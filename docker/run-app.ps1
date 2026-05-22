# 构建并启动应用（全部通过 -e 注入，不依赖 .env 文件）
# 示例:
#   .\docker\run-app.ps1 -MysqlPassword "secret"
#   $env:MYSQL_PASSWORD="secret"; .\docker\run-app.ps1

param(
  [int]$Port = $(if ($env:WEB_PORT) { [int]$env:WEB_PORT } else { 8080 }),
  [string]$MysqlHost = $(if ($env:MYSQL_HOST) { $env:MYSQL_HOST } else { 'host.docker.internal' }),
  [int]$MysqlPort = $(if ($env:MYSQL_PORT) { [int]$env:MYSQL_PORT } else { 3306 }),
  [string]$MysqlDatabase = $(if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } else { 'yuqing' }),
  [string]$MysqlUser = $(if ($env:MYSQL_USER) { $env:MYSQL_USER } else { 'root' }),
  [string]$MysqlPassword = $env:MYSQL_PASSWORD,
  [string]$SkipEnsureDatabase = $(if ($env:MYSQL_SKIP_ENSURE_DATABASE) { $env:MYSQL_SKIP_ENSURE_DATABASE } else { 'true' }),
  [switch]$Build
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $MysqlPassword) {
  Write-Host '请通过参数传入密码: .\docker\run-app.ps1 -MysqlPassword "你的密码"'
  Write-Host '或先设置: $env:MYSQL_PASSWORD="你的密码"'
  exit 1
}

if ($Build) {
  docker build -t yuqing:latest .
}

$runArgs = @(
  'run', '-d',
  '--name', 'yuqing-app',
  '-p', "${Port}:8080",
  '-e', "MYSQL_HOST=$MysqlHost",
  '-e', "MYSQL_PORT=$MysqlPort",
  '-e', "MYSQL_DATABASE=$MysqlDatabase",
  '-e', "MYSQL_USER=$MysqlUser",
  '-e', "MYSQL_PASSWORD=$MysqlPassword",
  '-e', "MYSQL_SKIP_ENSURE_DATABASE=$SkipEnsureDatabase",
  '-e', 'SKIP_ENV_FILES=true',
  '--add-host=host.docker.internal:host-gateway'
)

if (docker ps -a --format '{{.Names}}' | Select-String -Quiet '^yuqing-mysql$') {
  docker network create yuqing-net 2>$null
  $runArgs += @('--network', 'yuqing-net')
}

docker rm -f yuqing-app 2>$null
docker @runArgs yuqing:latest

Write-Host "应用已启动: http://localhost:$Port"
Write-Host "MYSQL_HOST=$MysqlHost"
