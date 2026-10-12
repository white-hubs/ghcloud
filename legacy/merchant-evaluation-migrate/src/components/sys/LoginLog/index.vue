<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout
    template(#toolbar-left)
      app-input-search(@search="v=>keyword=v" placeholder="快捷查询")
      a-button.ml1(@click="reload") 刷新
    app-table(
      ref="table"
      model-name="LoginLog"
      url="/sys/login-logs/page"
      default-sort="loginTime,desc"
      :visibles="columns"
      :params="params"
      :columns-customsize="columnsCustomsize"
    )
      template(#username="{record}")
        app-link-btn(:to="`/login-logs/detail/${record.id}`") {{record.username}}
      template(#action="{record}")
        app-action-column
          app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)" :disabled="!$getPermission('LoginLog:Delete')") 删除
</template>
<script>
export default {
  data() {
    return {
      columns: ['username', 'loginTime', 'ip', 'browserName', 'succeed', 'msg'],
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
        await this.$restful(`delete:/sys/login-logs/${record.id}`);
        this.$message.success('删除成功。');
        this.reload();
      } finally {
        cb();
      }
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '10rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
  },
};
</script>
