<template lang="pug">
  app-table-page-layout
    app-table(
      ref="table"
      model-name="agreement"
      url="/project-merchant/wholesaler-protocol/page"
      :params="params"
      :visibles="columns"
    )
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
        'name',
        'count',
        'signedCount',
        'notSignedCount',
        'processingStatus',
        'templateType',
        'status',
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
        companyId: this.id,
        projectId: this.project.id,
      };
    },
  },
  created() {},
  methods: {},
};
</script>
