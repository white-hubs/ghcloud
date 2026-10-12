import { setAuthInfo as setGlobalAuthObject } from "@ghcloud/cube-auth-utils";
import type { CubeAuth, UserInfo } from "@ghcloud/cube-ouaa-service";
import { defineStore } from "pinia";

export const useMfRootStore = defineStore("mf-root", {
  state: (): {
    userInfo: UserInfo | null;
    authInfo: CubeAuth | null;
    jti: string;
    refreshToken: string;
    unReadMessageNum: number;
  } => ({
    userInfo: null,
    authInfo: null,
    jti: "",
    refreshToken: sessionStorage.getItem("GH-RefreshToken") || "",
    unReadMessageNum: 0,
  }),
  actions: {
    clearAuthInfo() {
      this.authInfo = null;
      this.userInfo = null;
      this.jti = "";
      this.refreshToken = "";
      sessionStorage.removeItem("GH-Token");
      sessionStorage.removeItem("GH-NowEnterprise");
      sessionStorage.removeItem("GH-RefreshToken");
      sessionStorage.removeItem("GH-Jti");
    },
    setAuthInfo(authInfo: CubeAuth, refreshToken?: string, jti?: string) {
      if (!authInfo.token) {
        return;
      }
      if (refreshToken) {
        this.refreshToken = refreshToken;
        sessionStorage.setItem("GH-RefreshToken", refreshToken);
      }
      if (jti) {
        this.jti = jti;
        sessionStorage.setItem("GH-Jti", jti);
      }
      this.authInfo = authInfo;
      sessionStorage.setItem(
        "GH-Token",
        JSON.stringify({
          access_token: authInfo.token,
        }),
      );
      sessionStorage.setItem("GH-NowEnterprise", JSON.stringify({ code: authInfo.tenant }));
      setGlobalAuthObject(authInfo);
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },
  },
});
