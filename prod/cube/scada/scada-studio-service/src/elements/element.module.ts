import { Module, DatabaseModule } from "@dangao/bun-server";

import { ElementController } from "./element.controller";
import { ElementService } from "./element.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ElementController],
  providers: [ElementService],
  exports: [ElementService],
})
export class ElementModule {}
