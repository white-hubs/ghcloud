<template lang="pug">
div.inline-block
  a-input-search.input(placeholder="快捷查询" v-model="keyword" allow-clear @change="changeHandler" @search="searchHandler" v-bind="$attrs")
  a-button.ml1(type="primary" @click="searchHandler" v-if="showButton") 查询
</template>
<script>
export default {
  props: {
    showButton: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      keyword: null,
    };
  },
  watch: {
    keyword(nv, ov) {
      if (ov !== nv && !nv) {
        this.$emit('search', null);
      }
    },
  },
  methods: {
    changeHandler(e) {
      // 表示点击清除按钮
      if (e.type !== 'input' && !e.currentTarget.value) {
        this.$emit('search', null);
      }
    },
    searchHandler() {
      this.$emit('search', this.keyword);
    },
  },
};
</script>
<style lang="less" scoped>
.input {
  width: 250px;
  vertical-align: top;
}
</style>
