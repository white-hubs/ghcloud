import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";
import "dayjs/locale/zh-cn";

import { antd3LegacyThemeManager, themeManager } from "@ghcloud/cube-theme";

export const App = defineComponent({
  setup() {
    const locale = ref(zhCN);
    dayjs.locale("zh-cn");

    onMounted(() => {
      themeManager.mount();
      antd3LegacyThemeManager.mount();
    });

    return (): JSX.Element => (
      <a-config-provider locale={locale.value}>
        <router-view />
      </a-config-provider>
    );
  },
});

export default App;
