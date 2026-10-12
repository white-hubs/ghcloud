<template>
  <div class="content" v-if="dataList" :class="type === 'card' ? 'box-card' : 'box-normal'">
    <div class="box"
      v-for="(item, index) in dataList" :key="index" @click="openmodal(item)">
      <div v-if="item.iconImg" class="icon-bg">
        <img class="icon" :src="getSnImage(item.iconImg)" alt="">
      </div>
      <div class='info'>
        <div class="name">{{ item.label }}</div>
        <div class="value" :style="{color:item.color}">
          <count-to class="number" :startVal="0" :endVal="item.value ? Number(item.value) : 0"  :duration="2000" separator=""></count-to>
          <span v-if="item.unit" :class="item.unit === '%' ? 'person' : 'unit' " :style="{color: item.unit === '%' ? item.color : '#fff' }">{{item.unit}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted,watch} from 'vue'
import { getSnImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue"

interface Props {
  type: 'card' | 'normal',
  listData:{
      iconImg?:string;
      label:string;
      value:number;
      color:string;
      unit?:string;
  }[]
} 
const props = withDefaults(defineProps<Props>(), {
  type: 'normal'
});
const dataList = ref([])
watch(() => props.listData,() => {
  dataList.value = props.listData
},{deep: true, immediate:true});
const emit = defineEmits(["openmodal"]);
const openmodal=(item)=>{
  emit('openmodal',item)
}
</script>
<style lang="less" scoped>
.content {

  .box {
    cursor: pointer;
    box-sizing: border-box;
    padding:0 10px;
    background-position: 0px 3px;
    background-repeat: no-repeat;
    .name {
      font-size: 12px;
      color: #d9e7ff;
      margin-left:10px;
      margin-top:5px;
    }
    .value {
      font-family: "PangMenZhengDao";
      font-size: 20px;
      color: #FFFFFF;
    }
  }
}
.gh-count-to{
  font-family: PangMenZhengDao;
}
.box-card {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  grid-gap: 10px;
  .box{
    text-align: center;
    padding: 26px 16px 32px;
    gap: 14px;
    background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/stat_bg.png") no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .icon-bg{
      width: 75px;
      height: 75px;
    }
    .icon{
      display: inline-block;
      width: 65px;
      height: 75px;
    }
    .name{
      font-size: 16px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      text-align: center;
      color: #93aadb;
      line-height: 16px;
      margin: 0;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .number{
      font-size: 36px;
      font-weight: bolder;
    }
    .unit {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.50);
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      text-align: left;
    }
  }

}
.box-normal{
  display: flex;
  justify-content:space-between;
  width: 100%;
  .box{
    display: flex;
    align-items: center;
    margin-right: 5px;
    .icon{
      height: fit-content;
      display: inline-block;
      margin-right: 14px;
    }
    .name{
      margin-left: 0;
      text-wrap: nowrap;
    }
  }

}
.person{
  font-size: 20px !important;
}
.unit{
  font-size: 12px !important;
  font-family: Source Han Sans CN-Regular, Source Han Sans CN;
  display: inline-block;
  margin-left: 2px;
}
</style>  