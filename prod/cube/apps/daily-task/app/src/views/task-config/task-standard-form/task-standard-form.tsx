import { TaskBasicInfo } from "./components/task-basic-info/task-basic-info";
import { TaskStandardItems } from "./components/task-standard-items/task-standard-items";
import { cubeDailyTaskService } from "@/api/server";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { getCurrentDailyType, type StandardItemModel } from "@ghcloud/cube-daily-task-service";
import { Tabs, Button, TabPane, message } from "@ghcloud/cube-ui";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

export const TaskStandardForm = defineComponent({
  setup: () => {
    const route = useRoute();
    const saveLoading = ref(false);
    const { type, id } = route.query as { type: string; id: string };
    const title = computed(() => {
      const titleMap = new Map([
        ["add", "任务标准新增"],
        ["edit", "任务标准编辑"],
        ["detail", "任务标准详情"],
      ]);
      return `${titleMap.get(type) ?? "任务标准"}`;
    });

    // 选项卡
    const activeTab = ref("1"); // 1: 基础信息, 2: 标准项

    // 基础信息数据模型
    const basicInfo = ref<{
      name: string;
      categoryIds: string[] | undefined;
      categoryNames: string | undefined;
      description: string;
      enable: boolean;
      targetTypeRelations: {
        type: string;
        targetTypeId: string;
      }[];
    }>({
      name: "",
      categoryIds: undefined,
      categoryNames: undefined,
      description: "",
      enable: true,
      targetTypeRelations: [],
    });
    // 标准项数据模型
    const standardItems = ref<StandardItemModel[]>([]);

    const tabBaeRef = ref<{ validate: () => Promise<Record<string, unknown>> }>();
    const tabStandardRef = ref<{ validData: () => Promise<Record<string, unknown>[]> }>();

    const getData = async (id: string): Promise<void> => {
      try {
        const res = await cubeDailyTaskService.getDailyStandard(id);
        if (res) {
          basicInfo.value = {
            name: res?.name,
            categoryIds: res?.categoryIds?.split(",") || undefined,
            categoryNames: res?.categoryNames || undefined,
            description: res?.description,
            enable: res?.enable,
            targetTypeRelations: res?.targetTypeRelations,
          };
          standardItems.value = res?.items || [];
        }
      } catch {}
    };

    onMounted(() => {
      if (id) {
        getData(id);
      }
    });
    const goBack = (): void => {
      history.back();
    };

    const onSubmit = async (): Promise<void> => {
      try {
        if (type === "detail") {
          goBack();
          return;
        }
        const baseData = await tabBaeRef.value?.validate();
        const standardItemsData = (await tabStandardRef.value?.validData()) || standardItems.value || [];
        if (!standardItemsData.length) {
          message.error("请添加标准项");
          activeTab.value = "2";
          return;
        }
        saveLoading.value = true;
        const params = { ...baseData, items: standardItemsData, dailyType: getCurrentDailyType() };
        const isAdd = type === "add";
        const payload = isAdd ? params : { id: (id || "") as string, ...params };
        await (isAdd ? cubeDailyTaskService.addDailyStandard(payload) : cubeDailyTaskService.updateDailyStandard(payload));
        message.success("操作成功");
        goBack();
      } catch (error) {
        const errorFields = (error as { errorFields: unknown })?.errorFields;
        const showError = !errorFields && !(error instanceof Error && error.message.includes("校验失败"));
        showError && message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      } finally {
        saveLoading.value = false;
      }
    };

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Tabs v-model:activeKey={activeTab.value}>
            <TabPane key="1" tab="基础信息">
              <TaskBasicInfo
                ref={tabBaeRef}
                modelValue={basicInfo.value}
                onUpdate:modelValue={(val) => (basicInfo.value = val)}
                type={type as "add" | "edit" | "detail"}
              />
            </TabPane>
            <TabPane key="2" tab="标准项">
              <TaskStandardItems
                ref={tabStandardRef}
                modelValue={standardItems.value}
                onUpdate:modelValue={(val) => (standardItems.value = val)}
                type={type as "add" | "edit" | "detail"}
              />
            </TabPane>
          </Tabs>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Button onClick={goBack}>返回</Button>
          {type !== "detail" && (
            <Button type="primary" style={{ marginLeft: "8px" }} onClick={onSubmit}>
              保存
            </Button>
          )}
        </>
      ),
    };

    return (): JSX.Element => (
      <>
        <CubeLayout title={`${title.value}`} v-slots={layoutSlots} />
      </>
    );
  },
});
