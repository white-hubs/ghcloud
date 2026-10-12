import type { ShowSearchType } from "ant-design-vue/es/cascader";
import { computed, defineComponent, ref } from "vue";

import type { ProductIotCategoryTree } from "@ghcloud/cube-iot-center-service";
import { Cascader } from "@ghcloud/cube-ui";

import { cubeDeviceCenterService } from "../../../api/service";

interface Props {
  value?: string;
  placeholder?: string;
  showSearch?: boolean;
  width?: string;
  disabled?: boolean;
}

/** 设备中心 IoT 产品品类级联选择器，值为接口筛选使用的 categoryCode 路径。 */
export const IotProductCategoryTreeSelect = defineComponent({
  props: ["value", "placeholder", "showSearch", "width", "disabled"],
  emits: ["update:value", "change"],
  setup(props: Props, { emit }) {
    const options = ref<ProductIotCategoryTree[]>([]);

    cubeDeviceCenterService.getIotProductCategoryTree().then((res) => {
      options.value = res ?? [];
    });

    const cascaderValue = computed(() => {
      if (!props.value) {
        return [];
      }
      return props.value.split("-").filter(Boolean);
    });

    const filter: ShowSearchType["filter"] = (inputValue, path) =>
      path.some((option) =>
        String(option.categoryName ?? "")
          .toLowerCase()
          .includes(inputValue.toLowerCase()),
      );

    return (): JSX.Element => (
      <Cascader
        placeholder={props.placeholder ?? "请选择产品品类"}
        fieldNames={{ label: "categoryName", value: "categoryCode", children: "children" }}
        options={options.value}
        style={{ width: props.width || "100%" }}
        value={cascaderValue.value}
        changeOnSelect
        onChange={(value: string[]) => {
          const nextValue = value?.join("-") ?? "";
          emit("update:value", nextValue);
          emit("change", nextValue);
        }}
        showSearch={props.showSearch ? { filter } : false}
        allowClear
        disabled={props.disabled}
      />
    );
  },
});
