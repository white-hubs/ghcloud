<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="900" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    app-search(
      v-model='filters',
        @search='handleQuickSearch',
      keywordPlaceholder='请输入关键字'
      )
    app-table.mt2(
      ref='table',
      v-bind='$attrs',
      row-key="id",
      model-name='userStaff',
      url="/ouaa/authenticated/user-under-tenant/page?",
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
      title: '选择人员',
      expandedRowKeys: [],
      storeColumns: [
        'name',
        'mobile',
        'organizations',
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
        keyword: this.filters.search
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
      this.filterFieleds = [];
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
        this.$emit('select-user', arr);
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
.ant-table-wrapper, :deep(.ant-table-wrapper){
  padding-bottom: 60px;
}
</style>
