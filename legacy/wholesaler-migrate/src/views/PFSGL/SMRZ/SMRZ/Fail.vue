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
  app-table(
    ref="table"
    model-name="realNameAuth"
    url="/project-merchant/wholesaler-auth/page"
    :params="params"
    :visibles="columns"
    :fitHeight="-10"
  )
    template(#realName="{text, record}")
      app-link-btn(:to="'/real-name-auth/detail/' + record.id") {{ text }}
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {},
  data() {
    return {
      columns: ['realName', 'loginAccount', 'stallName', 'createTime'],
      // 筛选
      filters: {},
      filterFieleds: [],
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
        status: 2,
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
