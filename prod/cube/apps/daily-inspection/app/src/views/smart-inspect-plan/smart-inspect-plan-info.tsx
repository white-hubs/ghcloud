import { computed, defineComponent, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Space, message } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "@/api/server";
import { SmartInspectContentTable } from "@/components/smart-inspect-content-table/smart-inspect-content-table";
import { SmartInspectDeviceRouteConfig } from "@/components/smart-inspect-device-route-config/smart-inspect-device-route-config";
import type { DataSourceType } from "@/types/inspect";
import { SmartInspectBasicForm } from "@/views/smart-inspect-common/smart-inspect-basic-form";
import {
  createSmartInspectCommonSettingsValue,
  SmartInspectCommonSettings,
  type SmartInspectCommonSettingsValue,
} from "@/views/smart-inspect-common/smart-inspect-common-settings";
import { SmartInspectTargetTypeSelect } from "@/views/smart-inspect-common/smart-inspect-target-type-select";
import {
  createDroneConfigFromPlanDetail,
  getSmartTargetCategories,
  hasCommonTargetCategory,
  mergeSmartTargetCategories,
  type SmartInspectCommonTargetCategory,
  type SmartInspectDeviceRouteConfigValue,
  type SmartInspectTargetCategory,
} from "@/views/smart-inspect-common/types";

import styles from "@/views/smart-inspect-common/smart-inspect-page.module.less";

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value ? value.split(",").filter(Boolean) : [];
  return [];
};

const toBoolean = (value: unknown): boolean => {
  return value === true || value === "true" || value === 1 || value === "1";
};

const getCommonCategories = (categories: SmartInspectTargetCategory[]): SmartInspectCommonTargetCategory[] => {
  return categories.filter((item) => item !== "DRONE" && item !== "ROBOT_DOG") as SmartInspectCommonTargetCategory[];
};

export const SmartInspectPlanInfo = defineComponent({
  setup: () => {
    const route = useRoute();
    const currentPlanId = route.query.id as string;
    const state = reactive<{
      formState: Record<string, unknown>;
      commonSettings: SmartInspectCommonSettingsValue;
      tableData: DataSourceType[];
      selectedTargetCategories: SmartInspectTargetCategory[];
      droneConfig: SmartInspectDeviceRouteConfigValue | undefined;
      robotDogConfig: SmartInspectDeviceRouteConfigValue | undefined;
    }>({
      formState: {},
      commonSettings: createSmartInspectCommonSettingsValue(),
      tableData: [],
      selectedTargetCategories: [],
      droneConfig: undefined,
      robotDogConfig: undefined,
    });

    const commonCategories = computed(() => getCommonCategories(state.selectedTargetCategories));
    const hasCommonSection = computed(() => hasCommonTargetCategory(state.selectedTargetCategories));
    const hasDroneSection = computed(() => state.selectedTargetCategories.includes("DRONE"));
    const hasRobotDogSection = computed(() => state.selectedTargetCategories.includes("ROBOT_DOG"));

    const setCommonSettings = (source: Record<string, unknown>): void => {
      state.commonSettings = {
        ...createSmartInspectCommonSettingsValue(),
        isCheck: toBoolean(source.isCheck),
        method: String(source.method || ""),
        checkUserType: String(source.checkUserType || "1"),
        checkUserIds: toArray(source.checkUserIds),
        checkRoleIds: source.checkRoleIds,
        checkPostIds: source.checkPostIds,
        checkDeptIds: source.checkDeptIds,
        checkUserNames: source.checkUserNames as string | undefined,
        checkRoleNames: source.checkRoleNames as string | undefined,
        checkPostNames: source.checkPostNames as string | undefined,
        checkDeptNames: source.checkDeptNames as string | undefined,
      };
    };

    const getDetails = async (): Promise<void> => {
      if (!currentPlanId) return;
      try {
        const res = await cubeDailyInspectionService.getInspectPlanDetail({ id: currentPlanId, notTarget: true });
        state.formState = { ...res };
        setCommonSettings(res);
        state.selectedTargetCategories = getSmartTargetCategories(res);
        state.droneConfig = createDroneConfigFromPlanDetail(res.droneConfig as never);
        state.robotDogConfig = createDroneConfigFromPlanDetail(res.robotDogConfig as never, "ROBOT_DOG");
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };

    const getTableData = async (): Promise<void> => {
      if (!currentPlanId) return;
      try {
        const totalRes = await cubeDailyInspectionService.getInspectPlanDetail({
          id: currentPlanId,
          pageNumber: 1,
          pageSize: 10,
        });
        const total = ((totalRes?.total || totalRes?.targetNum) as number) ?? 0;
        if (total <= 0) {
          state.tableData = [];
          return;
        }
        const pageSize = 50;
        const totalPages = Math.ceil(total / pageSize);
        let allData: DataSourceType[] = [];
        const batchSize = 5;
        for (let batchStart = 1; batchStart <= totalPages; batchStart += batchSize) {
          const batchEnd = Math.min(batchStart + batchSize - 1, totalPages);
          const batchPromises = [];
          for (let pageNumber = batchStart; pageNumber <= batchEnd; pageNumber += 1) {
            batchPromises.push(
              cubeDailyInspectionService
                .getInspectPlanDetail({
                  id: currentPlanId,
                  pageNumber,
                  pageSize,
                })
                .then((pageRes) => ((pageRes.typeTargets as unknown[]) || []).flat() as DataSourceType[])
                .catch(() => [] as DataSourceType[]),
            );
          }
          const batchResults = await Promise.all(batchPromises);
          allData = [...allData, ...batchResults.flat()];
        }
        state.tableData = allData;
        state.selectedTargetCategories = mergeSmartTargetCategories(
          state.selectedTargetCategories,
          allData.map((item) => item.targetCategory),
        );
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };

    onMounted(async () => {
      await getDetails();
      await getTableData();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class={[styles["page-content"], styles["detail-content"]]}>
          <section class={styles["detail-section"]}>
            <div class={styles["section-title"]}>基础信息</div>
            <SmartInspectBasicForm initFormState={state.formState} mode="plan" readonly />
            <SmartInspectTargetTypeSelect value={state.selectedTargetCategories} readonly />
          </section>
          {hasCommonSection.value && (
            <section class={styles["detail-section"]}>
              <div class={styles["section-title"]}>通用巡检配置与内容</div>
              <SmartInspectCommonSettings value={state.commonSettings} readonly />
              <SmartInspectContentTable dataSource={state.tableData} targetCategories={commonCategories.value} readonly />
            </section>
          )}
          {hasDroneSection.value && (
            <section class={styles["detail-section"]}>
              <div class={styles["section-title"]}>无人机巡检配置</div>
              <SmartInspectDeviceRouteConfig method="DRONE" value={state.droneConfig} readonly showExecutionColumns={false} />
            </section>
          )}
          {hasRobotDogSection.value && (
            <section class={styles["detail-section"]}>
              <div class={styles["section-title"]}>机器狗巡检配置</div>
              <SmartInspectDeviceRouteConfig method="ROBOT_DOG" value={state.robotDogConfig} readonly showExecutionColumns={false} />
            </section>
          )}
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title="巡检计划详情" v-slots={layoutSlots} showTableXScroll />;
  },
});
