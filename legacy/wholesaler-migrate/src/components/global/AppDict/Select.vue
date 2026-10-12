<template lang="pug">
a-tree-select(
  :treeData='data',
  :value='value',
  treeDefaultExpandAll,
  v-on='$listeners',
  v-bind='$attrs',
  :allowClear='allowClear'
  :multiple="multiple"
)
</template>
<script>
import { GETTER_DICT_TREE_MAP } from '@store/dict';
import { mapGetters } from 'vuex';
import { flattenTree, treezen } from '@/utils/common';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    code: String, // typeCode
    value: [String, Array],
    multiple: {
      defate: false,
      type: Boolean,
    },
    allowClear: {
      defate: false,
      type: Boolean,
    },
  },
  data() {
    return {
      data: [],
    };
  },
  computed: {
    // vuex方法
    ...mapGetters({
      dicts: GETTER_DICT_TREE_MAP,
    }),
  },
  watch: {
    code: 'loadData',
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const data = this.dicts[this.code.trim()];
      // src/utils/common.js的方法
      // export function flattenTree(data, childrenProp = 'children') {
      //   const flatData = [];
      //   data.forEach((item) => {
      //     flatData.push(item);
      //     if (item[childrenProp]) {
      //       flatData.push(...flattenTree(item[childrenProp], childrenProp));
      //     }
      //   });
      //   return flatData;
      // }
      const flatData = flattenTree(data).map((item) => {
        return {
          ...item,
          title: item.name,
          value: item.code,
          parentCode: item.parentCode || null,
        };
      });
      this.data = treezen(flatData, 'parentCode', 'code');
    },
    reload() {
      this.loadData();
    },
  },
};
</script>
