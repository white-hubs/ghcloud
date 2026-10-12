<template lang="pug">
a-tree-select(
  :tree-data="data"
  :tree-expanded-keys.sync="expandedKeys"
  :value="value"
  v-bind="$attrs"
  v-on="$listeners"
)
</template>
<script>
import { flattenTree, treezen } from '@/utils/common';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
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
      expandedKeys: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const data = await this.$restful(`/sys/depts/all-graph`, {
        projectId: this.project.id,
      });
      const flattenData = flattenTree(data, 'depts').map((item) => {
        return {
          ...item,
          pid: item.pid || null,
          title: item.name,
          value: item.id,
          key: item.id,
        };
      });
      this._flattenData = flattenData;
      this.data = treezen(flattenData, 'pid');
      this.expandedDefault();
    },
    expandedDefault() {
      if (!this.expandedKeys.length) {
        this.expandedKeys = this.data.map((a) => a.id);
      }
    },
  },
};
</script>
