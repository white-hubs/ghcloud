import { defineComponent, onMounted } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Space } from "@ghcloud/cube-ui";

const TARGETS: Record<string, string> = {
  overview: "/portal/genericEquipmentMonitor/overView",
  monitor: "/portal/genericEquipmentMonitor/overView",
  "alarm-config": "/portal/iot-center/alarmConfigList",
  "alarm-record": "/portal/genericEquipmentMonitor/alarmRecord",
  "equipment-association": "/portal/generic-equipment/equipment-association",
};

export const GenericRedirect = defineComponent({
  name: "GenericRedirect",
  setup() {
    const route = useRoute();
    const target = (): string => TARGETS[String(route.meta.target ?? "")] ?? "/portal/genericEquipmentMonitor/overView";
    const open = (): void => {
      window.location.href = target();
    };

    onMounted(() => {
      open();
    });

    return (): JSX.Element => (
      <CubeLayout
        title="通用能力"
        v-slots={{
          "layout-content": () => (
            <div style={{ padding: "24px" }}>
              <Space>
                <span>正在跳转到通用设备监测能力。</span>
                <Button type="primary" onClick={open}>
                  立即打开
                </Button>
              </Space>
            </div>
          ),
        }}
      />
    );
  },
});
