import { createVNode, defineComponent, KeepAlive, onMounted, ref, Transition, type VNode } from "vue";
import { RouterView } from "vue-router";

import { ThemeConfigProvider } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import "vant/lib/index.css";
import "@/assets/style.less";

export const App = defineComponent({
  setup: () => {
    const theme = ref("lightBlue");
    onMounted(async () => {
      if (getEnvironment() === "cubeApp") {
        theme.value = (await cubeAppService.getAppTheme()) ?? "lightBlue";
        cubeAppService.onVisibilityNativeAppBar(false);
      }
    });
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView>
          {({ Component }: { Component: VNode }) => {
            return (
              <Transition name="van-fade">
                <KeepAlive include={["Entry"]}>{createVNode(Component)}</KeepAlive>
              </Transition>
            );
          }}
        </RouterView>
      </ThemeConfigProvider>
    );
  },
});
