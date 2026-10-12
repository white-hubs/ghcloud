<template>
  <span>{{ attributeItem.attributeName }}：</span>
  <a-radio-group button-style="solid" v-model:value="value" @change="changeValue">
    <a-radio-button v-for="(item, index) in attributeItem.attributeKeyValueVos" :key="index" :value="item.value">
      {{ item.label }}
    </a-radio-button>
  </a-radio-group>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  watch,
} from "vue";
export default defineComponent({
  props: {
    curValue: {
      type: [Boolean, String, Number],
    },
    attributeItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
    deviceId: {
      type: [Number, String],
      default: null,
    },
  },

  setup(props) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      value: null,
      timer: null,
    });
    const changeValue = value => {
      if (state.value === value) {
        return;
      }
      clearTimeout(state.timer);
      setTimeout(() => {
        let params = {
          deviceId: props.deviceId,
          propWriteValues: [{
            originalValue: props.curValue,
            expectedValue: value,
            code: props.attributeItem.key
          }]
        };
        proxy.$api.setDevcieCenterDeviceValue(params).then(res => {
          proxy.$message.success("下发指令成功");
        });
      }, 1000);
    };
    watch(
      () => props.curValue,
      () => {
        state.value = props.curValue;
      },
    );
    return {
      ...toRefs(state),
      changeValue,
    };
  },
});
</script>

<style scoped>
:deep(.ant-radio-button-wrapper) {
  margin-left: 10px;
}
</style>
