<template>
  <VanField type="text" :required="props.required" :readonly="props.readonly" class="group-list" :error-message="errorMessage">
    <template #label>
      <span>{{ props.label }}</span>
      <van-button type="primary" size="mini" @click="add" class="add-group" v-if="!props.readonly">选择资产</van-button>
    </template>
    <template #input>
      <div class="card" v-for="(item,index) in value" v-if="value.length">
        <div class="card-header">
          <span class="title">{{ item.name || '--'}}</span>
          <div class="field-item" style="margin-bottom: 0;">
            <span class="label" style="margin-left: 0;">资产编码</span>
            <span class="value">{{ item.serialNumber || '--'}}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="field-item">
            <span class="label">资产类别</span>
            <span class="value">{{ item.typeName || '--'}}</span>
          </div>
          <div class="field-item">
            <span class="label">财务编码</span>
            <span class="value">{{ item.financeNumber || '--'}}</span>
          </div>
          <div class="field-item">
            <span class="label">购入日期</span>
            <span class="value">{{ item.purchaseDate || '--'}}</span>
          </div>
          <div class="field-item">
            <span class="label">管理员</span>
            <span class="value">{{ item.adminName || '--'}}</span>
          </div>
          <!--图片-->
          <template v-if="item.imgs&&item.imgs.length">
            <van-image
              width="25vw"
              height="25vw"
              fit="contain"
              class="consumables-pic"
              :src="item.imgs[0].path"
            />
          </template>
        </div>
				<div class="card-foot van-cell--clickable" @click.stop="del(item)" v-if="!props.readonly">移除</div>
      </div>
      <VanEmpty description="暂无数据" v-else />
    </template>
  </VanField>
  <ChooseAssetPop ref="ChooseAssetPopRef" @selected="selected" :receive-dep-id="receiveDepId"/>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import ChooseAssetPop from "./ChooseAssetPop.vue";
import { PropertyDetailedParam } from "../../../domain/property";
const props = withDefaults(
  defineProps<{
    modelValue?: any[] | null;
    placeholder?: string;
    readonly?: boolean;
    config?: any;
    label: string;
    required?: boolean;
    errorMessage?: string;
    dependFormValues:any[];
  }>(),
  {
    modelValue: null,
    readonly: false,
    dependFormValues:()=>[]
  }
);
const emits = defineEmits(["update:modelValue"]);
const value = ref(props.modelValue ?? []);
const receiveDepId=computed(()=>{
  if(props.dependFormValues&&props.dependFormValues.length>0&&props.dependFormValues[0]&&props.dependFormValues[0][0]){
	  return	props.dependFormValues[0][0].id??''
	}
  return ''
})

const del=(item:unknown)=>{
  ChooseAssetPopRef.value.removeItem(item);
}

// 弹层相关
const ChooseAssetPopRef = ref()
const add = () => {
  ChooseAssetPopRef.value.show(value.value)
};
const selected = (values: PropertyDetailedParam[]) => {
  value.value = JSON.parse(JSON.stringify(values))
}

const validInput = ref(true)
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请至少添加一组资产` : ''
})
const validate = () => {
  const valid = !!value.value.length
  validInput.value = valid
  if(valid){
    emits("update:modelValue", value.value);
  }
  return valid
}

defineExpose<FormItemExpose>({
	validate
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
      min-height: 30vw;
      .consumables-pic{
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
      .label{
        margin-left: 8px;
        color: #333;
      }
      .value {
        margin-left: 10px;
      }
      :deep(.van-field){
        padding: 0;
        border-bottom: 0;
      }
      :deep(.van-cell__title){
        width: auto;
        margin-bottom: 0;
      }
  }
  }
}
</style>
