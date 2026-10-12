<template>
  <div class="row flex-start">
    <span>{{attributeItem.attributeName}}：</span>
    <div class="flex-start">
      <div>
        <a-input v-model:value="value" style="margin-left: 16px; width: 80px" />
      </div>
      <div class="btn" @click="handleSave">确定</div>
    </div>
  </div>

</template>

<script>
import { defineComponent, getCurrentInstance, reactive, toRefs, watch } from "vue";
export default defineComponent({
  props: {
    curValue: {
      type: [Boolean, String, Number],
    },
    attributeItem: {
      type: Object,
      default: () => {
        return {}
      }
    },
    deviceId: {
      type: [Number, String],
      default: null
    }
  },

  setup(props) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      value: 0,
    })
    const handleSave = (value) => {
      let params = {
        deviceId: props.deviceId,
        propWriteValues: [{
          originalValue: props.curValue,
          expectedValue: state.value,
          code: props.attributeItem.key
        }]
      }
      proxy.$api.setDevcieCenterDeviceValue(params).then(res => {
        proxy.$message.success("下发指令成功")
      })
    }
    watch(() => props.curValue, () => {
      state.value = props.curValue;
    })
    return {
      ...toRefs(state),
      changeValue
    }
  }
})
</script>

<style scoped lang="less">
.flex-start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

:deep(.ant-radio-button-wrapper) {
  margin-left: 10px;
}

.btn {
  width: 46px;
  height: 24px;
  background: #205798;
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  text-align: center;
  line-height: 24px;
  cursor: pointer;
  margin-left: 12px;
  color: white;
  font-size: 12px;
  font-family: PingFang SC-Regular;
  font-weight: 400;
  color: #ffffff;
}
</style>