<template lang="pug">
a-tree-select(
  :treeData='data',
  :value='value',
  :multiple='multiple',
  :maxTagCount='maxTagCount',
  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" 
  :getPopupContainer=(target) => target.parentNode
  :treeDefaultExpandAll="treeDefaultExpandAll"
  v-on='$listeners',
  v-bind='$attrs'
)
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
    api: String,
    params: Object,
    options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    parentProp: { default: 'pid', type: String },
    prop: { default: 'id', type: String },
    rootId: { default: null, type: String },
    maxTagCount: Number,
    multiple: {
      type: Boolean,
      default: false,
    },
    dataFormatter: Function,
    treeDefaultExpandAll: {
      type: Boolean,
      default: true,
    },
    childrenProp: {
      type: String,
      default: "children"
    }
  },
  data() {
    return {
      data: [],
    };
  },
  watch: {
    code: 'loadData',
    params: 'loadData',
  },
  created() {
    if (!this.options?.length) {
      this.loadData();
    } else {
      let data = this.options;
      if (this.dataFormatter) {
        data = this.dataFormatter(data);
      }
      const flatData = flattenTree(data, this.childrenProp).map((item) => {
        return {
          ...item,
          title: item[this.field.label],
          value: item[this.field.name],
          pid: item.pid || null,
        };
      });
      this.data = treezen(flatData, this.parentProp, this.prop, this.rootId);
    }
  },
  methods: {
    async loadData() {
      let data = await this.$restful(this.api, this.params);
      if (this.dataFormatter) {
        data = this.dataFormatter(data);
      }
      const flatData = flattenTree(data, this.childrenProp).map((item) => {
        return {
          ...item,
          title: item[this.field.label],
          value: item[this.field.name],
          pid: item.pid || null,
        };
      });
      this.data = treezen(flatData, this.parentProp, this.prop, this.rootId);
    },
    reload() {
      this.loadData();
    },
  },
};
</script>
