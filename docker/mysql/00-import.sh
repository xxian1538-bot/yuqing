#!/bin/bash
set -euo pipefail

# 去掉 mysqldump 中的 GTID 行，避免 MySQL 官方镜像首次初始化失败
sed '/GTID_PURGED/d' /sql/backup.sql | mysql -uroot -p"${MYSQL_ROOT_PASSWORD}"
