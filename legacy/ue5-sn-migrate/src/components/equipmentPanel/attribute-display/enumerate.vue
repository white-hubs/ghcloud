<template>
  <div class="attribute-value">
    <a-select
      v-model:value="curValue"
      :disabled="attributeItem.permission === 'READ_WRITE' ? false : true"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      @change="change"
    >
      <a-select-option
        v-for="item in attributeItem.attributeKeyValueVos"
        :value="item.value"
        >{{ item.keyName }}</a-select-option
      >
    </a-select>
  </div>
</template>
<script setup lang="ts">
import { AttributeNode } from "./type";
import { attributeWriteValue } from "@/api/device";
import { message } from "ant-design-vue";
import { ref, watch } from "vue";
interface Props {
  deviceId: string;
  initValue: any;
  attributeItem: AttributeNode;
}
const props = withDefaults(defineProps<Props>(), {
  deviceId: "",
  initValue: null,
  attributeItem: () => null,
});
const curValue = ref(props.initValue);
const change = async (value: string) => {
  let params = {
    deviceInstanceId: props.deviceId,
    keyValues: [
      {
        attributeCode: props.attributeItem.attributeCode,
        originalValue: {
          name: props.attributeItem.attributeName,
          value: props.initValue,
        },
        expectedValue: {
          name: props.attributeItem.attributeName,
          value: value,
        },
      },
    ],
  };
  const res = await attributeWriteValue(params);
  message.success("指令下发成功！");
};
watch(
  () => props.initValue,
  (newValue) => {
    curValue.value = newValue;
  }
);
</script>
<style lang="less">
.attribute-value {
  height: 100%;
  font-size: 12px;
  .ant-select {
    width: 100%;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    color: #ffffff;
    .ant-select-selector {
      background-color: transparent;
      border: none;
    }
    .ant-select-arrow {
      color: #ffffff;
    }
  }
}
.ant-select-dropdown,
.ant-select-item {
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
}
.ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background: rgba(86, 142, 255, 0.2);
  color: #d0deee;
}
.ant-select-dropdown .ant-select-item-option-active {
  background: rgba(86, 142, 255, 0.2);
  color: #d0deee;
}
</style>
