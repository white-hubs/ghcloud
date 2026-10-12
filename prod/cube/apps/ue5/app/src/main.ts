import { Application } from "./app";
import { failUe5BootLoader, reportUe5BootProgress } from "./application/bootstrap/boot-loader";
import { setupViewportScale } from "./application/bootstrap/viewport-scale";
import { syncAuthFromUrl } from "@/application/auth/session";
import { APP_ROUTE_PREFIX } from "@/constants/env";
import { installCardListScrollSnap } from "@/features/cards/base-panel-render/list-scroll-layout";

const bootstrap = async (): Promise<void> => {
  reportUe5BootProgress(70);
  setupViewportScale();
  installCardListScrollSnap();
  reportUe5BootProgress(74);

  try {
    await syncAuthFromUrl();
  } catch (error) {
    console.error("[ue5] sync auth from url failed", error);
  }
  reportUe5BootProgress(78);

  const app = new Application({ base: APP_ROUTE_PREFIX });
  await app.install();
};

bootstrap().catch((error) => {
  console.error("[ue5] bootstrap failed", error);
  failUe5BootLoader("应用启动失败，请刷新页面重试");
});
