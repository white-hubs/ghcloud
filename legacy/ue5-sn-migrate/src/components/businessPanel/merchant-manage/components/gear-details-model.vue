<template>
  <Modal @close="cellsClose" style="width: 300px;" :title="gearData.gearTitle" :show="show">
    <div class="gearDetails">
      <div class="gear-title">
        商户名称：{{ gearDetails.companyName }}
      </div>
      <div class="flex-between gear-item">
        <div>巡检异常数：{{ gearDetails.inspTotal }}</div>
        <div>诚信经营值：{{ gearDetails.honestyScore }} </div>
      </div>
      <div class="flex-between gear-item">
        <div>商品质量：{{ gearDetails.zScoreAvg }}</div>
        <div>诚实守信：{{ gearDetails.sScoreAvg }} </div>
      </div>
      <div class="flex-between gear-item">
        <div>服务态度：{{ gearDetails.tScoreAvg }}</div>
        <div>环境卫生：{{ gearDetails.wScoreAvg }} </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { stallScoreTotal } from '@/api/merchant'
import Modal from "../../../../components/modal-table/modal.vue";
import { ref, reactive,onMounted, watch} from 'vue'
const emit = defineEmits(["close","ok"]);
interface Props {
  id:string,
  code:string,
  show:boolean
}
const props = withDefaults(defineProps<Props>(),{
  id:'',
  code:'',
  show:false
})

const gearDetails = ref({
  companyName:'',
  inspTotal:'',
  honestyScore:'',
  zScoreAvg:'',
  tScoreAvg:'',
  wScoreAvg:'',
  sScoreAvg:'',
})
const gearData = reactive({
  gearTitle:'',
})
const cellsClose = ()=>{
  emit('close')
}
watch(
  () => props.id,
  () => {
    getGearDetails()
  }
);
watch(
  () => props.code,
  () => {
    getGearDetails()
  }
);
const getGearDetails = async()=>{
  let param = {
    stallId:props.id,
    bimId:props.code,
  }
  const res = await stallScoreTotal(param)
  gearData.gearTitle = res.records[0].name
  gearDetails.value = res.records[0]
}
onMounted(()=>{
  getGearDetails()
})

</script>
<style lang="less" scoped>
.gearDetails {
  width: 500px;
  color: #fff;

  .gear-title {
    font-size: 16px;
  }

  .gear-item {
    font-size: 16px;
  }
}
</style>