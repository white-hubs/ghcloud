<template>
  <div class="contanier">
    <img :src="props.img" class="aniamtion-pulse"/>
  </div>
</template>
<script setup lang="ts">
const props=defineProps<{
  img:string
}>()
</script>
<style lang="less" scoped>
.contanier{
  background: url("/resource/v1/ue5-sn-migrate/assets/images/business-icon/triage-queue/5.png");
  background-size: 100%100%;
  width: 66px;
  height: 46px;
  position: relative;
  margin-right: 9px;
  img{
    position: absolute;
    width: 24px;
    height: 24px;
    left: 21px;
  }
}
</style>