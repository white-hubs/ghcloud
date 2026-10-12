import { Badge } from "ant-design-vue";
import { defineComponent, reactive, ref } from "vue";

import { recordStatus } from "@/infrastructure/api/alarm";
import { EventCore } from "@/visualization-core/event/event-core";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./alarm-entry.module.less";

export const AlarmEntry = defineComponent({
  setup() {
    const { globalState } = useStateStore();
    const count = ref(0);
    const storagePanel = reactive({
      leftPanel: "",
      rightPanel: "",
    });
    /** 获取报警数量 */
    const getAlarmCount = async (): Promise<void> => {
      const res = await recordStatus();
      count.value = res.alarmUnresolvedHandlerNum;
    };
    EventCore.registerEvent("refreshAlarmBadge", getAlarmCount);
    EventCore.registerEvent("alarmPlaneUnmounted", () => {
      storagePanel.leftPanel = "";
      storagePanel.rightPanel = "";
    });
    getAlarmCount();

    function handleClick(): void {
      globalState.panel.visible = false;

      if (storagePanel.leftPanel || storagePanel.rightPanel) {
        setTimeout(() => {
          globalState.panel.leftPanelName = storagePanel.leftPanel;
          globalState.panel.rightPanelName = storagePanel.rightPanel;
          storagePanel.leftPanel = "";
          storagePanel.rightPanel = "";
          globalState.panel.visible = true;
        }, 500);
      } else {
        setTimeout(() => {
          storagePanel.leftPanel = globalState.panel.leftPanelName;
          storagePanel.rightPanel = globalState.panel.rightPanelName;
          globalState.panel.leftPanelName = null;
          globalState.panel.rightPanelName = null;
          globalState.panel.visible = true;
          globalState.panel.rightPanelName = "AlarmListPanel";
        }, 500);
      }
    }

    return (): JSX.Element => {
      return (
        <div class={styles.alarm} onClick={handleClick}>
          <Badge dot={count.value > 0}>
            <span class={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a7 7 0 0 0-7 7v3.2l-1.8 2.7h17.6L19 12.2V9a7 7 0 0 0-7-7Zm0 19a2.8 2.8 0 0 0 2.7-2h-5.4A2.8 2.8 0 0 0 12 21Z" />
              </svg>
            </span>
          </Badge>
        </div>
      );
    };
  },
});
