import { BatchHandleAlarmModal } from "./components/batch-handle-alarm-modal";
import { TabPaneAlarmDetail } from "./components/tab-pane-alarm-detail";
import { TabPaneAlarmNotice } from "./components/tab-pane-alarm-notice";
import { TabPaneLinkAction } from "./components/tab-pane-link-action";
import { Layout } from "@/components/layout/layout";
import { Button, TabPane, Tabs } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

/** 设备通知 - 详情 */
export const DeviceHealthAlarmDetail = defineComponent({
  setup: () => {
    const { id, businessKey, alarmStatus } = useRoute().query as { id: string; businessKey: string; alarmStatus: string };
    const batchHandleAlarmModalRef = ref<{ openModal: () => void }>();
    const activeKey = ref("报警详情");
    const loading = ref(false);

    onMounted(() => {
      loading.value = true;
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Tabs v-model:activeKey={activeKey.value} destroyInactiveTabPane>
            <TabPane key="报警详情" tab="报警详情">
              <TabPaneAlarmDetail id={id} businessKey={businessKey} alarmStatus={alarmStatus} />
            </TabPane>
            <TabPane key="联动动作" tab="联动动作">
              <TabPaneLinkAction id={id} businessKey={businessKey} />
            </TabPane>
            <TabPane key="处理记录" tab="处理记录">
              <TabPaneAlarmNotice id={id} businessKey={businessKey} />
            </TabPane>
          </Tabs>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Button type="primary">故障报修</Button>
          <Button type="primary" style={{ marginLeft: "10px" }}>
            报警确认
          </Button>
          <Button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>
        </>
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="通知配置详情" v-slots={layoutSlots} />
        <BatchHandleAlarmModal ref={batchHandleAlarmModalRef} />
      </>
    );
  },
});
