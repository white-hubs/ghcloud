import { Field } from "vant";
import { defineComponent, onMounted, ref, type PropType } from "vue";

import { DateField } from "@/components/date-field/date-field";
import { MapPickField } from "@/components/map-pick-field/map-pick-field";
import { OptionPicker } from "@/components/option-picker/option-picker";
import { service } from "@/shared";
import { type Option, type SuppliesFormState, unitOptions } from "@/views/supplies-list/supplies-shared";

import styles from "./supplies-fields.module.less";

export const SuppliesFields = defineComponent({
  name: "SuppliesFields",
  props: {
    form: {
      type: Object as PropType<SuppliesFormState>,
      required: true,
    },
    codeDisabled: { type: Boolean, default: false },
  },
  setup: (props) => {
    const types = ref<Option[]>([]);
    const warehouses = ref<Option[]>([]);

    const loadOptions = async (): Promise<void> => {
      const [typeData, warehouseData] = await Promise.all([
        service.getSuppliesTypePage({
          pageNumber: 1,
          pageSize: 200,
          status: true,
        }),
        service.getWarehousePage({
          pageNumber: 1,
          pageSize: 200,
          status: true,
        }),
      ]);
      types.value = typeData.records.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      warehouses.value = warehouseData.records.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    };

    onMounted(() => {
      void loadOptions();
    });

    return () => {
      const { form } = props;
      return (
        <div class={styles.fields}>
          <Field v-model={form.name} label="物资名称" label-width={96} required placeholder="请输入物资名称" maxlength={80} />
          <OptionPicker
            label="类别"
            required
            title="选择类别"
            value={form.type}
            options={types.value}
            placeholder="请选择类别"
            onChange={(value: string) => {
              form.type = value;
            }}
          />
          <Field
            v-model={form.code}
            label="物资编码"
            label-width={96}
            disabled={props.codeDisabled}
            placeholder="不填则自动生成"
            maxlength={64}
          />

          <div class={styles.formRow}>
            <Field v-model={form.specification} label="规格" label-width={48} required placeholder="如：MFZ/ABC4 4kg" maxlength={80} />
            <OptionPicker
              label="单位"
              labelWidth={48}
              required
              title="选择单位"
              value={form.unit}
              options={unitOptions}
              placeholder="请选择单位"
              onChange={(value: string) => {
                form.unit = value;
              }}
            />
          </div>

          <Field v-model={form.quantity} type="number" label="库存数量" label-width={96} required placeholder="0" />
          <Field v-model={form.safetyStockMin} type="number" label="安全库存下限" label-width={96} placeholder="低于该值触发库存预警" />
          <OptionPicker
            label="仓库"
            required
            title="选择仓库"
            value={form.warehouseId}
            options={warehouses.value}
            placeholder="请选择仓库"
            onChange={(value: string) => {
              form.warehouseId = value;
            }}
          />

          <DateField
            label="有效期至"
            required
            title="选择有效期至"
            value={form.expiryDate}
            placeholder="请选择日期"
            onChange={(value: string) => {
              form.expiryDate = value;
            }}
          />
          <DateField
            label="生产日期"
            title="选择生产日期"
            value={form.productionDate}
            placeholder="请选择日期"
            onChange={(value: string) => {
              form.productionDate = value;
            }}
          />

          <MapPickField
            longitude={form.longitude}
            latitude={form.latitude}
            locationDesc={form.locationDesc}
            onChange={(value) => {
              form.longitude = value.longitude;
              form.latitude = value.latitude;
              form.locationDesc = value.locationDesc;
            }}
          />

          <Field v-model={form.supplier} label="供应商" label-width={96} placeholder="供应商名称" maxlength={80} />
          <Field v-model={form.supplierContact} label="供应商联系方式" label-width={96} placeholder="如：025-85861234" maxlength={40} />
          <Field v-model={form.remark} label="备注" label-width={96} type="textarea" rows={2} placeholder="备注" maxlength={200} />
        </div>
      );
    };
  },
});
