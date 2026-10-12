import { defineAsyncComponent, defineComponent } from "vue";

import { Empty } from "@ghcloud/cube-ui";

import { ConfigShell } from "../config-shell";

import shellStyles from "../config-shell.module.less";

const BusinessMenu = defineAsyncComponent(() => import("./business-menu/business-menu"));
const DeviceAssociation = defineAsyncComponent(() => import("./device-association/device-association"));
const PanelConfig = defineAsyncComponent(() => import("./panel-config/panel-config"));

export default defineComponent({
  name: "BusinessConfigShell",
  setup() {
    const renderTab = (activeTab: string): JSX.Element => {
      if (activeTab === "menu") {
        return <BusinessMenu />;
      }
      if (activeTab === "panel") {
        return <PanelConfig />;
      }
      if (activeTab === "device") {
        return <DeviceAssociation />;
      }
      return <Empty class={shellStyles.empty} description="该配置页将在后续阶段迁入" />;
    };

    return () => (
      <ConfigShell
        group="business"
        v-slots={{
          default: ({ activeTab }: { activeTab: string }) => renderTab(activeTab),
        }}
      />
    );
  },
});
