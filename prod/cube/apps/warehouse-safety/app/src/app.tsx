import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import "./app-shell.less";

export const App = defineComponent({
  setup: () => () => (
    <ConfigProvider prefixCls="cube-warehouse-safety-app">
      <div class="warehouse-safety-app-shell">
        <div class="warehouse-safety-router">
          <RouterView />
        </div>
      </div>
    </ConfigProvider>
  ),
});
