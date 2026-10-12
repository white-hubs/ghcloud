<template lang="pug">
  a-pagination.custom-pagination(
  v-model="pagination.pageNum"
  :total="pagination.total"
  :page-size="pagination.pageSize"
  :page-size-options="pagination.pageSizeOptions"
  @change="handleChange"
  @showSizeChange="onShowSizeChange"
  v-bind="$attrs"
  )
</template>

<script>
export default {
  components: {
    TableHeaderCell: {
      props: {
        uid: String,
        dataIndex: String,
        title: String,
        width: String,
        render: Function,
      },
      render() {
        return (
          <div class="p2 center" style={{ width: this.width }}>
            {this.title}
          </div>
        );
      },
    },
    TableCell: {
      props: {
        uid: String,
        dataIndex: String,
        title: String,
        width: String,
        render: Function,
        model: [Object, Array],
      },
      render() {
        return (
          <div
            class="p1 center ellipsis"
            style={{ width: this.width }}
            title={this.model[this.dataIndex]}
          >
            {this.render
              ? this.render(
                  this.$createElement,
                  this.model[this.dataIndex],
                  this.model,
                )
              : this.model[this.dataIndex]}
          </div>
        );
      },
    },
  },
  props: {
    api: String,
    params: Object,
    tableColumns: Array,
    tablePagination: Object,
    noPagination: Boolean,
    dataFormater: Function,
    hideTitle: Boolean,
    smallPagination: Boolean,
  },
  data() {
    return {
      columns: [],
      pagination: {
        pageSizeOptions: ['10', '20', '30', '40', '50'],
        pageSize: 7,
        total: 0,
        pageNum: 1,
      },
      tableLoading: false,
      data: [],
      // list: [],
    };
  },
  computed: {
    // params() {
    //   return {
    //     ...this.filter,
    //     levelId: this.floor?.id,
    //     modelFileId: this.floor?.fileId,
    //     projectId: this.project.id,
    //   };
    // },
  },
  watch: {
    params: 'refresh',
  },
  created() {
    this.pagination = {
      ...this.pagination,
      ...(this.tablePagination || {}),
    };
    this.loadTableData();
  },
  methods: {
    async loadTableData() {
      this.tableLoading = true;
      this.$emit('update:loading', true);
      this.$restful(this.api, { ...this.params, ...this.pagination }).then(
        (res) => {
          // this.data = res.records
          this.data = res.records;
          this.pagination.total = res.total;
          this.tableLoading = false;
          this.$emit('update:data', res.records || []);
          this.$emit('update:loading', false);
        },
      );
      this.tableLoading = false;
    },
    onSearch(v) {
      this.filter.search = v;
    },
    reload() {
      this.loadTableData();
    },
    refresh() {
      this.pagination = {
        ...this.pagination,
        pageNum: 1,
      };
      // this.orderBy = 'sendTime:desc';
      this.reload();
    },
    handleChange(page, pageSize) {
      this.pagination.pageNum = page;
      this.loadTableData();
    },
    onShowSizeChange(current, pageSize) {
      this.pagination.pageSize = pageSize;
      this.refresh();
    },
  },
};
</script>

<style lang="less" scoped>
.custom-table {
  overflow: hidden;
  .table-header {
    background-color: rgba(16, 17, 26, 0.6);
    .table-row {
      height: 46px;
      display: flex;
      align-items: center;
    }
  }
  .table-body {
    min-height: 46px;
    font-size: 14px;
    .table-row {
      height: 46px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      &:hover {
        background-color: #00ffff40;
      }
      .table-cell {
        //
        .link-like {
          color: #00ffff;
          cursor: pointer;
          &:hover {
            // text-shadow: 0 3px 3px #00ffff;
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>
