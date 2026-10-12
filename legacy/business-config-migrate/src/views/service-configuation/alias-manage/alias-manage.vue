<template>
  <div class="channelCard" @click="toDetailPage('terminal')">访问端别名</div>
  <div class="channelCard" @click="toDetailPage('application')">应用别名</div>
  <div class="channelCard" @click="toDetailPage('route')">菜单别名</div>
</template>
<script setup lang="ts">
const toDetailPage = (type:string) => {
 const target = `/portal/legacy-business-config/alias-manage/${type}`
 history.pushState({ current: location.pathname + location.search }, "", target)
}
</script>

<style scoped lang="less">
.channelBox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .channelCard {
    cursor: pointer;
    width: 270px;
    height: 150px;
    margin: 0 50px 20px 0;
    background-color: rgb(242, 242, 242);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }
}
</style>