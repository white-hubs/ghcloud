<template lang="pug">
.worksheet
  .worksheet-main
    app-table-page-layout
      template(#toolbar-left)
        app-search(
          v-model='filters',
          :fields='filterFieleds',
          @search='handleQuickSearch',
          keywordPlaceholder='请输入关键字'
        ) 

        a-button.ml2(@click='$refs.table.reload()') 刷新
      template(#toolbar-right)
        a-button(type="primary" icon="plus" @click="handleCreate") 新建
        CreateConfig(ref="createAndConfig" @modal-success="$refs.table.refresh()")
      //- template(#toolbar-right)
      //-   a-button(
      //-     type='primary',
      //-     style='margin-left: 10px',
      //-     @click='exportClick'
      //-   ) 导出
      app-table(
        ref='table',
        model-name='labelSetTable',
        url='/project-merchant/stall-evaluation-tag/page',
        :params='params',
        :visibles='columns',
        :columns-customsize="columnsCustomsize"
        :fitHeight='-50'
      )
        template(#action="{record}")
          app-action-column
            app-link-btn(@click='handleEdit(record)') 编辑
            app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
import CreateConfig from './Modal/CreateConfig';
export default {
  // name: 'KeepAliveXxxx',
  components: { CreateConfig },
  data() {
    return {
      columns: ['tag', 'evaluation', 'category', 'score'],
      // 筛选
      filters: {
        search: '',
        evaluation: '', //评价维度
        type: '', //评价分类
      },
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
        projectId: this.project?.id,
        // search: this.filters?.search,
      };
    },
  },
  async created() {
    this.filterFieleds = [
      {
        name: 'evaluation',
        placeholder: '请选择评价维度',
        width: '150px',
        component: 'app-remote-select',
        options: [
          { code: 1, name: '商品质量' },
          { code: 2, name: '诚实守信' },
          { code: 3, name: '环境卫生' },
          { code: 4, name: '服务态度' },
        ],
        field: { name: 'code', label: 'name' },
      }
    ]
    const result = await this.getCategorys();
    this.filterFieleds.push({
      name: 'category',
      placeholder: '请选择评价评价分类',
      width: '150px',
      component: 'app-remote-select',
      options: [...result],
      field: { name: 'code', label: 'name' },
    })
  },
  methods: {
    moment,
    reload() {
      this.$refs.table.reload();
    },
    getCategorys() {
      return this.$restful(`GET:/dictionary/getDataDictionaryByItem?itemCode=project-merchant-evaluate_level&name=&code=`, {})
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    //新增
    handleCreate() {
      this.$refs.createAndConfig.show();
    },
    // 编辑
    handleEdit(record) {
      this.$refs.createAndConfig.show(record);
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/stall-evaluation-tag/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '15rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
  },
};
</script>

<style lang="less" scoped>
.worksheet {
  display: flex;
  height: 100%;
  overflow: hidden;
  flex-direction: column;

  .btn-tabs {
    flex: none;

    // padding: var(--space-3);
    // padding-bottom: 0;
    .category-btn {
      margin-right: 1rem;
    }
  }

  .worksheet-main {
    flex: auto;
    overflow: hidden;
    position: relative;
  }
}
</style>
