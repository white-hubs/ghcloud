#!/bin/bash

set -e
set -x

# 使用方法
# ./build.sh -r docker-hub.registry.url -t dev -n bimops/fe.streamengine-h5

# 参数
# =============================================================================================
# 构建路径
SOURCE_DIR=./
# 镜像地址
DOCKER_HUB_REGISTRY=192.168.0.220:5000
# 镜像 tag: local/dev/test
TAG=local
# 镜像名
IMAGE_NAME=bimops/fe.stream-engine-render
# 构建环境
BUILD_ENV=dev

# 参数接收
while getopts ":s:r:t:n:e:" opt
do
	case $opt in
		s)
		SOURCE_DIR=${OPTARG}
        ;;
		r)
		DOCKER_HUB_REGISTRY=${OPTARG}
        ;;
		t)
		TAG=${OPTARG}
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
cd ${SOURCE_DIR}
pnpm install --registry=https://registry.npmjs.org/
pnpm build:${BUILD_ENV}
# =============================================================================================


# 构建并推送镜像
# =============================================================================================
cd ${SOURCE_DIR}
docker build -f ./Dockerfile --build-arg DIST="./dist" --build-arg DOCKER_HUB_REGISTRY=${DOCKER_HUB_REGISTRY} -t ${IMAGE_NAME}:${TAG} .
#
docker tag ${IMAGE_NAME}:${TAG} ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}:${TAG}
docker push ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}:${TAG}
docker image rm ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}:${TAG}
docker image rm ${IMAGE_NAME}:${TAG}
# =============================================================================================


# 清理中间产物
# =============================================================================================
# =============================================================================================

