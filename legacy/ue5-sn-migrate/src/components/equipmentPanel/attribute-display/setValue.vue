<template>
  <div class="attribute-value">
    <div class="container flex-between">
      <span>{{ `${curValue}${attributeItem.attributeUnitName}` }}</span>
      <a-slider
        v-model:value="curValue"
        @change="change"
        :max="attributeItem.valueMax ? Number(attributeItem.valueMax) : 100"
        :min="attributeItem.valueMin ? Number(attributeItem.valueMin) : 0"
      >
      </a-slider>
    </div>
  </div>
</template>
<script setup lang="ts">
import { attributeWriteValue } from "@/api/device";
import { message } from "ant-design-vue";
import { ref } from "vue";
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
  .container {
    width: 100%;
    height: 100%;
    align-items: center;
    span {
      color: #ffffff;
      font-size: 16px;
      margin-right: 10px;
    }
    .ant-slider {
      flex: 1;
      height: 6px;
      .ant-slider-rail {
        background: rgba(255, 255, 255, 0.1);
      }
      .ant-slider-track {
        background: #2989ff;
      }
      .ant-slider-handle {
        background-color: #2989ff;
        border-color: #ffffff;
      }
    }
  }
}
</style>
