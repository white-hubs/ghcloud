import type { PropSchema } from "@cube-scada/core";
import { Checkbox, Input, InputNumber, Select, Switch } from "ant-design-vue";
import { defineComponent, ref, watch, type PropType } from "vue";

function isColorInputValue(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export const PropField = defineComponent({
  name: "PropField",
  props: {
    schema: { type: Object as PropType<PropSchema>, required: true },
    value: { type: [String, Number, Boolean, Object] as PropType<any>, default: undefined },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const onChange = (val: any) => emit("change", val);
    const lastOpaqueColor = ref(
      isColorInputValue(props.value) ? props.value : isColorInputValue(props.schema.default) ? props.schema.default : "#ffffff",
    );

    watch(
      () => props.value,
      (value) => {
        if (isColorInputValue(value)) lastOpaqueColor.value = value;
      },
    );

    return () => {
      const { schema, value } = props;

      switch (schema.type) {
        case "string":
          return (
            <Input
              value={value as string}
              maxLength={schema.maxLength}
              placeholder={schema.hint ?? `请输入${schema.label}`}
              onChange={(e: any) => onChange(e.target?.value ?? e)}
            />
          );

        case "number":
          return (
            <InputNumber
              value={value as number}
              min={schema.min}
              max={schema.max}
              step={schema.step}
              precision={schema.precision}
              style="width: 100%"
              onChange={onChange}
            />
          );

        case "boolean":
          return <Switch checked={!!value} onChange={onChange} />;

        case "select":
          return (
            <Select
              value={value as string}
              style="width: 100%"
              options={(schema.options ?? []).map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              onChange={onChange}
            />
          );

        case "color":
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Input
                type="color"
                value={isColorInputValue(value) ? value : lastOpaqueColor.value}
                disabled={value === "transparent"}
                style="width: 60px; padding: 2px"
                onChange={(e: any) => {
                  const next = e.target?.value ?? e;
                  if (isColorInputValue(next)) lastOpaqueColor.value = next;
                  onChange(next);
                }}
              />
              {schema.allowTransparent ? (
                <Checkbox
                  checked={value === "transparent"}
                  onChange={(e: { target: { checked: boolean } }) => onChange(e.target.checked ? "transparent" : lastOpaqueColor.value)}
                >
                  透明
                </Checkbox>
              ) : null}
            </div>
          );

        default:
          return <Input value={String(value ?? "")} onChange={(e: any) => onChange(e.target?.value ?? e)} />;
      }
    };
  },
});
