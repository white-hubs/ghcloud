import { showNotify, PullRefresh } from "vant";
import { defineComponent, onBeforeMount, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { PatrolPointVo } from "@ghcloud/cube-electronic-patrol-service";

import { cubeElectronPatrolService } from "@/api/server";
import { handleStorePatrolPoint, usePatrolStore } from "@/custom-store/use-patrol-store";
import { getAssetsFile } from "@/utils";
import { updatePatrolLocationIfAbsent } from "@/utils/update-patrol-location";

import styles from "./index.module.less";

export const Index = defineComponent({
  setup: () => {
    const route = useRoute();
    const patrolStore = usePatrolStore();
    const nfcScanPng = getAssetsFile("scan-nfc.png");
    const state = reactive<{
      point: PatrolPointVo;
      loading: boolean;
    }>({
      point: {
        id: "",
        locationId: "",
        locationName: "",
        taskName: "",
        nfcCode: "",
        bluetoothCode: "",
        arae: [],
        userId: "",
        userName: "",
        startDate: 0,
        endDate: 0,
        patrolResult: "",
        hiddenId: "",
        remark: "",
        orderNum: 0,
        nfcLongitude: "",
        nfcDimension: "",
        patrolWay: "",
        files: [],
      },
      loading: false,
    });
    const router = useRouter();
    const initScanNfc = async (): Promise<void> => {
      if (state.loading) return;
      if (getEnvironment() !== "cubeApp") {
        showNotify({
          type: "warning",
          message: "请在cubeApp中打开",
        });
        return;
      }
      state.loading = true;
      const nfcCode = await cubeAppService.onScanNFC();

      if (!nfcCode) {
        showNotify({
          type: "warning",
          message: "未扫描到NFC设备",
        });
        return;
      }
      try {
        // 如果是单个点位扫描蓝牙巡更
        if (route.query.nfcCode) {
          await pointScan(nfcCode);
        } else {
          getAllPointsByNfc(nfcCode);
        }
      } catch (error) {}
    };
    // 单个点位扫码逻辑
    const pointScan = async (nfcCode: string): Promise<void> => {
      const code = route.query.nfcCode as string;
      if (nfcCode !== code) {
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
    const getAllPointsByNfc = async (nfcCode?: string): Promise<void> => {
      try {
        const params = { nfcCode: nfcCode || "" };
        const result = await cubeElectronPatrolService.getElectronTaskPointsByNfc(params);
        state.loading = false;
        await handlePatrolPoint(result);
        state.point = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    onBeforeMount(() => {
      if (patrolStore.pointVo.id) {
        document.title = patrolStore.pointVo.locationName;
      } else {
        document.title = "NFC识别";
      }
    });
    onMounted(() => {
      // getEnvironment() !== 'cubeApp' && getAllPointsByNfc()
      // 初始化扫描蓝牙
      getEnvironment() === "cubeApp" && initScanNfc();
    });
    const handleRefresh = (): void => {
      if (state.loading) return;
      initScanNfc();
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
        <CubeNavBar showBack title="NFC识别" />
        <div class={styles.container}>
          <PullRefresh
            class={styles.pullRefresh}
            loading-text="扫描中..."
            onRefresh={handleRefresh}
            v-model={state.loading}
            success-text="刷新成功"
          >
            <div class={styles.nfcScan}>
              <img src={nfcScanPng} alt="" srcset="" />
              <div>请将设备贴近巡更点</div>
            </div>
          </PullRefresh>
        </div>
      </>
    );
  },
});
