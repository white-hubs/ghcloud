import { createElement } from "react";
import ReactDOM, { type Root } from "react-dom/client";

import "./setup-locale";
import { renderWithQiankun, qiankunWindow } from "vite-plugin-qiankun/dist/helper";

import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { initAuthStore } from "./api/auth-store";
import { initServer } from "./api/server";
import { App } from "./app";

const projectName = "todo-center-app";
let rootData: Root | null = null;

async function bootstrap(): Promise<void> {
  const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
  let authInfo: CubeAuth = {
    token: "",
    tenant: "",
    terminal: CubeTerminalEnum.BUSINESS,
  };

  // 方便开发时自定义token
  if (env === "development" || env === "dev") {
    authInfo.token =
      "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCIyOTQ1NDgwOCJdLCJwYXNzd29yZF9leHBpcmVkIjpmYWxzZSwidXNlcl9uYW1lIjoiMTM4ODg4ODg4ODEiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4wLjI0MzoxMDA4NiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjp0cnVlLCJhdWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJuYmYiOjE3NzUxMTQyODIsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyIyOTQ1NDgwOCJdLCJzY29wZSI6WyJzZWxlY3QiXSwibmFtZSI6IueOi-aYreWQmyIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6eyJkYXRlIjp7InllYXIiOjIwMjYsIm1vbnRoIjoxMSwiZGF5IjozfSwidGltZSI6eyJob3VyIjoxMCwibWludXRlIjoyMSwic2Vjb25kIjo1NiwibmFubyI6MH19LCJpZCI6IjE3NzA3MTkwMDA0NTI0NzY5MjkiLCJleHAiOjE4NzUxMTQyODIsImlhdCI6MTc3NTExNDI4MiwianRpIjoiYzE3ZTUwMmQtNGRjNC00NDMxLWJkNzctYTM0OTU2MzE0ZGMxIn0.KiYD5e36FWIKB64sQAf3uZZtZQ6PNmr9qR4m-GmiV8lMGPSw3Gt1JIii3aF1UnfH4-ydxHcBM8jK--5FseBlXAYzWzVyd70sP_YjIzSZpFoGDUODjDEbbMebo-8snkeHgSyfhRh1Qcy62qipSM3MFABHMosTU12OMR38T67CHiY-a6_5LosaknFikoX6QgjHnikigN8haFMtiUz0PH79FX9f2-Gl6uMtlsFZhjvnu33QSl8Olek8V12ovNgLu8elOFVXDBiUt6P5tuIFKIsOTc4UZOkcPIkNZdR-smM3B-tUIoH875yPNWa-ShF986xtc_VsehP9SCHiOAJMJtfeiw";
    authInfo.tenant = "29454808";
  } else {
    authInfo = (await getAuthInfo()) as CubeAuth;
  }
  initAuthStore(authInfo);
  initServer();
  const container = document.getElementById(projectName);
  if (!container) {
    throw new ReferenceError("Unexpected container is null!");
  }
  const root = ReactDOM.createRoot(container);
  rootData = root;
  root.render(createElement(App));
}

renderWithQiankun({
  bootstrap: () => {},
  mount: () => {
    bootstrap();
  },
  unmount: () => {
    rootData?.unmount();
  },
  update: () => {},
});
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  bootstrap();
}
