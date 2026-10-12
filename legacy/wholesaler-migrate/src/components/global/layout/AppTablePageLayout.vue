<template lang="pug">
  div.app-table-page-layout
    div.toolbar.flex.px3.pt2
      div.toolbar-left.flex-auto
        slot(name="toolbar-left")
      div.toolbar-right.flex-none
        slot(name="toolbar-right")
    div.table-container.mt2.mx3
      slot
</template>
<script>
export default {};
</script>
<style lang="less" scoped>
.app-table-page-layout {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .table-container {
    overflow: hidden;
    flex: 1;
    >div{
      height: 100%;
    }
  }
}
</style>
