<template>
  <span class="verticalLine primary-color-before">{{ title }}</span>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "gVerticalLine",
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  setup() {},
});
</script>
<style lang="less" scoped>
.verticalLine {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  font-family: PingFang SC-Medium;
  &::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 18px;
    margin-right: 8px;
    vertical-align: middle;
  }
}
</style>
