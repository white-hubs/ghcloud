import { initCubePlayerAuth, loadPlayerSDK } from "@ghcloud/cube-player";

import { authStore } from "@/api/auth-store";

export function syncCubePlayerAuth(): void {
  initCubePlayerAuth({
    tenant: authStore.tenant,
    token: authStore.token,
    terminal: authStore.terminal,
  });
}

export async function prepareCubePlayer(): Promise<void> {
  syncCubePlayerAuth();
  await loadPlayerSDK();
}
