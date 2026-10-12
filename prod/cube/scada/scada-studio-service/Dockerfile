FROM oven/bun:1 AS builder

WORKDIR /app

COPY .npmrc ./
COPY prod/cube/scada/scada-studio-service/package.docker.json ./package.json
COPY prod/cube/scada/basic/core ./prod/cube/scada/basic/core
COPY prod/cube/scada/scada-studio-service ./prod/cube/scada/scada-studio-service

RUN bun -e "const fs = require('fs'); const file = 'prod/cube/scada/basic/core/package.json'; const pkg = JSON.parse(fs.readFileSync(file, 'utf8')); if (pkg.peerDependencies?.typescript) pkg.peerDependencies.typescript = '^5.9.3'; fs.writeFileSync(file, JSON.stringify(pkg, null, 2));"
RUN bun install
RUN bun build prod/cube/scada/scada-studio-service/src/main.ts --target bun --compile --outfile prod/cube/scada/scada-studio-service/dist/server

FROM debian:bookworm-slim AS runner

WORKDIR /app/prod/cube/scada/scada-studio-service

COPY --from=builder /app/prod/cube/scada/scada-studio-service/dist/server ./server

RUN chmod +x ./server && mkdir -p ./data

EXPOSE 3100

CMD ["./server"]
