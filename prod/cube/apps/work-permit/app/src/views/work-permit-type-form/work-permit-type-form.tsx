import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { WorkPermitAssociatedItem, WorkPermitTypePayload } from "@ghcloud/cube-service-interface/work-permit";
import { createWorkPermitType, getWorkPermitTypeDetail, updateWorkPermitType } from "@ghcloud/cube-services-client/work-permit.client";
import {
  Button,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  MinusOutlined,
  PlusOutlined,
  Row,
  Switch,
  Textarea,
  message,
  type FormExpose,
} from "@ghcloud/cube-ui";

import styles from "./work-permit-type-form.module.less";

type FormMode = "add" | "edit" | "detail";

interface FormState {
  typeName: string;
  workPermitLevel: string | undefined;
  levelDefinition: string;
  permitValidHours: number | undefined;
  riskCheckItems: WorkPermitAssociatedItem[];
  acceptanceItems: WorkPermitAssociatedItem[];
}

const emptyItem = (): WorkPermitAssociatedItem => ({
  itemName: "",
  aiRecognitionEnabled: false,
});

export const WorkPermitTypeForm = defineComponent({
  name: "WorkPermitTypeForm",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<FormExpose>();
    const saveLoading = ref(false);
    const mode = computed<FormMode>(() => {
      const value = route.query.type;
      return value === "edit" || value === "detail" ? value : "add";
    });
    const readonly = computed(() => mode.value === "detail");
    const id = computed(() => route.query.id as string | undefined);
    const formState = reactive<FormState>({
      typeName: "",
      workPermitLevel: undefined,
      levelDefinition: "",
      permitValidHours: undefined,
      riskCheckItems: [emptyItem()],
      acceptanceItems: [emptyItem()],
    });
    const rules = {
      typeName: [{ required: true, message: "请输入作业类型名称", trigger: "blur" }],
      workPermitLevel: [{ required: true, message: "请输入作业等级", trigger: "blur" }],
      levelDefinition: [{ required: true, message: "请输入等级定义", trigger: "blur" }],
      permitValidHours: [{ required: true, message: "请输入作业票有效时长", trigger: "blur" }],
    };

    const title = computed(() => {
      const map = new Map<FormMode, string>([
        ["add", "新增作业类型"],
        ["edit", "编辑作业类型"],
        ["detail", "作业类型详情"],
      ]);
      return map.get(mode.value) ?? "作业类型";
    });

    const subtitle = computed(() => {
      if (mode.value === "add") {
        return "新增自定义作业类型，配置基础信息、风险项和验收项";
      }
      if (mode.value === "edit") {
        return "调整作业类型基础信息、风险项和验收项";
      }
      return "查看作业类型基础信息、风险项和验收项";
    });

    const loadDetail = async (): Promise<void> => {
      if (!id.value) {
        return;
      }
      const detail = await getWorkPermitTypeDetail(id.value);
      formState.typeName = detail.typeName ?? "";
      formState.workPermitLevel = detail.workPermitLevel;
      formState.levelDefinition = detail.levelDefinition ?? "";
      formState.permitValidHours = detail.permitValidHours;
      formState.riskCheckItems = detail.riskCheckItems?.length ? detail.riskCheckItems : [emptyItem()];
      formState.acceptanceItems = detail.acceptanceItems?.length ? detail.acceptanceItems : [emptyItem()];
    };

    const addItem = (field: "riskCheckItems" | "acceptanceItems"): void => {
      formState[field].push(emptyItem());
    };

    const removeItem = (field: "riskCheckItems" | "acceptanceItems", index: number): void => {
      if (formState[field].length === 1) {
        formState[field] = [emptyItem()];
        return;
      }
      formState[field].splice(index, 1);
    };

    const normalizeItems = (items: WorkPermitAssociatedItem[]): WorkPermitAssociatedItem[] =>
      items
        .map((item, index) => ({
          itemName: item.itemName?.trim() ?? "",
          aiRecognitionEnabled: item.aiRecognitionEnabled === true,
          sortNo: index,
        }))
        .filter((item) => item.itemName);

    const buildPayload = (): WorkPermitTypePayload => ({
      typeName: formState.typeName.trim(),
      workPermitLevel: formState.workPermitLevel?.trim() ?? "",
      levelDefinition: formState.levelDefinition.trim(),
      permitValidHours: formState.permitValidHours ?? 0,
      riskCheckItems: normalizeItems(formState.riskCheckItems),
      acceptanceItems: normalizeItems(formState.acceptanceItems),
    });

    const goList = (): void => {
      router.replace({
        path: "/work-permit-type-config",
      });
    };

    const submit = async (): Promise<void> => {
      if (readonly.value) {
        goList();
        return;
      }
      await formRef.value?.validate();
      saveLoading.value = true;
      try {
        const payload = buildPayload();
        await (mode.value === "edit" && id.value ? updateWorkPermitType(id.value, payload) : createWorkPermitType(payload));
        message.success("操作成功");
        goList();
      } finally {
        saveLoading.value = false;
      }
    };

    const renderItems = (
      titleText: string,
      field: "riskCheckItems" | "acceptanceItems",
      addText: string,
      placeholder: string,
    ): JSX.Element => (
      <div class={styles.section}>
        <div class={styles.sectionHeader}>
          <h3 class={styles.sectionTitle}>{titleText}</h3>
          {!readonly.value && (
            <Button type="primary" class={styles.addItemBtn} onClick={() => addItem(field)}>
              <PlusOutlined />
              {addText}
            </Button>
          )}
        </div>
        <div class={styles.itemRows}>
          {formState[field].map((item, index) => (
            <div class={styles.itemRow} key={index}>
              {readonly.value ? (
                <>
                  <div class={styles.readonlyText}>{item.itemName || "--"}</div>
                  <div class={styles.aiSwitchWrap}>
                    <span class={styles.aiSwitchLabel}>AI识别</span>
                    <Switch checked={item.aiRecognitionEnabled === true} checkedChildren="开" unCheckedChildren="关" disabled />
                  </div>
                </>
              ) : (
                <>
                  <Input class={styles.itemInput} v-model:value={item.itemName} placeholder={placeholder} maxlength={255} />
                  <div class={styles.aiSwitchWrap}>
                    <span class={styles.aiSwitchLabel}>AI识别</span>
                    <Switch
                      checked={item.aiRecognitionEnabled === true}
                      checkedValue
                      unCheckedValue={false}
                      checkedChildren="开"
                      unCheckedChildren="关"
                      onChange={(value: boolean) => {
                        item.aiRecognitionEnabled = value;
                      }}
                    />
                  </div>
                  <Button class={styles.removeBtn} danger onClick={() => removeItem(field, index)}>
                    <MinusOutlined />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    onMounted(async () => {
      await loadDetail();
    });

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <div class={styles.section}>
            <div class={styles.sectionHeader}>
              <h3 class={styles.sectionTitle}>基础信息</h3>
            </div>
            <Form model={formState} ref={formRef} rules={rules} label-col={{ style: { width: "120px" } }}>
              <Row gutter={[24, 16]} style={{ width: "100%" }}>
                <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label="作业类型名称" name="typeName">
                    <Input v-model:value={formState.typeName} disabled={readonly.value} placeholder="请输入作业类型名称" maxlength={64} />
                  </FormItem>
                </Col>
                <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label="作业等级" name="workPermitLevel">
                    {readonly.value ? (
                      <div class={styles.readonlyText}>{formState.workPermitLevel || "--"}</div>
                    ) : (
                      <Input v-model:value={formState.workPermitLevel} placeholder="请输入作业等级" maxlength={64} />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ width: "100%" }}>
                <Col span={24}>
                  <FormItem label="等级定义" name="levelDefinition">
                    <Textarea
                      v-model:value={formState.levelDefinition}
                      disabled={readonly.value}
                      placeholder="请输入作业等级的具体定义说明（1-200个字符）"
                      maxlength={200}
                      rows={4}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ width: "100%" }}>
                <Col span={24}>
                  <FormItem label="作业票有效时长" name="permitValidHours">
                    {readonly.value ? (
                      <div class={styles.readonlyText}>{formState.permitValidHours ?? "--"} 小时</div>
                    ) : (
                      <div class={styles.duration}>
                        <InputNumber
                          class={styles.durationInput}
                          v-model:value={formState.permitValidHours}
                          min={1}
                          precision={0}
                          placeholder="请输入时长"
                        />
                        <span>小时</span>
                      </div>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
          {renderItems("作业风险检查项", "riskCheckItems", "添加检查风险项", "请输入风险项名称")}
          {renderItems("作业验收项", "acceptanceItems", "添加验收项", "请输入验收项名称")}
        </div>
      ),
      "footer-page": (): JSX.Element =>
        readonly.value ? (
          <Button type="primary" onClick={goList}>
            返回
          </Button>
        ) : (
          <>
            <Button onClick={goList}>取消</Button>
            <Button type="primary" loading={saveLoading.value} onClick={submit} class={styles.ml16}>
              保存
            </Button>
          </>
        ),
    };

    return (): JSX.Element => <CubeLayout title={title.value} desc={subtitle.value} v-slots={slots} />;
  },
});
