# 构建阶段
FROM cmc-tcr.tencentcloudcr.com/panda/node:20 AS builder

WORKDIR /app

# 安装阶段不要设 NODE_ENV=production，否则会省略 devDependencies（Vite 等装不上）
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# 运行阶段（与构建相同基础镜像，便于只拉取你们仓库里的镜像）
FROM cmc-tcr.tencentcloudcr.com/panda/node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN npm install -g serve@14

COPY --from=builder /app/dist ./dist

EXPOSE 8080

USER node

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
