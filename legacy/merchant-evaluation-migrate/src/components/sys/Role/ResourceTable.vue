<template lang="pug">
  a-table(
    bordered
    row-key="id"
    childrenColumnName="menus"
    @expandedRowsChange="rows=>expandedRowKeys=rows"
    :data-source="data"
    :pagination="false"
    :expandedRowKeys="expandedRowKeys"
    :loading="!data.length"
    v-bind="$attrs"
  )
    a-table-column(key="menu" title="菜单" data-index="menu" width="30rem")
      template(slot-scope="text, record")
        a-checkbox(:checked="isChecked(record)" :indeterminate="isIndeterminate(record)" @change="handleCheckboxChange(record)") {{record.name}}
    a-table-column(key="function" data-index="function")
      div(slot="title")
        span 权限
        span.mr2.right-0.absolute
          a-checkbox(:checked="isCheckedAll()" :indeterminate="isAllIndeterminate()" @change="handleSelectAll") 全选
      template(slot-scope="text, record")
        div.function-wrapper
          div.function-item.mr1(v-for="item in record.functions" :key="item.id")
            a-checkbox(:checked="isChecked(item)" @change="handleCheckboxChange(item)") {{item.name}}
</template>
<script>
import { flattenTree } from '@/utils/common';
import _ from 'lodash';
export default {
  model: {
    prop: 'resources',
    event: 'change',
  },
  props: {
    resources: Array, // id 数组
  },
  data() {
    this._flattenData = [];
    return {
      data: [],
      expandedRowKeys: [],
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const data = await this.$restful('/xtpt/resources/all-graph');
      const flattenData = flattenTree(data).map((item) => {
        return {
          ...item,
          pid: item.pid || null,
        };
      });
      flattenData.forEach((item) => {
        item.children = flattenData.filter((a) => a.pid === item.id);
        item.functions = flattenData.filter(
          (a) => a.type === 'FUNCTION' && a.pid === item.id,
        );
        item.menus = flattenData.filter(
          (a) => a.type === 'MENU' && a.pid === item.id,
        );
        if (!item.menus[0]) {
          item.menus = null;
        }
      });
      this.data = flattenData.filter((a) => a.pid === null);
      this._flattenData = flattenData;
      this.expandedRowKeys = this.data.map((a) => a.id);
    },
    isChecked(item) {
      if (item.type === 'FUNCTION') {
        return this.resources.includes(item.id);
      }
      if (item.type === 'MENU') {
        return this.resources.includes(item.id);
        // if (_.isEmpty(item.children)) {
        //   return false;
        // }
        // return item.children.every((a) => this.isChecked(a));
      }
      return false;
    },
    isCheckedAll() {
      return this.data.every((a) => this.isChecked(a));
    },
    isAllIndeterminate() {
      if (this.isCheckedAll()) {
        return false;
      }
      if (this.data.some((a) => this.isChecked(a) || this.isIndeterminate(a))) {
        return true;
      }
      return false;
    },
    isIndeterminate(item) {
      if (item.type === 'MENU') {
        const functions = flattenTree(item.children, 'children').filter(
          (a) => a.type === 'FUNCTION',
        );
        if (
          !this.isChecked(item) &&
          functions.some((a) => this.resources.includes(a.id))
        ) {
          return true;
        }
      }
      return false;
    },
    handleSelectAll() {
      if (this.isCheckedAll()) {
        this.$emit('change', []);
      } else {
        this.$emit(
          'change',
          this._flattenData.map((a) => a.id),
        );
      }
    },
    // handleCheckboxChange(item) {
    //   let resources = this.resources;
    //   if (item.type === 'FUNCTION') {
    //     resources = _.xor(resources, [item.id]);
    //   } else {
    //     const functions = flattenTree(item.children)
    //       .filter((a) => a.type === 'FUNCTION')
    //       .map((a) => a.id);
    //     if (this.isChecked(item)) {
    //       resources = _.filter(
    //         resources,
    //         (a) => !functions.some((b) => b === a),
    //       );
    //     } else {
    //       resources.push(...functions);
    //     }
    //   }
    //   this.$emit('change', _.uniq(resources));
    // },
    handleCheckboxChange(item) {
      let resources = this.resources;
      resources = _.xor(resources, [item.id]);
      const functions = flattenTree(item.children).map((a) => a.id);
      if (this.isChecked(item)) {
        resources = _.filter(resources, (a) => !functions.some((b) => b === a));
      } else {
        resources.push(...functions);
      }
      resources = this.getCheckboxParent(item, resources);
      this.$emit('change', _.uniq(resources));
    },
    getCheckboxParent(item, resources) {
      if (item.pid) {
        let parentElement = this._flattenData.find((a) => a.id === item.pid);
        if (parentElement) {
          if (!resources.includes(parentElement.id)) {
            resources.push(parentElement.id);
          }
          this.getCheckboxParent(parentElement, resources);
        }
      }
      return resources;
    },
  },
};
</script>
<style lang="less" scoped>
.function-wrapper {
  .function-item {
    display: inline-block;
  }
}
</style>
