<template>
  <div class="attribute-value">
    <a-radio-group
      v-model:value="curValue"
      @change="change"
      :disabled="attributeItem.permission === 'READ_WRITE' ? false : true"
    >
      <a-radio-button
        v-for="item in attributeItem.attributeKeyValueVos"
        :value="item.value"
        >{{ item.keyName }}</a-radio-button
      >
    </a-radio-group>
  </div>
</template>
<script setup lang="ts">
import { attributeWriteValue } from "@/api/device";
import { message } from "ant-design-vue";
import { ref, watch } from "vue";
import { AttributeNode } from "./type";
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
watch(
  () => props.initValue,
  (newValue) => {
    curValue.value = newValue;
  }
);
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
</script>
<style lang="less">
.attribute-value {
  .ant-radio-group {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .ant-radio-button-wrapper {
    background: transparent;
    color: #ffffff;
    border: none;
    height: 22px;
    line-height: 22px;
  }
  .ant-radio-button-wrapper-checked {
    border: none;
  }
  .ant-radio-button-wrapper:not(:first-child)::before {
    width: 0;
  }

  .ant-radio-button-checked {
    background: #2989ff;
    border: none;
  }
}
</style>
