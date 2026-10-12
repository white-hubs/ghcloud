<template>
  <div class="sub-panel">
    <div class="sub-panel-content">
      <TallyCounter :data="metaInfo" @close="closeDevicePanel"></TallyCounter>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import { TallyCounter } from "./components/tally-counter/tally-counter";
import { cubeMeattradeService , cubeDeviceCenterService} from '@/api/service'

const emit = defineEmits(['close'])
interface Props {
  id:string
}
const props = withDefaults(defineProps<Props>(),{
})
const metaInfo = ref()
const getTallyData = async (): Promise<void> => {
  try {
    const [deviceRes, slideRes] = await Promise.all([
      cubeDeviceCenterService.getNorthDeviceDetail({ deviceId:props.id }),
      cubeMeattradeService.getArrangeLastInfo({ deviceId:props.id })
    ])
    metaInfo.value = { device: deviceRes, slide: slideRes }
    
  } catch (error) {
  }
}
const closeDevicePanel = ()=>{
  emit('close')
}
onMounted(()=>{
  getTallyData()
})
</script>

<style lang="less" scoped>
.sub-panel {
  transform: scale(0.8)
}
</style>
