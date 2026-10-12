#!/bin/bash

# 导入工具包
source $(dirname "$0")/bash-tools.bash

function install_deps {
  log_range_start "install deps"
  pnpm i --no-frozen-lockfile
  log_range_end "install deps"
}

function build_project {
  local project=$1
  local build_env=$2
  log_range_start "build $build_env" "$project"
  pnpm --filter $project build:${build_env}
  log_range_end "build $build_env" "$project"
  return $EXIT_SUCCESS
}

function deploy_project {
  local project=$1
  local project_path=$2
  local package_version=$3
  local target=$4
  local remote_ssh=$5
  log_range_start "deploy" "$project to $target"
  eval "ssh $remote_ssh \"mkdir -p $target/$project/$package_version\""
  rsync -rv ${project_path}/dist/* "$remote_ssh:$target/$project/$package_version/"
  log_range_end "deploy" "$project"
  return $EXIT_SUCCESS
}


function build_and_deploy_project {
  chmod +x standard/devops/ci/get-package.bash
  local project=$1
  local build_env=$2
  local target=$3
  local remote_ssh=$4
  local error_project_file=$5
  local package_path=$(bash $(dirname "$0")/get-package.bash "$project" path)
  local package_version=$(bash $(dirname "$0")/get-package.bash "$project" version)
  log_range_start "build_and_deploy_project" "$project"
  
  if [[ `pnpm m ls --depth=-1 | grep "$project" | wc -l` -eq 0 ]]; then
    log_error "connot find module '$project'!"
    return $EXIT_ERROR_USER_INPUT
  fi

  build_project "$project" "$build_env"
  if [ $? -ne 0 ]; then
    log_error "build_project failed! ${project} ${build_env} exit-${$?}"
    echo "["$project"]" >> $error_project_file
    return $?
  fi
  
  deploy_project "$project" "$package_path" "$package_version" "$target" "$remote_ssh"
  if [ $? -ne 0 ]; then
    log_error "deploy_project failed! ${project} exit-${$?}"
    echo "["$project"]" >> $error_project_file
    return $?
  fi
}