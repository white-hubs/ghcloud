import { cubeDeviceCenterService } from "../api/service";
import type { ProductCategoryTree, ProductIotCategoryTree } from "@ghcloud/cube-iot-center-service";
import { Cascader } from "@ghcloud/cube-ui";
import type { ShowSearchType } from "ant-design-vue/es/cascader";
import { defineComponent, ref } from "vue";

/** 产品品类级联选择器 */
export const ProductCategoryTreeSelect = defineComponent({
  props: ["value", "useType", "showSearch", "width"],
  emits: ["update:value", "change"],
  setup: (props: { value: string; useType: "id" | "code"; showSearch: false; width: string }, { emit }) => {
    const options = ref<ProductCategoryTree[] | ProductIotCategoryTree[]>([]);
    const useType = props.useType ?? "id";
    if (useType === "id") {
      cubeDeviceCenterService.getProductCategoryTree().then((res) => {
        options.value = res;
      });
    } else {
      cubeDeviceCenterService.getIotProductCategoryTree().then((res) => {
        options.value = res;
      });
    }
    const fieldNames =
      useType === "id"
        ? { label: "itemLabel", value: "id", children: "children" }
        : { label: "categoryName", value: "categoryCode", children: "children" };

    const filter: ShowSearchType["filter"] = (inputValue, path) =>
      path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    return () => (
      <Cascader
        placeholder="请选择产品品类"
        field-names={fieldNames}
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
