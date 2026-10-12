import styles from "./index.module.less";
import { Form, FormItem, InputNumber, type FormInstance } from "ant-design-vue";
import { defineComponent, reactive, ref, watch } from "vue";

export const DailyTaskTimeLimit = defineComponent({
  props: {
    value: {
      type: Object as () => Record<string, unknown>,
      default: () => ({
        day: 0,
        hour: 0,
        minute: 0,
      }),
    },
  },
  emits: ["update:value"],
  setup: (props, { emit }) => {
    const formState = reactive({
      day: 0,
      hour: 0,
      minute: 0,
    });
    const formRef = ref<FormInstance>();
    const rules = {
      day: [
        {
          required: true,
          message: "请输入天数",
        },
        {
          message: "请输入正整数(包含0)",
          pattern: /^[+]{0,1}(\d+)$/g,
        },
      ],
      hour: [
        {
          required: true,
          message: "请输入小时",
        },
        {
          message: "请输入正整数(包含0)",
          pattern: /^[+]{0,1}(\d+)$/g,
        },
      ],
      minute: [
        {
          required: true,
          message: "请输入分钟",
        },
        {
          message: "请输入正整数(包含0)",
          pattern: /^[+]{0,1}(\d+)$/g,
        },
      ],
    };
    watch(
      () => props.value,
      () => {
        if (props.value) {
          formState.day = Number(props.value.day);
          formState.hour = Number(props.value.hour);
          formState.minute = Number(props.value.minute);
        }
      },
    );
    watch(
      () => [formState.day, formState.hour, formState.minute],
      () => {
        const { day, hour, minute } = formState;
        if (day || hour || minute) {
          emit("update:value", { day, hour, minute });
        }
        formRef.value?.validate();
      },
    );
    const dayInputStyle = { width: "100px", maxWidth: "100px", minWidth: 0 };
    const hmInputStyle = { width: "90px", maxWidth: "90px", minWidth: 0 };
    return (): JSX.Element => (
      <Form ref={formRef} model={formState} rules={rules} layout="vertical" class={styles.formRoot}>
        <div class={styles.inputsRow}>
          <FormItem name="day" class={styles.field}>
            <InputNumber style={dayInputStyle} step={1} min={0} addonAfter="天" v-model:value={formState.day} max={999} placeholder="天" />
          </FormItem>
          <FormItem name="hour" class={styles.field}>
            <InputNumber style={hmInputStyle} step={1} min={0} addonAfter="时" v-model:value={formState.hour} max={23} placeholder="时" />
          </FormItem>
          <FormItem name="minute" class={styles.field}>
            <InputNumber style={hmInputStyle} step={1} min={0} addonAfter="分" v-model:value={formState.minute} max={59} placeholder="分" />
          </FormItem>
        </div>
      </Form>
    );
  },
});
