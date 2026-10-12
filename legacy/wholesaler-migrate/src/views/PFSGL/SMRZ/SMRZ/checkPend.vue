<template lang="pug">
app-table-page-layout
  template(#toolbar-left)
    app-search(
      v-model="filters"
      :fields="filterFieleds"
      @search="handleQuickSearch"
      keywordPlaceholder="请输入关键字"
    )
    a-button.ml2(@click='$refs.table.reload()') 刷新
  template(#toolbar-right)
    a-button(type='primary' @click="handleBatchPass" :disabled='!canPassBatch') 批量通过
  app-table(
    ref="table"
    model-name="realNameAuth"
    url="/project-merchant/wholesaler-auth/page"
    :params="params"
    :visibles="columns"
    :columns-customsize="columnsCustomsize"
    @select='handleSelectChange',
    @selectChange='handleSelectChange',
    @change='handleSelectChange',
    @loaded='handleSelectChange'
    :fitHeight="-10"
  )
    template(#realName="{text, record}")
      app-link-btn(:to="'/real-name-auth/detail/' + record.id") {{ text }}
    template(#action="{record}")
      app-action-column
        app-link-btn(@click="handleAdopt(record)") 通过
        app-link-btn(@click="handleReject(record)") 驳回
  CreateAndEdit(ref='createAndEdit', @modal-success='$refs.table.reload()')
</template>

<script>
import CreateAndEdit from './Model/CreateAndEdit';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { CreateAndEdit },
  data() {
    return {
      columns: ['realName', 'loginAccount', 'stallName', 'createTime'],
      // 筛选
      filters: {},
      filterFieleds: [],
      canPassBatch: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        ...this.filters,
        projectId: this.project.id,
        status: 0,
      };
    },
  },
  created() {
    this.initFilters();
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
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
    // 驳回
    async handleReject(item) {
      this.$refs.createAndEdit.show(item);
      // this.$restful(`PUT:/project-merchant/wholesaler/reject/${item.id}`).then((res) => {
      //   this.$message.success('操作成功');
      //   this.$refs.table.reload();
      // });
    },
    // 通过
    handleAdopt(item) {
      this.$restful(`PUT:/project-merchant/wholesaler/status/${item.id}`).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    // 批量通过
    handleBatchPass() {
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);
      this.$restful(`PUT:/project-merchant/wholesaler/status/ids`, {
        ids: ids,
      }).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    handleSelectChange(select) {
      if (select?.selectedRowKeys?.length) {
        this.canPassBatch = true;
      } else {
        this.canPassBatch = false;
      }
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'timeRange',
          placeholder: '请选择时间范围',
          width: '500px',
          component: 'AppTimeRangeSelect',
          options: [{ code: 'custom', name: '自定义时间范围' }],
          field: { name: 'code', label: 'name' },
          extraProp: {
            onlyCustom: true,
            onlyDate: true,
          },
          onChange: (e) => {
            if (Array.isArray(e)) {
              this.filters.timeRange = 'custom';
              this.filters.beginTime = e[0] || null;
              this.filters.endTime = e[1] || null;
            } else {
              this.filters.beginTime = null;
              this.filters.endTime = null;
            }
          },
        },
      ];
    },
  },
};
</script>
<style lang="less" scoped>
// .
</style>
