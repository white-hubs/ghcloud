import dayjs from "dayjs";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Space, message } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "@/api/server";
import { SmartInspectContentTable } from "@/components/smart-inspect-content-table/smart-inspect-content-table";
import { SmartInspectDeviceRouteConfig } from "@/components/smart-inspect-device-route-config/smart-inspect-device-route-config";
import type { DataSourceType } from "@/types/inspect";
// import { SmartInspectAiFillPanel } from "@/views/smart-inspect-common/smart-inspect-ai-fill-panel";
import { SmartInspectBasicForm } from "@/views/smart-inspect-common/smart-inspect-basic-form";
import {
  createSmartInspectCommonSettingsValue,
  SmartInspectCommonSettings,
  type SmartInspectCommonSettingsValue,
} from "@/views/smart-inspect-common/smart-inspect-common-settings";
import { SmartInspectStepShell, type SmartInspectStepItem } from "@/views/smart-inspect-common/smart-inspect-step-shell";
import { SmartInspectTargetTypeSelect } from "@/views/smart-inspect-common/smart-inspect-target-type-select";
import {
  buildDroneInspectionConfigPayload,
  createDroneConfigFromPlanDetail,
  getInspectionModeByCategories,
  getSmartTargetCategories,
  hasCommonTargetCategory,
  mergeSmartTargetCategories,
  type SmartInspectCommonTargetCategory,
  type SmartInspectDeviceRouteConfigValue,
  type SmartInspectSpecialTargetCategory,
  type SmartInspectTargetCategory,
} from "@/views/smart-inspect-common/types";

import styles from "@/views/smart-inspect-common/smart-inspect-page.module.less";

const createType = ["create", "copy"];

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value ? value.split(",").filter(Boolean) : [];
  return [];
};

const toJoinValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(",");
  if (value === undefined || value === null) return "";
  return String(value);
};

const toBoolean = (value: unknown): boolean => {
  return value === true || value === "true" || value === 1 || value === "1";
};

const getCommonCategories = (categories: SmartInspectTargetCategory[]): SmartInspectCommonTargetCategory[] => {
  return categories.filter((item) => item !== "DRONE" && item !== "ROBOT_DOG") as SmartInspectCommonTargetCategory[];
};

export const SmartInspectPlanEdit = defineComponent({
  setup: () => {
    const route = useRoute();
    const state = reactive<{
      formState: Record<string, unknown>;
      commonSettings: SmartInspectCommonSettingsValue;
      tableData: DataSourceType[];
      selectedTargetCategories: SmartInspectTargetCategory[];
      droneConfig: SmartInspectDeviceRouteConfigValue | undefined;
      robotDogConfig: SmartInspectDeviceRouteConfigValue | undefined;
      loading: boolean;
    }>({
      formState: {},
      commonSettings: createSmartInspectCommonSettingsValue(),
      tableData: [],
      selectedTargetCategories: [],
      droneConfig: undefined,
      robotDogConfig: undefined,
      loading: false,
    });

    const title = computed(() => {
      const titleType = {
        info: "巡检计划详情",
        edit: "编辑巡检计划",
        create: "新增巡检计划",
        copy: "新增巡检计划",
      };
      return titleType[route.query.type as keyof typeof titleType] ?? "新增巡检计划";
    });
    const readonly = computed(() => route.query.type === "info");
    const basicInfoRef = ref<{
      handleSubmit: () => Promise<Record<string, unknown>>;
      getFormState: () => Record<string, unknown>;
      setFormValues: (values: Record<string, unknown>) => void;
    }>();
    const commonSettingsRef = ref<{ validate: () => Promise<SmartInspectCommonSettingsValue> }>();
    const patrolContentRef = ref<{ validate: () => boolean; getApiParams: () => unknown[]; getDataSource: () => DataSourceType[] }>();
    const droneRouteRef = ref<{ validate: () => Promise<SmartInspectDeviceRouteConfigValue | undefined> }>();
    const robotDogRouteRef = ref<{ validate: () => Promise<SmartInspectDeviceRouteConfigValue | undefined> }>();
    const activeStepKey = ref("basic");

    const commonCategories = computed(() => getCommonCategories(state.selectedTargetCategories));
    const hasCommonStep = computed(() => hasCommonTargetCategory(state.selectedTargetCategories));
    const hasDroneStep = computed(() => state.selectedTargetCategories.includes("DRONE"));
    const hasRobotDogStep = computed(() => state.selectedTargetCategories.includes("ROBOT_DOG"));
    const hasSpecialStep = computed(() => hasDroneStep.value || hasRobotDogStep.value);
    const shouldShowCommonStep = computed(() => hasCommonStep.value || (!readonly.value && !hasSpecialStep.value));

    const validateBasicStep = async (): Promise<Record<string, unknown>> => {
      const formValue = (await basicInfoRef.value?.handleSubmit()) as Record<string, unknown>;
      if (!state.selectedTargetCategories.length) {
        message.error("请至少选择一种巡检对象类型");
        activeStepKey.value = "basic";
        return Promise.reject(new Error("target category required"));
      }
      return formValue;
    };

    const validateCommonSettings = async (): Promise<SmartInspectCommonSettingsValue | undefined> => {
      if (!hasCommonStep.value) return createSmartInspectCommonSettingsValue();
      try {
        return await commonSettingsRef.value?.validate();
      } catch {
        activeStepKey.value = "common";
        return undefined;
      }
    };

    const validateCommonContent = (): unknown[] | undefined => {
      if (!hasCommonStep.value) return [];
      if (!patrolContentRef.value?.validate()) {
        activeStepKey.value = "common";
        return undefined;
      }
      const planRelationList = patrolContentRef.value?.getApiParams();
      if (!planRelationList?.length) {
        activeStepKey.value = "common";
        message.error("巡检内容不能为空");
        return undefined;
      }
      const noStandardList = planRelationList.filter((item) => !(item as Record<string, string>).standardId);
      if (noStandardList.length) {
        activeStepKey.value = "common";
        message.error("请选择巡检标准");
        return undefined;
      }
      const noInspectItemList = planRelationList.filter((item) => !(item as Record<string, string>).itemId);
      if (noInspectItemList.length) {
        activeStepKey.value = "common";
        message.error("请选择巡检项");
        return undefined;
      }
      return planRelationList;
    };

    const validateSpecialRoute = async (
      category: SmartInspectSpecialTargetCategory,
    ): Promise<SmartInspectDeviceRouteConfigValue | undefined> => {
      try {
        return category === "DRONE" ? await droneRouteRef.value?.validate() : await robotDogRouteRef.value?.validate();
      } catch (error) {
        activeStepKey.value = category === "DRONE" ? "drone" : "robotDog";
        throw error;
      }
    };

    const stepItems = computed((): SmartInspectStepItem[] => {
      const steps: SmartInspectStepItem[] = [
        {
          key: "basic",
          title: "基础信息与巡检对象类型",
          description: "填写基础信息，勾选本次巡检对象类型",
          render: () => (
            <div class={styles["step-content"]}>
              {/* {!readonly.value && (
                <SmartInspectAiFillPanel
                  mode="plan"
                  onApplyDraft={(payload: { formValues: Record<string, unknown>; targetCategories: SmartInspectTargetCategory[] }) => {
                    basicInfoRef.value?.setFormValues(payload.formValues);
                    state.selectedTargetCategories = payload.targetCategories;
                  }}
                />
              )} */}
              <div class={styles["section-title"]}>基础信息</div>
              <SmartInspectBasicForm initFormState={state.formState} mode="plan" readonly={readonly.value} ref={basicInfoRef} />
              <SmartInspectTargetTypeSelect v-model:value={state.selectedTargetCategories} readonly={readonly.value} />
            </div>
          ),
        },
      ];

      if (shouldShowCommonStep.value) {
        steps.push({
          key: "common",
          title: "配置巡检对象与内容",
          description: "选择具体对象，批量配置或删除巡检内容",
          render: () => (
            <div class={styles["step-content"]}>
              <div class={styles["section-title"]}>配置巡检对象与内容</div>
              <SmartInspectCommonSettings v-model:value={state.commonSettings} readonly={readonly.value} ref={commonSettingsRef} />
              <SmartInspectContentTable
                dataSource={state.tableData}
                targetCategories={commonCategories.value}
                readonly={readonly.value}
                ref={patrolContentRef}
              />
            </div>
          ),
        });
      }

      if (hasDroneStep.value) {
        steps.push({
          key: "drone",
          title: "无人机巡检配置",
          description: "选择无人机设备、航线并配置航点内容",
          render: () => (
            <div class={styles["step-content"]}>
              <div class={styles["section-title"]}>无人机巡检配置</div>
              <SmartInspectDeviceRouteConfig
                method="DRONE"
                value={state.droneConfig}
                readonly={readonly.value}
                showExecutionColumns={false}
                ref={droneRouteRef}
              />
            </div>
          ),
        });
      }

      if (hasRobotDogStep.value) {
        steps.push({
          key: "robotDog",
          title: "机器狗巡检配置",
          description: "选择机器狗设备、地面路线并配置路线点内容",
          render: () => (
            <div class={styles["step-content"]}>
              <div class={styles["section-title"]}>机器狗巡检配置</div>
              <SmartInspectDeviceRouteConfig
                method="ROBOT_DOG"
                value={state.robotDogConfig}
                readonly={readonly.value}
                showExecutionColumns={false}
                ref={robotDogRouteRef}
              />
            </div>
          ),
        });
      }

      return steps;
    });

    const activeStepIndex = computed(() => {
      const index = stepItems.value.findIndex((item) => item.key === activeStepKey.value);
      return index >= 0 ? index : 0;
    });
    const isLastStep = computed(() => activeStepIndex.value >= stepItems.value.length - 1);

    watch(
      () => stepItems.value.map((item) => item.key).join(","),
      () => {
        if (stepItems.value.some((item) => item.key === activeStepKey.value)) return;
        activeStepKey.value = stepItems.value[0]?.key ?? "basic";
      },
    );

    const handlePrevStep = (): void => {
      const prevStep = stepItems.value[activeStepIndex.value - 1];
      if (prevStep) activeStepKey.value = prevStep.key;
    };

    const handleNextStep = async (): Promise<void> => {
      if (activeStepKey.value === "basic") {
        await validateBasicStep();
      }
      if (activeStepKey.value === "common") {
        const commonSettings = await validateCommonSettings();
        if (!commonSettings) return;
        const commonContent = validateCommonContent();
        if (!commonContent) return;
      }
      const nextStep = stepItems.value[activeStepIndex.value + 1];
      if (nextStep) activeStepKey.value = nextStep.key;
    };

    const handleSubmit = async (): Promise<void> => {
      const type = String(route.query.type || "create");
      const basicFormValue = await validateBasicStep();
      const commonSettings = await validateCommonSettings();
      if (!commonSettings) return;
      const formValue = { ...basicFormValue, ...commonSettings };
      const planRelationList = validateCommonContent();
      if (!planRelationList) return;

      const configs: Partial<Record<SmartInspectSpecialTargetCategory, SmartInspectDeviceRouteConfigValue>> = {};
      try {
        if (hasDroneStep.value) configs.DRONE = await validateSpecialRoute("DRONE");
        if (hasRobotDogStep.value) configs.ROBOT_DOG = await validateSpecialRoute("ROBOT_DOG");
      } catch {
        return;
      }

      try {
        state.loading = true;
        const params = {
          ...formValue,
          planRelationList,
          receiveIds: toArray(formValue.receiveIds).join(","),
          checkUserIds: toArray(formValue.checkUserIds).join(","),
          validBeginTime: formValue.beginTime,
          validEndTime: formValue.endTime,
          selection: toJoinValue(formValue.selection),
          cronId: formValue.cronId === "custom" ? "" : formValue.cronId,
          enable: 1,
          inspectionMode: getInspectionModeByCategories(state.selectedTargetCategories),
          droneConfig: buildDroneInspectionConfigPayload(configs.DRONE),
          robotDogConfig: buildDroneInspectionConfigPayload(configs.ROBOT_DOG),
          id: createType.includes(type) ? "" : formValue.id,
        };
        if (createType.includes(type)) {
          await cubeDailyInspectionService.createInspectPlan(params);
        } else {
          await cubeDailyInspectionService.updateInspectPlan(params);
        }
        history.back();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      } finally {
        state.loading = false;
      }
    };

    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string;
      const type = String(route.query.type || "create");
      if (!id) return;
      try {
        const res = await cubeDailyInspectionService.getInspectPlanDetail({ id, notTarget: true });
        state.formState = {
          ...res,
          name: type === "copy" ? `${res.name}-副本-${dayjs().format("YYYY-MM-DD")}` : res.name,
          selection: res.selection ? String(res.selection).split(",") : null,
        };
        state.commonSettings = {
          ...createSmartInspectCommonSettingsValue(),
          isCheck: toBoolean(res.isCheck),
          method: String(res.method || ""),
          checkUserType: String(res.checkUserType || "1"),
          checkUserIds: toArray(res.checkUserIds),
          checkRoleIds: res.checkRoleIds,
          checkPostIds: res.checkPostIds,
          checkDeptIds: res.checkDeptIds,
        };
        state.selectedTargetCategories = getSmartTargetCategories(res);
        state.droneConfig = createDroneConfigFromPlanDetail(res.droneConfig as never);
        state.robotDogConfig = createDroneConfigFromPlanDetail(res.robotDogConfig as never, "ROBOT_DOG");
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };

    const getTableData = async (): Promise<void> => {
      if (route.query.type === "create") return;
      const totalRes = await cubeDailyInspectionService.getInspectPlanDetail({
        id: route.query.id as string,
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
                id: route.query.id as string,
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
    };

    onMounted(async () => {
      await getDetails();
      await getTableData();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class={styles["page-content"]}>
          <SmartInspectStepShell
            steps={stepItems.value}
            activeKey={activeStepKey.value}
            clickable={readonly.value}
            onChange={(key: string) => {
              activeStepKey.value = key;
            }}
          />
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
          {!readonly.value && activeStepIndex.value > 0 && <Button onClick={handlePrevStep}>上一步</Button>}
          {!readonly.value && !isLastStep.value && (
            <Button type="primary" onClick={handleNextStep}>
              下一步
            </Button>
          )}
          {!readonly.value && isLastStep.value && (
            <Button type="primary" loading={state.loading} onClick={handleSubmit}>
              保存
            </Button>
          )}
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title={title.value} v-slots={layoutSlots} />;
  },
});
