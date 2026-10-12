import { apiProxy } from "../../../api/service";
import type { ProductBrandModel } from "@ghcloud/cube-iot-center-service";
import { Select } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref } from "vue";

/** 产品品牌下拉框 */
interface Props {
  value: string;
  mode?: string;
  width?: string;
  enable?: boolean;
}
export const ProductBrandSelect = defineComponent({
  props: ["value", "width", "mode", "enable"],
  emits: ["update:value", "change"],
  setup: (props: Props, { emit }) => {
    const options = ref<ProductBrandModel[]>([]);
    const getData = async (): Promise<void> => {
      apiProxy.cubeDeviceIotCenterService
        .getProductBrandPage({
          pageSize: 1000,
          pageNumber: 1,
        })
        .then((res) => {
          options.value = res?.records || [];
          const selectValue = options.value.find((e: ProductBrandModel) => e.id === props.value);
          emit("change", props.value, selectValue);
        });
    };

    onMounted(async () => {
      await getData();
    });

    return (): JSX.Element => (
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder="请选择品牌"
          style={{ width: props.width ?? "180px" }}
          fieldNames={{ label: "itemLabel", value: "id" }}
          onUpdate:value={(value) => {
            emit("update:value", value);
          }}
          onChange={(value: unknown) => {
            emit(
              "change",
              value,
              options.value.find((e) => e.id === value),
            );
          }}
          mode={props.mode ?? ""}
          allowClear
        />
      </>
    );
  },
});
