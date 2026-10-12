<template>
  <div class="assessment-indicators">
    <img :src="getAssetsImage('radio-icon.png')" alt="">
    <div class="amount-stat">
      <div class="title">{{overPanelData?.title}}</div>
      <div class="value">{{ overPanelData?.total }}</div>
      <div class="radio-box">
        <span>同比</span>
        <img :src="getAssetsImage('overView9.png')" alt="" srcset="">
        <span class="radio-value">{{ overPanelData?.rate }}%</span>
      </div>
    </div>
    <div class="line"></div>
    <div class="item" v-for="item in overPanelData?.valueData">
      <div class="label">{{ item.label }}</div>
      <div class="value">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { reactive, toRefs, onMounted } from 'vue';
import { getAssetsImage } from '@/utils/getImage';

interface data {
    title: string;
    rate:number;
    total: number;
    valueData:{
        label: string;
        value: number;
    }[]

}
interface Props {
    overPanelData: data
}
const props = withDefaults(defineProps<Props>(), {
});
/**
* 数据部分
*/
const state = reactive({})
onMounted(() => {
})
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>
<style scoped lang='less'>
.assessment-indicators {
  margin-top: 12px;
  background-image: url('/resource/v1/ue5-migrate/assets/images/model-bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  align-items: center;

  img {
    width: 76px;
    height: 76px;
  }


}

.amount-stat {
  padding-right: 6px;

  .title {
    font-size: 12px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: center;
    color: #cad9ee;
  }

  .value {
    font-size: 18px;
    font-family: Roboto, Roboto-Regular;
    font-weight: Regular;
    text-align: center;
    color: #ffffff;
  }

  .radio-box {
    font-size: 11px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 1px;
    color: #cad9ee;

    img {
      width: 8.5px;
      height: 8.5px;
      transform: rotate(90deg);

    }

    .radio-value {
      color: #2ae8bd;
    }
  }
}

.line {
  width: 1px;
  height: 20px;
  background: #cad9ee;
  background: rgba(41, 137, 255, 0.50);
}

.item {
  margin-left: 10px;

  .label {
    font-size: 12px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: left;
    color: #cad9ee;
  }

  .value {
    margin-top: 6px;
    font-size: 18px;
    font-family: Roboto, Roboto-Regular;
    font-weight: Regular;
    text-align: left;
    color: #ffffff;
  }
}
</style>