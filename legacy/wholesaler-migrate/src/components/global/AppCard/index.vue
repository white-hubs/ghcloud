<template lang="pug">
  div.app-card
    div.card-header 
      div.header-left
        div.card-title {{ title }}
        div.card-description {{ description }}
      div.header-right
        slot(name="header-right")
    div.card-body
      slot
    div.card-footer
      slot(name="footer")
</template>

<script>
export default {
  props: {
    title: String,
    description: String,
  },
};
</script>

<style lang="less" scoped>
@import '~@/styles/variables';
.app-card {
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  .card-header {
    color: #333;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .header-left {
      display: flex;
      align-items: center;
    }
    .card-title {
      font-size: 16px;
      border-left: 4px solid @primary-color;
      padding-left: 12px;
    }
    .card-description {
      font-size: 14px;
      color: #999;
    }
  }
  .card-body {
    flex: 1;
    overflow: auto;
  }
  .card-footer {
  }
}
</style>
