import { defineComponent } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { usePageName } from "@ghcloud/cube-utils";
import { DeviceModalTable } from "@ghcloud/generic-component";

import { AreaTreePanel } from "./components/area-tree-panel";
import { RouteFormModal } from "./components/route-form-modal";
import { RouteListTable } from "./components/route-list-table";
import { RouteMapCanvas } from "./components/route-map-canvas";
import { useEvacuationRouteState } from "./composables/use-evacuation-route-state";
import { APPLICATION_CODE } from "@/constants/env";

import styles from "./index.module.less";

export const EvacuationRouteConfig = defineComponent({
  name: "EvacuationRouteConfig",
  setup: () => {
    const { pageTitle } = usePageName();
    const state = useEvacuationRouteState();

    return (): JSX.Element => (
      <CubeLayout title={pageTitle} showFooter={false}>
        {{
          "layout-content": () => (
            <div class={styles.page}>
              <div class={styles.layout}>
                <aside class={styles.sidebar}>
                  <AreaTreePanel state={state} />
                </aside>
                <main class={styles.main}>
                  <div class={styles.card}>
                    <RouteMapCanvas state={state} />
                  </div>
                  <RouteListTable state={state} />
                </main>
              </div>
            </div>
          ),
          default: () => (
            <>
              <RouteFormModal state={state} />
              <DeviceModalTable
                ref={state.deviceModalTableRef}
                v-model:value={state.deviceList.value}
                multiple
                applicationCode={APPLICATION_CODE}
                tagCodes={[state.tagCode]}
                title="关联设备"
                onOk={(values: { id: string; name: string }[]) => {
                  void state.handleCameraBindOk(values);
                }}
              />
            </>
          ),
        }}
      </CubeLayout>
    );
  },
});
