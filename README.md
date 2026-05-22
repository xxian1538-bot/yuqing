# 舆情管理系统（yuqing）

## Docker 启动（`docker run -e`，不用 .env 文件）

构建：

```bash
docker build -t yuqing:latest .
```

启动（**运行时 `-e` 传入数据库配置**）：

```bash
docker run -d --name yuqing-app ^
  -p 8080:8080 ^
  -e MYSQL_HOST=host.docker.internal ^
  -e MYSQL_PORT=3306 ^
  -e MYSQL_DATABASE=yuqing ^
  -e MYSQL_USER=root ^
  -e MYSQL_PASSWORD=你的密码 ^
  -e MYSQL_SKIP_ENSURE_DATABASE=true ^
  --add-host=host.docker.internal:host-gateway ^
  yuqing:latest
```

访问：`http://localhost:8080`

### 连接 Docker 里的 MySQL 容器

先起 MySQL（同样用 `-e`）：

```bash
docker network create yuqing-net

docker run -d --name yuqing-mysql --network yuqing-net ^
  -p 3306:3306 ^
  -e MYSQL_ROOT_PASSWORD=changeme ^
  -e MYSQL_DATABASE=yuqing ^
  -e MYSQL_USER=yuqing ^
  -e MYSQL_PASSWORD=changeme ^
  -v "%cd%/yuqing_backup_20260522.sql:/sql/backup.sql:ro" ^
  -v "%cd%/docker/mysql/00-import.sh:/docker-entrypoint-initdb.d/00-import.sh:ro" ^
  mysql:8.4
```

再起应用（`MYSQL_HOST` 填容器名）：

```bash
docker run -d --name yuqing-app --network yuqing-net ^
  -p 8080:8080 ^
  -e MYSQL_HOST=yuqing-mysql ^
  -e MYSQL_PORT=3306 ^
  -e MYSQL_DATABASE=yuqing ^
  -e MYSQL_USER=yuqing ^
  -e MYSQL_PASSWORD=changeme ^
  -e MYSQL_SKIP_ENSURE_DATABASE=true ^
  yuqing:latest
```

### PowerShell 快捷脚本（内部也是 `-e`）

```powershell
.\docker\run-mysql.ps1 -RootPassword "changeme" -Password "changeme"
.\docker\run-app.ps1 -Build -MysqlHost yuqing-mysql -MysqlUser yuqing -MysqlPassword "changeme"
```

### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `MYSQL_HOST` | 是 | 数据库主机 |
| `MYSQL_PASSWORD` | 是 | 密码 |
| `MYSQL_PORT` | 否 | 默认 3306 |
| `MYSQL_DATABASE` | 否 | 默认 yuqing |
| `MYSQL_USER` | 否 | 默认 root |
| `MYSQL_URL` | 否 | 连接串，优先于分项 |
| `MYSQL_SKIP_ENSURE_DATABASE` | 否 | `true` 跳过建库 |
| `SKIP_ENV_FILES` | 否 | `true` 时不读 `.env` / `.env.local` |

容器内只认 `docker run -e` 注入的值；镜像内不包含 `.env` 文件。

### 数据存在哪张表？

业务数据**不在** `sentiments` 表，而在：

```sql
SELECT collection, id, data, updated_at
FROM app_records
WHERE collection = 'sentiments'
ORDER BY updated_at DESC;
```

`data` 列为 JSON。页面增删改查都读写该表。

验证连接与条数：`GET http://localhost:8081/api/health`

清理历史演示数据（含 example.com 的备份种子）：

```sql
DELETE FROM app_records WHERE collection = 'sentiments';
```

---

## 本地开发

```bash
copy .env.example .env.local
npm install
npm run dev:api
npm run dev
```

本地可选用 `.env.local`；与 Docker 无关。
