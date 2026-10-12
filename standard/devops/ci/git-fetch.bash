#!/bin/bash

# bash $(dirname "$0")/git-fetch.bash --workspace-dir ${PARAM_WORKSPACE_DIR} --work-name ${PARAM_WORK_NAME} --git-repo ${PARAM_GIT_REPO} 

# 导入工具包
source $(dirname "$0")/bash-tools.bash

PARAM_WORKSPACE_DIR=
PARAM_WORK_NAME=
PARAM_GIT_REPO=
PARAM_GIT_BRANCH=

allowed_params="help h|workspace-dir w|git-repo r|git-branch b|work-name n|project-names p"
get_shell_params $*

mkdir -p ${PARAM_WORKSPACE_DIR}

cd ${PARAM_WORKSPACE_DIR}

if [[ ! -d "${PARAM_WORKSPACE_DIR}/${PARAM_WORK_NAME}/.git" ]];then
    # 拉取源码
    git clone -b ${PARAM_GIT_BRANCH} ${PARAM_GIT_REPO} ${PARAM_WORK_NAME}
    # 进入
    cd ${PARAM_WORK_NAME}
else
    cd ${PARAM_WORK_NAME}
    git config core.filemode false
    git config pull.rebase true
    git add .
    git stash
    git checkout main
    if [ `git branch --list ${PARAM_GIT_BRANCH}` ]
    then
        echo 'delete old branch'
        git branch -D ${PARAM_GIT_BRANCH}
    fi
    git pull -p
    git checkout ${PARAM_GIT_BRANCH}
fi