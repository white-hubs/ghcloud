import { Select } from "ant-design-vue";
import { defineComponent, ref } from "vue";

import { DataType, type ProjectPageVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { cubeZDDataVizService } from "@/infrastructure/api/service";

import styles from "./type-select.module.less";

/** 所属项目下拉框 */
export const TypeSelect = defineComponent({
  props: ["value", "width", "placeholder", "params"],
  emits: ["update:value", "change"],
  setup: (props: { value: string; width: string; placeholder?: string; params?: Record<string, unknown> }, { emit }) => {
    const options = ref([]);
    cubeZDDataVizService.getDataTypeListAll({ dataType: DataType.PLACE }).then((res) => {
      options.value = res?.map((item) => {
        return {
          name: item.dataName,
          id: item.id,
        };
      });
      options.value.unshift({
        name: "全部分类",
        id: "",
      });
    });
    return (): JSX.Element => (
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder={props?.placeholder || "全部分类"}
          field-names={{ label: "name", value: "id" }}
          style={{ width: props.width || "180px", cursor: "pointer" }}
          onChange={(e: string) => {
            emit("update:value", e);
            emit("change", e);
          }}
          allowClear
          optionFilterProp="name"
          showSearch
          notFoundContent={"暂无数据"}
          class={styles["select"]}
        />
      </>
    );
  },
});
