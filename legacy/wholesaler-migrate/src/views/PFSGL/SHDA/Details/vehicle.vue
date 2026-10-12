<template lang="pug">
  app-table-page-layout
    app-table(
      ref="table"
      model-name="vehicle"
      url="/project-merchant/wholesaler-vehicle/page"
      :params="params"
      :visibles="columns"
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
      columns: [
        'vehiclePlate',
        'vehicleType',
        'color',
        'owner',
        'mobile',
        'stallName',
        'companyName',
        'fileDTOS',
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
        // ...this.filters,
        projectId: this.project.id,
        companyId: this.id,
      };
    },
  },
  created() {},
  methods: {
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
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/project-merchant/wholesaler-vehicle/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
  },
};
</script>
