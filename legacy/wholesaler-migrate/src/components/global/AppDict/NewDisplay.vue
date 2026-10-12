<template lang="pug">
  span
    slot(v-bind:model="model")
      span {{model && model.name}}
  </template>
<script>
export default {
  props: {
    value: [String, Number],
    itemCode: {
      type: String,
      default: () => "project-merchant-evaluate_level"
    }
  },
  data() {
    return {
      dictOptions: []
    }
  },
  computed: {
    model() {
      return this.dictOptions.find(item => item.code === this.value);
    },
  },
  created() {
    this.getCategorys()
  },
  methods: {
    async getCategorys() {
      this.dictOptions = await this.$restful(`GET:/dictionary/getDataDictionaryByItem?itemCode=${this.itemCode}&name=&code=`, {})
    },
  }
};
</script>
  
<style lang="less" scoped></style>
  