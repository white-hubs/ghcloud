<template lang="pug">
  div.table-box.app-custom-table
    div.table-header(v-if="!hideTitle")
      div.table-row 
        div.table-cell(v-if="selectionMode==='multi'")
          div.p1.center(style="width: 50px;") 
            //- indeterminate属性设置 indeterminate 状态，只负责样式控制，boolean
            //- checked	指定当前是否选中
            //- 全选按钮
            a-checkbox(:indeterminate="isIndeterminate(selections)" :checked="isCheckedAll(selections)" @click="checkAll")
        div.table-cell(v-for="col in columns" :key="col.uid" :style="{ width: col.width, flex: col.flex || 'none', }")
          //- div.p2.center(:style="{width: col.width}") {{col.title}}
          TableHeaderCell(v-bind="col")
    a-spin(:spinning="tableLoading")
      div.table-body(:style="{'max-height': this.maxHeight ? this.maxHeight+'px' : 'max-content'}")
        a-empty.p2(v-if="!data || !data.length" description="")
        div.table-row(v-for="(r,index) in data" :key="r[rowKey]" @click="handleClick(r)")
          div.table-cell(v-if="selectionMode==='multi'")  
            div.p1.center(style="width: 50px;")       
              a-checkbox(:checked="isChecked(r)" :disabled="r.props && r.props.disabled")
          div.table-cell(v-for="col in columns" :key="col.uid + '_' + r.id" :style="{ width: col.width, flex: col.flex || 'none', }")
            TableCell(v-bind="col" :model="r" :index="index")
        a-pagination(
        v-model="pagination.pageNum"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        :show-size-changer="showSizeChanger"
        :page-size-options="pagination.pageSizeOptions"
        :size="smallPagination? 'small' : ''"
        @change="handleChange"
        @showSizeChange="onShowSizeChange")
      
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
        titleRender: Function,
        customClass: Array,
      },
      render() {
        return (
          // class="p2 center"
          <div
            class={['p1'].concat(this.customClass || [])}
            style={{ width: this.width }}
          >
            {this.titleRender
              ? this.titleRender(this.$createElement, this.title, {
                  uid: this.uid,
                  dataIndex: this.dataIndex,
                  title: this.title,
                  width: this.width,
                })
              : this.title}
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
        index: Number,
        customClass: Array,
      },
      render() {
        return (
          // class="p1 center ellipsis"
          <div
            class={['p1'].concat(this.customClass || [])}
            style={{ width: this.width }}
            title={this.model[this.dataIndex]}
          >
            {this.render
              ? this.render(
                  this.$createElement,
                  this.model[this.dataIndex],
                  this.model,
                  this.index,
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
    tableData: [Array, Object],
    tableColumns: Array,
    tablePagination: Object,
    noPagination: Boolean,
    showSizeChanger: Boolean,
    dataFormater: Function,
    hideTitle: Boolean,
    maxHeight: Number,
    smallPagination: Boolean,
    selectionMode: {
      type: [String, Boolean],
      default: 'multi',
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    defaultSelections: [Array, Object],
    defaultSort: {
      type: [String, Array],
      default: 'createTime,desc',
    },
  },
  data() {
    return {
      columns: [],
      pagination: {
        pageSizeOptions: ['10', '20', '30', '40', '50'],
        pageSize: 7,
        total: 100,
        pageNum: 1,
      },
      tableLoading: false,
      data: [], // 表格数据
      // 选中的项
      selections: [],
    };
  },
  computed: {},
  watch: {
    params: 'refresh',
    tableData: 'loadTableData',
  },
  created() {
    // 初始化
    this.initColumns();
    this.pagination = {
      ...this.pagination,
      ...(this.tablePagination || {}),
    };
    this.selections = this.defaultSelections ? [...this.defaultSelections] : [];
    this.loadTableData();
  },
  methods: {
    async loadTableData() {
      this.tableLoading = true;
      if (this.tableData) {
        this.data = this.tableData;
        this.pagination.total = this.tableData.length;
        this.tableLoading = false;
        this.$emit('loaded');
      } else if (this.api) {
        this.$restful(this.api, {
          sort: this.defaultSort,
          ...this.params,
          pageSize: this.pagination.pageSize,
          pageNum: this.pagination.pageNum,
        })
          .then((res) => {
            // this.data = res.records
            this.data = res.records;
            this.pagination.total = res.total;
          })
          .finally(() => {
            this.tableLoading = false;
            this.$emit('loaded');
          });
      }
      // this.tableLoading = false;
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
    // 翻页
    handleChange(page, pageSize) {
      this.pagination.pageNum = page;
      this.loadTableData();
    },
    // 改变每页显示条数
    onShowSizeChange(current, pageSize) {
      this.pagination.pageSize = pageSize;
      this.refresh();
    },
    // ========== 处理选中状态 =========
    isChecked(item) {
      // some():返回一个Boolean，判断是否有元素符合func条件
      return this.selections.some((it) => {
        return it[this.rowKey] === item[this.rowKey];
      });
    },
    isIndeterminate() {
      const length = this.data.length;
      const checkedList = [];
      for (let i = 0; i < length; i++) {
        if (this.isChecked(this.data[i])) {
          checkedList.push(i);
        }
      }
      return !!checkedList.length && checkedList.length !== length;
    },
    isCheckedAll() {
      // this.data.forEach(item => {})
      const length = this.data.length;
      for (let i = 0; i < length; i++) {
        if (!this.isChecked(this.data[i])) {
          return false;
        }
      }
      return !!length && true;
    },
    handleClick(item) {
      if (!this.isChecked(item)) {
        this.selections.push({
          ...item,
        });
      } else {
        this.selections.forEach((it, index) => {
          if (it[this.rowKey] === item[this.rowKey]) {
            this.selections.splice(index, 1);
          }
        });
      }
      this.$emit('row-click', item);
    },
    checkAll() {
      // 当前是否被选中
      const isCheckedAll = this.isCheckedAll();
      // 已被选中
      if (!isCheckedAll) {
        this.data.forEach((item) => {
          if (!this.isChecked(item)) {
            this.selections.push({
              ...item,
            });
          }
        });
      } else {
        this.data.forEach((item) => {
          const rmIndex = [];
          this.selections.forEach((it, index) => {
            if (
              it[this.rowKey] === item[this.rowKey] ||
              it[this.rowKey] === item[this.rowKey]
            ) {
              rmIndex.push(index);
              this.selections.splice(index, 1);
            }
          });
        });
      }
      this.$emit('row-click');
    },
    // 初始化列
    initColumns() {
      this.columns = this.tableColumns || [
        {
          uid: 'name',
          dataIndex: 'name',
          title: '名称',
          width: '20rem',
        },
      ];
      if (this.selectionMode) {
        //
      }
    },
  },
};
</script>

<style lang="less" scoped>
.app-custom-table {
  overflow: hidden;
  .table-header {
    border: 1px solid rgba(0, 0, 0, 0.1);
    background-color: rgba(0, 0, 0, 0.05);
    .table-row {
      height: 46px;
      display: flex;
      align-items: stretch;
    }
  }
  .table-body {
    min-height: 46px;
    font-size: 14px;
    overflow-x: hidden;
    overflow-y: overlay;
    // max-height: 200px;
    max-height: max-content;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-top: 0;
    .table-row {
      min-height: 46px;
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      &:hover {
        background-color: rgba(0, 0, 0, 0.01);
      }
      &:last-child {
        border-bottom: 0;
      }
    }
  }
  .table-cell {
    //
    display: flex;
    align-items: center;
    & + .table-cell {
      // border-left: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
