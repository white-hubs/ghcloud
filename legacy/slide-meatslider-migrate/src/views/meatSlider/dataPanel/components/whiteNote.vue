<template lang="pug">
.whiteNote
    .whiteNote-title
        gVerticalLine(title="肉类交易量")
    .whiteNote-content
        .whiteNote-content-left
           .whiteNote-item
           .whiteNote-item
           .whiteNote-item
           .whiteNote-item
        .whiteNote-content-right    
</template>
<script  lang="jsx">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
});
</script>
<style lang="less" scoped>
.whiteNote {
  margin-top: 16px;
  height: 404px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .whiteNote-title {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    border-bottom: 1px solid #f3f3f3;
  }
  .whiteNote-content {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    > div {
      flex: 1;
      height: 100%;
      &.whiteNote-content-left {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: 40px 0;
        .whiteNote-item {
          width: calc(50% - 8px);
          height: 114px;
          margin-bottom: 18px;
          background: #fafafa;
        }
      }
    }
  }
}
</style>
