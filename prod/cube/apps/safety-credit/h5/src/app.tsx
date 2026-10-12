import { KeepAlive, Transition, createVNode, defineComponent, onMounted, ref, type VNode } from "vue";
import { RouterView } from "vue-router";

import { ThemeConfigProvider } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";

import "vant/lib/index.css";

export const App = defineComponent({
  setup: () => {
    const theme = ref("");
    onMounted(async () => {
      theme.value = (await cubeAppService.getAppTheme()) ?? "lightBlue";
      cubeAppService.onVisibilityNativeAppBar(false);
    });
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView>
          {({ Component }: { Component: VNode }) => (
            <Transition name="van-fade">
              <KeepAlive include={["Entry", "CreditHome", "MerchantBehaviorList"]}>{createVNode(Component)}</KeepAlive>
            </Transition>
          )}
        </RouterView>
      </ThemeConfigProvider>
    );
  },
});
