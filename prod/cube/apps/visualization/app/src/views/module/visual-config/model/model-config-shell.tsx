import { defineAsyncComponent, defineComponent, onMounted, provide, watch } from "vue";

import { Empty } from "@ghcloud/cube-ui";

import { ConfigShell } from "../config-shell";
import { MODEL_CONFIGURATION_KEY, useModelConfiguration } from "./composables/use-model-configuration";
import { useProjectId } from "@/hooks/use-project-id";

import shellStyles from "../config-shell.module.less";

const RenderSettings = defineAsyncComponent(() => import("./render-settings/render-settings"));
const IntroducingModels = defineAsyncComponent(() => import("./introducing-models/introducing-models"));
const PerspectiveConfiguration = defineAsyncComponent(() => import("./perspective-configuration/perspective-configuration"));
const RoamingRoute = defineAsyncComponent(() => import("./roaming-route/roaming-route"));
const OtherSettings = defineAsyncComponent(() => import("./other-settings/other-settings"));
const GuideSettings = defineAsyncComponent(() => import("./guide-settings/guide-settings"));

export default defineComponent({
  name: "ModelConfigShell",
  setup() {
    const { projectId, ensureProjectId } = useProjectId();
    const modelApi = useModelConfiguration(projectId);

    provide(MODEL_CONFIGURATION_KEY, modelApi);

    onMounted(() => {
      if (ensureProjectId()) {
        void modelApi.load();
      }
    });

    watch(projectId, (id, prev) => {
      if (id && id !== prev) {
        void modelApi.load();
      }
    });

    const renderTab = (activeTab: string): JSX.Element => {
      if (activeTab === "render") {
        return <RenderSettings />;
      }
      if (activeTab === "models") {
        return <IntroducingModels />;
      }
      if (activeTab === "perspective") {
        return <PerspectiveConfiguration />;
      }
      if (activeTab === "roaming") {
        return <RoamingRoute />;
      }
      if (activeTab === "other") {
        return <OtherSettings />;
      }
      if (activeTab === "guide") {
        return <GuideSettings />;
      }
      return <Empty class={shellStyles.empty} description="该配置页将在后续阶段迁入" />;
    };

    return () => (
      <ConfigShell
        group="model"
        contentLoading={modelApi.loading.value}
        v-slots={{
          default: ({ activeTab }: { activeTab: string }) => renderTab(activeTab),
        }}
      />
    );
  },
});
