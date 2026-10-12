import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import { defineComponent, ref } from "vue";
import { RouterView } from "vue-router";

import { MFRootEventNameEnum, subscriber } from "@ghcloud/cube-mf-root";
import { themeManager } from "@ghcloud/cube-theme";

import "ant-design-vue/dist/reset.css";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

const PREFIX_CLS = "cube-visualization-app";

export const App = defineComponent({
  name: "CubeVisualizationApp",
  setup: () => {
    const colorPrimary = ref(themeManager.getCurrentThemePrimaryColor());
    subscriber.subscribe<string>(MFRootEventNameEnum.MF_ROOT_CHANGE_SKIN, (info) => {
      colorPrimary.value = info.data;
    });
    return (): JSX.Element => {
      return (
        <ConfigProvider prefixCls={PREFIX_CLS} locale={zhCN} theme={{ token: { colorPrimary: colorPrimary.value } }}>
          <RouterView />
        </ConfigProvider>
      );
    };
  },
});
