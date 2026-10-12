import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import { CubeMessageEvent } from "@ghcloud/cube-protocol";
import { getEnvironment } from "@ghcloud/cube-utils";

/**
 * 切换至目标微应用页面。
 * qiankun 内跨应用须通过 MF_ROOT_TO_APPLICATION 通知宿主切换子应用（仅 pushState 不会卸载当前应用）。
 */
export function openBusinessPage(applicationCode: string, url: string): void {
  const environment = getEnvironment();
  if (environment === "cubeDesktopClient" || environment === "iframe") {
    window.parent.postMessage(
      {
        type: CubeMessageEvent.TO_BUSINESS_PAGE,
        data: {
          code: applicationCode,
          path: url,
        },
      },
      "*",
    );
    return;
  }
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, {
      code: applicationCode,
      path: url,
    });
    return;
  }
  history.pushState({ current: location.pathname + location.search }, "", url);
}
