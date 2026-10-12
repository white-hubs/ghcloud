import { apiProxy } from "../../../api/service";
import type { ProductCategoryModel } from "@ghcloud/cube-iot-center-service";
import { Cascader } from "@ghcloud/cube-ui";
import type { ShowSearchType } from "ant-design-vue/es/cascader";
import { defineComponent, ref } from "vue";

/** 产品品类级联选择器 */
export const ProductCategoryTreeSelect = defineComponent({
  props: ["value", "showSearch", "width"],
  emits: ["update:value", "change"],
  setup: (props: { value: string; showSearch: false; width: string }, { emit }) => {
    const options = ref<ProductCategoryModel[]>([]);

    apiProxy.cubeDeviceIotCenterService.getProductCategoryTree().then((res) => {
      options.value = res;
    });

    const filter: ShowSearchType["filter"] = (inputValue, path) =>
      path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return () => (
      <Cascader
        placeholder="请选择产品品类"
        field-names={{ label: "itemLabel", value: "id", children: "children" }}
        options={options.value}
        style={{ width: props.width || "180px" }}
        value={props.value}
        changeOnSelect
        onChange={(e: string[]) => {
          emit("update:value", e);
          emit("change");
        }}
        show-search={props.showSearch && filter}
        allowClear
      />
    );
  },
});
