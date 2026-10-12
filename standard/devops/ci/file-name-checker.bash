#!/bin/bash
ERROR_MESSAGE=""
CHECK_DIR="$(dirname "$0")/../../"
OUT_FILE="$(dirname "$0")/./file-name-checker.out"

#RED="echo -en \\E[4;31m"
#GREEN="echo -en \\E[7;31m"
#RESET="echo -en \\E[0;39m"
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
RESET=$(tput sgr0)

rm -f "$OUT_FILE"
touch "$OUT_FILE"



function error {
  echo "${RED}${1}${RESET}"
}

function info {
  echo "${GREEN}${1}${RESET}"
}

function checkFileName {
  if [[ $1 =~ ^\.?(/?\.?[0-9a-z_-]*)*$ ]]; then
    info "checkFile [$1] pass"
  else
    ERROR_MESSAGE="checkFile [$1] fail! 文件（夹）名格式不合法，命名需要遵循 \`kebab-case\`"
    error "$ERROR_MESSAGE"
    echo "$ERROR_MESSAGE" >> "$OUT_FILE"
  fi
}

########################
# 处理路径中带有空格的情况 #
oldIFS=$IFS
IFS=$'\n'
########################

CHECK_FILES=`find $CHECK_DIR`
for file in $CHECK_FILES; do
  if [[ "$file" =~ "node_modules" || "$file" =~ ".git" || "$file" =~ ".vscode" || "$file" =~ '.idea' || "$file" =~ 'lib' || "$file" =~ 'legacy/' || "$file" =~ 'dist/' ]]; then
    continue
  else
    checkFileName "$file"
  fi
done

########################
# 处理路径中带有空格的情况 #
IFS=$oldIFS
########################

if [[ $ERROR_MESSAGE != "" ]]; then
  exit 255
fi

exit 0