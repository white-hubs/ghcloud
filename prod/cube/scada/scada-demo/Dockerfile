FROM oven/bun:1 AS builder

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

RUN bun run --cwd prod/cube/scada/scada-demo build:prod

FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/prod/cube/scada/scada-demo/dist /usr/share/nginx/html
COPY prod/cube/scada/scada-demo/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
