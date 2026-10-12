import { DataCondition } from "./data-condition";
import { cubeDeviceIotCenterService } from "@/api/service";
import { STATUS_OPTIONS } from "@/constants/status";
import { Form, FormItem, Input, Select, RadioGroup, Textarea, type FormExpose } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, onMounted } from "vue";

interface Props {
  formState: Record<string, string | number | [] | undefined> & {
    config?: Record<string, string | number | [] | undefined>;
  };
  handleType: "add" | "edit" | "detail";
  disabled?: boolean;
}

const LABEL_WIDTH = "100px";

/** 事件表单组件 */
export const EventForm = defineComponent({
  props: ["formState", "handleType", "disabled"],
  setup(props: Props, { expose }) {
    const formRef = ref<FormExpose>();
    const dataConditionRef = ref<{ validate: () => Promise<unknown>; resetForm: () => void; formState: Record<string, unknown> }>();

    const formState = reactive<Record<string, string | number | [] | undefined>>({
      name: undefined,
      eventCode: undefined,
      eventCategoryId: undefined,
      status: undefined,
      remark: undefined,
      config: undefined,
    });

    const formRules = {
      name: [{ required: true, message: "请输入事件名称", trigger: "blur" }],
      eventCode: [{ required: true, message: "请输入事件标识", trigger: "change" }],
      eventCategoryId: [{ required: true, message: "请选择事件类型", trigger: "change" }],
      status: [{ required: true, message: "请选择是否启用", trigger: "change" }],
    };

    const categoryOptions = ref<{ label: string; value: string }[]>([]);
    const loading = ref(false);

    /**
     * 查询事件类型
     */
    const queryEventType = async (): Promise<void> => {
      loading.value = true;
      try {
        const result = await cubeDeviceIotCenterService.getProductEventType();
        if (Array.isArray(result)) {
          categoryOptions.value = result.map((item: { itemLabel: string; id: string }) => ({
            label: item.itemLabel,
            value: item.id,
          }));
        }
      } catch (_ignore) {
        // 静默失败
      } finally {
        loading.value = false;
      }
    };

    /**
     * 监听 formState 变化
     */
    watch(
      () => props.formState,
      () => {
        if (props.formState) {
          formRef.value?.clearValidate();
          Object.assign(formState, props.formState);
        } else {
          Object.keys(formState).forEach((key) => {
            formState[key] = undefined;
          });
        }
      },
      { deep: true, immediate: true },
    );

    /**
     * 表单验证
     */
    const validate = async (): Promise<unknown> => {
      try {
        const formValues = await formRef.value?.validate();
        const dataConditionValues = await dataConditionRef.value?.validate();
        const formValuesObj = formValues as Record<string, unknown>;
        const dataConditionValuesObj = dataConditionValues as Record<string, unknown>;
        return {
          ...formValuesObj,
          ...dataConditionValuesObj,
        };
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
    };

    onMounted(async () => {
      await queryEventType();
    });

    expose({
      validate,
      resetForm,
      formState,
    });

    return (): JSX.Element => (
      <Form ref={formRef} model={formState} labelCol={{ style: { width: LABEL_WIDTH } }} rules={formRules}>
        <FormItem label="事件名称" name="name">
          <Input
            v-model:value={formState.name}
            placeholder="请输入事件名称"
            allowClear
            maxlength={30}
            showCount
            disabled={props.disabled || false}
          />
        </FormItem>
        <FormItem label="事件标识" name="eventCode">
          <Input
            v-model:value={formState.eventCode}
            placeholder="请输入事件标识"
            allowClear
            maxlength={50}
            showCount
            disabled={props.disabled || false || props.handleType === "edit"}
          />
        </FormItem>
        <FormItem label="事件类型" name="eventCategoryId">
          <Select
            v-model:value={formState.eventCategoryId}
            placeholder="请选择事件类型"
            options={categoryOptions.value}
            allowClear
            disabled={props.disabled || false || props.handleType === "edit"}
            fieldNames={{ label: "label", value: "value" }}
          />
        </FormItem>
        <FormItem label="" name="dataConfigCustom">
          <DataCondition
            ref={dataConditionRef}
            formState={(formState.config ?? {}) as Record<string, string | number | [] | undefined>}
            handleType={props.handleType}
            disabled={props.disabled || false || props.handleType === "edit"}
          />
        </FormItem>
        <FormItem label="是否启用" name="status">
          <RadioGroup v-model:value={formState.status} options={STATUS_OPTIONS} disabled={props.disabled || false} />
        </FormItem>
        <FormItem label="事件描述" name="remark">
          <Textarea
            v-model:value={formState.remark}
            placeholder="请输入事件描述"
            allowClear
            maxlength={200}
            showCount
            disabled={props.disabled || false}
          />
        </FormItem>
      </Form>
    );
  },
});
