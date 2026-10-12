<template lang="pug">
app-page-layout(fixHeader)
  app-table-page-layout
    Edit(ref='edit', @on-save='reload')
    template(#toolbar-left)
      a-button.ml2(@click='$refs.table.reload()') 刷新
    template(#toolbar-right)
      app-link-btn
        a-button(
          type='primary',
          icon='plus',
          @click='handleAdd',
          :disabled='!$getPermission("Resource:Add")'
        ) 新建
    app-table(
      ref='table',
      model-name='Resource',
      selectionMode='single',
      sortable,
      parentKey='pid',
      @expandedRowsChange='(rows) => (expandedRowKeys = rows)',
      @on-sort='handleSort',
      :expandedRowKeys='expandedRowKeys',
      :url='fetchData',
      :visibles='columns',
      :pagination='false',
      :columns-customsize='columnsCustomsize'
    )
      template(#name='{record}')
        span.drag-handler
          span {{ record.name }}
          a-icon.drag-icon(type='drag')
      template(#action='{record}')
        app-action-column
          app-link-btn(
            @click='handleEdit(record)',
            :disabled='!$getPermission("Resource:Edit")'
          ) 编辑
          app-link-btn-delete(
            @confirm='(cb) => handleDelete(record, cb)',
            :disabled='!$getPermission("Resource:Delete")'
          ) 删除
</template>
<script>
import Edit from './Edit';
import { flattenTree, treezen } from '@/utils/common';
export default {
  components: { Edit },
  data() {
    return {
      columns: ['name', 'icon', 'code', 'path', 'enabled', 'type'],
      expandedRowKeys: [],
    };
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    async fetchData() {
      const data = await this.$restful(`/sys/resources/all-graph`);
      const flatData = flattenTree(data).map((item) => {
        return {
          ...item,
          pid: item.pid || null,
        };
      });
      return treezen(flatData, 'pid');
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '20rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    handleAdd() {
      const select = this.$refs.table.getSelection();
      this.$refs.edit.show({ pid: select?.id });
    },
    handleEdit(record) {
      this.$refs.edit.show({ ...record });
    },
    async handleDelete(record, cb) {
      await this.$restful(`delete:/sys/resources/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.$refs.table.reload();
    },
    async handleSort(ids) {
      await this.$restful(`put:/sys/resources/sorting`, {
        ids,
      });
      this.$message.success('已保存排序。');
      this.$refs.table.reload();
    },
  },
};
</script>
