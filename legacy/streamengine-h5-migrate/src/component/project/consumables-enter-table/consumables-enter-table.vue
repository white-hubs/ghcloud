<template>
  <VanField type="text" :required="props.required" :disabled="props.readonly" class="group-list"
    :error-message="errorMessage">
    <template #label>
      <span>
        <span>{{ props.label }}</span>
        <span style="margin-left: 10px;">总量：{{ totalNum }} 总金额：{{ totalAmount }}</span>
      </span>
      <van-button type="primary" size="mini" @click="add" class="add-group" v-if="!props.readonly">选择耗材</van-button>
    </template>
    <template #input>
      <div class="card" v-for="(item, index) in value" v-if="value.length">
        <div class="card-header">
          <span class="title">{{ item.name || '--' }}</span>
          <div class="field-item" style="margin-bottom: 0;">
            <span class="label" style="margin-left: 0;">耗材编码</span>
            <span class="value">{{ item.code || '--' }}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="field-item">
            <span class="label">品牌</span>
            <span class="value">{{ item.brand || '--' }}</span>
          </div>
          <div class="field-item">
            <span class="label">单位</span>
            <span class="value">{{ item.unit || '--' }}</span>
          </div>
          <!--图片-->
          <template v-if="item.file && item.file.length">
            <van-image width="25vw" height="25vw" fit="contain" class="consumables-pic" :src="item.file[0].path" />
          </template>
          <div class="field-item" v-if="!props.readonly">
            <van-field v-model="item.price" placeholder="请输入单价" label="单价" :required="true" type="number"
              :error-message="errorMessageItem(item, index, 'price', '请输入单价')" />
          </div>
          <div class="field-item" v-else>
            <span class="label">单价</span>
            <span class="value">{{ translateAmount(item.price) }}</span>
          </div>
          <div class="field-item" v-if="!props.readonly">
            <van-field v-model="item.num" placeholder="请输入数量" type="digit" required label="数量"
              :error-message="errorMessageItem(item, index, 'num', '请输入数量')" />
          </div>
          <div class="field-item" v-else>
            <span class="label">数量</span>
            <span class="value">{{ item.num }}</span>
          </div>
          <div class="field-item">
            <span class="label">金额</span>
            <span class="value">{{ caclStoreAmount(item) }}</span>
          </div>
        </div>
        <div class="card-foot van-cell--clickable" @click.stop="del(item)" v-if="!props.readonly">删除</div>
      </div>
      <VanEmpty description="暂无数据" v-else />
    </template>
  </VanField>
  <ChooseConsumablesPop ref="ChooseAssetPopRef" @selected="selected" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import ChooseConsumablesPop from "./ChooseConsumablesPop.vue";
import { PropertyDetailedParam } from "../../../domain/property";
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { computed } from "vue";
import { translateAmount } from '../../../infrastructure/amount-util';

const props = withDefaults(
  defineProps<{
    modelValue?: any[] | null;
    placeholder?: string;
    readonly?: boolean;
    config?: any;
    label: string;
    required?: boolean;
    errorMessage?: string;
    dependFormValues: any[];
  }>(),
  {
    modelValue: null,
    readonly: false,
  }
);
const emits = defineEmits(["update:modelValue"]);
const value = ref(props.modelValue ?? []);

// 弹层相关
const ChooseAssetPopRef = ref();
const add = () => {
  ChooseAssetPopRef.value.show(value.value);
};
const selected = (values: PropertyDetailedParam[]) => {
  value.value = JSON.parse(JSON.stringify(values));
  value.value = value.value.map(e => {
    e.flowConvertData = false
    return e
  })
  errorMessage.value = ''
};

const del = (item: unknown) => {
  ChooseAssetPopRef.value.removeItem(item)
};

const caclStoreAmount = computed(() => {
  return (item: { storeAmount: number; num: number; price: number }) => {
    item.storeAmount = (item.num ?? 0) * (item.price ?? 0);
    return item.storeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
});

const totalAmount = computed(() => {
  let res = 0
  value.value.forEach(e => {
    res += e.storeAmount ?? 0
  })
  return res.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})
const totalNum = computed(() => {
  let res = 0
  value.value.forEach(e => {
    res += e.num ? parseInt(e.num) : 0
  })
  return res
})

const validInput = ref<{ valid: boolean; index: number }[]>([]);
const errorMessageItem = computed(() => {
  return (
    item: { [x: string]: any },
    index: number,
    field: string,
    text: string
  ) => {
    const valid = validInput.value[index]?.valid;
    if (valid === false && !item[field]) {
      return text;
    }
    if (valid === false && item[field] === '0') {
      return field === 'num' ? '数量不能小于1' : "金额不能为0"
    }
    return "";
  };
});

const errorMessage = ref('')

const validate = () => {
  errorMessage.value = ''
  if (value.value.length == 0) {
    errorMessage.value = '请选择耗材'
    return false
  }
  validInput.value = value.value.map((e, i) => {
    return { valid: true, index: i };
  });
  let valid = true;
  for (let index = 0; index < value.value.length; index++) {
    const item = value.value[index];
    if (!item.price || !item.num || item.price === '0' || item.num === '0') {
      validInput.value[index].valid = false;
      valid = false;
    }
  }
  if (valid) {
    emits('update:modelValue', value.value)
  }
  return valid;
};
defineExpose<FormItemExpose>({
  validate,
});
</script>
<style scoped lang="less">
.group-list {
  flex-flow: column;
  background-color: #f3f7fa;

  :deep(.van-cell) {
    border-bottom: 1px solid #fafafa;
  }

  :deep(.van-cell__title) {
    width: 100%;
    margin-bottom: 10px;
    position: relative;

    .add-group {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }
  }

  :deep(.van-field__control--custom) {
    display: flex;
    flex-flow: column;
  }

  .card {
    width: 100%;
    margin: 0 auto;
    margin-bottom: 10px;
    background-color: white;

    .card-header {
      width: 100%;
      box-sizing: border-box;
      padding: 10px;

      .title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }

      .field-item {
        max-width: 50%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .card-body {
      width: 100%;
      box-sizing: border-box;
      padding: 5px 10px;
      padding-top: 15px;
      border-top: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;
      position: relative;

      .consumables-pic {
        position: absolute;
        right: 4vw;
        top: 10px;
        z-index: 1;
      }
    }

    .card-foot {
      text-align: center;
      padding: 15px 10px;
      color: var(--van-button-danger-background);
    }

    .field-item {
      color: #a7a7a7;
      margin-bottom: 10px;

      .label {
        margin-left: 8px;
        color: #333;
      }

      .value {
        margin-left: 10px;
      }

      :deep(.van-field) {
        padding: 0;
        border-bottom: 0;
      }

      :deep(.van-cell__title) {
        width: auto;
        margin-bottom: 0;
      }
    }
  }
}
</style>
