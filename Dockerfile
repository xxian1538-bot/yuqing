# 构建前端
FROM cmc-tcr.tencentcloudcr.com/panda/node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# 运行：Nginx + API，数据库连接由 docker run -e / --env-file 注入
FROM cmc-tcr.tencentcloudcr.com/panda/node:20 AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install -g tsx

COPY server ./server
COPY src ./src
COPY docker/start.sh ./docker/start.sh
RUN sed -i 's/\r$//' /app/docker/start.sh && chmod +x /app/docker/start.sh
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3001
ENV SKIP_ENV_FILES=true
ENV SEED_MOCK_DATA=false

EXPOSE 8080

# 避免 Windows CRLF 导致 start.sh 中 set -e 报错
CMD ["sh", "-c", "cd /app && npx tsx server/index.ts & exec nginx -g 'daemon off;'"]
