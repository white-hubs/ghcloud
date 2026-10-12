import { computed, defineComponent, onMounted, reactive, ref, type Ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, InspectItemContentTable } from "@ghcloud/cube-app-design";
import type { InspectItemContent } from "@ghcloud/cube-app-design/src/business-components/inspect-components/inspect-item-content-table/type";
import { InspectBusinessType, targetCategoryOptions } from "@ghcloud/cube-daily-inspection-service";
import { Button, Col, Form, FormItem, Input, Row, Select, Switch, message, type FormExpose } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDailyInspectionService } from "@/api/server";

import styles from "./inspect-items-form.module.less";

interface Items {
  id?: string | undefined;
  imageFlag?: boolean | undefined;
  name?: string | undefined;
  resultId?: string | null | undefined;
  resultItemValue?: string | null | undefined;
  itemTag?: string | null | undefined;
  imageResult?: string | boolean | null | undefined;
  remarkResult?: string | boolean | null | undefined;
  businessType?: InspectBusinessType | undefined;
}

type InspectItemRow = InspectItemContent & { imageFlag?: boolean | undefined; businessType?: InspectBusinessType | undefined };
export const InspectItemsForm = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const { type, id } = route.query as { type: string; id: string };

    const formRenderRef = ref<FormExpose>();
    const inspectItemContentTableRef = ref<{
      isValid: Ref<boolean>;
      dataSource: Ref<InspectItemContent[]>;
      checkData: () => Promise<void>;
      addContent: () => void;
    }>();
    const inspectItems = ref<InspectItemContent[]>([]);

    const formState = reactive<{
      id: string | undefined;
      alias: string | undefined;
      referType: string | undefined;
      isResultItem: boolean;
    }>({
      id: undefined,
      alias: undefined,
      referType: undefined,
      isResultItem: true,
    });
    const modalRules = {
      alias: [{ required: true, message: "请输入巡检项名称", trigger: "blur" }],
      referType: [{ required: true, message: "请选择适用对象", trigger: "blur" }],
    };
    const saveLoading = ref(false);
    const onSubmit = async (): Promise<void> => {
      try {
        if (type === "detail") {
          onCancel();
          return;
        }
        await formRenderRef.value?.validate();
        const result = (await inspectItemContentTableRef.value?.checkData()) as unknown as InspectItemRow[];

        const newResult = result?.map((e): Items => {
          if (formState.isResultItem) {
            return {
              id: e.id,
              imageFlag: e.imageFlag,
              name: e.name,
              businessType: e.businessType,
              resultId: e.resultId ?? null,
              resultItemValue: e.resultItemValue ?? null,
              itemTag: e.itemTag ?? null,
              imageResult: Array.isArray(e.imageResult) && e.imageResult.length ? e.imageResult.join(",") : null,
              remarkResult: Array.isArray(e.remarkResult) && e.remarkResult.length ? e.remarkResult.join(",") : null,
            };
          }
          return {
            id: e.id,
            imageFlag: e.imageFlag,
            name: e.name,
            businessType: e.businessType,
            resultId: null,
            resultItemValue: null,
            itemTag: null,
            imageResult: e.imageResult === true,
            remarkResult: e.remarkResult === true,
          };
        });
        saveLoading.value = true;
        const params = {
          alias: formState.alias,
          items: newResult as unknown as Items[],
          referType: formState.referType as InspectBusinessType,
          isResultItem: formState.isResultItem,
        };
        if (type === "add") {
          await cubeDailyInspectionService.addInspectItemTemplate(params);
        }
        if (type === "edit") {
          await cubeDailyInspectionService.updateInspectItemTemplate(id, params);
        }
        message.success("操作成功");
        setTimeout(() => {
          onCancel();
        }, 500);
      } catch (error) {
        const errorFields = (error as { errorFields: unknown })?.errorFields;
        const showError = !errorFields && !(error instanceof Error && error.message.includes("校验失败"));
        showError && message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      } finally {
        saveLoading.value = false;
      }
    };
    const getData = async (id: string): Promise<void> => {
      try {
        const res = await cubeDailyInspectionService.getInspectItemTemplateDetail(id);
        if (res) {
          formState.alias = res?.alias;
          formState.referType = res?.referType;
          formState.isResultItem = res?.isResultItem ?? true;
          const parseMultiResult = (value: string | boolean | undefined): string[] => {
            if (typeof value === "boolean") return [];
            return value ? value.split(",") : [];
          };
          const parseBooleanResult = (value: string | boolean | undefined): boolean | undefined => {
            if (typeof value === "boolean") return value;
            if (value === "true") return true;
            if (value === "false") return false;
            return undefined;
          };
          inspectItems.value.push({
            id: res?.id,
            name: res?.name,
            resultId: res?.resultId,
            resultItemValue: res?.resultItemValue,
            imageResult: formState.isResultItem ? parseMultiResult(res?.imageResult) : parseBooleanResult(res?.imageResult),
            remarkResult: formState.isResultItem ? parseMultiResult(res?.remarkResult) : parseBooleanResult(res?.remarkResult),
            itemTag: res?.itemTag,
            options: ((res?.resultVO?.options as unknown[]) || [])?.map((e) => {
              return {
                itemName: (e as { itemName: string })?.itemName,
                itemValue: (e as { itemValue: string })?.itemValue,
                errorFlag: (e as { errorFlag: boolean })?.errorFlag,
              };
            }),
          });
        }
      } catch {}
    };
    onMounted(() => {
      if (id) {
        getData(id);
      }
      if (type === "add") {
        inspectItemContentTableRef.value?.addContent();
      }
    });
    const onCancel = (): void => {
      formRenderRef.value?.resetFields();
      history.back();
    };
    const title = computed(() => {
      const titleMap = new Map([
        ["add", "新增"],
        ["edit", "编辑"],
        ["detail", "详情"],
      ]);
      return `${titleMap.get(type) ?? ""}${pageTitle}`;
    });
    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <div class={styles["edit-content"]}>
            <div class={styles.title}>基础信息</div>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
              <Row gutter={[8 * 12, 12]} style={{ width: "100%" }}>
                <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label="巡检项名称" name="alias">
                    <Input v-model:value={formState.alias} placeholder="请输入巡检项名称" />
                  </FormItem>
                </Col>
                <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label="适用对象" name="referType">
                    <Select v-model:value={formState.referType} placeholder="请选择适用对象" options={targetCategoryOptions.slice(1)} />
                  </FormItem>
                </Col>
                <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label="结果巡检项" name="isResultItem">
                    <Switch v-model:checked={formState.isResultItem} checked-children="开启" un-checked-children="关闭" />
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <div class={styles.title}>巡检项内容</div>
            <InspectItemContentTable
              ref={inspectItemContentTableRef}
              v-model:value={inspectItems.value}
              businessType={InspectBusinessType.DAILY_INSPECTION}
              action={type}
              isResultItem={formState.isResultItem}
            />
          </div>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <>
            <Button onClick={onCancel}>取消</Button>
            {type !== "detail" && (
              <Button type="primary" loading={saveLoading.value} onClick={onSubmit} class={styles["ml-16"]}>
                保存
              </Button>
            )}
          </>
        );
      },
    };
    return (): JSX.Element => <CubeLayout title={`${title.value}`} v-slots={layoutSlots} />;
  },
});
