<template lang="pug">
app-page-layout.no-bg-body(title='配置详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="170")
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: '',
  components: {},
  data() {
    return {
      activeKey: 1,
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      // 筛选
      filters: {},
      filterFieleds: [],
      columns: [
        'code',
        'name',
        'type',
        'createBy',
        'createTime',
        'type',
        'updateBy',
        // 'updateTime',
      ],
      companyData: [],
      fields: [
        {
          name: 'code',
          label: '编号',
        },
        {
          name: 'standardName',
          label: '巡检标准',
        },
        {
          name: 'itemName',
          label: '巡检项',
        },
        {
          name: 'itemResultName',
          label: '结果选项',
        },
        {
          name: 'itemResultMark',
          label: '扣减分值',
        },
      ],
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    id() {
      const id = this.$route.params.id;
      return id;
    },
  },
  async created() {
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
    this.loadModel(this.id);
  },
  methods: {
    async loadModel(id) {
      this.model = await this.$restful(
        `GET:/project-merchant/fireinsp-item-evaluation/${id}`,
      );
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '22rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    handleCreate() {
      this.$refs.record.show();
    },
    handleCompanyDetail() {},
    back() {
      this.$back();
    },
  },
};
</script>
<style lang="less" scoped>
.sqxx-container {
  height: 400px;
}
.sbxx-container {
  min-height: 100px;
  background-color: #fff;
}
.mt16 {
  margin-top: 16px;
}
.dw-container {
  padding: 0 20px;
}
.footer-btns {
  margin: 16px 0;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
