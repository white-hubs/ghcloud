<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout
    template(#toolbar-left)
      app-input-search(@search="v=>keyword=v" placeholder="快捷查询")
      a-button.ml1(@click="reload") 刷新
    app-table(
      ref="table"
      model-name="OperationLog"
      url="/sys/operation-logs/page"
      :visibles="columns"
      :params="params"
      :columns-customsize="columnsCustomsize"
      :pagination="false"
      :fitHeight="-30"
      :selectionMode="false"
    )
      template(#title="{record}")
        app-link-btn(:to="`/operation-logs/detail/${record.id}`") {{record.title}}
      template(#action="{record}")
        app-action-column
          app-link-btn 编辑
          app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
</template>
<script>
export default {
  data() {
    return {
      columns: ['title', 'username', 'url', 'time', 'status'],
      keyword: null,
    };
  },
  computed: {
    params() {
      if (this.keyword) {
        return {
          username: this.keyword,
        };
      }
      return null;
    },
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    async handleDelete(record, cb) {
      try {
        await this.$restful(`delete:/sys/operation-logs/${record.id}`);
        this.$message.success('删除成功。');
        this.reload();
      } finally {
        cb();
      }
    },
    async handleBatchDelete() {
      const selection = this.$refs.table.getSelection();
      if (selection[0]) {
        this.$confirm({
          title: '提示',
          content: '是否删除所选数据？',
          onOk: async () => {
            await this.$restful(`delete:/sys/operation-logs`, {
              ids: selection.map((a) => a.id),
            });
            this.$message.success('删除成功。');
            this.reload();
          },
        });
      } else {
        this.$message.info('未选择数据，无法删除。');
      }
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
