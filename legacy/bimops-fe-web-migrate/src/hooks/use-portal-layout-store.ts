import { defineStore } from "pinia";
import type { RouteLocationNormalized } from "vue-router";

import { _query } from "@/utils/route-query.js";

export const usePortalLayoutStore = defineStore("portal-layout", {
  state: (): { isPortalImmersive: boolean; isPortalMenuHidden: boolean } => ({
    isPortalImmersive: false,
    isPortalMenuHidden: false,
  }),
  actions: {
    syncFromRoute(to: RouteLocationNormalized): void {
      const inPortal = to.path.includes("/portal/");
      this.isPortalImmersive = inPortal && _query(to.query, "isFullWindow");
      // hideMenu 仅收起左侧菜单；isFullWindow 保持原有「顶栏 + 菜单全部隐藏」语义。
      this.isPortalMenuHidden = inPortal && (this.isPortalImmersive || _query(to.query, "hideMenu"));
    },
    clear(): void {
      this.isPortalImmersive = false;
      this.isPortalMenuHidden = false;
    },
  },
});
