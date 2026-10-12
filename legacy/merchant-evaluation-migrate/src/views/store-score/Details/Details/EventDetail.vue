<template lang="pug">
app-page-layout.no-bg-body(title='评价详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="170" :colspans="colspans")
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
      activeKey: 1,
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      fields: [
        {
          name: 'stallName',
          label: '档位名称',
        },
        {
          name: 'nickname',
          label: '用户',
        },
        {
          name: 'createTime',
          label: '评价时间',
        },
        {
          name: 'zScore',
          label: '商品质量',
          render(h, v, r) {
            return (
              <span>
                <a-rate value={r} disabled allow-half />
                <span class="ant-rate-text">{r}(星)</span>
              </span>
            );
          },
        },
        {
          name: 'sScore',
          label: '诚实守信',
          render(h, v, r) {
            return (
              <span>
                <a-rate value={r} disabled allow-half />
                <span class="ant-rate-text">{r}(星)</span>
              </span>
            );
          },
        },
        {
          name: 'tScore',
          label: '服务态度',
          render(h, v, r) {
            return (
              <span>
                <a-rate value={r} disabled allow-half />
                <span class="ant-rate-text">{r}(星)</span>
              </span>
            );
          },
        },
        {
          name: 'wScore',
          label: '环境卫生',
          render(h, v, r) {
            return (
              <span>
                <a-rate value={r} disabled allow-half />
                <span class="ant-rate-text">{r}(星)</span>
              </span>
            );
          },
        },
        {
          name: 'fileDTOS',
          label: '图片',
          render(h, model) {
            return model.fileDTOS?.length ? (
              <app-imgs-display files={model.fileDTOS} />
            ) : (
              '无'
            );
          },
        },
        {
          name: 'descr',
          label: '评价内容',
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
        `GET:/project-merchant/stall-evaluation-records/${id}`,
        {
          projectId: this.project.id,
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
.sqxx-container {
  height: 400px;
}
.sbxx-container {
  min-height: 100px;
  background-color: #fff;
}
.mt16 {
  margin-top: 16px;
}
.dw-container {
  padding: 0 20px;
}
.footer-btns {
  margin: 16px 0;
}
/deep/ .app-table-page-layout .table-container{
  overflow: auto !important;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
.app-table-page-layout .table-container{
  overflow: auto !important;
}
</style>
