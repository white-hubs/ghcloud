<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout
    template(#toolbar-left)
      AppSearch(
        v-model='filters',
        :fields='filterFieleds',
        @search='handleQuickSearch'
      ) 
      a-button.ml2(@click='$refs.table.reload()') 刷新
    template(#toolbar-right)
      a-button(type='primary', icon='plus', @click='handleCreate') 新建
      CreateConfig(
        ref='createAndConfig',
        @modal-success='$refs.table.refresh()'
      )
    app-table(
      ref='table',
      model-name='evaluation-config',
      url='/project-merchant/fireinsp-item-evaluation/page',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize'
    )
      template(#code='{ text, record }')
        app-link-btn(:to='"./evaluate-config/" + record.id') {{ text }}
      template(#action='{ record }')
        app-action-column
          app-link-btn(@click='handleEdit(record)') 编辑
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import CreateConfig from './Modal/CreateConfig';
export default {
  name: 'KeepAliveXxxx',
  components: { CreateConfig },
  data() {
    return {
      columns: [
        'code',
        'itemName',
        'itemResultName',
        'itemResultMark',
        'standardName',
        'createBy',
        'createTime',
      ],
      search: null,
      filters: {
        search: null,
        type: null,
        level: null,
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
        businessType: 'centerTrainTask',
      };
    },
  },
  created() {
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
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      // this.search = keyword;
    },
    handleCreate() {
      this.$refs.createAndConfig.show();
    },
    // 编辑
    async handleEdit(record) {
      const event = await this.$restful(
        `GET:/project-merchant/fireinsp-item-evaluation/${record.id}`,
      );
      this.$refs.createAndConfig.show(event);
    },
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
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/fireinsp-item-evaluation/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
  },
};
</script>
