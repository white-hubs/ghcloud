<template>
  <span>{{ attributeItem.attributeName }}：</span>
  <RadioGroup button-style="solid" v-model:value="value" @change="changeValue">
    <RadioButton v-for="(item, index) in attributeItem.attributeKeyValueVos" :key="index" :value="item.value">
      {{ item.label }}
    </RadioButton>
  </RadioGroup>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  watch,
} from "vue";
import { cubeDeviceCenterService } from '@/api/service'
import { RadioButton, RadioGroup } from "ant-design-vue";
import {message} from 'ant-design-vue'

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
      value: props.curValue??null,
      timer: null,
    });
    const changeValue = value => {
      if (state.value === value) {
        return;
      }
      clearTimeout(state.timer);
      setTimeout(() => {
        const params = {
          deviceId: props.deviceId,
          propWriteValues: [
            {
              code: props.attributeItem.attributeCode,
              expectedValue: state.value
            }
          ]
        }
        cubeDeviceCenterService.controlWithPermission(params).then(res => {
          message.success("下发指令成功");
        });
      }, 0);
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
  margin-bottom: 5px;
}
</style>
