<template lang="pug">
a-tree-select(
  :treeData="data" 
  :value="value" 
  v-on="$listeners" 
  v-bind="$attrs")
</template>
<script>
import { flattenTree, treezen } from '@/utils/common';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Array],
  },
  data() {
    return {
      data: [],
    };
  },
  watch: {
    code: 'loadData',
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const data = await this.$restful(`/sys/resources/all-graph`);
      const flatData = flattenTree(data).map((item) => {
        return {
          ...item,
          title: item.name,
          value: item.id,
          pid: item.pid || null,
        };
      });
      this.data = treezen(flatData, 'pid');
    },
    reload() {
      this.loadData();
    },
  },
};
</script>
