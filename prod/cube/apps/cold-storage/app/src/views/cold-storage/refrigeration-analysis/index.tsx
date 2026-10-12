import { defineComponent, shallowRef } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";

import { PrototypeTabs } from "../shared/components";
import { EnergyAnalysisTab } from "./components/energy-analysis-tab";
import { HealthDashboardTab } from "./components/health-dashboard-tab";

import "./index.less";

export const RefrigerationAnalysisPage = defineComponent({
  name: "RefrigerationAnalysisPage",
  setup: () => {
    const activeTab = shallowRef("health");

    const content = (): JSX.Element => (
      <div class="cs-page">
        <PrototypeTabs
          tabs={[
            { key: "health", label: "健康度看板" },
            { key: "energy", label: "能效分析" },
          ]}
          activeKey={activeTab.value}
          onUpdate:activeKey={(key: string) => {
            activeTab.value = key;
          }}
        />
        {activeTab.value === "health" ? <HealthDashboardTab /> : <EnergyAnalysisTab />}
      </div>
    );

    return () => <CubeLayout title="制冷分析" showFooter={false} v-slots={{ "layout-content": content }} />;
  },
});
