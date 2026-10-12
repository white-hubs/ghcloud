import { Module, DatabaseModule } from "@dangao/bun-server";

import { PageController } from "./page.controller";
import { PageService } from "./page.service";

@Module({
  imports: [DatabaseModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
