# 链接跳转服务测试脚本 (PowerShell)

param(
    [string]$BaseUrl = "http://localhost:8788",
    [string]$Password = "test123"
)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "链接跳转服务测试" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "测试 URL: $BaseUrl"
Write-Host ""

$Passed = 0
$Failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus
    )
    
    Write-Host -NoNewline "测试 $Name ... "
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
        $status = $response.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
    }
    
    if ($status -eq $ExpectedStatus) {
        Write-Host "✓ 通过" -ForegroundColor Green -NoNewline
        Write-Host " (状态码: $status)"
        $script:Passed++
    } else {
        Write-Host "✗ 失败" -ForegroundColor Red -NoNewline
        Write-Host " (期望: $ExpectedStatus, 实际: $status)"
        $script:Failed++
    }
}

# 1. 测试健康检查
Write-Host "1. 健康检查" -ForegroundColor Yellow
Test-Endpoint "健康检查" "$BaseUrl/health" 200
Write-Host ""

# 2. 测试首页
Write-Host "2. 页面访问" -ForegroundColor Yellow
Test-Endpoint "首页" "$BaseUrl/" 200
Test-Endpoint "登录页面" "$BaseUrl/login" 200
Write-Host ""

# 3. 测试未授权访问
Write-Host "3. 授权检查" -ForegroundColor Yellow
Write-Host -NoNewline "测试 未授权访问生成页面 ... "
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/generate" -Method Get -MaximumRedirection 0 -ErrorAction SilentlyContinue
    $status = $response.StatusCode
} catch {
    $status = $_.Exception.Response.StatusCode.value__
}
if ($status -eq 302) {
    Write-Host "✓ 通过" -ForegroundColor Green -NoNewline
    Write-Host " (状态码: $status)"
    $Passed++
} else {
    Write-Host "✗ 失败" -ForegroundColor Red -NoNewline
    Write-Host " (期望: 302, 实际: $status)"
    $Failed++
}

Test-Endpoint "未授权访问生成 API" "$BaseUrl/api/generate" 401
Write-Host ""

# 4. 测试传统跳转
Write-Host "4. 传统跳转" -ForegroundColor Yellow
Test-Endpoint "有效的跳转" "$BaseUrl/redirect?to=https://example.com" 200
Test-Endpoint "缺少参数的跳转" "$BaseUrl/redirect" 400
Write-Host ""

# 5. 测试加密路由
Write-Host "5. 加密路由" -ForegroundColor Yellow
Test-Endpoint "无效的 AES 路径" "$BaseUrl/e/invalid" 400
Test-Endpoint "无效的 XOR 路径" "$BaseUrl/o/invalid" 400
Write-Host ""

# 6. 测试登录 API
Write-Host "6. 登录功能" -ForegroundColor Yellow
Write-Host -NoNewline "测试登录 API ... "

$body = @{
    password = $Password
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/login" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -MaximumRedirection 0 `
        -ErrorAction SilentlyContinue
    $status = $response.StatusCode
} catch {
    $status = $_.Exception.Response.StatusCode.value__
}

if ($status -eq 302 -or $status -eq 200) {
    Write-Host "✓ 通过" -ForegroundColor Green -NoNewline
    Write-Host " (状态码: $status)"
    $Passed++
} else {
    Write-Host "✗ 失败" -ForegroundColor Red -NoNewline
    Write-Host " (状态码: $status)"
    $Failed++
}
Write-Host ""

# 7. 测试 CORS
Write-Host "7. CORS 支持" -ForegroundColor Yellow
Write-Host -NoNewline "测试 OPTIONS 请求 ... "

try {
    $headers = @{
        "Origin" = "http://example.com"
    }
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/login" `
        -Method Options `
        -Headers $headers `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $status = $response.StatusCode
} catch {
    $status = $_.Exception.Response.StatusCode.value__
}

if ($status -eq 200) {
    Write-Host "✓ 通过" -ForegroundColor Green -NoNewline
    Write-Host " (状态码: $status)"
    $Passed++
} else {
    Write-Host "✗ 失败" -ForegroundColor Red -NoNewline
    Write-Host " (状态码: $status)"
    $Failed++
}
Write-Host ""

# 总结
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "测试总结" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "通过: " -NoNewline
Write-Host $Passed -ForegroundColor Green
Write-Host "失败: " -NoNewline
Write-Host $Failed -ForegroundColor Red
Write-Host "总计: $($Passed + $Failed)"
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "所有测试通过！" -ForegroundColor Green
    exit 0
} else {
    Write-Host "有测试失败，请检查！" -ForegroundColor Red
    exit 1
}
