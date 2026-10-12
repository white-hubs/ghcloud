<template>
<span class="verticalLine primary-color-before">{{title}}</span>
</template>
<script>
export default {
  name:'gVerticalLine',
  props: {
    title: {
      type: String,
      default: "",
    },
  },
};
</script>
<style lang="less" scoped>
.verticalLine {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  &::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 18px;
    margin-right: 8px;
    vertical-align: middle;
    background-color: #1890FF;
  }
}
</style>