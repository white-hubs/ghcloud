import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import styles from "./app.module.less";

export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls="drone">
        <div class={styles.appShell}>
          <RouterView />
        </div>
      </ConfigProvider>
    );
  },
});
