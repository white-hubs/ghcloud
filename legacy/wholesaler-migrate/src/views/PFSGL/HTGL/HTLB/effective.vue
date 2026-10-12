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
  app-table(
    ref="table"
    model-name="contract"
    url="/project-merchant/wholesaler-contract/page"
    :params="params"
    :visibles="columns"
    :fitHeight="-10"
  )
    template(#code="{text, record}")
      app-link-btn(:to="'/contract-list/detail/' + record.id") {{ text }}
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
export default {
  components: {},
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
            '已生效合同数据导出' +
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
