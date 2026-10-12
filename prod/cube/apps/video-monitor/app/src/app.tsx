import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import { computed, defineComponent, ref } from "vue";
import { RouterView } from "vue-router";

import { MFRootEventNameEnum, subscriber, type MFRootThemePayload } from "@ghcloud/cube-mf-root";
import "dayjs/locale/zh-cn";

import { applyLegacyPrimaryColor, createAntTheme, normalizeThemePayload, readInitialTheme } from "./theme";

import "./styles/theme.less";

dayjs.locale("zh-cn");

export const App = defineComponent({
  setup: () => {
    const currentTheme = ref(readInitialTheme());
    const antTheme = computed(() => createAntTheme(currentTheme.value));

    const getAppContainer = (): HTMLElement => {
      return (
        document.querySelector<HTMLElement>("#cube-video-monitor-app .cube-video-monitor-theme") ??
        document.getElementById("cube-video-monitor-app") ??
        document.body
      );
    };

    subscriber.subscribe<MFRootThemePayload>(MFRootEventNameEnum.MF_ROOT_CHANGE_THEME, (info) => {
      currentTheme.value = normalizeThemePayload(info.data, currentTheme.value);
    });

    subscriber.subscribe<string>(MFRootEventNameEnum.MF_ROOT_CHANGE_SKIN, (info) => {
      currentTheme.value = applyLegacyPrimaryColor(currentTheme.value, info.data);
    });

    return (): JSX.Element => {
      return (
        <ConfigProvider
          prefixCls="cube-video-monitor-app"
          locale={zhCN}
          theme={antTheme.value}
          getPopupContainer={getAppContainer}
          getTargetContainer={getAppContainer}
        >
          <div class="cube-video-monitor-theme" data-theme={currentTheme.value.mode}>
            <RouterView />
          </div>
        </ConfigProvider>
      );
    };
  },
});
