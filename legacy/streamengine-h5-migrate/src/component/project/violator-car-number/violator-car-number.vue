<template>
  <div class="violator-car-number-container">
    <VanField
      v-model="textValue"
      :label="props.label"
      :required="props.required"
      :disabled="props.readonly"
      :placeholder="props.placeholder"
      :error-message="errorMessage"
      autocomplete="off"
      @update:model-value="onInput"
      @focus="onFocus"
      @blur="onBlur"
    >
      <template #button>
        <van-icon class="field-icon" v-if="!props.readonly" name="photograph" @click.stop="useScan" />
      </template>
    </VanField>
    
    <div v-if="showSuggestions && options.length > 0" class="suggestions-list" @scroll="onScroll">
      <div 
        v-for="(item, index) in options" 
        :key="item.value + index" 
        class="suggestion-item"
        @mousedown.prevent="selectItem(item)"
      >
        {{ item.label }}
      </div>
      <div v-if="loading" class="loading-item">加载中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { cubeParkingLotService, cubeOcrService } from '../../../service/service';
import debounce from 'lodash/debounce';
import { cubeAppService } from '@ghcloud/cube-app-js-sdk';
import { GLOBAL_SCENE_CODE, type FileState } from '@ghcloud/cube-file-service';
import { OcrFileProvideType, VehicleOcrManufacture } from "@ghcloud/cube-ocr-service";
import { showLoadingToast, showNotify } from 'vant';


const props = withDefaults(defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  placeholder?: string;
  modelValue?: string;
  // Additional props from car-id.vue or for compatibility
  defaultValue?: string;
  disabled?: boolean;
  maxlength?: number;
  allFormData?: any;
  params?: string;
}>(), {
  placeholder: '请输入或拍照识别车牌号码',
});

const route = useRoute();

const emits = defineEmits(['update:modelValue', 'change']);

const textValue = ref(props.modelValue ?? '');
const options = ref<{ label: string; value: string }[]>([]);
const showSuggestions = ref(false);
const loading = ref(false);
const pagination = ref({
  pageNumber: 1,
  pageSize: 20,
  total: 0,
  keyword: ''
});

watch(() => props.modelValue, (val: string | undefined) => {
  textValue.value = val ?? '';
});

watch(textValue, (val: string) => {
  emits('update:modelValue', val);
});

const validInput = ref(true);
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请输入${props.label || '车牌号码'}` : '';
});

const fetchVehicle = async (keyword: string, isLoadMore = false) => {
  if (!keyword && !isLoadMore) {
    options.value = [];
    return;
  }

  if (!isLoadMore) {
    pagination.value.pageNumber = 1;
    pagination.value.keyword = keyword;
    options.value = [];
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
        options.value = newOptions;
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

const onInput = (val: string) => {
  showSuggestions.value = true;
  debouncedFetch(val);
};

const onFocus = () => {
  if (textValue.value) {
    showSuggestions.value = true;
    if (options.value.length === 0) {
        debouncedFetch(textValue.value);
    }
  }
};

const onBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const selectItem = (item: { label: string; value: string }) => {
  textValue.value = item.value;
  showSuggestions.value = false;
  emits('change', item.value);
};

const onScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
    if (options.value.length < pagination.value.total && !loading.value) {
      pagination.value.pageNumber++;
      fetchVehicle(pagination.value.keyword, true);
    }
  }
};

defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!textValue.value;
    if (props.required && !valid) {
        validInput.value = false;
        return '请输入车牌号码';
    }
    validInput.value = true;
    return true;
  }
});
const useScan = async () => {
  if (props.readonly) {
    return;
  }

  try {
    const result = await cubeAppService.uploadFile('1', {
      sceneCode: GLOBAL_SCENE_CODE.parkingVehicle
    });

    if (result && result.length > 0) {
      handleOcr(result[0]);
    }
  } catch (error) {
    const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON ? (error as { toJSON: () => { errorMessage: string; }; }).toJSON() : { errorMessage: (error as Error).message };
    showNotify({ type: 'danger', message: errorMessage || '上传失败' });
  }
};

const handleOcr = async (file: FileState) => {
  const toast = showLoadingToast({
    message: '识别中...',
    forbidClick: true,
    duration: 0,
  });

  try {
    const imgUrl = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path || ''}`;

    const res = await cubeOcrService.ocrVehicleNumber({
      vehicleOcrManufacture: VehicleOcrManufacture.ALI,
      ocrFileProvideType: OcrFileProvideType.URL,
      imgUrl: imgUrl,
      imgFileVO: file
    });

    if (res?.vehicleNumber) {
      textValue.value = res.vehicleNumber;
      // showNotify({ type: 'success', message: '识别成功' });
      emits('update:modelValue', textValue.value);
      emits('change', textValue.value);
      debouncedFetch(textValue.value);
    } else {
      showNotify({ type: 'warning', message: '未识别到车牌' });
    }
  } catch (error) {
    const errorMessage = (error as any)?.toJSON?.()?.errorMessage || (error as Error).message || '识别失败';
    showNotify({ type: 'warning', message: errorMessage });
  } finally {
    toast.close();
  }
};
onMounted(async () => {
  const vehicleNo = route.query.vehicleNo as string;
  if (vehicleNo) {
    textValue.value = vehicleNo;
    emits('update:modelValue', vehicleNo);
    emits('change', vehicleNo);
  } else if (props.defaultValue && !props.modelValue) {
    textValue.value = props.defaultValue;
    emits('update:modelValue', textValue.value);
  }
});
</script>

<style scoped>
.violator-car-number-container {
  position: relative;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.suggestion-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #323233;
  cursor: pointer;
}

.suggestion-item:active {
  background-color: #f2f3f5;
}

.loading-item {
  padding: 10px 16px;
  text-align: center;
  color: #969799;
  font-size: 12px;
}
  .form-item-field .van-field__body{
    align-items: flex-start;
  }
  .field-icon {
    font-size: 18px;
    line-height: inherit;
    margin-left: 5px;
  }
  .field-icon-text{
    color: var(--van-nav-bar-text-color);
    font-size: var(--van-font-size-md);
    line-height: inherit;
  }
  .field-tags{
    width: 100%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 控制最多显示两行 */
    max-height: 70px ;
    text-overflow: ellipsis;
  }
</style>
