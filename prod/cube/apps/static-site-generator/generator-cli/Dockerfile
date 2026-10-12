FROM oven/bun:1-debian

WORKDIR /app

RUN echo 'install.registry=https://registry.npmmirror.com' > .bunrc

COPY generator-cli ./generator-cli
COPY ssg-components ./ssg-components

RUN echo '{"name":"root","private":true,"workspaces":["generator-cli","ssg-components"],"catalog":{"@types/node":"22.13.10","typescript":"5.9.3","vue":"3.3.9","vue-tsc":"1.2.0"}}' > package.json

RUN bun install

RUN mkdir -p /app/output

CMD ["sh", "-c", "SSG_INPUT_DIR=/app/input bun --cwd /app/generator-cli src/cli.ts build --input /app/input --tar"]
