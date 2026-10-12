import { Dropdown } from "ant-design-vue";
import { defineComponent, onMounted, ref } from "vue";

import type { RoamingRouteItem } from "./resolve-roaming-route";
import { ConfigLoader } from "@/application/config/config-loader";
import { eventInstance } from "@/visualization-core/event/event";
import { EventCore } from "@/visualization-core/event/event-core";

import styles from "./roaming-route.module.less";

/** 漫游路线 */
export const RoamingRoute = defineComponent({
  setup() {
    const options = ref<RoamingRouteItem[]>(ConfigLoader.config.roamingRoute ?? []);
    const selected = ref<string>("漫游路线");

    function handleClick(item: RoamingRouteItem): void {
      selected.value = item.name;
      eventInstance.emitEvent("startRoaming", item.route);
    }

    onMounted(() => {
      EventCore.registerEvent("resetRoamingRoute", () => {
        selected.value = "漫游路线";
      });
    });

    return (): JSX.Element => (
      <>
        <Dropdown
          getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
          v-slots={{
            overlay: () => {
              return (
                <div class={styles.list}>
                  {options.value.map((item) => {
                    return (
                      <div
                        class={styles["list-item"]}
                        key={item.id ?? item.name}
                        onClick={() => {
                          handleClick(item);
                        }}
                      >
                        <span>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              );
            },
          }}
        >
          <div class={styles.box} v-show={options.value.length > 0}>
            <span>{selected.value}</span>
          </div>
        </Dropdown>
      </>
    );
  },
});
