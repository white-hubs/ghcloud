import { cubeBusinessTagService } from "../../../api/service";
import styles from "./business-tag-select.module.less";
import { TreeSelect } from "@ghcloud/cube-ui";
import { defineComponent, ref, watch } from "vue";

interface Props {
  title: string;
  multiple: boolean;
  checkable: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
  maxTagCount: number;
  style?: Record<string, string | number>;
  showCheckedStrategy?: "SHOW_ALL" | "SHOW_PARENT" | "SHOW_CHILD";
}
/** 业务标签选择 */
export const BusinessTagSelect = defineComponent({
  props: ["title", "multiple", "value", "checkable", "placeholder", "readonly", "maxTagCount", "style", "showCheckedStrategy"],
  emits: ["update:value"],
  setup(props: Props, { emit }) {
    const select = ref<string | string[] | undefined>(props.value ?? (props.checkable ? [] : undefined));
    const tagOptions = ref([]);
    cubeBusinessTagService
      .getTagTreeList({})
      .then((res) => {
        tagOptions.value = res as never[];
      })
      .catch(() => {
        tagOptions.value = [];
      });

    watch(
      () => props.value,
      () => {
        select.value = props.value ?? (props.checkable ? [] : undefined);
      },
    );

    const handleChange = (val: string | string[]): void => {
      if (props.checkable || props.multiple) {
        emit("update:value", val as string[]);
      } else {
        emit("update:value", val as string);
      }
    };
    return (): JSX.Element => (
      <TreeSelect
        fieldNames={{ label: "name", value: "id", children: "childList" }}
        placeholder={props.placeholder ?? "请选择"}
        treeData={tagOptions.value}
        showSearch={true}
        allowClear={true}
        showCheckedStrategy={props.showCheckedStrategy}
        multiple={props.multiple ?? false}
        v-model:value={select.value}
        onChange={handleChange}
        disabled={props.readonly}
        class={styles.tagSelect}
        style={props.style}
        maxTagCount={props.maxTagCount}
      />
    );
  },
});
