import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import "@/assets/style.less";

/** 开河蓝，与 `rgb(24, 144, 255)` 一致 */
const COLOR_PRIMARY_KAIHE = "#1890ff";

export const App = defineComponent({
  name: "FumigationOperation",
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider
        prefixCls="fumigation-operation"
        theme={{
          token: {
            colorPrimary: COLOR_PRIMARY_KAIHE,
          },
        }}
      >
        <div class="fumigation-app-view">
          <RouterView />
        </div>
      </ConfigProvider>
    );
  },
});
