<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="1200" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    app-search(
      v-model="filters"
      :fields="filterFieleds"
      @search="handleQuickSearch"
    ) 
    app-table.mt2(
      ref='table',
      model-name='signStore',
      url="/project-merchant/spaces/page",
      :visibles='storeColumns',
      :params='params',
      :fitHeight='-115',
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
      expandedRowKeys: [],
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
    handleQuickSearch(keyword) {},
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
    handleSubmit() {
      const selections = this.$refs.table.getSelection();
      if (selections.length) {
        this.$emit('select-stall', selections);
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
.mt2{
  position: relative;
  display: flex;
  width: 100%;
}
</style>
