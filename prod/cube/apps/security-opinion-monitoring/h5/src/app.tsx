import { KeepAlive, Transition, createVNode, defineComponent, onMounted, ref, type VNode } from "vue";
import { RouterView } from "vue-router";

import { ThemeConfigProvider } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";

import "vant/lib/index.css";

export const App = defineComponent({
  name: "App",
  setup: () => {
    const theme = ref("lightBlue");
    onMounted(async () => {
      if (getEnvironment() === "cubeApp") {
        theme.value = (await cubeAppService.getAppTheme()) ?? "lightBlue";
        cubeAppService.onVisibilityNativeAppBar(false);
      }
    });
    return (): VNode => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView>
          {({ Component }: { Component: VNode }) => (
            <Transition name="van-fade">
              <KeepAlive include={[]}>{createVNode(Component)}</KeepAlive>
            </Transition>
          )}
        </RouterView>
      </ThemeConfigProvider>
    );
  },
});
