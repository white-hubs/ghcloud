import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import "@/assets/style.less";

const COLOR_PRIMARY_KAIHE = "#1890ff";

export const App = defineComponent({
  name: "EmergencyDispatch",
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls="emergency-dispatch" theme={{ token: { colorPrimary: COLOR_PRIMARY_KAIHE } }}>
        <RouterView />
      </ConfigProvider>
    );
  },
});
