<template>
  <VanField
    v-model="textValue"
    :label="props.label"
    :required="props.required"
    :disabled="props.readonly"
    :placeholder="props.placeholder || '请输入车主姓名'"
    :error-message="errorMessage"
    clearable
    @update:model-value="onInput"
  />
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { ref, watch, onMounted, computed } from 'vue';
import { cubeParkingLotService } from '../../../service/service';

const props = withDefaults(defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  placeholder?: string;
  modelValue?: string;
  defaultValue?: string;
  disabled?: boolean;
  maxlength?: number;
  allFormData?: any;
  params?: string;
}>(), {
  placeholder: '请输入车主姓名',
});

const emits = defineEmits(['update:modelValue', 'change']);

const textValue = ref(props.modelValue ?? '');

// Sync modelValue to textValue
watch(() => props.modelValue, (val) => {
  textValue.value = val ?? '';
});

// Error message handling
const validInput = ref(true);
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请输入${props.label || '车主姓名'}` : '';
});

const onInput = (val: string) => {
  textValue.value = val;
  emits('update:modelValue', val);
  emits('change', val);
};

const fetchName = async () => {
  if (!props.params || !props.allFormData) return;

  const carNumber = props.allFormData[props.params];
  if (!carNumber) return;

  try {
    const res = await cubeParkingLotService.getVehiclePageList({
      pageNumber: 1,
      pageSize: 20,
      vehicleNo: carNumber
    });

    if (res && res.records && res.records.length > 0) {
      const vehicle = res.records.find((v: any) => v.vehicleNo === carNumber) || res.records[0];
      if (vehicle && vehicle.customerName) {
        textValue.value = vehicle.customerName;
        emits('update:modelValue', textValue.value);
        emits('change', textValue.value);
      }
    }
  } catch (error) {
  }
};

watch(
  () => props.allFormData && props.params ? props.allFormData[props.params] : undefined,
  (newVal) => {
    if (newVal) {
      fetchName();
    }
  },
  { immediate: true }
);

defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!textValue.value;
    if (props.required && !valid) {
        validInput.value = false;
        return `请输入${props.label || '车主姓名'}`;
    }
    validInput.value = true;
    return true;
  }
});

onMounted(() => {
  if (props.defaultValue && !props.modelValue) {
    textValue.value = props.defaultValue;
    emits('update:modelValue', textValue.value);
  }
});
</script>

<style scoped>
</style>
