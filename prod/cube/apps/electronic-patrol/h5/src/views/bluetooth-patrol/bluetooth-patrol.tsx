import { showNotify, PullRefresh, CellGroup, Cell, Button } from "vant";
import { defineComponent, onBeforeMount, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { PatrolPointVo } from "@ghcloud/cube-electronic-patrol-service";

import { cubeElectronPatrolService } from "@/api/server";
import { handleStorePatrolPoint, usePatrolStore } from "@/custom-store/use-patrol-store";
import { updatePatrolLocationIfAbsent } from "@/utils/update-patrol-location";

import styles from "./index.module.less";

export const BluetoothPatrol = defineComponent({
  setup: () => {
    const route = useRoute();
    const patrolStore = usePatrolStore();
    const state = reactive<{
      pointList: PatrolPointVo[];
      loading: boolean;
    }>({
      pointList: [],
      loading: false,
    });
    const router = useRouter();
    const initScanBluetooth = async (): Promise<void> => {
      if (state.loading) return;
      if (getEnvironment() !== "cubeApp") {
        showNotify({
          type: "warning",
          message: "请在cubeApp中打开",
        });
        return;
      }
      state.loading = true;
      const bluetoothCodes = await cubeAppService.onScanBluetooth();
      if (!bluetoothCodes) {
        showNotify({
          type: "warning",
          message: "未扫描到蓝牙设备",
        });
        return;
      }
      if (!bluetoothCodes.length) {
        showNotify({
          type: "warning",
          message: "未扫描到蓝牙设备",
        });
        return;
      }
      try {
        // 如果是单个点位扫描蓝牙巡更
        if (route.query.bluetoothCode) {
          await pointScan(bluetoothCodes);
        } else {
          getAllPointsByBluetoothCodes(bluetoothCodes);
        }
      } catch (error) {}
    };
    // 单个点位扫码逻辑
    const pointScan = async (bluetoothCodes: string[]): Promise<void> => {
      const code = route.query.bluetoothCode as string;
      if (!bluetoothCodes.includes(code)) {
        showNotify({
          type: "warning",
          message: "与当前巡更点位不匹配",
        });
        return;
      }
      void updatePatrolLocationIfAbsent((route.query.locationId as string) || patrolStore.pointVo.locationId);
      router.push({
        path: "/patrol-result",
      });
    };
    // 根据蓝牙获取任务点位
    const getAllPointsByBluetoothCodes = async (bluetoothCodes: string[]): Promise<void> => {
      const mockData = [
        "59:D5:47:CD:3B:64",
        "FF:FF:86:77:1A:74",
        "D8:96:E0:8B:48:BA",
        "D8:96:E0:8B:91:D1",
        "5E:09:A1:94:8C:4C",
        "C6:58:98:5A:AE:02",
      ];
      const params = bluetoothCodes.length ? { bluetoothCodes } : { bluetoothCodes: mockData };
      const result = await cubeElectronPatrolService.getElectronTaskPointsByBluetooth(params);
      state.loading = false;
      state.pointList = result;
    };
    onBeforeMount(() => {
      if (patrolStore.pointVo.id) {
        document.title = patrolStore.pointVo.locationName;
      } else {
        document.title = "蓝牙识别";
      }
    });
    onMounted(() => {
      getEnvironment() !== "cubeApp" && getAllPointsByBluetoothCodes([]);
      // 初始化扫描蓝牙
      getEnvironment() === "cubeApp" && initScanBluetooth();
    });
    const handleRefresh = (): void => {
      if (state.loading) return;
      initScanBluetooth();
    };
    const handlePatrolPoint = async (pointVo: PatrolPointVo): Promise<void> => {
      void updatePatrolLocationIfAbsent(pointVo.locationId);
      handleStorePatrolPoint(pointVo);
      router.push({
        path: "/patrol-result",
      });
    };

    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title="蓝牙识别" />
        <div class={styles.container}>
          <PullRefresh
            class={styles.pullRefresh}
            loading-text="加载中..."
            onRefresh={handleRefresh}
            v-model={state.loading}
            success-text="刷新成功"
          >
            <CellGroup>
              {state.pointList.map((item) => {
                const cellSlots = {
                  value: (): JSX.Element => {
                    return (
                      <Button
                        type="primary"
                        size="small"
                        onClick={async () => {
                          await handlePatrolPoint(item);
                        }}
                      >
                        巡更
                      </Button>
                    );
                  },
                };
                return (
                  <Cell key={item.id} center title={`点位:${item.locationName}`} label={`任务:${item.taskName}`} v-slots={cellSlots} />
                );
              })}
            </CellGroup>
          </PullRefresh>
        </div>
      </>
    );
  },
});
