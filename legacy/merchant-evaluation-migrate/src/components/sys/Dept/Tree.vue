<template lang="pug">
div.dept-tree
  div.dept-tree-header
    a-input-search(placeholder="输入查询..." v-model="keyword" allowClear)
  div.dept-tree-body
    div.center.mt3(v-if="loading")
      a-spin
    a-tree(:tree-data="data" v-show="!loading" show-line block-node :expandedKeys.sync="expandedKeys" @select="handleSelect" :selectedKeys="selectedKeys")
      template(slot="title" slot-scope="node")
        div.flex.treenode-title
          span.flex-auto {{node.title}}
          span.treenode-toolbar(@click.stop v-if="!readonly")
            template(v-if="node.dataRef.id")
              a-icon(type="plus" title="新建子部门" @click="handleAdd(node)")
              a-popconfirm(title="是否删除此部门？" @confirm="handleDelete(node)")
                a-icon.ml1(type="delete" title="删除")
            template(v-else)
              a-icon.ml1(type="delete" title="删除" @click="handleDelete(node)")
</template>
<script>
import { flattenTree, treezen } from '@/utils/common';
import { buildDefaults } from '@/services/ModelService';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import _ from 'lodash';
export default {
  model: {
    prop: 'dept',
    event: 'change',
  },
  props: {
    dept: Object,
    readonly: Boolean,
  },
  data() {
    this._flattenData = [];
    return {
      data: [],
      expandedKeys: [],
      keyword: null,
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    selectedKeys() {
      return this.dept ? [this.dept._uid] : [];
    },
  },
  watch: {
    keyword() {
      this.buildTreeData(this._flattenData, this.keyword);
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    nomalizeItem(item) {
      const uid = item._uid || item.id || _.uniqueId();
      return {
        ...item,
        pid: item.pid || null,
        _uid: uid,
        value: uid,
        scopedSlots: { title: 'title' },
        key: uid,
        title: item.name,
      };
    },
    async reload() {
      await this.loadData();
      const selected = this._flattenData.find(
        (a) => a._uid === this.dept?._uid,
      );
      this.$emit('change', selected);
    },
    async loadData() {
      try {
        this.loading = true;
        const data = await this.$restful(`/sys/depts/all-graph`, {
          projectId: this.project.id,
        });
        const flattenData = flattenTree(data, 'children').map(
          this.nomalizeItem,
        );
        this._flattenData = flattenData;
        this.buildTreeData(flattenData, this.keyword);
      } finally {
        this.loading = false;
      }
    },
    buildTreeData(flatData, keyword) {
      let data = flatData;
      let expandedKeys = [];
      if (keyword) {
        data = flatData.filter((a) => {
          const match = a.name && a.name.includes(keyword);
          if (match && a.pid) {
            expandedKeys.push(a.pid);
          }
          return match;
        });
        [...data].forEach((item) => {
          let parentId = item.pid;
          while (parentId) {
            expandedKeys.push(parentId);
            const parent = flatData.find((a) => a.id === parentId);
            data.push(parent);
            parentId = parent.pid;
          }
        });
      }
      this.data = treezen(_.uniqBy(data, 'id'), 'pid');
      if (expandedKeys.length) {
        this.expandedKeys = _.uniq(expandedKeys);
      } else {
        this.expandedDefault();
      }
    },
    expandedDefault() {
      if (!this.expandedKeys.length) {
        this.expandedKeys = this.data.map((a) => a.id);
      }
    },
    handleAdd(node) {
      const defaults = buildDefaults('Dept');
      defaults.pid = node.key;
      defaults._uid = _.uniqueId();
      defaults.name = '新建部门';
      defaults.projectId = this.project.id;
      const flattenData = [...this._flattenData, defaults];
      this.expandedKeys = _.uniq([...this.expandedKeys, node.key]);
      this.data = treezen(flattenData.map(this.nomalizeItem), 'pid');
      this.$emit('change', defaults);
    },
    async handleDelete(node) {
      const model = node.dataRef;
      if (model.id) {
        await this.$restful(`delete:/sys/depts/${model.id}`);
        this.$message.success('删除成功。');
      } else {
        const flattenData = [...this._flattenData].filter(
          (a) => a._uid !== model._uid,
        );
        this.data = treezen(flattenData.map(this.nomalizeItem), 'pid');
      }
      if (this.dept._uid === model._uid) {
        this.$emit('change', null);
      }
    },
    handleSelect(selectedKeys, { node }) {
      this.$emit('change', node.dataRef);
    },
  },
};
</script>
<style lang="less" scoped>
.dept-tree {
  display: flex;
  flex-direction: column;
  &-header {
    overflow: hidden;
    flex: none;
    padding: 1rem;
  }
  &-body {
    overflow: auto;
    flex: auto;
    padding: 0 1rem;
    .treenode-title {
      .treenode-toolbar {
        display: none;
        cursor: pointer;
      }
      &:hover {
        .treenode-toolbar {
          display: block;
        }
      }
    }
  }
}
</style>
