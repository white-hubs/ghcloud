#!/bin/bash

# 批量发布脚本
# 使用方法: ./publish-packages.sh

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
REGISTRY_URL="http://nexus.guhecloud.com:8888/repository/npm-hosted/"
NPM_USERNAME="npm-publisher"
NPM_PASSWORD="L_eQmDv#UJ\\\${Y7yp"

echo -e "${BLUE}=== 批量发布脚本开始执行 ===${NC}"
echo -e "${YELLOW}Registry URL: ${REGISTRY_URL}${NC}"
echo -e "${YELLOW}用户名: ${NPM_USERNAME}${NC}"
echo ""

# 获取所有包含 publishConfig 的 package.json 文件
echo -e "${BLUE}正在搜索包含 publishConfig 的包...${NC}"
PACKAGES=$(find . -name "package.json" -type f | grep -v node_modules | xargs grep -l "publishConfig" 2>/dev/null || true)

if [ -z "$PACKAGES" ]; then
    echo -e "${RED}未找到包含 publishConfig 的包${NC}"
    exit 1
fi

echo -e "${GREEN}找到以下包含 publishConfig 的包:${NC}"
echo "$PACKAGES" | nl
echo ""
echo -e "${GREEN}总共找到 $(echo "$PACKAGES" | wc -l | tr -d ' ') 个包${NC}"
echo ""

# 确认是否继续
read -p "是否继续执行登录和发布操作? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}开始批量发布流程...${NC}"

# 统计变量
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0
FAILED_PACKAGES=()
SKIPPED_PACKAGES=()

# 遍历每个包
echo "$PACKAGES" | while read -r package_file; do
    if [ -z "$package_file" ]; then
        continue
    fi
    
    # 获取包目录
    PACKAGE_DIR=$(dirname "$package_file")
    
    # 获取包名
    PACKAGE_NAME=$(cat "$package_file" | grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    
    echo -e "${BLUE}正在处理包: ${PACKAGE_NAME}${NC}"
    echo -e "路径: ${PACKAGE_DIR}"
    
    # 进入包目录
    cd "$PACKAGE_DIR"
    
    # 检查是否有dist目录
    if [ ! -d "dist" ]; then
        echo -e "${YELLOW}未找到 ./dist 目录，跳过此包${NC}"
        SKIPPED_PACKAGES+=("$PACKAGE_NAME (缺少dist目录)")
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        cd - > /dev/null
        echo ""
        continue
    fi
    
    # 执行 npm login (自动输入用户名和密码)
    echo -e "${YELLOW}正在登录到 npm registry...${NC}"
    
    # 使用expect自动输入用户名和密码
    expect << 'EOF'
spawn npm login --registry=http://nexus.guhecloud.com:8888/repository/npm-hosted/
expect "Username:"
send "npm-publisher\r"
expect "Password:"
send "L_eQmDv#UJ\${Y7yp\r"
expect {
    "Email:" {
        send "\r"
        exp_continue
    }
    "Logged in" {
        # 登录成功
    }
    eof
}
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}登录成功${NC}"
    else
        echo -e "${RED}登录失败，跳过此包${NC}"
        FAILED_PACKAGES+=("$PACKAGE_NAME (登录失败)")
        FAILED_COUNT=$((FAILED_COUNT + 1))
        cd - > /dev/null
        echo ""
        continue
    fi
    
    # 执行 npm publish
    echo -e "${YELLOW}正在发布包...${NC}"
    if npm publish --registry="$REGISTRY_URL" 2>/dev/null; then
        echo -e "${GREEN}发布成功: ${PACKAGE_NAME}${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}发布失败: ${PACKAGE_NAME}${NC}"
        FAILED_PACKAGES+=("$PACKAGE_NAME (发布失败)")
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
    
    cd - > /dev/null
    echo ""
done

echo -e "${BLUE}=== 发布结果汇总 ===${NC}"
echo -e "${GREEN}成功发布: $SUCCESS_COUNT 个包${NC}"
echo -e "${RED}发布失败: $FAILED_COUNT 个包${NC}"
echo -e "${YELLOW}跳过的包: $SKIPPED_COUNT 个包${NC}"

if [ ${#FAILED_PACKAGES[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}发布失败的包列表:${NC}"
    for package in "${FAILED_PACKAGES[@]}"; do
        echo -e "${RED}  - $package${NC}"
    done
fi

if [ ${#SKIPPED_PACKAGES[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}跳过的包列表:${NC}"
    for package in "${SKIPPED_PACKAGES[@]}"; do
        echo -e "${YELLOW}  - $package${NC}"
    done
fi

# 将结果写入日志文件
if [ ${#FAILED_PACKAGES[@]} -gt 0 ] || [ ${#SKIPPED_PACKAGES[@]} -gt 0 ]; then
    echo "$(date): 批量发布结果汇总" > publish_result.log
    echo "成功发布: $SUCCESS_COUNT 个包" >> publish_result.log
    echo "发布失败: $FAILED_COUNT 个包" >> publish_result.log
    echo "跳过的包: $SKIPPED_COUNT 个包" >> publish_result.log
    echo "" >> publish_result.log
    
    if [ ${#FAILED_PACKAGES[@]} -gt 0 ]; then
        echo "发布失败的包:" >> publish_result.log
        for package in "${FAILED_PACKAGES[@]}"; do
            echo "  - $package" >> publish_result.log
        done
        echo "" >> publish_result.log
    fi
    
    if [ ${#SKIPPED_PACKAGES[@]} -gt 0 ]; then
        echo "跳过的包:" >> publish_result.log
        for package in "${SKIPPED_PACKAGES[@]}"; do
            echo "  - $package" >> publish_result.log
        done
    fi
    
    echo -e "${YELLOW}详细结果已保存到 publish_result.log${NC}"
fi

echo ""
echo -e "${BLUE}批量发布完成${NC}"