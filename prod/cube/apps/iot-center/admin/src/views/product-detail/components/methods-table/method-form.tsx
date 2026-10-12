import { ParamForm } from "./param-form";
import { DataType } from "@/constants/data-type";
import { MethodType, METHOD_TYPE_OPTIONS } from "@/constants/method-type";
import { Status } from "@/constants/status";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { Form, FormItem, Input, InputNumber, RadioGroup, Textarea, Button, type FormExpose, Switch, Tabs, TabPane } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, computed, onBeforeUnmount } from "vue";

interface Props {
  formState: Record<string, unknown>;
  handleType: "add" | "edit" | "detail";
  disabled?: boolean;
}

interface ParamItem {
  identifier: string;
  name: string;
  required?: boolean;
  dataType: string;
  unit?: string | null;
  min?: number;
  max?: number;
  precision?: number;
  maxLength?: number;
  enumValues?: { value: string | number; label: string }[];
  boolZeroText?: string;
  boolOneText?: string;
  dataRequired: boolean;
  [key: string]: unknown;
}

const LABEL_WIDTH = "100px";

/** 服务方法表单 */
export const MethodForm = defineComponent({
  props: ["formState", "handleType", "disabled"],
  setup(props: Props, { expose }) {
    const formRef = ref<FormExpose>();
    const activeTabKey = ref<string>("basic");

    const formState = reactive<Record<string, unknown>>({
      name: undefined,
      methodCode: undefined,
      methodType: MethodType.SYNC,
      status: Status.ENABLED,
      remark: undefined,
      timeoutSeconds: undefined,
      retryCount: undefined,
      retryInterval: undefined,
      inputParams: [] as ParamItem[],
      outputParams: [] as ParamItem[],
    });

    const formRules = {
      methodCode: [{ required: true, message: "请输入方法标识", trigger: "blur" }],
      name: [{ required: true, message: "请输入方法名称", trigger: "blur" }],
      methodType: [{ required: true, message: "请选择执行方式", trigger: "change" }],
      timeoutSeconds: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (value !== undefined && value !== null && value < 1) {
              return Promise.reject(new Error("超时时间必须大于等于1"));
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      retryCount: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (value !== undefined && value !== null && value < 0) {
              return Promise.reject(new Error("重试次数必须大于等于0"));
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      retryInterval: [
        {
          validator: (_rule: unknown, value: number | undefined): Promise<void> => {
            if (value !== undefined && value !== null && value < 0) {
              return Promise.reject(new Error("重试间隔必须大于等于0"));
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
    };

    /**
     * 监听 formState 变化
     */
    let isUpdating = false;
    const stopWatch = watch(
      () => props.formState,
      () => {
        // 防止循环更新
        if (isUpdating) {
          return;
        }
        try {
          isUpdating = true;
          if (props.formState && Object.keys(props.formState).length > 0) {
            if (formRef.value) {
              formRef.value.clearValidate();
            }
            Object.assign(formState, {
              methodCode: props.formState.methodCode,
              name: props.formState.name,
              methodType: props.formState.methodType || MethodType.SYNC,
              status: props.formState.status === undefined ? Status.ENABLED : props.formState.status,
              remark: props.formState.remark,
              timeoutSeconds: props.formState.timeoutSeconds,
              retryCount: props.formState.retryCount,
              retryInterval: props.formState.retryInterval,
              inputParams: (props.formState.inputParams as ParamItem[]) || [],
              outputParams: (props.formState.outputParams as ParamItem[]) || [],
            });
            // 同步 ref 数组长度
            inputParamFormRefs.value.length = (props.formState.inputParams as ParamItem[])?.length || 0;
            outputParamFormRefs.value.length = (props.formState.outputParams as ParamItem[])?.length || 0;
          } else {
            // 只有当 formState 为空时才清空
            Object.keys(formState).forEach((key) => {
              if (key === "inputParams" || key === "outputParams") {
                formState[key] = [];
                // 清空对应的 ref 数组
                if (key === "inputParams") {
                  inputParamFormRefs.value = [];
                } else if (key === "outputParams") {
                  outputParamFormRefs.value = [];
                }
              } else if (key === "methodType") {
                formState[key] = MethodType.SYNC;
              } else if (key === "status") {
                formState[key] = Status.ENABLED;
              } else {
                formState[key] = undefined;
              }
            });
          }
        } catch (_ignore) {
          // 静默处理错误，避免在组件卸载时抛出异常
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
     * 添加输入参数
     */
    const addInputParam = (): void => {
      const params = (formState.inputParams as ParamItem[]) || [];
      params.push({
        identifier: "",
        name: "",
        required: false,
        dataType: DataType.INT,
        unit: null,
        dataRequired: false,
      });
      formState.inputParams = params;
    };

    /**
     * 删除输入参数
     */
    const removeInputParam = (index: number): void => {
      const params = (formState.inputParams as ParamItem[]) || [];
      params.splice(index, 1);
      formState.inputParams = params;
      // 清理对应的 ref
      inputParamFormRefs.value.splice(index, 1);
    };

    /**
     * 添加输出参数
     */
    const addOutputParam = (): void => {
      const params = (formState.outputParams as ParamItem[]) || [];
      params.push({
        identifier: "",
        name: "",
        dataType: DataType.INT,
        unit: null,
        dataRequired: false,
      });
      formState.outputParams = params;
    };

    /**
     * 删除输出参数
     */
    const removeOutputParam = (index: number): void => {
      const params = (formState.outputParams as ParamItem[]) || [];
      params.splice(index, 1);
      formState.outputParams = params;
      // 清理对应的 ref
      outputParamFormRefs.value.splice(index, 1);
    };

    /**
     * 更新参数数据
     */
    const updateInputParam = (index: number, data: Record<string, unknown>): void => {
      try {
        const params = (formState.inputParams as ParamItem[]) || [];
        if (params[index]) {
          Object.assign(params[index], data);
        }
      } catch (_ignore) {
        // 静默处理错误，避免在组件卸载时抛出异常
      }
    };

    const updateOutputParam = (index: number, data: Record<string, unknown>): void => {
      try {
        const params = (formState.outputParams as ParamItem[]) || [];
        if (params[index]) {
          Object.assign(params[index], data);
        }
      } catch (_ignore) {
        // 静默处理错误，避免在组件卸载时抛出异常
      }
    };

    // 存储输入参数和输出参数的 ref
    const inputParamFormRefs = ref<({ validate: () => Promise<unknown>; clearValidate: () => void } | null)[]>([]);
    const outputParamFormRefs = ref<({ validate: () => Promise<unknown>; clearValidate: () => void } | null)[]>([]);

    /**
     * 设置输入参数表单 ref
     */
    const setInputParamFormRef = (index: number, ref: unknown): void => {
      if (inputParamFormRefs.value.length <= index) {
        inputParamFormRefs.value.length = index + 1;
      }
      // 从组件实例中获取暴露的方法
      const componentInstance = ref as { validate?: () => Promise<unknown>; clearValidate?: () => void } | null;
      if (componentInstance && componentInstance.validate && componentInstance.clearValidate) {
        inputParamFormRefs.value[index] = {
          validate: componentInstance.validate,
          clearValidate: componentInstance.clearValidate,
        };
      } else {
        inputParamFormRefs.value[index] = null;
      }
    };

    /**
     * 设置输出参数表单 ref
     */
    const setOutputParamFormRef = (index: number, ref: unknown): void => {
      if (outputParamFormRefs.value.length <= index) {
        outputParamFormRefs.value.length = index + 1;
      }
      // 从组件实例中获取暴露的方法
      const componentInstance = ref as { validate?: () => Promise<unknown>; clearValidate?: () => void } | null;
      if (componentInstance && componentInstance.validate && componentInstance.clearValidate) {
        outputParamFormRefs.value[index] = {
          validate: componentInstance.validate,
          clearValidate: componentInstance.clearValidate,
        };
      } else {
        outputParamFormRefs.value[index] = null;
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
          // 基本信息验证失败，切换到基本信息 Tab
          activeTabKey.value = "basic";
          throw error;
        }

        // 验证所有输入参数
        const inputParamErrors: { index: number; error: unknown }[] = [];
        for (let i = 0; i < inputParamFormRefs.value.length; i++) {
          const ref = inputParamFormRefs.value[i];
          if (ref) {
            try {
              await ref.validate();
            } catch (error) {
              inputParamErrors.push({ index: i, error });
            }
          }
        }

        // 验证所有输出参数
        const outputParamErrors: { index: number; error: unknown }[] = [];
        for (let i = 0; i < outputParamFormRefs.value.length; i++) {
          const ref = outputParamFormRefs.value[i];
          if (ref) {
            try {
              await ref.validate();
            } catch (error) {
              outputParamErrors.push({ index: i, error });
            }
          }
        }

        // 如果有参数验证失败，切换到对应的 Tab 并抛出错误
        if (inputParamErrors.length > 0 || outputParamErrors.length > 0) {
          // 优先显示输入参数的错误
          if (inputParamErrors.length > 0) {
            activeTabKey.value = "input";
          } else if (outputParamErrors.length > 0) {
            activeTabKey.value = "output";
          }

          const errorMessages: string[] = [];
          if (inputParamErrors.length > 0) {
            errorMessages.push(`输入参数第${inputParamErrors.map((e) => e.index + 1).join("、")}项填写有误`);
          }
          if (outputParamErrors.length > 0) {
            errorMessages.push(`输出参数第${outputParamErrors.map((e) => e.index + 1).join("、")}项填写有误`);
          }
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
      activeTabKey.value = "basic";
    };

    expose({
      validate,
      resetForm,
    });

    const inputParams = computed(() => (formState.inputParams as ParamItem[]) || []);
    const outputParams = computed(() => (formState.outputParams as ParamItem[]) || []);

    return (): JSX.Element => (
      <Tabs v-model:activeKey={activeTabKey} type="card">
        {/* 基本信息 Tab */}
        <TabPane key="basic" tab="基本信息">
          <Form ref={formRef} model={formState} labelCol={{ style: { width: LABEL_WIDTH } }} rules={formRules}>
            <div style={{ padding: "16px 0" }}>
              <FormItem label="方法标识" name="methodCode">
                <Input
                  v-model:value={formState.methodCode}
                  placeholder="请输入方法标识"
                  allowClear
                  maxlength={50}
                  showCount
                  disabled={props.disabled || props.handleType === "edit"}
                />
              </FormItem>
              <FormItem label="方法名称" name="name">
                <Input
                  v-model:value={formState.name}
                  placeholder="请输入方法名称"
                  allowClear
                  maxlength={30}
                  showCount
                  disabled={props.disabled}
                />
              </FormItem>
              <FormItem label="执行方式" name="methodType">
                <RadioGroup v-model:value={formState.methodType} options={METHOD_TYPE_OPTIONS} disabled={props.disabled} />
              </FormItem>
              <FormItem label="是否启用" name="status">
                <Switch
                  v-model:value={formState.status}
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                  checkedValue={Status.ENABLED}
                  unCheckedValue={Status.DISABLED}
                  {...(props.disabled ? { disabled: true } : {})}
                />
              </FormItem>
              <FormItem label="超时时间(秒)" name="timeoutSeconds">
                <InputNumber
                  v-model:value={formState.timeoutSeconds}
                  placeholder="请输入超时时间"
                  min={1}
                  allowClear
                  disabled={props.disabled || false}
                />
              </FormItem>
              <FormItem label="重试次数" name="retryCount">
                <InputNumber
                  v-model:value={formState.retryCount}
                  placeholder="请输入重试次数"
                  min={0}
                  allowClear
                  disabled={props.disabled || false}
                />
              </FormItem>
              <FormItem label="重试间隔(秒)" name="retryInterval">
                <InputNumber
                  v-model:value={formState.retryInterval}
                  placeholder="请输入重试间隔"
                  min={0}
                  allowClear
                  disabled={props.disabled || false}
                />
              </FormItem>
              <FormItem label="方法说明" name="remark">
                <Textarea
                  v-model:value={formState.remark}
                  placeholder="请输入方法说明"
                  allowClear
                  maxlength={200}
                  showCount
                  disabled={props.disabled}
                />
              </FormItem>
            </div>
          </Form>
        </TabPane>

        {/* 输入参数 Tab */}
        <TabPane key="input" tab="输入参数">
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "12px" }}>
              {!props.disabled && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addInputParam}>
                  新增参数
                </Button>
              )}
            </div>
            {inputParams.value.length === 0 ? (
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
                暂无输入参数，点击"新增参数"添加
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
                {inputParams.value.map((param, index) => (
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
                          onClick={() => removeInputParam(index)}
                          style={{ padding: 0, height: "auto" }}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                    <ParamForm
                      ref={(el) => setInputParamFormRef(index, el)}
                      param={param}
                      disabled={props.disabled || false}
                      isInput={true}
                      onChange={(data: Record<string, unknown>) => updateInputParam(index, data)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPane>

        {/* 输出参数 Tab */}
        <TabPane key="output" tab="输出参数">
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "12px" }}>
              {!props.disabled && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addOutputParam}>
                  新增参数
                </Button>
              )}
            </div>
            {outputParams.value.length === 0 ? (
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
                暂无输出参数，点击"新增参数"添加
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
                {outputParams.value.map((param, index) => (
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
                          onClick={() => removeOutputParam(index)}
                          style={{ padding: 0, height: "auto" }}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                    <ParamForm
                      ref={(el) => setOutputParamFormRef(index, el)}
                      param={param}
                      disabled={props.disabled || false}
                      isInput={false}
                      onChange={(data: Record<string, unknown>) => updateOutputParam(index, data)}
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
