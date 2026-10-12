<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="1200" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    app-search(
      v-model="filters"
      :fields="filterFieleds"
      @search="handleQuickSearch"
    ) 
    app-table.mt2(
      ref='table',
      model-name='Space',
      url="/project-merchant/spaces/page",
      :visibles='storeColumns',
      :params='params',
      :fitHeight='-115'
      :expandedRowKeys="expandedRowKeys")
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';

export default {
  components: {},
  data() {
    return {
      visible: false,
      loading: false,
      title: '添加档位',
      storeColumns: [
        'name',
        'acreage',
        'area',
        'deptName',
        'tradeModel',
        'companyName',
      ],
      typeActvie: '',
      planUserDTOS: [],
      expandedRowKeys: [],
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
      };
    },
  },
  created() {
    this.initFilters();
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'areaId',
          placeholder: '请选择区域',
          width: '150px',
          component: 'app-cascader',
          api: '/project-merchant/areas/all-graph',
          params: { projectId: this.project.id },
          mode: 'single',
        },
      ];
    },
    handleQuickSearch(k) {},
    handleSubmit() {
      const selections = this.$refs.table.getSelection();
      if (selections.length) {
        this.$emit('select-company', selections);
      }
      this.hide();
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-item {
  padding-left: 90px;
  margin: -10px 0 16px 0;
}
</style>
