def mrTitleRe = ~"^([\\w-\\s{},\\.\\(\\)]+)[:：]\\s(.*)\$"
def WORKSPACE_DIR = """/tmp/gitlab-ci/workspaces/${env.gitlabSourceRepoName}/${env.gitlabBranch}"""
def PROJECT_NAME = "source"
def WORKER_DIR = """${WORKSPACE_DIR}/${PROJECT_NAME}"""
def CHECK_PASSED = true

pipeline {
    agent any
    environment {
        PATH = "PATH+EXTRA=/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/bin"
    }
    stages {
        stage("初始化") {
            steps {
                script {
                    stage(Stages.FETCH_CODE.getValue()) {
                        updateStatus stage: Stages.FETCH_CODE, state: GitlabCheckStatus.RUNNING
                        script {
                            try {
                                sh fetchRepo(WORKSPACE_DIR: WORKSPACE_DIR, PROJECT_NAME: PROJECT_NAME)
                            } catch (ex) {
                                updateStatus stage: Stages.FETCH_CODE, state: GitlabCheckStatus.FAILED
                                errorStageExit(Stages.FETCH_CODE, ex)
                            }
                        }
                    }
                }
            }
        }
        stage("看门狗") {
            parallel {
                stage('阶段：仓库检查') {
                    steps {
                        script {
                            stage(Stages.TITLE_CHECK.getValue()) {
                                updateStatus stage: Stages.TITLE_CHECK, state: GitlabCheckStatus.RUNNING
                                script {
                                    if (env.gitlabMergeRequestTitle ==~ mrTitleRe) {
                                        sh 'exit 0'
                                        return
                                    }
                                    commentGitlabMr(stage: Stages.TITLE_CHECK, emoji: GitlabEmoji.FAIL, content: """MR 标题不规范，参考格式：
```
修改范围: 修改内容描述
```
""")
                                    updateStatus stage: Stages.TITLE_CHECK, state: GitlabCheckStatus.FAILED
                                    errorStageExit(Stages.TITLE_CHECK)
                                }
                            }
                            stage(Stages.FILE_CHECK.getValue()) {
                                updateStatus stage: Stages.FILE_CHECK, state: GitlabCheckStatus.RUNNING
                                script {
                                    def bashHome = "${WORKER_DIR}/tools/ci"
                                    try {
                                        sh "chmod +x ${bashHome}/file-name-checker.bash"
                                        sh "${bashHome}/file-name-checker.bash"
                                    } catch (ex) {
                                        updateStatus stage: Stages.FILE_CHECK, state: GitlabCheckStatus.FAILED
                                        def file = readFile("${bashHome}/file-name-checker.out")
                                        commentGitlabMr(stage: Stages.FILE_CHECK, emoji: GitlabEmoji.FAIL, content: file)
                                        errorStageExit(Stages.FILE_CHECK, ex)
                                    }
                                }
                            }
                        }
                    }
                }
                stage('阶段：代码检查') {
                    steps {
                        script {
                            stage(Stages.BUILD_CHECK.getValue()) {
                                updateStatus stage: Stages.BUILD_CHECK, state: GitlabCheckStatus.RUNNING
                                script {
                                    def bashHome = "${WORKER_DIR}/tools/ci"
                                    try {
                                        sh "chmod +x ${bashHome}/build-checker.bash"
                                        sh "${bashHome}/build-checker.bash"
                                    } catch (ex) {
                                        commentGitlabMr(stage: Stages.BUILD_CHECK, emoji: GitlabEmoji.FAIL, content: """构建失败，请查看具体构建日志""")
                                        updateStatus stage: Stages.BUILD_CHECK, state: GitlabCheckStatus.FAILED
                                        errorStageExit(Stages.BUILD_CHECK, ex)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        stage("完成") {
            steps {
                script {
                    if (CHECK_PASSED == true) {
                        updateStatus stage: Stages.FETCH_CODE, state: GitlabCheckStatus.SUCCESS
                        updateStatus stage: Stages.TITLE_CHECK, state: GitlabCheckStatus.SUCCESS
                        updateStatus stage: Stages.FILE_CHECK, state: GitlabCheckStatus.SUCCESS
                        updateStatus stage: Stages.BUILD_CHECK, state: GitlabCheckStatus.SUCCESS
                        commentGitlabMr stage: Stages.SUCCESS, emoji: GitlabEmoji.OK, content: "所有检查通过 ${GitlabEmoji.HAPPY}"
                    }
                }
            }
        }
    }
}

enum Stages {
    SUCCESS('完成', 0),
    FETCH_CODE('拉取代码', 1),
    TITLE_CHECK('合入标题检查', 2),
    FILE_CHECK('合入文件检查', 3),
    BUILD_CHECK('编译检查', 4)

    private String value

    private int errorCode

    Stages(String value, int errorCode) {
        this.value = value
        this.errorCode = errorCode
    }

    String getValue() {
        return value
    }

    int getErrorCode() {
        return errorCode
    }

    String toString() {
        return value
    }
}

enum GitlabEmoji {
    FAIL(':x:'),
    OK(':heavy_check_mark:'),
    BUILDING(':pick:'),
    HAPPY(':100:')

    private String value

    GitlabEmoji(String value) {
        this.value = value
    }

    String getValue() {
        return value
    }

    String toString() {
        return value
    }
}

enum GitlabCheckStatus {
    PENDING('pending'),
    RUNNING('running'),
    SUCCESS('success'),
    FAILED('failed'),
    CANCELED('canceled')

    private String value

    GitlabCheckStatus(String value) {
        this.value = value
    }

    String getValue() {
        return value
    }

    String toString() {
        return value
    }
}

def commentGitlabMr(Map args) {
    def comment = buildMessage(stage: args.stage, emoji: args.emoji, content: args.content)
    println comment
    addGitLabMRComment(comment: comment)
}

def errorStageExit(Stages stage, ex = null) {
    println stage.getValue()
    println ex
    CHECK_PASSED = false
    sh "echo '${stage.getValue()} ${ex}'"
    sh "exit ${stage.getErrorCode()}"
}

def fetchRepo(Map args) {
    def WORKSPACE_DIR = args.WORKSPACE_DIR
    def PROJECT_NAME = args.PROJECT_NAME
    return """
#!/bin/bash

set -e
set -x

# 添加 pnpm 执行环境
export PATH=${PATH}:/opt/node/bin
# 创建本次工作空间
mkdir -p ${WORKSPACE_DIR}
cd ${WORKSPACE_DIR}

if [[ ! -d "${WORKSPACE_DIR}/${PROJECT_NAME}/.git" ]];then
    # 拉取源码
    git clone -b ${env.gitlabBranch} ${env.gitlabSourceRepoSshUrl} ${PROJECT_NAME}
    # 进入
    cd ${PROJECT_NAME}
else
    cd ${PROJECT_NAME}
    git config --add core.filemode false
    git config pull.rebase true
    git stash
    git checkout main
    if [ `git branch --list ${env.gitlabBranch}` ]
    then
        echo 'delete old branch'
        git branch -D ${env.gitlabBranch}
    fi
    git pull -p
    git checkout ${env.gitlabBranch}
fi

"""
}

def buildMessage(Stages stage, GitlabEmoji emoji, String content) {
    return """
${GitlabEmoji.BUILDING.getValue()} Jenkins stage `${stage.getValue()}` ${emoji.getValue()}

${content}

Results available at: [Jenkins [ghcloud-ci-pipline #${BUILD_NUMBER}]](https://ci-sn.guhecloud.com:8443/job/ghcloud-monorepo/job/gitlab/job/gitlab-ci-pipline/${BUILD_NUMBER}/console)
"""
}

def buildMessage(Map args) {
    return buildMessage(args.stage, args.emoji, args.content)
}

def updateStatus(Stages stage, GitlabCheckStatus state) {
    updateGitlabCommitStatus name: stage.getValue(), state: state.getValue()
}

def updateStatus(Map args) {
    updateStatus(args.stage, args.state)
}