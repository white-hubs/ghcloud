<template lang="pug">
  app-table-page-layout
    app-table(
      ref="table"
      model-name="personnel"
      :params="params"
      :visibles="columns"
      url="/project-merchant/wholesaler/user/page"
      :columns-customsize='columnsCustomsize'
    )
      template(#action='{ record }')
          app-action-column
            app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';

export default {
  components: {},
  props: {
    id: String,
  },
  data() {
    return {
      list: [],
      columns: [
        'nickname',
        'gender',
        'mobile',
        // 'identityCard',
        'stallName',
        'owner',
        'companyName',
        'createBy',
        'createTime',
      ],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        projectId: this.project.id,
        companyId: this.id,
      };
    },
  },
  created() {
    this.getPersonnelList();
  },
  methods: {
    // 人员列表
    getPersonnelList() {
      this.$restful('GET:/project-merchant/wholesaler/user/page', {
        projectId: this.project.id,
        companyId: this.id,
      }).then((res) => {
        this.list = res.records || [];
      });
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '8rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    // 删除
    handleDelete(record, cb) {
      this.$restful(`delete:/centerApi/sys/users/${record.userId}`);
      this.$restful(`delete:/project-merchant/companies/user`, {
        companyId: record.companyId,
        // stallId: record.stallId,
        userId: record.userId,
      });
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
  },
};
</script>
