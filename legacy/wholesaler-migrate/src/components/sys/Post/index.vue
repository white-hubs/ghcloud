<template lang="pug">
app-page-layout(fix-header)
  edit(ref='edit', @on-save='reload')
  app-table-page-layout
    template(#toolbar-left)
      a-button.ml1(@click='reload') 刷新
    template(#toolbar-right)
      a-button(
        type='primary',
        icon='plus',
        @click='handleAdd',
        :disabled='!$getPermission("Post:Add")'
      ) 新建岗位
    app-table(
      ref='table',
      model-name='Post',
      :url='`/sys/posts/all/${project.id}`',
      :pagination='false',
      :visibles='columns',
      :columns-customsize='columnsCustomsize'
    )
      template(#action='{record}')
        app-action-column
          app-link-btn(
            @click='handleEdit(record)',
            :disabled='!$getPermission("Post:Edit")'
          ) 编辑
          app-link-btn-delete(
            @confirm='(cb) => handleDelete(record, cb)',
            :disabled='!$getPermission("	Post:Delete")'
          ) 删除
</template>
<script>
import Edit from './Edit';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { Edit },
  data() {
    return {
      columns: ['name'],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    async handleDelete(record, cb) {
      try {
        await this.$restful(`delete:/sys/posts/${record.id}`);
        this.$message.success('删除成功。');
        this.reload();
      } finally {
        cb();
      }
    },
    handleAdd() {
      this.$refs.edit.show();
    },
    handleEdit(record) {
      this.$refs.edit.show(record);
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '15rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
  },
};
</script>
