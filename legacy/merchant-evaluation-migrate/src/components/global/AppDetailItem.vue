<template lang="pug">
  div.app-detail-item
    span.label(:style="labelStyle")
      slot(name='label') {{label}}
      span :
    span.value
      slot
</template>
<script>
export default {
  props: {
    label: String,
    labelWidth: String,
    labelAlign: {
      type: String,
      default: 'left',
    },
  },
  computed: {
    labelStyle() {
      return {
        width: this.labelWidth || 'auto',
        textAlign: this.labelAlign,
      };
    },
  },
};
</script>
<style lang="less" scoped>
.app-detail-item {
  display: inline-flex;
  margin: 0.5rem 0;
  .label {
    display: inline-block;
    flex: none;
    color: rgba(0, 0, 0, 0.85);
  }
  .value {
    flex: auto;
    margin-left: 1rem;
  }
}
</style>
