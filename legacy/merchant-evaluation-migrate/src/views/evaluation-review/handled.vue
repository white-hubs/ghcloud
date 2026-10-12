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
      //- template(#toolbar-right)
        //- a-button(type="primary" icon="plus" @click="handleCreate") 新建
        //- CreateConfig(ref="createAndConfig" @modal-success="$refs.table.refresh()")
      //- template(#toolbar-right)
      //-   a-button(
      //-     type='primary',
      //-     style='margin-left: 10px',
      //-     @click='exportClick'
      //-   ) 导出
      app-table(
        ref='table',
        model-name='noHandledTable',
        url='/project-merchant/stall-evaluation-records/store/page',
        :params='params',
        :visibles='columns',
        :columns-customsize="columnsCustomsize"
        :fitHeight='-50'
      )
        template(#code="{text,record}")
            app-link-btn( :to="'./evaluation-review-detail/'+record.id+'/'+'Handled'")  {{text}}
        template(#action="{record}")
                app-action-column
                  app-link-btn(:to="'./evaluation-review-detail/'+record.id+'/'+'Handled'") 详情
                  //- app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 处理

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
      columns: [
        'code',
        'createTime',
        'nickname',
        'descr',
        'fileDTOS',
        'username',
        'examineStatus',
        'examineTime',
      ],
      // 筛选
      filters: {
        search: '',
        timeRange: '',
        beginTime: '',
        endTime: '',
        examineStatus: '', //审核状态（0:未审核，1:已通过，2:未通过）
        handled: true, //已处理
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
        projectId: this.project.id,
        // search: this.filters?.search,
      };
    },
  },
  async created() {
    this.filterFieleds = [
      {
        name: 'examineStatus',
        placeholder: '请选择处理结果',
        width: '150px',
        component: 'app-remote-select',
        options: [
          { code: 1, name: '已通过' },
          { code: 2, name: '未通过' },
        ],
        field: { name: 'code', label: 'name' },
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
          // onlyDate: true,
          // showTime: true,
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
  methods: {
    moment,
    reload() {
      this.$refs.table.reload();
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
