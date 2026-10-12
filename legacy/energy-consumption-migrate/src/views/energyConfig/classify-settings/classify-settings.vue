<template>
  <div class="classify-settings-page">
    <GLayout title="分类设置">
      <template #content-table>
        <div>
          <p>请配置能耗分类，如果需要监测请打开监测开关。并同步设置其数据采集方式。</p>
          <p>系统只会对监测开关是开启的能耗分类进行采集、存储、分析、上报操作。采集方式为人工录入的情况下，需要按日或者月进行补录数值</p>
        </div>
        <div class="classify-settings-table">
          <Table
            :data-source="tableList"
            :columns="columns"
            :pagination="false"
            size="small"
            :loading="loading"
            rowKey="deviceId"
            :scroll="{ y: scrollY }"
          >
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'action'">
                <Button type="link" @click="openModel(record)" :data-text="text">配置</Button>
              </template>
            </template>
          </Table>
        </div>
      </template>
    </GLayout>
    <!-- 分类设置弹窗 -->
    <Modal v-model:visible="deviceVisible" title="分类设置" width="640px" destroy-on-close @ok="submitDevice">
      <Form ref="formRef" class="classify-settings-modal-form" :model="deviceForm" layout="horizontal">
        <FormItem name="categoryName" label="能耗分类">
          <span class="classify-settings-modal-form__text">{{ deviceForm.categoryName }}</span>
        </FormItem>
        <FormItem name="collectOn" label="监测开关">
          <Switch v-model:checked="deviceForm.collectOn" :disabled="deviceForm.categoryName === '电'" />
        </FormItem>
        <FormItem name="collectType" label="采集方式">
          <Select
            v-model:value="deviceForm.collectType"
            allow-clear
            class="classify-settings-modal-form__control"
            :options="collectTypeOption"
          />
        </FormItem>
        <FormItem name="custCode" label="分类编码">
          <Input v-model:value="deviceForm.custCode" class="classify-settings-modal-form__control" :maxlength="20" />
        </FormItem>
        <FormItem name="fuelCode" label="燃料类型">
          <Select
            v-model:value="deviceForm.fuelCode"
            allow-clear
            show-search
            class="classify-settings-modal-form__control classify-settings-modal-form__select-fuel"
            option-filter-prop="fuelName"
            :options="fuelOption"
            :field-names="{ label: 'fuelName', value: 'code' }"
            @change="changeFuel"
          />
          <div class="classify-settings-modal-form__hint">
            单位：{{ fuelUnit.unit }}、折标准煤系数：{{ fuelUnit.calculateProportion }}kgce、碳排因子：{{ fuelUnit.carbonFactor }}kgCO2
          </div>
        </FormItem>
        <FormItem name="rolloverValue" label="回卷周期值">
          <InputNumber
            v-model:value="deviceForm.rolloverValue"
            class="classify-settings-modal-form__control"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="为空时不处理回卷"
          />
        </FormItem>
        <FormItem name="maxStepUsage" label="单次最大合理用量">
          <InputNumber
            v-model:value="deviceForm.maxStepUsage"
            class="classify-settings-modal-form__control"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="为空时不限制"
          />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
interface FuelType extends DefaultOptionType {
  calculateProportion: number;
  carbonFactor: number;
  code: string;
  fuelName: string;
  id: number;
  unit: string;
}
import { Modal } from "ant-design-vue";
import { message } from "ant-design-vue/es";
import type { SelectValue } from "ant-design-vue/es/select";
import type { ColumnsType } from "ant-design-vue/es/table/Table";
import type { DefaultOptionType } from "ant-design-vue/lib/select";
import { ref, onMounted, reactive } from "vue";

import { ClassifySettingsPage, FuelListPage, UpdateClassifySettings } from "@/api/energyOverview";
import GLayout from "@/components/common/gLayout.vue";
const collectTypeOption = [
  { label: "计量设备自动采集", value: "auto" },
  { label: "人工录入", value: "hand" },
];
const loading = ref(true);
const scrollY = ref<number>(200);
const fuelOption = ref();
const scrollHandle = () => {
  let tableHeight = 0;
  const clientHeight = document.querySelector(".content-table")?.clientHeight;
  if (clientHeight) {
    tableHeight = clientHeight - 120;
  }
  scrollY.value = tableHeight;
};
onMounted(async () => {
  // 设置表格滚动
  scrollHandle();
  getFuelList();
  window.addEventListener("resize", function () {
    scrollHandle();
  });
  setTimeout(() => {
    getTableList();
  }, 0);
});
const getFuelList = async () => {
  const { data } = await FuelListPage({ keyword: "" });
  fuelOption.value = data;
};
//分类列表=============================================================================================================================================
const tableList = ref([]);
const columns: ColumnsType = [
  {
    title: "编码",
    dataIndex: "custCode",
    key: "custCode",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return (text as string) ?? "--";
    },
  },
  {
    title: "能耗分类",
    dataIndex: "categoryName",
    key: "categoryName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return (text as string) ?? "--";
    },
  },
  {
    title: "数据采集",
    dataIndex: "collectType",
    key: "collectType",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text ? (text === "auto" ? "计量设备自动采集" : "人工录入") : "--";
    },
  },
  {
    title: "监测开关",
    dataIndex: "collectOn",
    key: "collectOn",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: boolean }) => {
      return text ? "开" : "关";
    },
  },
  {
    dataIndex: "action",
    title: "操作",
    width: "140px",
  },
];
const getTableList = async () => {
  loading.value = true;
  const { data } = await ClassifySettingsPage();
  tableList.value = data.records;
  loading.value = false;
};
//配置分类=============================================================================================================================================
const deviceVisible = ref(false);
const formRef = ref();
const deviceForm = reactive({
  collectOn: true,
  id: "",
  categoryName: "", //类型名称
  custCode: "",
  collectType: "",
  fuelCode: "",
  rolloverValue: null as number | null,
  maxStepUsage: null as number | null,
});
const fuelUnit = ref({
  unit: "",
  carbonFactor: 0,
  calculateProportion: 0,
});
const changeFuel = (_value: SelectValue, option: FuelType) => {
  fuelUnit.value.unit = option?.unit ?? "";
  fuelUnit.value.carbonFactor = option?.carbonFactor ?? "";
  fuelUnit.value.calculateProportion = option?.calculateProportion ?? "";
};
const openModel = (item: any) => {
  deviceVisible.value = true;
  deviceForm.id = item.id;
  deviceForm.collectOn = item.collectOn;
  deviceForm.categoryName = item.categoryName;
  deviceForm.custCode = item.custCode;
  deviceForm.collectType = item.collectType;
  deviceForm.fuelCode = item.fuelCode;
  deviceForm.rolloverValue = item.rolloverValue ?? null;
  deviceForm.maxStepUsage = item.maxStepUsage ?? null;
  fuelUnit.value.unit = item.unit;
  fuelUnit.value.carbonFactor = item.carbonFactor;
  fuelUnit.value.calculateProportion = item.calculateProportion;
};
const submitDevice = async () => {
  await formRef.value?.validate();
  await UpdateClassifySettings(deviceForm);
  getTableList();
  message.success("配置成功");
  deviceVisible.value = false;
};
</script>
<style lang="less" scoped>
.classify-settings-table {
  display: block;
  width: 100%;
  min-width: 0;
  margin-top: 20px;
}
.pagination {
  margin-top: 20px;
  float: right;
}
</style>
<style lang="less">
/* Modal 内容常挂到 body，与 scoped 分离；限定在表单根类避免污染全局 */
.classify-settings-modal-form.ant-form-horizontal {
  .ant-form-item {
    margin-bottom: 16px;
  }
  .ant-form-item .ant-form-item-row {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
  }
  .ant-form-item .ant-form-item-label {
    flex: 0 0 132px;
    width: 132px !important;
    max-width: 132px !important;
    min-width: 132px !important;
    text-align: right;
    padding-right: 8px;
    line-height: 32px;
  }
  .ant-form-item .ant-form-item-control {
    flex: 1 1 auto;
    min-width: 0;
  }
  .classify-settings-modal-form__control {
    width: 100%;
    max-width: 100%;
  }
  .classify-settings-modal-form__hint {
    margin-top: 8px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    line-height: 1.5;
  }
  .classify-settings-modal-form__text {
    display: inline-block;
    line-height: 32px;
  }
}
</style>
