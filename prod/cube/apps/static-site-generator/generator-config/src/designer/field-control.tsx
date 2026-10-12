// oxlint-disable complexity
// oxlint-disable no-use-before-define
import { MaterialSelectModal } from "../views/material-management/components/material-select-modal";
import type { SelectOption as SelectOptionType } from "./types";
import type { EditorType } from "./types";
import { Input, Switch, Textarea, Select, SelectOption, Button } from "@ghcloud/cube-ui";
import { defineComponent, ref, type PropType } from "vue";

export const FieldControl = defineComponent({
  props: {
    editor: {
      type: String as PropType<EditorType>,
      required: true,
    },
    value: {
      type: [String, Number, Boolean, Array, Object] as PropType<unknown>,
      default: undefined,
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    options: {
      type: Array as PropType<SelectOptionType[]>,
      default: () => [],
    },
  },
  emits: ["update"],
  setup(props, { emit }) {
    return (): JSX.Element => {
      const { editor, value, label, placeholder, options } = props;

      switch (editor) {
        case "textarea":
          return (
            <Textarea
              value={String(value ?? "")}
              onUpdate:value={(val: string) => emit("update", val)}
              rows={4}
              placeholder={placeholder || `请输入 ${label}`}
              show-count={false}
              maxlength={Number.MAX_SAFE_INTEGER}
            />
          );
        case "number":
          return (
            <Input
              value={String(value ?? "")}
              onUpdate:value={(val: string) => {
                const num = val === "" ? undefined : Number(val);
                emit("update", num);
              }}
              onKeydown={(e: KeyboardEvent) => {
                if (e.key === ".") {
                  e.preventDefault();
                }
              }}
              placeholder={placeholder || `请输入 ${label}`}
              show-count={false}
              maxlength={Number.MAX_SAFE_INTEGER}
              style={{ width: "100%" }}
            />
          );
        case "switch":
          return <Switch value={Boolean(value)} onUpdate:value={(val: boolean) => emit("update", val)} />;
        case "select": {
          const opts = options || [];
          return (
            <Select
              value={String(value ?? "")}
              onUpdate:value={(val: string) => emit("update", val)}
              placeholder={placeholder || `请选择 ${label}`}
              style={{ width: "100%" }}
            >
              {opts.map((opt) => (
                <SelectOption key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectOption>
              ))}
            </Select>
          );
        }
        case "color":
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="color"
                value={String(value ?? "#000000")}
                onInput={(e: Event) => emit("update", (e.target as HTMLInputElement).value)}
                style={{
                  width: "36px",
                  height: "36px",
                  padding: 0,
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
              <Input
                value={String(value ?? "")}
                onUpdate:value={(val: string) => emit("update", val)}
                placeholder={placeholder || `请输入 ${label}`}
                show-count={false}
                maxlength={Number.MAX_SAFE_INTEGER}
                style={{ flex: 1 }}
              />
            </div>
          );
        case "image":
          return <ImageField value={String(value ?? "")} placeholder={placeholder} onUpdate={(val) => emit("update", val)} />;
        case "input":
        default:
          return (
            <Input
              value={String(value ?? "")}
              onUpdate:value={(val: string) => emit("update", val)}
              placeholder={placeholder || `请输入 ${label}`}
              show-count={false}
              maxlength={Number.MAX_SAFE_INTEGER}
            />
          );
      }
    };
  },
});

/**
 * 图片字段：Input + 选择素材按钮 + MaterialSelectModal
 */
const ImageField = defineComponent({
  props: {
    value: { type: String, default: "" },
    placeholder: { type: String, default: "" },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const visible = ref(false);

    const handleConfirm = (materials: { url: string }[]): void => {
      if (materials.length > 0 && materials[0].url) {
        emit("update", materials[0].url);
      }
      visible.value = false;
    };

    return (): JSX.Element => (
      <div style={{ display: "flex", gap: "8px" }}>
        <Input
          value={props.value}
          onUpdate:value={(val: string) => emit("update", val)}
          placeholder={props.placeholder || "请输入图片 URL 或选择素材"}
          show-count={false}
          maxlength={Number.MAX_SAFE_INTEGER}
          style={{ flex: 1 }}
        />
        <Button onClick={() => (visible.value = true)}>选择素材</Button>
        <MaterialSelectModal v-model:visible={visible.value} mode="single" title="选择素材" onConfirm={handleConfirm} />
      </div>
    );
  },
});
