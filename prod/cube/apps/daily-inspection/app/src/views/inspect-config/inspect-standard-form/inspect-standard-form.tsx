import { computed, defineComponent, onMounted, reactive, ref, type Ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, InspectItemContentTable, InspectItemModalTable } from "@ghcloud/cube-app-design";
import type { InspectItemContent } from "@ghcloud/cube-app-design/src/business-components/inspect-components/inspect-item-content-table/type";
import { InspectBusinessType, type InspectItemVO } from "@ghcloud/cube-daily-inspection-service";
import { Button, Col, Form, FormItem, Input, Row, TabPane, Tabs, Textarea, message, type FormExpose } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { AssociationTabs, AssocType, type AssociationItem } from "./components/association-tabs";
import { cubeDailyInspectionService } from "@/api/server";

import styles from "./inspect-standard-form.module.less";

interface Items {
  imageFlag?: boolean | undefined;
  name?: string | undefined;
  resultId?: string | undefined;
  resultItemValue?: string | undefined;
  itemTag?: string | undefined;
  imageResult?: string | boolean | null | undefined;
  remarkResult?: string | boolean | null | undefined;
  businessType?: InspectBusinessType;
  referType?: InspectBusinessType | string;
  isResultItem?: boolean;
}

const isResultItemEnabled = (value: unknown): boolean => {
  return value !== false && value !== "false" && value !== 0 && value !== "0";
};

export const InspectStandardForm = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const { type, id } = route.query as { type: string; id: string };

    const inspectItemModalTableRef = ref<{ openModal: (record?: unknown) => void }>();
    const inspectItemContentTableRef = ref<{
      isValid: Ref<boolean>;
      dataSource: Ref<InspectItemContent[]>;
      checkData: () => Promise<void>;
      addContent: () => void;
      initContent: (data?: unknown) => void;
    }>();

    const inspectItems = ref<InspectItemContent[]>([]);

    const formRenderRef = ref<FormExpose>();
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
      remark: string | undefined;
      safetyTips: string | undefined;
      enable: boolean | undefined;
    }>({
      id: undefined,
      name: undefined,
      remark: undefined,
      safetyTips: undefined,
      enable: true,
    });
    const associationActiveKey = ref<AssocType>(AssocType.DEVICE);
    const activeTab = ref("base");
    const associations = ref<AssociationItem[]>([]);
    const modalRules = {
      name: [{ required: true, message: "请输入标准名称", trigger: "blur" }],
    };
    const saveLoading = ref(false);
    const onSubmit = async (): Promise<void> => {
      try {
        if (type === "detail") {
          onCancel();
          return;
        }
        await formRenderRef.value?.validate();
        const result = (await inspectItemContentTableRef.value?.checkData()) as unknown as Items[];
        if (!associations.value.length) {
          activeTab.value = "base";
          message.warning("请添加关联项");
          return;
        }

        const newResult = result?.map((e) => {
          const payload = { ...e } as Record<string, unknown>;
          const isResultItem = isResultItemEnabled(e.isResultItem);
          if (!isResultItem) {
            return {
              ...payload,
              isResultItem,
              resultId: null,
              resultItemValue: null,
              itemTag: null,
              imageResult: e.imageResult === true,
              remarkResult: e.remarkResult === true,
              referType: InspectBusinessType.DAILY_INSPECTION,
            };
          }
          return {
            ...payload,
            isResultItem,
            imageResult: Array.isArray(e.imageResult) ? e.imageResult?.join(",") : undefined,
            remarkResult: Array.isArray(e.remarkResult) ? e.remarkResult?.join(",") : undefined,
            referType: InspectBusinessType.DAILY_INSPECTION,
          };
        });
        const standardTypeRefers = Object.values(AssocType)
          .map((targetCategory) => {
            const targetTypes = associations.value.filter((item) => item.type === targetCategory).map((item) => item.targetTypeId);
            return { targetCategory, targetTypes };
          })
          .filter((item) => item.targetTypes.length);
        saveLoading.value = true;
        const params = {
          name: formState.name,
          remark: formState.remark,
          safetyTips: formState.safetyTips,
          standardItems: (newResult ?? []) as unknown as Items[],
          enable: formState.enable,
          standardTypeRefers,
          businessType: InspectBusinessType.DAILY_INSPECTION,
        };
        if (type === "add") {
          await cubeDailyInspectionService.addInspectStandard(
            params as Parameters<typeof cubeDailyInspectionService.addInspectStandard>[0],
          );
        }
        if (type === "edit") {
          await cubeDailyInspectionService.updateInspectStandard(
            id,
            params as Parameters<typeof cubeDailyInspectionService.updateInspectStandard>[1],
          );
        }
        message.success("操作成功");
        setTimeout(() => {
          onCancel();
        }, 500);
      } catch (error) {
        const errorFields = (error as { errorFields: unknown })?.errorFields;
        if (errorFields) {
          activeTab.value = "base";
        }
        if (error instanceof Error && error.message.includes("校验失败")) {
          activeTab.value = "items";
        }
        const showError = !errorFields && !(error instanceof Error && error.message.includes("校验失败"));
        showError && message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      } finally {
        saveLoading.value = false;
      }
    };
    const handleModalEnter = (record: InspectItemVO[]): void => {
      const tableIds = inspectItems.value.map((e) => e.id);
      record.forEach((e) => {
        if (!tableIds.includes(e.id)) {
          inspectItems.value.push({
            ...(e as unknown as InspectItemContent),
            imageResult: e?.imageResult?.split(",") ?? [],
            remarkResult: e?.remarkResult?.split(",") ?? [],
          });
        }
      });
      inspectItemContentTableRef.value?.initContent(inspectItems.value);
    };
    const getData = async (id: string): Promise<void> => {
      try {
        const res = await cubeDailyInspectionService.getInspectStandardDetail(id, { businessType: InspectBusinessType.DAILY_INSPECTION });
        if (res) {
          formState.remark = res?.remark;
          formState.safetyTips = res?.safetyTips;
          formState.name = res?.name;
          formState.enable = res?.enable;
          associations.value = (res?.standardTypeRefers ?? []).flatMap((item) => {
            return (item.targetTypes ?? []).map((targetTypeId) => ({
              type: item.targetCategory as AssocType,
              targetTypeId,
            }));
          });
          inspectItems.value = (res?.standardItems ?? [])?.map((e) => {
            const row = e as typeof e & {
              isResultItem?: unknown;
              imageResult?: string | boolean;
              remarkResult?: string | boolean;
            };
            const isResultItem = isResultItemEnabled(row?.isResultItem);
            return {
              ...row,
              isResultItem,
              imageResult: isResultItem
                ? typeof row?.imageResult === "string" && row?.imageResult
                  ? row?.imageResult?.split(",")
                  : undefined
                : row.imageResult === true || row.imageResult === "true",
              remarkResult: isResultItem
                ? typeof row?.remarkResult === "string" && row?.remarkResult
                  ? row?.remarkResult?.split(",")
                  : undefined
                : row.remarkResult === true || row.remarkResult === "true",
            };
          });
        }
      } catch {}
    };
    onMounted(() => {
      if (id) {
        getData(id);
      }
    });
    const onCancel = (): void => {
      formRenderRef.value?.resetFields();
      history.back();
    };
    const handleCall = (): void => {
      inspectItemModalTableRef.value?.openModal();
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
            <Tabs v-model:activeKey={activeTab.value}>
              <TabPane key="base" tab="基础信息">
                <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "110px" } }}>
                  <Row gutter={[8 * 12, 12]} style={{ width: "100%" }}>
                    <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
                      <FormItem label="标准名称" name="name">
                        <Input v-model:value={formState.name} placeholder="请输入标准名称" disabled={type === "detail"} />
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={[8 * 12, 12]} style={{ width: "100%" }}>
                    <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
                      <FormItem label="标准说明" name="remark">
                        <Textarea v-model:value={formState.remark} placeholder="请输入标准说明" disabled={type === "detail"} />
                      </FormItem>
                    </Col>
                    <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
                      <FormItem label="安全提示" name="safetyTips">
                        <Textarea v-model:value={formState.safetyTips} placeholder="请输入安全提示" disabled={type === "detail"} />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
                <div class={styles.title}>关联对象</div>
                <AssociationTabs
                  v-model:activeKey={associationActiveKey.value}
                  v-model:modelValue={associations.value}
                  disabled={type === "detail"}
                />
              </TabPane>
              <TabPane key="items" tab="巡检项">
                <InspectItemContentTable
                  ref={inspectItemContentTableRef}
                  v-model:value={inspectItems.value}
                  businessType={InspectBusinessType.DAILY_INSPECTION}
                  showAdd
                  action={type}
                >
                  {type !== "detail" && (
                    <Button type="primary" onClick={handleCall} class={styles["ml-16"]}>
                      调用巡检项
                    </Button>
                  )}
                </InspectItemContentTable>
              </TabPane>
            </Tabs>
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
    return (): JSX.Element => (
      <>
        <CubeLayout title={`${title.value}`} v-slots={layoutSlots} />
        <InspectItemModalTable
          title="调用巡检项"
          ref={inspectItemModalTableRef}
          businessType={InspectBusinessType.DAILY_INSPECTION}
          referType={associationActiveKey.value}
          onEnter={handleModalEnter}
        />
      </>
    );
  },
});
