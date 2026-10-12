import { DataCondition } from "./data-condition";
import { EventParamForm } from "./event-param-form";
import { cubeDeviceCenterService } from "@/api/service";
import { DataType } from "@/constants/data-type";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { Form, FormItem, Input, Select, RadioGroup, Textarea, Button, type FormExpose, Tabs, TabPane } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, computed, onBeforeUnmount } from "vue";

interface Props {
  labelWidth?: string;
  formState: Record<string, string | number | [] | undefined> & {
    eventConfig?: Record<string, string | number | [] | undefined>;
    eventParams?: ParamItem[];
  };
  handleType: "add" | "edit" | "detail";
  disabled: boolean;
}

interface ParamItem {
  identifier: string;
  name: string;
  required?: boolean;
  dataType: string;
  unit?: string | null;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  maxLength?: number | undefined;
  enumValues?: { value: string | number; label: string }[];
  boolZeroText?: string;
  boolOneText?: string;
  dataRequired: boolean;
  [key: string]: unknown;
}

const LABEL_WIDTH = "100px";

/** 事件表单组件 */
export const EventForm = defineComponent({
  props: ["labelWidth", "formState", "handleType", "disabled"],
  setup(props: Props, { expose }) {
    const formRef = ref<FormExpose>();
    const dataConditionRef = ref<{ validate: () => Promise<unknown>; resetForm: () => void }>();
    const activeTabKey = ref<string>("basic");

    const formState = reactive<Record<string, unknown>>({
      name: undefined,
      eventCode: undefined,
      categoryId: undefined,
      status: undefined,
      remark: undefined,
      eventConfig: {},
      eventParams: [] as ParamItem[],
    });

    const formRules = {
      name: [{ required: true, message: "请输入事件名称", trigger: "blur" }],
      eventCode: [{ required: true, message: "请输入事件标识", trigger: "change" }],
      categoryId: [{ required: true, message: "请选择事件类型", trigger: "change" }],
      status: [{ required: true, message: "请选择是否启用", trigger: "change" }],
    };

    const categoryOptions = ref<{ label: string; value: string | number }[]>([]);
    const loading = ref(false);

    // 存储事件参数的 ref
    const eventParamFormRefs = ref<({ validate: () => Promise<unknown>; clearValidate: () => void } | null)[]>([]);

    /**
     * 监听 formState 变化
     */
    let isUpdating = false;
    const stopWatch = watch(
      () => props.formState,
      () => {
        if (isUpdating) {
          return;
        }
        try {
          isUpdating = true;
          if (props.formState && Object.keys(props.formState).length > 0) {
            if (formRef.value) {
              formRef.value.clearValidate();
            }
            const prevConfig = props.formState.eventConfig;
            const prevParams = (props.formState.eventParams as ParamItem[]) || [];
            Object.assign(formState, {
              name: props.formState.name,
              eventCode: props.formState.eventCode,
              categoryId: props.formState.categoryId,
              status: props.formState.status,
              remark: props.formState.remark,
              eventConfig:
                prevConfig && typeof prevConfig === "object"
                  ? { ...prevConfig, rules: prevConfig.rules && typeof prevConfig.rules === "object" ? { ...prevConfig.rules } : undefined }
                  : {},
              eventParams: prevParams.map((p) => ({ ...p })),
            });
            // 同步 ref 数组长度
            eventParamFormRefs.value.length = (props.formState.eventParams as ParamItem[])?.length || 0;
          } else {
            Object.keys(formState).forEach((key) => {
              if (key === "eventParams") {
                formState[key] = [];
                eventParamFormRefs.value = [];
              } else if (key === "eventConfig") {
                formState[key] = {};
              } else {
                formState[key] = undefined;
              }
            });
          }
        } catch (_ignore) {
          // 静默处理错误
        } finally {
          isUpdating = false;
        }
      },
      { deep: true, immediate: true },
    );

    /**
     * 组件卸载前清理监听器
     */
    onBeforeUnmount(() => {
      stopWatch();
    });

    /**
     * 添加事件参数
     */
    const addEventParam = (): void => {
      const params = (formState.eventParams as ParamItem[]) || [];
      params.push({
        identifier: "",
        name: "",
        required: false,
        dataType: DataType.INT,
        unit: null,
        dataRequired: false,
      });
      formState.eventParams = params;
    };

    /**
     * 删除事件参数
     */
    const removeEventParam = (index: number): void => {
      const params = (formState.eventParams as ParamItem[]) || [];
      params.splice(index, 1);
      formState.eventParams = params;
      eventParamFormRefs.value.splice(index, 1);
    };

    /**
     * 更新事件参数数据
     */
    const updateEventParam = (index: number, data: Record<string, unknown>): void => {
      try {
        const params = (formState.eventParams as ParamItem[]) || [];
        if (params[index]) {
          Object.assign(params[index], data);
        }
      } catch (_ignore) {
        // 静默处理错误
      }
    };

    /**
     * 设置事件参数表单 ref
     */
    const setEventParamFormRef = (index: number, ref: unknown): void => {
      if (eventParamFormRefs.value.length <= index) {
        eventParamFormRefs.value.length = index + 1;
      }
      const componentInstance = ref as { validate?: () => Promise<unknown>; clearValidate?: () => void } | null;
      if (componentInstance && componentInstance.validate && componentInstance.clearValidate) {
        eventParamFormRefs.value[index] = {
          validate: componentInstance.validate,
          clearValidate: componentInstance.clearValidate,
        };
      } else {
        eventParamFormRefs.value[index] = null;
      }
    };

    /**
     * 查询事件类型
     */
    const queryEventType = async (): Promise<void> => {
      loading.value = true;
      try {
        const result = await cubeDeviceCenterService.getEventType();
        categoryOptions.value = (result as { id: string | number; itemLabel: string }[]).map((item) => ({
          label: item.itemLabel,
          value: item.id,
        }));
        loading.value = false;
      } catch {
        loading.value = false;
      }
    };

    /**
     * 表单验证
     */
    const validate = async (): Promise<unknown> => {
      try {
        // 验证主表单（基本信息）
        try {
          await formRef.value?.validate();
        } catch (error) {
          activeTabKey.value = "basic";
          throw error;
        }

        try {
          const eventConfigData = (await dataConditionRef.value?.validate()) as Record<string, unknown> | undefined;
          if (eventConfigData) {
            const rules = {
              propCode: eventConfigData.propCode,
              op: eventConfigData.op,
              oprand: eventConfigData.oprand,
              delayTime: eventConfigData.delayTime,
            };
            formState.eventConfig = {
              ...(typeof formState.eventConfig === "object" && formState.eventConfig !== null ? formState.eventConfig : {}),
              triggerType: eventConfigData.triggerType,
              eventRelatedProp: Array.isArray(eventConfigData.eventRelatedProp) ? eventConfigData.eventRelatedProp : [],
              rules,
            } as Record<string, unknown>;
          }
        } catch (error) {
          activeTabKey.value = "basic";
          throw error;
        }

        // 验证所有事件参数
        const eventParamErrors: { index: number; error: unknown }[] = [];
        for (let i = 0; i < eventParamFormRefs.value.length; i++) {
          const ref = eventParamFormRefs.value[i];
          if (ref) {
            try {
              await ref.validate();
            } catch (error) {
              eventParamErrors.push({ index: i, error });
            }
          }
        }

        if (eventParamErrors.length > 0) {
          activeTabKey.value = "params";
          const errorMessages: string[] = [];
          errorMessages.push(`事件参数第${eventParamErrors.map((e) => e.index + 1).join("、")}项填写有误`);
          return Promise.reject(new Error(errorMessages.join("；")));
        }

        return formState;
      } catch (errorInfo) {
        return Promise.reject(errorInfo);
      }
    };

    /**
     * 重置表单
     */
    const resetForm = (): void => {
      formRef.value?.clearValidate();
      dataConditionRef.value?.resetForm();
      activeTabKey.value = "basic";
    };

    expose({
      formState,
      formRef,
      validate,
      resetForm,
    });

    const eventParams = computed(() => (formState.eventParams as ParamItem[]) || []);

    // 初始化时查询事件类型
    queryEventType();

    return (): JSX.Element => (
      <Tabs
        activeKey={activeTabKey.value}
        type="card"
        onChange={(key: string) => {
          activeTabKey.value = key;
        }}
      >
        {/* 基本信息 Tab */}
        <TabPane key="basic" tab="基本信息">
          <Form ref={formRef} model={formState} labelCol={{ style: { width: props.labelWidth || LABEL_WIDTH } }} rules={formRules}>
            <div style={{ padding: "16px 0" }}>
              <FormItem label="事件名称" name="name">
                <Input
                  v-model:value={formState.name}
                  placeholder="请输入事件名称"
                  allowClear
                  maxlength={30}
                  showCount
                  disabled={props.disabled}
                />
              </FormItem>
              <FormItem label="事件标识" name="eventCode">
                <Input
                  v-model:value={formState.eventCode}
                  placeholder="请输入事件标识"
                  allowClear
                  maxlength={50}
                  showCount
                  disabled={props.disabled || props.handleType === "edit"}
                />
              </FormItem>
              <FormItem label="事件类型" name="categoryId">
                <Select
                  v-model:value={formState.categoryId}
                  placeholder="请选择事件类型"
                  options={categoryOptions.value}
                  allowClear
                  fieldNames={{ label: "label", value: "value" }}
                  disabled={props.disabled || props.handleType === "edit"}
                />
              </FormItem>
              <FormItem label="">
                <DataCondition
                  ref={dataConditionRef}
                  formState={(formState.eventConfig || {}) as Record<string, string | number | [] | undefined>}
                  handleType={props.handleType}
                  disabled={props.disabled || props.handleType === "edit"}
                />
              </FormItem>
              <FormItem label="是否启用" name="status">
                <RadioGroup
                  v-model:value={formState.status}
                  options={[
                    { label: "是", value: 1 },
                    { label: "否", value: 0 },
                  ]}
                  disabled={props.disabled}
                />
              </FormItem>
              <FormItem label="事件描述" name="remark">
                <Textarea
                  v-model:value={formState.remark}
                  placeholder="请输入事件描述"
                  allowClear
                  maxlength={200}
                  showCount
                  disabled={props.disabled}
                />
              </FormItem>
            </div>
          </Form>
        </TabPane>

        {/* 事件参数 Tab */}
        <TabPane key="params" tab="事件参数">
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "12px" }}>
              {!props.disabled && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addEventParam}>
                  新增参数
                </Button>
              )}
            </div>
            {eventParams.value.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  color: "#8c8c8c",
                  background: "#fafafa",
                  borderRadius: "4px",
                  border: "1px dashed #d9d9d9",
                  fontSize: "13px",
                }}
              >
                暂无事件参数，点击"新增参数"添加
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  paddingRight: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {eventParams.value.map((param, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "4px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        paddingBottom: "8px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: "13px", color: "#595959" }}>参数 {index + 1}</span>
                      {!props.disabled && (
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeEventParam(index)}
                          style={{ padding: 0, height: "auto" }}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                    <EventParamForm
                      ref={(el) => setEventParamFormRef(index, el)}
                      param={param}
                      disabled={props.disabled || false}
                      onChange={(data: Record<string, unknown>) => updateEventParam(index, data)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>
    );
  },
});
