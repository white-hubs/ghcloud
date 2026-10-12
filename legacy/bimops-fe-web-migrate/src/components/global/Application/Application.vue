<template>
  <div class="application">
    <div class="title">
      <div class="app-ctr">
        <div class="group" v-for="(item, index) in applications" :key="index">
          <div v-if="item.applicationPageVOS.length">
            <div class="groupName">{{ item.name }}</div>
            <AppStyle :appList="item.applicationPageVOS" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import AppStyle from '../AppStyle/AppStyle.vue'

const props = defineProps({
  applications: {
    type: Array,
    default: "",
  },
});
</script>
<style lang="less" scoped>
.application {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: @white;
  box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.04);

  .modelTitle {
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: #535b6c;
    text-align: left;
    font-family: @fontMedium;
    position: absolute;
    padding: 0 20px;
    background-color: @white;
    left: 0;
    font-size: 16px;
    z-index: 2;
  }

  .occupy {
    width: 100%;
    height: 60px;
  }

  .title {
    height: calc(100% - 60px);

    :deep(.ant-empty) {
      height: 100%;
      flex-direction: column;
      display: flex;
      justify-content: center;
      color: #000;
    }
  }

  .app-ctr {
    padding-top: 20px;
  }

  .groupName {
    text-align-last: left;
    color: #535b6c;
    font-family: "SourceHanSansCN-Medium-2";
    font-size: 14px;
    margin-bottom: 10px;
  }
}
</style>
