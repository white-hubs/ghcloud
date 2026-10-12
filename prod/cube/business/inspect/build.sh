#!/bin/bash

set -e
set -x

# 使用方法
# ./build.sh -r ${DOCKER_HUB_REGISTRY} -n ${IMAGE_NAME} -t ${IMAGE_TAG} -e ${BUILD_ENV}

# 参数
# =============================================================================================
# 镜像地址
DOCKER_HUB_REGISTRY=
# 镜像 tag: local/dev/test
IMAGE_TAG=
# 镜像名
IMAGE_NAME=
# 构建环境
BUILD_ENV=

# 参数接收
while getopts ":r:t:n:e:" opt
do
	case $opt in
		r)
		DOCKER_HUB_REGISTRY=${OPTARG}
        ;;
		t)
		IMAGE_TAG=${OPTARG}
        ;;
		n)
		IMAGE_NAME=${OPTARG}
        ;;
		e)
		BUILD_ENV=${OPTARG}
        ;;
		?)
        echo "未知参数"
        exit 1;;
    esac
done
# =============================================================================================


# 编译打包
pnpm install --registry=http://nexus.guhecloud.com:8888/repository/npm-group/
pnpm build:${BUILD_ENV}
# =============================================================================================


# 构建并推送镜像
# =============================================================================================
docker build -f ./Dockerfile --build-arg DIST="./dist" --build-arg DOCKER_HUB_REGISTRY=${DOCKER_HUB_REGISTRY} -t ${IMAGE_NAME}:${IMAGE_TAG} .
#
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
docker push ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
docker image rm ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
docker image rm ${IMAGE_NAME}:${IMAGE_TAG}
# =============================================================================================
