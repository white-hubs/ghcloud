<template lang="pug">
  a-popover(title="高级搜索" v-bind="$attrs" trigger="click")
    slot
    div.wrapper.show-scroll(slot="content" @keydown.enter="okHandler")
      div.body
        filter-group(:name="name" :data="data" professional ref="filterGroup")
      div.footer.overflow-hidden
        div.right 
          a-button(@click="resetHandler") 重置
          a-button.ml2(type="primary" @click="okHandler") 查询
</template>
<script>
import FilterGroup from './FilterGroup';

export default {
  components: { FilterGroup },
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      data: [],
    };
  },
  methods: {
    getFilter() {
      return this.$refs.filterGroup.getFilter();
    },
    async okHandler() {
      this.$emit('on-filter', await this.getFilter());
    },
    resetHandler() {
      this.data = [];
      this.$emit('on-filter', null);
    },
  },
};
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  width: 700px;
  min-height: 200px;
  max-height: 50vh;
  .body {
    flex: auto;
    overflow: auto;
  }
  .footer {
    flex: none;
    margin-top: 1rem;
  }
}
</style>
