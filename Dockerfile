# syntax=docker/dockerfile:1.7
# 启用 BuildKit 构建：$env:DOCKER_BUILDKIT=1; docker build -t yuqing:latest .

# ---------- 阶段1：只构建前端（改 server 代码不会重做 npm ci + vite）----------
FROM cmc-tcr.tencentcloudcr.com/panda/node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci

COPY index.html vite.config.ts postcss.config.mjs ./
COPY src ./src
RUN npm run build

# ---------- 阶段2：运行（基于 nginx 镜像，不再 apt-get 装 nginx）----------
FROM nginx:1.27-alpine AS runner

# nginx 已内置；用 apk 装 Node，通常几秒完成，且该层可长期缓存
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev \
 && npm install -g tsx

COPY server ./server
COPY src/app/types ./src/app/types
COPY src/app/utils ./src/app/utils
COPY src/app/data ./src/app/data

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3001
ENV SKIP_ENV_FILES=true
ENV SEED_MOCK_DATA=false

EXPOSE 8080

CMD ["sh", "-c", "cd /app && npx tsx server/index.ts & exec nginx -g 'daemon off;'"]
