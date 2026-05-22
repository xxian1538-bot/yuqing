# 可选：Docker 启动 MySQL（-e 注入，不依赖 .env）
# 示例: .\docker\run-mysql.ps1 -RootPassword "secret" -Password "secret"

param(
  [string]$RootPassword = $env:MYSQL_ROOT_PASSWORD,
  [string]$Database = $(if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } else { 'yuqing' }),
  [string]$User = $(if ($env:MYSQL_USER) { $env:MYSQL_USER } else { 'yuqing' }),
  [string]$Password = $env:MYSQL_PASSWORD,
  [int]$Port = $(if ($env:MYSQL_PORT) { [int]$env:MYSQL_PORT } else { 3306 })
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $RootPassword -or -not $Password) {
  Write-Host '请传入: .\docker\run-mysql.ps1 -RootPassword "root密码" -Password "业务用户密码"'
  exit 1
}

docker network create yuqing-net 2>$null
docker rm -f yuqing-mysql 2>$null

docker run -d `
  --name yuqing-mysql `
  --network yuqing-net `
  -p "${Port}:3306" `
  -e "MYSQL_ROOT_PASSWORD=$RootPassword" `
  -e "MYSQL_DATABASE=$Database" `
  -e "MYSQL_USER=$User" `
  -e "MYSQL_PASSWORD=$Password" `
  -v "${Root}/yuqing_backup_20260522.sql:/sql/backup.sql:ro" `
  -v "${Root}/docker/mysql/00-import.sh:/docker-entrypoint-initdb.d/00-import.sh:ro" `
  mysql:8.4

Write-Host "MySQL: yuqing-mysql，应用请 -MysqlHost yuqing-mysql -MysqlUser $User -MysqlPassword $Password"
