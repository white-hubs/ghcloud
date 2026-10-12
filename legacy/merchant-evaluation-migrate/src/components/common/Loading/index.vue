<template lang="pug">
  div.page-loading
    a-spin(size="large")
</template>

<script>
export default {};
</script>

<style scoped>
.page-loading {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  /* background: chartreuse; */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
</style>
