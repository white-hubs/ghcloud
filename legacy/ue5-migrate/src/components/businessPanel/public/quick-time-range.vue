<template>
  <div class="main">
    <div>{{ props.btn1 }}</div>
    <div>近七天</div>
    <div>近30天</div>
    <div>近1年</div>
  </div>
</template>
<script lang="ts" setup>
const props = withDefaults(defineProps<{
  btn1?: string;
}>(), {
  btn1: '今天'
})
</script>

<style lang="less" scoped>
.main {
  font-size: 14px;
  width: 100%;
  color: #fff;
  display: flex;
  justify-content: end;
  flex-grow: 0;
  flex-shrink: 0;
  div {
    padding: 0 8px;
  }
  div:hover {
    background-color: rgba(11, 21, 33, 0.05);
    cursor: pointer;
  }
}
</style>