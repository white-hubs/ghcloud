<template>
  <ListData :baseInfo="props.deviceInfo" :productPropVoList="props.productPropVoList" :data="props.data"/>
  <BatteryTabData :productPropVoList="props.productPropVoList" :data="props.data"/>
  <InputTabData :productPropVoList="props.productPropVoList" :data="props.data"/>
  <OutData :productPropVoList="props.productPropVoList" :data="props.data"/>
</template>
<script setup lang="ts">
import ListData from './components/list-data.vue';
import BatteryTabData from "./components/battery-tab-data.vue";
import InputTabData from "./components/input-tab-data.vue";
import OutData from "./components/out-data.vue";

const props=defineProps({
  data: {
    type: Object,
    default: {}
  },
  productPropVoList: {
    type: Array,
    default: []
  },
  deviceInfo: {
    type: Object,
    default: {}
  }
})
</script>