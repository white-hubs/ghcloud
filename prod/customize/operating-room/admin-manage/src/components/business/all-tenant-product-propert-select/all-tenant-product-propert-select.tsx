import { cubeOperatingRoomService } from "@/api/service";
import type { AllTenantPropertVO } from "@ghcloud/cube-operating-room-service";
import { Select } from "@ghcloud/cube-ui";
import { defineComponent, ref } from "vue";
interface Props {
  optionData: AllTenantPropertVO[];
  value: string | string[];
  disabledValue: string[];
  width: string;
  mode: "multiple" | "tags" | "SECRET_COMBOBOX_MODE_DO_NOT_USE";
  maxTagCount: number;
}
/** 所属产品-属性选择 */
export const AllTenantProductPropertSelect = defineComponent({
  props: ["optionData", "value", "disabledValue", "width", "mode", "maxTagCount"],
  emits: ["update:value", "change"],
  setup: (props: Props, { emit }) => {
    const data = ref<AllTenantPropertVO[]>([]);
    const options = ref<AllTenantPropertVO[]>([]);

    const handleMapData = (): void => {
      options.value = data.value.map((ele) => {
        const value = `${ele.tenantId}-${ele.productId}-${ele.propertyCode}`;
        return {
          ...ele,
          label: ele.propertyName,
          value: value,
          disabled: props.disabledValue?.includes(value) ?? false,
        };
      });
    };

    if (props.optionData && props.optionData.length) {
      data.value = props.optionData;
      handleMapData();
    } else {
      cubeOperatingRoomService.getAllTenantProductList().then((res: AllTenantPropertVO[]) => {
        data.value = res;
        handleMapData();
      });
    }

    const slots = {
      option: ({ label, productName, propertyCode }: { label: string; productName: string; propertyCode: string }): JSX.Element => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{label}</span>
          <span style={{ color: "#999" }}>{`${productName}`}</span>
          <span style={{ color: "#868383" }}>{`${propertyCode}`}</span>
        </div>
      ),
    };

    return (): JSX.Element => (
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          mode={props.mode}
          maxTagCount={props.maxTagCount}
          placeholder="请选择所属产品的项目"
          showSearch
          allowClear
          style={{ width: props.width }}
          filterOption={(input: string, option: { propertyName: string; productName: string }) => {
            const propertyMatch = (option.propertyName as string).toLowerCase().includes(input.toLowerCase());
            const productMatch = (option.productName as string).toLowerCase().includes(input.toLowerCase());
            return propertyMatch || productMatch;
          }}
          onChange={(e: string | string[]) => {
            emit("update:value", e);
            if (props.mode === "multiple") {
              const selectValue = options.value.filter((ele) => e.includes(ele.value));
              emit("change", selectValue);
            } else {
              const selectValue = options.value.find((ele) => e === ele.value);
              emit("change", selectValue);
            }
          }}
          v-slots={slots}
        />
      </>
    );
  },
});
