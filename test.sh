#!/bin/bash

# 链接跳转服务测试脚本

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
BASE_URL="${1:-http://localhost:8788}"
PASSWORD="${2:-test123}"

echo "======================================"
echo "链接跳转服务测试"
echo "======================================"
echo "测试 URL: $BASE_URL"
echo ""

# 测试计数
PASSED=0
FAILED=0

# 测试函数
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "测试 $name ... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ 通过${NC} (状态码: $status)"
        ((PASSED++))
    else
        echo -e "${RED}✗ 失败${NC} (期望: $expected_status, 实际: $status)"
        ((FAILED++))
    fi
}

# 1. 测试健康检查
echo "1. 健康检查"
test_endpoint "健康检查" "$BASE_URL/health" 200
echo ""

# 2. 测试首页
echo "2. 页面访问"
test_endpoint "首页" "$BASE_URL/" 200
test_endpoint "登录页面" "$BASE_URL/login" 200
echo ""

# 3. 测试未授权访问
echo "3. 授权检查"
test_endpoint "未授权访问生成页面" "$BASE_URL/generate" 302
test_endpoint "未授权访问生成 API" "$BASE_URL/api/generate" 401
echo ""

# 4. 测试传统跳转
echo "4. 传统跳转"
test_endpoint "有效的跳转" "$BASE_URL/redirect?to=https://example.com" 200
test_endpoint "缺少参数的跳转" "$BASE_URL/redirect" 400
echo ""

# 5. 测试加密路由
echo "5. 加密路由"
test_endpoint "无效的 AES 路径" "$BASE_URL/e/invalid" 400
echo ""

# 6. 测试登录 API
echo "6. 登录功能"
echo -n "测试登录 API ... "

login_response=$(curl -s -X POST "$BASE_URL/api/login" \
    -H "Content-Type: application/json" \
    -d "{\"password\":\"$PASSWORD\"}" \
    -w "\n%{http_code}")

status=$(echo "$login_response" | tail -n1)

if [ "$status" -eq "302" ] || [ "$status" -eq "200" ]; then
    echo -e "${GREEN}✓ 通过${NC} (状态码: $status)"
    ((PASSED++))
else
    echo -e "${RED}✗ 失败${NC} (状态码: $status)"
    ((FAILED++))
fi
echo ""

# 7. 测试 CORS
echo "7. CORS 支持"
echo -n "测试 OPTIONS 请求 ... "

cors_status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X OPTIONS "$BASE_URL/api/login" \
    -H "Origin: http://example.com")

if [ "$cors_status" -eq "200" ]; then
    echo -e "${GREEN}✓ 通过${NC} (状态码: $cors_status)"
    ((PASSED++))
else
    echo -e "${RED}✗ 失败${NC} (状态码: $cors_status)"
    ((FAILED++))
fi
echo ""

# 总结
echo "======================================"
echo "测试总结"
echo "======================================"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo "总计: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}有测试失败，请检查！${NC}"
    exit 1
fi
