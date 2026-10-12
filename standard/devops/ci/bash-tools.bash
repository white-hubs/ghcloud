#!/bin/bash

##################### exit code #####################
# 成功
EXIT_SUCCESS=0
# 用户输入错误
EXIT_ERROR_USER_INPUT=2
# 程序错误
EXIT_ERROR_APP=10
# 找不到资源
EXIT_ERROR_NOT_FOUND=30
##################### exit code #####################

function current_time {
  echo $(date +"%Y-%m-%d %H:%M:%S")
}

function log_prefix {
  local tag=$1
  echo "$(current_time) [ghcloud-devops-log] [$tag]"
}

function log_range_start {
  echo "################################## $(log_prefix "RANGE") [BEGIN] [$1] $2 ##################################"
}

function log_range_end {
  echo "################################## $(log_prefix "RANGE") [END] [$1] $2 ##################################"
}

function log_error {
  echo "$(log_prefix "ERROR") $1"
}

function log_info {
  echo "$(log_prefix "INFO") $1"
}

##################### string #####################
to_upper() {
  echo $1 | tr '[a-z]' '[A-Z]'
}

to_lower() {
  echo $1 | tr '[A-Z]' '[a-z]'
}

##################### string end #####################
##################### bash params #####################
_ensure_valid_params_key() {
  local params=$1
  local keyRE=".*\\|?$2\\|?.*"
  if [[ $params =~ $keyRE ]] || [ -n "$2" ]; then
    return
  fi
  log_error "invalid option $key"
  return $EXIT_ERROR_USER_INPUT
}
_ensure_required_params_key() {
  local input_params=()
  eval input_params=("\"$(echo "$1" | sed 's/|/" "/g')\"")
  local not_empty_args=()
  eval not_empty_args=("\"$(echo "$2")\"")
  for in_arg in "${input_params[@]}"; do
    local key_option=($in_arg)
    local key=$(echo "$(to_upper ${key_option[0]})" | sed 's/-/_/g')
    if [ "${key_option[1]}" == "required" ]; then
      local has_key=0
      for item in $not_empty_args; do
        if [ "$item" == "$key" ]; then
          has_key=1
          break
        fi
      done

      if [[ $has_key -eq 0 ]]; then
        log_error "option '$key_option' is required. but input empty"
        return $EXIT_ERROR_USER_INPUT
      fi
    fi
  done
}
# analysis_shell_params "" "--key1|--key2" ...params
analysis_shell_params() {
  local params=$1
  local lastKey=""
  local not_empty_args=()
  # 解析长参数
  for i in $(seq 2 $#); do
    local keyOrValue=${!i}
    if [ -z "$keyOrValue" ]; then
      continue
    fi
    if [[ "$keyOrValue" == "--"* ]]; then
      _ensure_valid_params_key $params "$keyOrValue"
      if [ $? -ne 0 ]; then
        log_error "ensure_valid_params_key failed! exit $?"
      fi
      lastKey=$(echo "$(to_upper ${keyOrValue/--/})" | sed 's/-/_/g')
    else
      not_empty_args+=("$lastKey")
      eval "PARAM_$lastKey=\"$keyOrValue\""
    fi
  done
  _ensure_required_params_key "${params}" "${not_empty_args[*]}"
}
##################### bash params end #####################