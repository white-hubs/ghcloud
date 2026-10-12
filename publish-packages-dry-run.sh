#!/bin/bash

# 批量发布脚本 - 干运行模式 (仅检查，不实际发布)
# 使用方法: ./publish-packages-dry-run.sh

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
REGISTRY_URL="http://nexus.guhecloud.com:8888/repository/npm-hosted/"

echo -e "${BLUE}=== 批量发布脚本 - 干运行模式 ===${NC}"
echo -e "${YELLOW}Registry URL: ${REGISTRY_URL}${NC}"
echo -e "${YELLOW}注意: 这是干运行模式，不会实际执行登录和发布操作${NC}"
echo ""

# 获取所有包含 publishConfig 的 package.json 文件
echo -e "${BLUE}正在搜索包含 publishConfig 的包...${NC}"
PACKAGES=$(find . -name "package.json" -type f | grep -v node_modules | xargs grep -l "publishConfig" 2>/dev/null || true)

if [ -z "$PACKAGES" ]; then
    echo -e "${RED}未找到包含 publishConfig 的包${NC}"
    exit 1
fi

echo -e "${GREEN}找到以下包含 publishConfig 的包:${NC}"
echo ""

# 计数器
TOTAL_COUNT=0
READY_COUNT=0
NEED_BUILD_COUNT=0
ERROR_COUNT=0

# 遍历每个包进行检查
echo "$PACKAGES" | while read -r package_file; do
    if [ -z "$package_file" ]; then
        continue
    fi
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    # 获取包目录
    PACKAGE_DIR=$(dirname "$package_file")
    
    # 获取包名和版本
    PACKAGE_NAME=$(cat "$package_file" | grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    PACKAGE_VERSION=$(cat "$package_file" | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"version"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    
    echo -e "${BLUE}[$TOTAL_COUNT] 包名: ${PACKAGE_NAME}${NC}"
    echo -e "    版本: ${PACKAGE_VERSION}"
    echo -e "    路径: ${PACKAGE_DIR}"
    
    # 检查 publishConfig
    PUBLISH_REGISTRY=$(cat "$package_file" | grep -A 5 "publishConfig" | grep -o '"registry"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"registry"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/' || echo "未配置")
    echo -e "    发布仓库: ${PUBLISH_REGISTRY}"
    
    # 检查构建状态
    cd "$PACKAGE_DIR"
    
    BUILD_STATUS=""
    if [ -d "dist" ] || [ -d "lib" ] || [ -d "build" ]; then
        BUILD_STATUS="${GREEN}✓ 已构建${NC}"
        READY_COUNT=$((READY_COUNT + 1))
    elif grep -q '"build"' package.json; then
        BUILD_STATUS="${YELLOW}⚠ 需要构建${NC}"
        NEED_BUILD_COUNT=$((NEED_BUILD_COUNT + 1))
    else
        BUILD_STATUS="${YELLOW}? 无构建脚本${NC}"
        NEED_BUILD_COUNT=$((NEED_BUILD_COUNT + 1))
    fi
    
    echo -e "    构建状态: $BUILD_STATUS"
    
    # 检查是否有必要的文件
    if [ ! -f "package.json" ]; then
        echo -e "    ${RED}✗ 缺少 package.json${NC}"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    
    cd - > /dev/null
    echo ""
done

echo -e "${BLUE}=== 检查结果汇总 ===${NC}"
echo -e "${GREEN}总包数: $TOTAL_COUNT${NC}"
echo -e "${GREEN}准备就绪: $READY_COUNT${NC}"
echo -e "${YELLOW}需要构建: $NEED_BUILD_COUNT${NC}"
echo -e "${RED}有错误: $ERROR_COUNT${NC}"

echo ""
echo -e "${BLUE}=== 下一步操作建议 ===${NC}"
echo -e "${YELLOW}1. 如果需要构建的包较多，建议先运行构建命令${NC}"
echo -e "${YELLOW}2. 确认所有包的版本号是否正确${NC}"
echo -e "${YELLOW}3. 确认 npm 登录凭据是否有效${NC}"
echo -e "${YELLOW}4. 运行 ./publish-packages.sh 执行实际发布${NC}"

echo ""
echo -e "${BLUE}干运行检查完成${NC}"