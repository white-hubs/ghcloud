<template>
  <div class="roaming-point">
    <div class="button_style" @click="suspend">
      <caret-right-outlined v-show="!suspendFlag" />
      <pause-outlined v-show="suspendFlag" />
      {{suspendFlag?"暂停":'继续'}}
    </div>
    <div class="button_style" @click="stopRoamInspect">
      <poweroff-outlined />
      退出
    </div>
    <a-radio-group class="radioList" @change="goPoint" v-model:value="pointSelect" size="small">
      <a-radio-button :title="item.name" :style="radioStyle" :value="item.pointName" v-for="item in props.point">{{item.pointName}}</a-radio-button>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch} from 'vue'
import { CaretRightOutlined , PauseOutlined , PoweroffOutlined} from '@ant-design/icons-vue';
const emits = defineEmits(['stopRoamInspect','pauseRoamInspect','changeRoamInspect'])
const props = withDefaults(defineProps<{
  point: {
    area: string
    id: string
    name:string
    perspective:string
    pointName:string
    sort:number
    speed:number
  }[]
}>(), {})
const pointSelect = ref(props.point[0].name)
const suspendFlag = ref(true)
const radioStyle = reactive({
      display: 'flex',
      height: '30px',
      lineHeight: '30px',
});

const goPoint = ()=>{
  const index = props.point.findIndex(e=>e.pointName===pointSelect.value)
  if(index!==-1){
    emits('changeRoamInspect',props.point,index)
  }
}
const suspend = ()=>{
  suspendFlag.value = !suspendFlag.value
  emits('pauseRoamInspect')
}
const stopRoamInspect = ()=>{
  emits('stopRoamInspect')
}

</script>
<style lang="less" scoped>
.roaming-point {
  display: flex;
  flex-direction: column;

  .roaming-point-close {
    margin-bottom: 10px;
  }
}

:deep(.ant-radio-button-wrapper) {
  border-radius: 13px;
  margin-bottom: 5px;
  border: 1px solid transparent;
  height: 30px !important;
  line-height: 30px !important;
  background: rgba(6, 6, 6, 0.7);
  color: #fff;
  text-align: center;

}

:deep(.ant-radio-button-wrapper span):nth-child(2) {
  display: inline-block !important;
  width: 55px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-radio-button-wrapper)::before {
  display: none;
}

:deep(.ant-radio-button-wrapper-checked) {
  color: #fff;
  border-color: transparent !important;
  background-color: #1890ff;
}

:deep(.ant-radio-button-input) {
  display: none;
}

.button_style {
  width: auto;
  background: rgba(6, 6, 6, 0.7);
  color: #FFFFFF;
  font-size: 12px;
  border-radius: 13px;
  text-align: center;
  height: 30px !important;
  line-height: 30px !important;
  cursor: pointer;
  margin-top: 5px;
}

.radioList {
  margin-top: 20px;
  height: 500px;
  overflow-y: auto;
}
</style>