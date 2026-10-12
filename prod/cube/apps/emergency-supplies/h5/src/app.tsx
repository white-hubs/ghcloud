import { defineComponent, onMounted, ref } from "vue";
import { RouterView } from "vue-router";

import { ThemeConfigProvider } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import "vant/lib/index.css";
import "@/assets/style.less";

export const App = defineComponent({
  name: "EmergencySuppliesH5",
  setup: () => {
    const theme = ref("lightBlue");

    onMounted(async () => {
      if (getEnvironment() !== "cubeApp") {
        return;
      }
      try {
        theme.value = (await cubeAppService.getAppTheme()) ?? "lightBlue";
      } catch {
        theme.value = "lightBlue";
      }
    });

    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView />
      </ThemeConfigProvider>
    );
  },
});
