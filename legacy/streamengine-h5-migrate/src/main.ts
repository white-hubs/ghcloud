import { setCustomHeaders } from "@ghcloud/cube-app-js-sdk";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initAuthStore as initAppDesignAuthStore } from "@ghcloud/cube-h5-design/src/api/auth-store.ts";
import { CubeAuth, CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { initAuthStore } from "./service/auth-store";

async function bootstrap(): Promise<void> {
  // 处理鉴权信息
  await handleAuthStore();
  await import("./service/staff/staff.service");
  await import("./app");
}
async function handleAuthStore(): Promise<void> {
  const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
  let authInfo: CubeAuth = {
    token: "",
    tenant: "",
    terminal: CubeTerminalEnum.APP,
  };
  // 方便开发时自定义token
  if (env.includes("dev")) {
    authInfo.token =
      "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiMjMwMTM0MjQiLCI0MDYxNDc2OSIsIjExNjk0MjIyIiwiNDAyNTExMCIsIjY3ODI2ODA0IiwiNjU0MDYyMzEiLCI5NDczNjk1IiwiODQ5MDI3MzAiLCI3MDczNTEzMCIsIjIzODYyMjQ5IiwiOTYwODA0MTkiLCI2ODU0NzEyOCIsIjM3Mzg2NDI4Il0sInBhc3N3b3JkX2V4cGlyZWQiOmZhbHNlLCJ1c2VyX25hbWUiOiIxMzY4OTA0MDcxMCIsImlzcyI6Imh0dHA6Ly8xMC4xMjUuMTAuMjAwOjQwMDkiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6ZmFsc2UsImF1ZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsIm5iZiI6MTc4MzQxMjU3OSwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbIjY3ODI2ODA0IiwiNjU0MDYyMzEiLCI5NDczNjk1IiwiODQ5MDI3MzAiLCI3MDczNTEzMCIsIjIzODYyMjQ5Il0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi5p2O5p2wIiwiaWQiOiIxODIxMzgzODM4MDgxMjY1NjY1IiwiZXhwIjoxODgzNDEyNTc5LCJpYXQiOjE3ODM0MTI1NzksImp0aSI6IjYwMDBlZWIyLTY4MzYtNGE3MC1iMTIxLTFiNjVmNjljYWNiNCJ9.Oi8iy1LlXH1tay4u3u1Au0DORwKs0r1pmwZlyrv3p-s-f16HqLU5vKTfo3Ri6d9TITotYcsBPdLPr87uXbfmOHlQln11BX8HeTLT6esRhGQKa4qTql7xBJh4wbecLpZYU9c5j1pJmjM9YG6rhfLtg3eMMbPZbD3E7R1MzWHcF0JsoNErBweiIPEOsZcLHYm_g6pNXLlM2NGGMUdMicmWJnb5KZm-e3WojRmDIZuNnAsr9g3qoS9q-Jo7-DlVYn1H7CaY6wP6VzXMwXXc48Sb6n0miRjO-FUIzep_4P4ejkwIn0LNmxefBLekS_zAiD_rkxQ-ECrkZWLTEP8nSJ3bnw";
    authInfo.tenant = "37386428";
  } else {
    authInfo = await getAuthInfo();
  }
  setCustomHeaders({
    Authorization: authInfo.token.includes("Bearer") ? authInfo.token : "Bearer " + authInfo.token,
    tenant: authInfo.tenant,
    terminal: authInfo.terminal,
  });
  initAuthStore(authInfo);
  initAppDesignAuthStore(authInfo);
}
bootstrap()
  .then(() => {})
  .catch((e) => {});
