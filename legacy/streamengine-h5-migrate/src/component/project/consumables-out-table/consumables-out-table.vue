<template>
  <VanField type="text" :required="props.required" :readonly="props.readonly" class="group-list" :error-message="errorMessage">
    <template #label>
      <span>
        <span>{{ props.label }}</span>
        <span style="margin-left: 10px">总量：{{ totalNum }} 总金额：{{ totalAmount }}</span>
      </span>
      <van-button type="primary" size="mini" @click="add" class="add-group" v-if="!props.readonly">选择耗材</van-button>
    </template>
    <template #input>
      <div class="card" v-for="(item, index) in value" :key="item.id" v-if="value.length">
        <div class="card-header">
          <span class="title">{{ item.name || "--" }}</span>
          <div class="field-item" style="margin-bottom: 0">
            <span class="label" style="margin-left: 0">耗材编码</span>
            <span class="value">{{ item.code || "--" }}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="field-item">
            <span class="label">单价</span>
            <span class="value">{{ translateAmount(item.avgPrice) }}</span>
          </div>
          <div class="field-item">
            <span class="label">单位</span>
            <span class="value">{{ item.unit || "--" }}</span>
          </div>
          <div class="field-item">
            <span class="label">品牌</span>
            <span class="value">{{ item.brand || "--" }}</span>
          </div>
          <div class="field-item">
            <span class="label">库存</span>
            <span class="value">{{ item.storeNum ?? "--" }}</span>
          </div>
          <div class="field-item">
            <span class="label">限领数量</span>
            <span class="value">{{ item.useLimit || "--" }}</span>
          </div>
          <!--图片-->
          <template v-if="item.file && item.file.length">
            <van-image width="25vw" height="25vw" fit="contain" class="consumables-pic" :src="item.file[0].path" />
          </template>
          <div class="field-item" v-if="!props.readonly">
            <van-field
              v-model="item.num"
              placeholder="请输入数量"
              type="digit"
              required
              label="出库数量"
              :error-message="validInput[index]?.valid === false ? getRowError(item) : ''"
            />
          </div>
          <div class="field-item" v-else>
            <span class="label">出库数量</span>
            <span class="value">{{ item.num }}</span>
          </div>
        </div>
        <div class="card-foot van-cell--clickable" @click.stop="del(item)" v-if="!props.readonly">删除</div>
      </div>
      <VanEmpty description="暂无数据" v-else />
    </template>
  </VanField>
  <ChooseConsumablesPop ref="ChooseAssetPopRef" @selected="selected" :store-id="props.dependFormValues[0]?.id" />
</template>
<script setup lang="ts">
import { showNotify } from "vant";
import { ref } from "vue";
import { computed } from "vue";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { PropertyDetailedParam } from "../../../domain/property";
import { translateAmount } from "../../../infrastructure/amount-util";
import ChooseConsumablesPop from "./ChooseConsumablesPop.vue";

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
  },
);
const emits = defineEmits(["update:modelValue"]);
const value = ref<any[]>(Array.isArray(props.modelValue) ? props.modelValue : []);

const totalAmount = computed(() => {
  let res = 0;
  value.value.forEach((e) => {
    res += (e.avgPrice ?? 0) * (e.num ?? 0);
  });
  return res.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});
const totalNum = computed(() => {
  let res = 0;
  value.value.forEach((e) => {
    res += e.num ? parseInt(e.num) : 0;
  });
  return res;
});

// 弹层相关
const ChooseAssetPopRef = ref();
const add = () => {
  if (props.dependFormValues?.length && !props.dependFormValues[0]) {
    showNotify("请先选择仓库");
    return;
  }
  ChooseAssetPopRef.value.show(value.value);
};
const selected = (values: PropertyDetailedParam & { flowConvertData: boolean }[]) => {
  value.value = JSON.parse(JSON.stringify(values));
  value.value = value.value.map((e) => {
    e.flowConvertData = false;
    return e;
  });
  errorMessage.value = "";
  validInput.value = [];
  emits("update:modelValue", value.value);
};

const del = (item: PropertyDetailedParam) => {
  value.value = value.value.filter((row) => row.id !== item.id);
  validInput.value = [];
  emits("update:modelValue", value.value);
};

const validInput = ref<{ valid: boolean; index: number }[]>([]);
const getRowError = (item: Record<string, any>): string => {
  const num = Number(item.num);
  if (!Number.isSafeInteger(num) || num < 1) return "出库数量必须为大于0的整数";
  // 库存与限领分别校验，0 库存有效，0 限领表示不限制。
  if (item.storeNum != null && item.storeNum !== "" && num > Number(item.storeNum)) {
    return `出库数量不能大于库存数量（${item.storeNum}）`;
  }
  if (Number(item.useLimit) > 0 && num > Number(item.useLimit)) {
    return `出库数量不能大于限领数量（${item.useLimit}）`;
  }
  return "";
};
const errorMessage = ref("");

const validate = () => {
  errorMessage.value = "";
  if (props.readonly) return true;
  if (value.value.length == 0) {
    if (props.required) {
      errorMessage.value = "请选择耗材";
      return "请选择耗材";
    }
    emits("update:modelValue", value.value);
    return true;
  }
  validInput.value = value.value.map((e, i) => {
    return { valid: true, index: i };
  });
  let firstError = "";
  for (let index = 0; index < value.value.length; index++) {
    const item = value.value[index];
    const error = getRowError(item);
    if (error) {
      validInput.value[index].valid = false;
      if (!firstError) firstError = `第${index + 1}行${error}`;
    }
  }
  if (firstError) {
    errorMessage.value = firstError;
    return firstError;
  }
  emits("update:modelValue", value.value);
  return true;
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
