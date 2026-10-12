import { qiankunWindow, renderWithQiankun } from "vite-plugin-qiankun/dist/helper";
import { createApp, ref, type App as VueApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import type { AuthState } from "@ghcloud/cube-services-client";
import { initGenericComponentAuth } from "@ghcloud/generic-component";

import { App } from "./app.tsx";
import { authRequest } from "./hooks/auth-request.ts";
import { routes } from "./routes.ts";

const appRef = ref<VueApp | null>(null);

const render = (props: unknown): void => {
  const app = createApp(App);
  const { auth, base } = props as { auth: AuthState; base: string };
  authRequest.updateAuth(auth);
  initGenericComponentAuth({
    tenant: auth.tenant ?? "",
    token: auth.token ?? "",
  });
  app.use(
    createRouter({
      history: createWebHistory(base),
      routes,
    }),
  );

  app.mount("#cube-visualization-app");
  appRef.value = app;
};

async function bootstrap(): Promise<void> {}

async function mount(props: unknown): Promise<void> {
  render(props);
}

async function unmount(): Promise<void> {
  appRef.value?.unmount();
  appRef.value = null;
}

async function update(props: unknown): Promise<void> {
  void props;
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({ auth: {} as AuthState, base: "/" });
} else {
  renderWithQiankun({
    bootstrap,
    mount,
    unmount,
    update,
  });
}
