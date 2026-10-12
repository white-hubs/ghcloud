<template>
  <SubPanelTemplate title="安全运营天数">
    <OperateDays :value="days" title="监测天数"> </OperateDays>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import OperateDays from "../../../public/operateDays.vue";
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service';

const startTime = ref(window.config?.systemStartTime ?? '2021-01-01');
const days = ref(dayjs().diff(startTime.value, 'day'));

const getDictionary = async () => {
  const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
    itemCode: "SYSTEM_CREATION_TIME",
    code: "SYSTEM_CREATION_TIME"
  });
  if (res.variable) {
    startTime.value = res.variable;
    days.value = dayjs().diff(startTime.value, 'day');
  }
};

onMounted(() => {
  getDictionary();
});
</script>

<style lang="less" scoped>
</style>
