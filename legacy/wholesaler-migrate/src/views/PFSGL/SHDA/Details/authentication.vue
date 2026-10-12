<template lang="pug">
  app-table-page-layout
    app-table(
      ref="table"
      model-name="authentication"
      url="/project-merchant/wholesaler-auth/page"
      :params="params"
      :visibles="columns"
      :selectionMode="false"
    )
      template(#realName="{text, record}")
        app-link-btn(:to="'/real-name-auth/detail/' + record.id") {{ text }}
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
      columns: ['realName', 'mobile', 'stallName', 'createTime', 'status'],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        companyId: this.id,
        projectId: this.project.id,
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
        width: '18rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    handledetails() {},
  },
};
</script>
