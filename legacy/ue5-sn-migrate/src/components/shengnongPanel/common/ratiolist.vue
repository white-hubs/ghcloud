<template>
  <div class="content" v-if="dataList" :class="type === 'card' ? 'box-card' : 'box-normal'">
    <div class="box"
      v-for="(item, index) in dataList" :key="index" @click="openmodal(item)">
      <img v-if="item.iconImg" class="icon" :src="getSnImage(item.iconImg)" alt="">
      <div class='info'>
        <div class="name">{{ item.label }}</div>
        <div class="value" :style="{color:item.color}">
          <count-to :startVal="0" :endVal="item.value ? Number(item.value) : 0"  :duration="2000" separator=""></count-to>
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
    // width: 40%;
    background-position: 0px 3px;
    background-repeat: no-repeat;
    // background-size: 10%;
    // height: 60px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  .box{
    text-align: center;
    padding: 10px 0 20px 0;
    background-color: linear-gradient(0deg, rgba(77,115,197,0.06) 12%, rgba(82,120,203,0.014) 100%);
    border: 1px solid rgba(157, 174, 211, 0.08);
    margin-right: 10px;
    padding-right: 5px;
    background: rgba(0,0,0,0.15);
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