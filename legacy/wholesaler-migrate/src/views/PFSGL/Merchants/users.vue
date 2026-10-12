<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout  
    template(#toolbar-left)  
      app-search(
        v-model="filters"
        :fields="filterFieleds"
        keywordPlaceholder="姓名/手机号"
      )
      a-button.ml2(@click="$refs.table.reload()") 刷新      
    template(#toolbar-right)    
      a-button(type="primary" @click="handleExport" :loading="exportLoading") 导出数据    
    app-table(
      ref='table',
      model-name='users',
      url='/sys/users/company/page',
      :selectionMode='false',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize'
    )
      template(#action='{record}')
        app-action-column
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 移除用户
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {},
  data() {
    return {
      columns: [
        'username',
        'nickname',
        'mobile',
        'gender',
        'isOwner',
        'companyName',
        'storeName',
        'createTime',
      ],
      search: null,
      isCompanyOwner: '',
      filters: {
        search: null,
        searchStore: null,
        areaId: null,
        isCompanyOwner: null,
      },
      filterFieleds: [],
      typeList: [
        {
          value: '档主',
          key: 'true',
        },
        {
          value: '从业人员',
          key: 'false',
        },
      ],
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
        type: 'userType_store',
      };
    },
  },
  created() {
    this.initFilters();
  },
  methods: {
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '18rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    onChange() {},
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/centerApi/sys/users/${record.id}`);
      await this.$restful(`delete:/project-merchant/companies/user`, {
        // storeId: record.storeDTOS[0].id,
        userId: record.id,
      });
      cb();
      this.$message.success('移除成功!');
      this.$refs.table.reload();
    },
    searchClick() {
      this.search = this.searchForm.search;
      this.isCompanyOwner = this.searchForm.isCompanyOwner;
      this.searchStore = this.searchForm.searchStore;
      this.areaId = this.searchForm.areaId;
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'searchStore',
          placeholder: '商户/档位',
          width: '150px',
          component: 'a-input',
        },
        {
          name: 'isCompanyOwner',
          placeholder: '职位',
          width: '150px',
          component: 'app-remote-select',
          options: [
            { name: '档主', id: 'true' },
            { name: '从业人员', id: 'false' },
          ],
        },
        {
          name: 'areaId',
          placeholder: '请选择所属区域',
          width: '250px',
          component: 'app-cascader',
          api: '/project-merchant/areas/all-graph',
          params: { projectId: this.project.id },
          mode: 'single',
        },
      ];
    },
  },
};
</script>
<style lang="less" scoped>
.user_container {
  padding: 20px;

  .user_search {
    margin-bottom: 10px;
  }
}
</style>
