#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PLATFORM="linux/amd64"
PUSH="false"
SERVICES=("scada-studio-service" "scada-studio" "scada-demo")
IMAGE_PREFIX=""
BUILDER=""
NO_CACHE="false"

usage() {
  cat <<'EOF'
一键构建 Cube SCADA 镜像（buildx）

用法:
  ./prod/cube/scada/buildx.sh [选项]

选项:
  --platform <value>        构建平台，默认: linux/amd64
  --services <csv>          构建服务，逗号分隔，默认: scada-studio-service,scada-studio,scada-demo
  --push                    推送到远端仓库（默认仅 --load 到本地）
  --image-prefix <prefix>   镜像前缀（示例: registry.example.com/ghcloud）
  --builder <name>          指定 buildx builder
  --legacy                  使用 docker build，不使用 buildx（不支持 --platform 多架构）
  --no-cache                禁用 Docker 构建缓存
  -h, --help                显示帮助

示例:
  ./prod/cube/scada/buildx.sh
  ./prod/cube/scada/buildx.sh --legacy --services scada-studio-service
  ./prod/cube/scada/buildx.sh --platform linux/amd64,linux/arm64 --push --image-prefix registry.example.com/ghcloud
EOF
}

USE_LEGACY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform)
      PLATFORM="${2:-}"
      shift 2
      ;;
    --services)
      IFS=',' read -r -a SERVICES <<< "${2:-}"
      shift 2
      ;;
    --push)
      PUSH="true"
      shift
      ;;
    --image-prefix)
      IMAGE_PREFIX="${2:-}"
      shift 2
      ;;
    --builder)
      BUILDER="${2:-}"
      shift 2
      ;;
    --legacy)
      USE_LEGACY="true"
      shift
      ;;
    --no-cache)
      NO_CACHE="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "未知参数: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "${#SERVICES[@]}" -eq 0 ]]; then
  echo "services 不能为空" >&2
  exit 1
fi

if [[ "$PUSH" == "true" && -z "$IMAGE_PREFIX" ]]; then
  echo "启用 --push 时必须提供 --image-prefix（示例: registry.example.com/ghcloud）" >&2
  exit 1
fi

if [[ "$USE_LEGACY" == "true" && "$PUSH" == "true" ]]; then
  echo "--legacy 不支持 --push，请使用 buildx 或手动 docker push" >&2
  exit 1
fi

if [[ -n "$BUILDER" && "$USE_LEGACY" != "true" ]]; then
  docker buildx use "$BUILDER" >/dev/null
fi

build_service() {
  local service="$1"
  local dockerfile="$ROOT_DIR/prod/cube/scada/${service}/Dockerfile"
  local tag="$service:latest"

  if [[ ! -f "$dockerfile" ]]; then
    echo "缺少 Dockerfile: $dockerfile" >&2
    exit 1
  fi

  if [[ -n "$IMAGE_PREFIX" ]]; then
    tag="${IMAGE_PREFIX}/${service}:latest"
  fi

  echo ">>> building ${service} -> ${tag}"

  if [[ "$USE_LEGACY" == "true" ]]; then
    # set -u 下勿展开空数组；${NO_CACHE:+--no-cache} 在 false 时不产出参数
    docker build \
      ${NO_CACHE:+--no-cache} \
      -f "$dockerfile" \
      -t "$tag" \
      "$ROOT_DIR"
    return
  fi

  local output_flag="--load"
  if [[ "$PUSH" == "true" ]]; then
    output_flag="--push"
  fi

  docker buildx build \
    --platform "$PLATFORM" \
    ${NO_CACHE:+--no-cache} \
    -f "$dockerfile" \
    -t "$tag" \
    "$ROOT_DIR" \
    "$output_flag"
}

for service in "${SERVICES[@]}"; do
  build_service "$service"
done

echo "构建完成: ${SERVICES[*]}"
