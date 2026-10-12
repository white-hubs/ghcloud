#!/bin/bash

# 遇到非 0 就退出
set -e

# 导入工具包
source $(dirname "$0")/bash-tools.bash

# 导入构建函数集
source $(dirname "$0")/cube-build-fun.bash

PARAM_PROJECT_PATH=
PARAM_PROJECT_NAMES=
PARAM_BUILD_ENV=dev
# input /path/to/deploy
# output /path/to/deploy/$project/$package_version
PARAM_DEPLOY_TARGET=
# fe@192.168.1.1
PARAM_DEPLOY_REMOTE_SSH=

allowed_params="help|project-names required|build-env required|project-path required|deploy-target required|deploy-remote-ssh required"
analysis_shell_params "$allowed_params" "$@"

install_deps $PARAM_PROJECT_PATH

# If exec error, write to this file.
ERROR_PROJECTS_FILE=$(uuidgen)".failed_project"
rm -f ./*.failed_project
touch $ERROR_PROJECTS_FILE
# 启动所有的项目构建并在后台运行
for project in $(echo $PARAM_PROJECT_NAMES | sed "s/,/ /g"); do
  build_and_deploy_project "$project" "$PARAM_BUILD_ENV" "$PARAM_DEPLOY_TARGET" "$PARAM_DEPLOY_REMOTE_SSH" "${ERROR_PROJECTS_FILE}" &
done

# 等待所有的后台进程结束
wait

check_error_projects=$(cat "${ERROR_PROJECTS_FILE}")

# 检查是否有任何项目构建失败
if [ -n "$check_error_projects" ]; then
    log_error "One or more projects failed, $(cat "${ERROR_PROJECTS_FILE}" | tr 'n' ' ' )"
    exit $EXIT_ERROR_APP
fi

log_info "All projects build and deploy completed."
exit $EXIT_SUCCESS
