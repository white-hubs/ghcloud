import { Textarea, type TextAreaProps } from "ant-design-vue/es";
import { defineComponent, ref, watch } from "vue";
export default defineComponent({
  props: {
    placeholder: {
      type: String,
      default: "请输入",
    },
    maxlength: {
      type: Number,
      default: 500,
    },
    showCount: {
      type: Boolean,
      default: true,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    autoSize: {
      type: [Boolean, Object],
      default: false,
    },
    bordered: {
      type: Boolean,
      default: true,
    },
    rows: {
      type: Number,
      default: 4,
    },
    value: {
      type: String,
      default: "",
    },
  },
  emits: ["update:value", "change"],
  setup(props: TextAreaProps, { emit }) {
    const value = ref(props.value ?? undefined);
    watch(
      () => props.value,
      () => {
        value.value = props.value;
      },
    );
    return (): JSX.Element => (
      <Textarea
        {...props}
        v-model:value={value.value}
        onChange={() => {
          emit("update:value", value.value);
          emit("change", value.value);
        }}
      />
    );
  },
});
