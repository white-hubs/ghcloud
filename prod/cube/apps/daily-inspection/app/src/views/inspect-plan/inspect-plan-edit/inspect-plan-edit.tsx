import dayjs from "dayjs";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Space, Button, message } from "@ghcloud/cube-ui";

import { BasicInfo } from "./components/basic-info";
import { cubeDailyInspectionService } from "@/api/server";
import { InspectContentTable } from "@/components/inspect-content-table/inspect-content-table";
import type { DataSourceType } from "@/types/inspect";

import styles from "./inspect-plan-edit.module.less";

const createType = new Set(["create", "copy"]);
export const InspectPlanEdit = defineComponent({
  setup: () => {
    const route = useRoute();
    const state = reactive<{
      formState: Record<string, unknown>;
      tableData: DataSourceType[];
      loading: boolean;
      page: Record<string, unknown>;
    }>({
      formState: {},
      tableData: [],
      loading: false,
      page: {
        total: 0,
      },
    });
    const title = computed(() => {
      const titleType = {
        info: "巡检计划详情",
        edit: "编辑巡检计划",
        create: "新增巡检计划",
        copy: "新增巡检计划",
      };
      return titleType[route.query.type as unknown as keyof typeof titleType | "create"] ?? "新增巡检计划";
    });
    const basicInfoRef = ref<{ handleSubmit: () => Promise<Record<string, unknown>> }>();
    const patrolContentRef = ref<{ getApiParams: () => unknown[] }>();
    const handleSubmit = async (): Promise<void> => {
      const type = route.query.type as string;
      const formValue = (await basicInfoRef.value?.handleSubmit()) as Record<string, string>;
      const planRelationList = patrolContentRef.value?.getApiParams();
      if (!planRelationList?.length) {
        message.error("巡检内容不能为空");
        return;
      }
      // 校验所有巡检对象（含新增的）都已选择巡检标准；
      // getApiParams 会为没有标准的对象兜底推送 standardId 为空的记录，避免对象丢失。
      const noStandardList = planRelationList?.filter((item) => !(item as Record<string, string>).standardId);
      if (noStandardList?.length) {
        message.error("请选择巡检标准");
        return;
      }
      try {
        state.loading = true;
        const params = {
          ...formValue,
          planRelationList,
          receiveIds: (formValue as unknown as { receiveIds: string[] }).receiveIds.join(","),
          checkUserIds: (formValue as unknown as { checkUserIds: string[] }).checkUserIds.join(","),
          validBeginTime: formValue.beginTime,
          validEndTime: formValue.endTime,
          selection: (formValue as unknown as { selection: string[] }).selection?.join(","),
          cronId: formValue.cronId === "custom" ? "" : formValue.cronId,
          enable: 1,
          id: createType.has(type) ? "" : formValue.id,
        };
        // 新增
        if (createType.has(type)) {
          await cubeDailyInspectionService.createInspectPlan(params);
        } else {
          // 编辑
          await cubeDailyInspectionService.updateInspectPlan(params);
        }
        // 编辑
        history.back();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        // message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false;
      }
    };
    onMounted(() => {
      getDetails();
      getTableData();
    });
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string;
      const type = route.query.type as string;
      if (!id) {
        return;
      }
      try {
        const res = await cubeDailyInspectionService.getInspectPlanDetail({ id, notTarget: true });
        state.formState = {
          ...res,
          name: type === "copy" ? `${res.name}-副本-${dayjs().format("YYYY-MM-DD")}` : res.name,
          selection: res.selection ? (res.selection as string)?.split(",") : null,
        };
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        // message.error(errorMessage || '请求失败')
      }
    };
    const getTableData = async (): Promise<void> => {
      if (route.query.type === "create") {
        return;
      }
      const param = {
        id: route.query.id as string,
        pageNumber: 1,
        pageSize: 10,
      };
      const res = await cubeDailyInspectionService.getInspectPlanDetail(param);
      const total = ((res?.total || res?.targetNum) as number) ?? 0;

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

        for (let pageNumber = batchStart; pageNumber <= batchEnd; pageNumber++) {
          const pageParam = {
            id: route.query.id as string,
            pageNumber,
            pageSize,
          };
          batchPromises.push(
            cubeDailyInspectionService
              .getInspectPlanDetail(pageParam)
              .then((pageRes) => (pageRes.typeTargets as unknown[]).flat() as DataSourceType[])
              .catch(() => [] as DataSourceType[]),
          );
        }
        const batchResults = await Promise.all(batchPromises);
        allData = [...allData, ...batchResults.flat()];
      }
      state.tableData = allData;
    };
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class={styles["edit-content"]}>
          <div class={styles.title}>基础信息</div>
          <BasicInfo initFormState={state.formState} ref={basicInfoRef} />
          <div class={styles.title}>巡检内容</div>
          <InspectContentTable dataSource={state.tableData} ref={patrolContentRef} />
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
          {route.query.type !== "info" && (
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
