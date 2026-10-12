import { Application } from "@dangao/bun-server";

const port = Number(process.env.PORT) || 3100;
/** 默认 0.0.0.0，便于局域网访问；仅本机可设环境变量 HOST=127.0.0.1 */
const hostname = process.env.HOST ?? "0.0.0.0";

// Application must be instantiated first to initialize the runtime,
// before any module files (which call DatabaseModule.forRoot etc.) are evaluated.
const app = new Application({ port, hostname });

const { AppModule } = await import("./app.module");
app.registerModule(AppModule);

await app.listen();
console.log(`[Cube SCADA Server] Listening on http://${hostname}:${port}`);
