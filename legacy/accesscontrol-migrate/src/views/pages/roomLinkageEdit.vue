<template>
  <g-layout title="编辑门禁联动">
    <template #content-table>
      <gDetailFormRef ref="detailForm" :api="api" :formList="formList" :afterGet="afterGet">
        <template #dataValidSeconds="{ record }">
          <a-input-number v-model:value="record.dataValidSeconds" :min="1" :precision="0" />
          <span class="seconds-unit">秒</span>
          <span class="seconds-hint">超过此时长的数据视为无效</span>
        </template>
        <template #gasConfigs="{ record }">
          <div class="gas-hint">
            已绑定传感器且已填写阈值的气体参与校验；未绑定传感器的气体跳过不校验。仅校验进入方向。气体数据不可用时不下发指令，由门禁本地超时处理。
          </div>
          <div v-for="definition in gasDefinitions" :key="definition.gasType" class="gas-row">
            <span class="gas-label">{{ definition.label }}</span>
            <a-select
              v-model:value="record.gasConfigs[definition.gasType].sensorDeviceId"
              :options="sensorOptions"
              allow-clear
              placeholder="请选择传感器"
              class="sensor-select"
              @change="clearGasThreshold(record, definition.gasType)"
            />
            <template v-if="definition.range"
              ><span>下限</span
              ><a-input-number
                v-model:value="record.gasConfigs[definition.gasType].lowerThreshold"
                :disabled="!record.gasConfigs[definition.gasType].sensorDeviceId"
                :min="0" /><span>~</span
              ><a-input-number
                v-model:value="record.gasConfigs[definition.gasType].upperThreshold"
                :disabled="!record.gasConfigs[definition.gasType].sensorDeviceId"
                :min="0"
            /></template>
            <template v-else
              ><span>上限</span
              ><a-input-number
                v-model:value="record.gasConfigs[definition.gasType].upperThreshold"
                :disabled="!record.gasConfigs[definition.gasType].sensorDeviceId"
                :min="0"
            /></template>
            <span class="unit">ppm</span
            ><span v-if="!record.gasConfigs[definition.gasType].sensorDeviceId" class="skip">（未绑定，不校验）</span>
          </div>
        </template>
      </gDetailFormRef>
    </template>
    <template #footer-page
      ><a-button @click="back">返回</a-button><a-button type="primary" :loading="saving" @click="save">保存</a-button></template
    >
  </g-layout>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs } from "vue";
import { useRoute } from "vue-router";

import { pushLinkageRoute } from "./linkage/navigation";
import gDetailFormRef from "@/components/Common/gDetailFormRef.vue";
export default defineComponent({
  components: { gDetailFormRef },
  setup() {
    const route = useRoute();
    const detailForm = ref();
    const { proxy } = getCurrentInstance();
    const doorDeviceId = route.params.id;
    const gasDefinitions = [
      { gasType: "O2", label: "氧气 O₂", range: true },
      { gasType: "CO2", label: "二氧化碳 CO₂", range: false },
      { gasType: "PH3", label: "磷化氢 PH₃", range: false },
    ];
    const emptyGas = (gasType) => ({ gasType, sensorDeviceId: null, lowerThreshold: null, upperThreshold: null, unit: "ppm" });
    const state = reactive({
      saving: false,
      sensorOptions: [],
      api: { detail: "getDoorGasLinkageConfigDetail" },
      formList: [
        {
          title: "基础信息",
          form: [
            { label: "门禁名称", value: "doorName", plaintext: true },
            { label: "所属区域", value: "areaName", plaintext: true },
            { label: "设备编码", value: "deviceCode", plaintext: true },
            { label: "说明", value: "baseInfoTip", plaintext: true, detailFun: () => "基础信息由海康门禁设备同步，不可编辑" },
          ],
        },
        {
          title: "气体联动",
          form: [
            { label: "气体联动", value: "gasLinkageEnabled", component: "a-switch", checkedValue: "已开启", unCheckedValue: "已关闭" },
            { label: "数据有效时长", value: "dataValidSeconds", slot: true, showCondition: (form) => form.gasLinkageEnabled },
            { label: "气体配置", value: "gasConfigs", slot: true, singleLine: true, showCondition: (form) => form.gasLinkageEnabled },
          ],
        },
      ],
    });
    const afterGet = (data) => {
      const gasConfigs = Object.fromEntries(
        gasDefinitions.map((definition) => [
          definition.gasType,
          { ...emptyGas(definition.gasType), ...(data.gasConfigs || []).find((item) => item.gasType === definition.gasType) },
        ]),
      );
      return {
        ...data,
        doorName: data.door?.deviceName,
        deviceCode: data.door?.deviceCode,
        areaName: data.door?.areaName,
        dataValidSeconds: data.dataValidSeconds || 60,
        gasConfigs,
      };
    };
    const clearGasThreshold = (record, gasType) => {
      const gas = record.gasConfigs[gasType];
      if (!gas.sensorDeviceId) {
        gas.lowerThreshold = null;
        gas.upperThreshold = null;
      }
    };
    const loadSensorOptions = async () => {
      const result = await proxy.$api.getSecurityDevicePage({ applicationCode: "GAS_MONITORING", pageNumber: 1, pageSize: 100 });
      state.sensorOptions = (result.records || []).map((item) => ({
        value: item.deviceId,
        label: item.code && item.code !== item.deviceName ? `${item.deviceName}（${item.code}）` : item.deviceName,
      }));
    };
    const save = async () => {
      const form = detailForm.value.form;
      const gasConfigs = gasDefinitions.map((definition) => form.gasConfigs[definition.gasType]).filter((item) => item.sensorDeviceId);
      if (form.gasLinkageEnabled && !gasConfigs.length) return proxy.$message.warning("请至少选择一个气体传感器");
      state.saving = true;
      try {
        await proxy.$api.saveDoorGasLinkageConfig(doorDeviceId, {
          gasLinkageEnabled: form.gasLinkageEnabled,
          dataValidSeconds: form.dataValidSeconds,
          gasConfigs: form.gasLinkageEnabled ? gasConfigs : [],
        });
        proxy.$message.success("保存成功");
        pushLinkageRoute(`/roomLinkagePage/${doorDeviceId}`, { type: "detail", id: doorDeviceId });
      } finally {
        state.saving = false;
      }
    };
    onMounted(loadSensorOptions);
    return {
      ...toRefs(state),
      detailForm,
      gasDefinitions,
      afterGet,
      clearGasThreshold,
      save,
      back: () => pushLinkageRoute("/roomLinkagePage"),
    };
  },
});
</script>
<style scoped lang="less">
.seconds-unit {
  margin-left: 8px;
  color: #606266;
}

.seconds-hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.gas-hint {
  margin-bottom: 16px;
  padding: 10px 12px;
  color: #909399;
  line-height: 20px;
  background: #f5f7fa;
  border-radius: 2px;
}

.gas-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.gas-label {
  width: 110px;
  color: #606266;
}

.sensor-select {
  width: 260px;
}

.unit,
.skip {
  color: #909399;
  font-size: 12px;
}

.skip {
  font-style: italic;
}
</style>
