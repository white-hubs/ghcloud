import { cubeMdataService } from "../../api/service";
import { TreeSelect } from "@ghcloud/cube-ui";
import { defineComponent, ref, watch } from "vue";

interface GridAreaOption {
  id: string;
  name: string;
  children?: GridAreaOption[];
}

interface Props {
  title: string;
  multiple: boolean;
  checkable: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
  showCheckedStrategy?: "SHOW_ALL" | "SHOW_PARENT" | "SHOW_CHILD";
}

/** 网格区域选择 */
export const GridAreaTreeSelect = defineComponent({
  props: ["title", "multiple", "value", "checkable", "placeholder", "readonly", "showCheckedStrategy"],
  emits: ["update:value", "change"],
  setup(props: Props, { emit }) {
    const select = ref(props.value);
    const gridAreaOptions = ref<GridAreaOption[]>([]);
    cubeMdataService.getGridLeaderAreaList().then((res) => {
      gridAreaOptions.value = res as GridAreaOption[];
    });

    watch(
      () => props.value,
      () => {
        select.value = props.value ?? (props.multiple ? [] : "");
      },
    );
    return (): JSX.Element => (
      <TreeSelect
        fieldNames={{ label: "name", value: "id", children: "children" }}
        placeholder={props.placeholder ?? "请选择"}
        treeData={gridAreaOptions.value}
        allow-clear
        showCheckedStrategy={props.showCheckedStrategy}
        multiple={props.multiple ?? false}
        v-model:value={select.value}
        onChange={(ids: string[], labels: string[], _extra: unknown) => {
          // 将 ids 和 labels 组合成 {id: string, name: string}[] 格式
          const options = ids
            .map((id, index) => ({
              id: String(id ?? ""),
              name: String(labels[index] ?? ""),
            }))
            .filter((opt) => opt.id);
          emit("update:value", ids);
          emit("change", ids, options);
        }}
        disabled={props.readonly}
      />
    );
  },
});
