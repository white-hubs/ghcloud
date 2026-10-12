import { DatabaseModule, LoggerModule, Module } from "@dangao/bun-server";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ElementModule } from "./elements/element.module";
import { PageModule } from "./pages/page.module";
import { ProjectModule } from "./projects/project.module";

const serverRoot = dirname(fileURLToPath(import.meta.url));
const dataDir = join(serverRoot, "../data");
mkdirSync(dataDir, { recursive: true });

@Module({
  imports: [
    DatabaseModule.forRoot({
      database: {
        type: "sqlite",
        config: {
          path: join(dataDir, "scada.db"),
        },
      },
    }),
    LoggerModule.forRoot({}),
    PageModule,
    ElementModule,
    ProjectModule,
  ],
})
export class AppModule {}
