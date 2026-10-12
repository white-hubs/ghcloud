<template>
  <a-input
    v-if="!readonly"
    v-model:value="localValue"
    :placeholder="placeholder"
    style="width: 100%"
    @change="handleChange"
  />
  <span v-else>{{ modelValue || '--' }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { cubeParkingLotService } from '@/api/service';

const props = withDefaults(defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  readonly?: boolean;
  params?: string;
  formData?: any;
}>(), {
  modelValue: null,
  placeholder: "请输入车主联系方式",
  readonly: false
});

const emits = defineEmits(['update:modelValue', 'change']);
const localValue = ref<string | undefined>(undefined);

watch(() => props.modelValue, (val) => {
  localValue.value = val || undefined;
}, { immediate: true });

const getData = async () => {
  if (!props.params || !props.formData) return;

  const carNumber = props.formData[props.params];
  if (!carNumber) return;

  try {
    const res = await cubeParkingLotService.getVehiclePageList({
      pageNumber: 1,
      pageSize: 20,
      vehicleNo: carNumber
    });

    if (res && res.records && res.records.length > 0) {
      const vehicle = res.records.find((v) => v.vehicleNo === carNumber) || res.records[0];
      if (vehicle && vehicle.customerMobile) {
        localValue.value = vehicle.customerMobile;
        emits('update:modelValue', localValue.value);
        emits('change', localValue.value);
      }
    }
  } catch (error) {
  }
};

watch(
  () => props.formData && props.params ? props.formData[props.params] : undefined,
  (newVal) => {
    if (newVal) {
      getData();
    }
  },
  { immediate: true }
);

const handleChange = (e: any) => {
  const val = e.target.value;
  emits('update:modelValue', val);
  emits('change', val);
};

const validatePhone = (value: string) => {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(value);
}

const validator = async () => {
  if (localValue.value && !validatePhone(localValue.value)) {
    return Promise.reject("请输入正确的手机号码");
  }
  return Promise.resolve();
};

defineExpose({
  validator
});
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
