<template>
  <div class="hidden-danger flex-between">
    <div :style="{ 'background-image': 'url(' + getAssetsImage(item.bgImg) + ')' }" class="hidden-danger-box"
      v-for="item in props.hiddenData" :key="item.bgImg" @click="openmodal(item)">
      <div class="hidden-danger-name">{{ item.label }}</div>
      <div class="hidden-danger-value" :style="{color:item.color}">
        <count-to  style="margin-left:10px;margin-top:5px" :startVal="0" :endVal="item.value"  :duration="2000" separator=""></count-to>
 
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue"

interface Props {
  hiddenData:{
    label:string;
    value:number;
    color:string;
    bgImg:string;
}[]
  } 
const props = withDefaults(defineProps<Props>(), {
});
const emit = defineEmits(["openmodal"]);
const openmodal=(item)=>{

emit('openmodal',item)

}
</script>
<style lang="less" scoped>

.hidden-danger {
  .hidden-danger-box {
    cursor: pointer;
    padding: 5px;
   
    box-sizing: border-box;
    width:30%;
    background-position: 0px 3px;
    background-repeat: no-repeat;
    background-size: 100%;
    height: 60px;

    .hidden-danger-name {
      font-size: 12px;
    color: #d9e7ff;
     margin-left:10px;
     margin-top:5px;
    }

    .hidden-danger-value {
      font-family: "PangMenZhengDao";
      font-size: 20px;
      color: #FFFFFF;
    }
  }
}
.gh-count-to{

font-family: PangMenZhengDao;
}
</style>