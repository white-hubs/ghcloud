<template lang="pug">
app-page-layout.no-bg-body(title='协议模板详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90")
    .footer-btns
      app-link-btn(@click='back') 
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: 'detail',
  components: {},
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      fields: [
        {
          name: 'code',
          label: '编号',
        },
        {
          name: 'name',
          label: '名称',
        },
        {
          name: 'typeName',
          label: '协议类型',
        },
        {
          name: 'protocolFileDTOS',
          label: '协议附件',
          render(h, r, v) {
            return v?.length ? <app-files-display files={v} /> : '无';
          },
        },
        {
          name: 'remark',
          label: '备注',
        },
      ],
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    id() {
      const id = this.$route.params.id;
      return id;
    },
  },
  async created() {
    this.loadModel(this.id);
  },
  methods: {
    async loadModel(id) {
      this.model = await this.$restful(
        `GET:/project-merchant/wholesaler-protocol-template/${id}`,
        {
          // projectId: this.project.id,
          id: id,
        },
      );
    },
    back() {
      this.$back();
    },
  },
};
</script>
<style lang="less" scoped>
.mt16 {
  margin-top: 16px;
}

.footer-btns {
  margin: 16px 0;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
