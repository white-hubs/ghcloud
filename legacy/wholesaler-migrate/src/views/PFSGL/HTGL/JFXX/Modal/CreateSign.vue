<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="900" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    app-search(
      v-model='filters',
      :fields='filterFieleds',
        @search='handleQuickSearch',
      keywordPlaceholder='请输入关键字'
      )
    app-table.mt2(
      ref='table',
      v-bind='$attrs',
      row-key="id",
      model-name='planStaff',
      url="/ouaa/user-under-tenant/page",
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
      title: '添加签约人',
      expandedRowKeys: [],
      storeColumns: ['nickname', 'deptName', 'mobile'],
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
        organizationId: this.deptId,
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
    handleQuickSearch(keyword) {
      // this.search = keyword;
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'deptId',
          component: 'app-tree-select',
          width: '150px',
          uid: 'dept',
          placeholder: '请选择部门',
          api: '/ouaa/authenticated/organizations/list',
          params: {
            pageSize: 1000,
            pageNumber: 1,
            enabled: true
          },
          // field:{},
          dataFormatter: (data) => {
            data[0].selectable = false;
            return data;
          },
        },
      ];
    },
    handleSubmit() {
      const selections = this.$refs.table.getSelection();

      if (selections.length) {
        let arr = selections.map((item) => {
          return {
            userId: item.id,
            name: item.name,
            remark: item.remark,
          };
        });
        this.$emit('select-sign', arr);
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
.ant-modal-body{
  padding-bottom: 70px;
}
.ant-modal-footer>div{
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.ant-table-wrapper, :deep(.ant-table-wrapper){
  padding-bottom: 60px;
}
</style>
