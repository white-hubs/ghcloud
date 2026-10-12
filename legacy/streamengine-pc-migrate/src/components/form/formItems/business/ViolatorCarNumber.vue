<template>
  <a-select
    v-if="!readonly"
    v-model:value="localValue"
    show-search
    option-label-prop="value"
    :placeholder="placeholder"
    style="width: 100%"
    :default-active-first-option="false"
    :show-arrow="false"
    :filter-option="false"
    :not-found-content="loading ? undefined : null"
    @search="handleSearch"
    @change="handleChange"
    @popupScroll="handlePopupScroll"
    allowClear
  >
    <template v-if="loading" #notFoundContent>
      <a-spin size="small" />
    </template>
    <a-select-option v-for="d in options" :key="d.value" :value="d.value">
      {{ d.label }}
    </a-select-option>
  </a-select>
  <span v-else>{{ modelValue || '--' }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { cubeParkingLotService } from '@/api/service';
import debounce from 'lodash/debounce';


const props = withDefaults(defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  readonly?: boolean;
  params?: string;
  formData?: any;
}>(), {
  modelValue: null,
  placeholder: "请输入车牌号码",
  readonly: false
});

const emits = defineEmits(['update:modelValue', 'change']);

const options = ref<{ label: string; value: string }[]>([]);
const loading = ref(false);
const localValue = ref<string | undefined>(undefined);
const pagination = ref({
  pageNumber: 1,
  pageSize: 20,
  total: 0,
  keyword: ''
});

watch(() => props.modelValue, (val) => {
  localValue.value = val || undefined;
  if (val && !options.value.some(opt => opt.value === val)) {
    options.value.push({ label: val, value: val });
  }
}, { immediate: true });

const fetchVehicle = async (keyword: string, isLoadMore = false) => {
  if (!keyword && !isLoadMore) {
    options.value = [];
    return;
  }
  
  if (!isLoadMore) {
    pagination.value.pageNumber = 1;
    pagination.value.keyword = keyword;
    options.value = keyword ? [{ label: keyword, value: keyword }] : [];
  }

  loading.value = true;
  try {
    const res = await cubeParkingLotService.getVehiclePageList({
      pageNumber: pagination.value.pageNumber,
      pageSize: pagination.value.pageSize,
      vehicleNo: pagination.value.keyword
    });
    
    if (res && res.records) {
      pagination.value.total = res.total;
      const newOptions = res.records.map((item: any) => ({
        label: `${item.vehicleNo} - ${item.customerName}`, 
        value: item.vehicleNo
      }));
      
      if (isLoadMore) {
        options.value = [...options.value, ...newOptions];
      } else {
        if (keyword) {
          const filteredNewOptions = newOptions.filter((o: any) => o.value !== keyword);
          options.value = [{ label: keyword, value: keyword }, ...filteredNewOptions];
        } else {
          options.value = newOptions;
        }
      }
    }
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce((val: string) => {
  fetchVehicle(val, false);
}, 800);

const handleSearch = (val: string) => {
  if (val && !options.value.some(o => o.value === val)) {
    options.value = [{ label: val, value: val }, ...options.value];
  }
  debouncedFetch(val);
};

const handlePopupScroll = (e: any) => {
  const { target } = e;
  if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
    // Reached bottom
    if (options.value.length < pagination.value.total && !loading.value) {
      pagination.value.pageNumber++;
      fetchVehicle(pagination.value.keyword, true);
    }
  }
};

const handleChange = (val: string) => {
  emits('update:modelValue', val);
  emits('change', val);
};

const validator = async () => {
  if (localValue.value) {
    return Promise.reject("请输入车牌号码");
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
