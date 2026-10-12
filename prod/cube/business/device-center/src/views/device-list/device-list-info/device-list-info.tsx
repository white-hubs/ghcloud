import { computed, defineComponent, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { Button, Spin, TabPane, Tabs, Tag } from "@ghcloud/cube-ui";

import { SubDevice } from "./components/sub-device";
import { TabAttr } from "./components/tab-attr";
import { TabBaseInfo } from "./components/tab-base-info";
import { TabEvent } from "./components/tab-event";
import { TabService } from "./components/tab-service";
import { cubeDeviceCenterInternalService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { statusOptions, type DeviceInfo } from "@/types/device-type";

import "@/styles/common.less";

export const DeviceListInfo = defineComponent({
  setup: () => {
    const route = useRoute();
    const { id, subDeviceId, mainDevice } = route.query as { id: string; subDeviceId: string; mainDevice: string };

    const deviceId = ref(id || subDeviceId);
    const mainDeviceInfo = ref(mainDevice ? JSON.parse(mainDevice) : null);
    const state = reactive<{
      baseInfo: DeviceInfo;
      loading: boolean;
    }>({
      baseInfo: {
        name: "",
        deviceNumber: "",
        statusName: "",
        status: 0,
        onlineTime: 0,
        onlineTimeStr: "",
        product: {
          id: "",
        },
        slaveDeviceIds: "",
      },
      loading: true,
    });
    const activeKey = ref(0);
    const getDeviceInfo = async (): Promise<void> => {
      try {
        state.loading = true;
        const res = await cubeDeviceCenterInternalService.getDeviceDetail({ deviceId: deviceId.value });
        state.baseInfo = res as unknown as DeviceInfo;
      } catch {
      } finally {
        state.loading = false;
      }
    };

    const goBack = (): void => {
      history.back();
    };
    watch(
      [
        () => route.query.id as string | undefined,
        () => route.query.subDeviceId as string | undefined,
        () => route.query.mainDevice as string | undefined,
      ],
      async ([id, subDeviceId, mainDevice]) => {
        activeKey.value = 0;
        deviceId.value = id || subDeviceId;
        mainDeviceInfo.value = mainDevice ? JSON.parse(mainDevice) : null;
        await getDeviceInfo();
      },
      { immediate: true },
    );
    // 显示子设备内容
    const subDeviceVisible = computed(
      () => state.baseInfo.slaveDeviceIds && state.baseInfo.slaveDeviceIds?.split(",").length > 0 && !mainDeviceInfo.value,
    );

    const title = computed(() => (mainDeviceInfo.value ? "子设备详情" : "设备详情"));

    const renderMainDeviceInfo = (): JSX.Element | null => (
      <>
        <div class="top-info-item">主设备序列号：{mainDeviceInfo.value?.deviceNumber || "--"}</div>
        <div class="top-info-item">主设备名称：{mainDeviceInfo.value?.name || "--"}</div>
      </>
    );

    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        const curState = statusOptions.find((e) => e.value === state.baseInfo.status);
        return (
          <>
            <Spin spinning={state.loading}>
              <div>
                <div class="top-info">
                  {mainDeviceInfo.value && renderMainDeviceInfo()}
                  <div class="top-info-item">设备序列号：{state.baseInfo.deviceNumber || "--"}</div>
                  <div class="top-info-item">设备名称：{state.baseInfo.name || "--"}</div>
                  <div class="top-info-item">
                    设备状态：
                    {curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : "--"}
                  </div>
                  <div class="top-info-item">最后连接时间：{state.baseInfo.onlineTimeStr || "--"}</div>
                </div>
                {!state.loading && (
                  <Tabs v-model:activeKey={activeKey.value} destroyInactiveTabPane>
                    <TabPane key={0} tab="设备信息">
                      <TabBaseInfo id={deviceId.value} />
                    </TabPane>
                    <TabPane key={1} tab="属性">
                      <TabAttr id={deviceId.value} prodId={state.baseInfo.product.id} device={state.baseInfo} />
                    </TabPane>
                    <TabPane key={2} tab="事件">
                      <TabEvent id={deviceId.value} prodId={state.baseInfo.product.id} device={state.baseInfo} />
                    </TabPane>
                    <TabPane key={3} tab="服务">
                      <TabService deviceId={deviceId.value} prodId={state.baseInfo.product.id} />
                    </TabPane>
                    {subDeviceVisible.value && (
                      <TabPane key={4} tab="子设备">
                        <SubDevice mainDeviceId={deviceId.value} device={state.baseInfo} />
                      </TabPane>
                    )}
                  </Tabs>
                )}
              </div>
            </Spin>
          </>
        );
      },
      "footer-page": (): JSX.Element => (
        <>
          <Button onClick={goBack}>返回</Button>
        </>
      ),
    };

    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />;
  },
});
