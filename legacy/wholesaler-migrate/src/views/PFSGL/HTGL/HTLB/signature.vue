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
    a-button(type='primary' :loading="exportLoading" @click="handleExport") 导出
    a-button.ml2(type='primary' @click="handleBatchSignature") 批量签章
  app-table(
    ref="table"
    model-name="contract"
    url="/project-merchant/wholesaler-contract/page"
    :params="params"
    :visibles="columns"
    :columns-customsize="columnsCustomsize"
    :fitHeight="-10"
  )
    template(#code="{text, record}")
      app-link-btn(:to="'/contract-list/detail/' + record.id") {{ text }}
    template(#action="{record}")
      app-action-column
        app-link-btn(@click="handleSignature(record)") 签章
  CreateSignature(ref="createSignature",@modal-success="$refs.table.reload()")
</template>

<script>
import CreateSignature from './Modal/CreateSignature';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
export default {
  components: { CreateSignature },
  props: {
    status: String,
  },
  data() {
    return {
      columns: [
        'code',
        'stallDtos',
        'signingWay',
        'contractTypeDto',
        'createBy',
        'createTime',
      ],
      // 筛选
      filters: {},
      filterFieleds: [],
      exportLoading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        ...this.filters,
        status: this.status,
        projectId: this.project.id,
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
    // 导出数据
    moment,
    handleExport() {
      this.exportLoading = true;
      this.$restful(
        `GET:/project-merchant/wholesaler-contract/data-export`,
        { ...this.params },
        { responseType: 'blob' },
      )
        .then((res) => {
          const link = document.createElement('a');
          let blob = new Blob([res], {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          link.style.display = 'none';
          link.href = URL.createObjectURL(blob);
          link.setAttribute(
            'download',
            '待签章合同数据导出' +
              this.moment().format('YYYYMMDDHHmmss') +
              '.xlsx',
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '8rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    // 催办
    handleUrge(id) {
      this.$restful(`GET:/project-merchant/wholesaler-contract/notice/${id}`).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    // 签章
    handleSignature(record) {
      this.$refs.createSignature.show(record);
    },
    // 批量签章
    handleBatchSignature() {
      this.$restful(`GET:/project-merchant/wholesaler-contract/notice/ids`, {
        projectId: this.project.id,
      }).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/edu/center-train-task/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'signingWay',
          placeholder: '签约方式',
          width: '150px',
          component: 'app-remote-select',
          options: [
            { name: '1', label: '续签' },
            {
              name: '0',
              label: '新签',
            },
          ],
          field: { name: 'name', label: 'label' },
        },
        {
          name: 'contractType',
          placeholder: '合同类型',
          width: '150px',
          component: 'app-remote-select',
          api: '/project-merchant/wholesaler-contract-type/list',
          field: { name: 'id', label: 'name' },
        },
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
