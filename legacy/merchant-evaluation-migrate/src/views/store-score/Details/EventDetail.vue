<template lang="pug">
app-page-layout.no-bg-body(title='档位详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(
              :baseInfo='model',
              :fields='fields',
              :labelWidth='170',
              :colspans='colspans'
            )
    a-row.mt16
      app-card
        .dw-container
          a-tabs(:active-key='activeKey', @change='(tab) => (activeKey = tab)')
            //- a-tab-pane(:key='1', tab='巡检扣分')
            //-   .tab-panel-container
            //-     SafetyList(:id='id')
            a-tab-pane(:key='1', tab='评价记录')
              .tab-panel-container
                EvaluationRecordList(:id='id')
            a-tab-pane(:key='2', tab='修改记录')
              .tab-panel-container
                ReviseRecordList(:id='id')
            a-tab-pane(:key='3', tab='评价分析')
              .tab-panel-container
                EvaluationAnalysis(:id='id') 
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import CreateRecord from '../Modal/CreateRecord';
import SafetyList from './SafetyList';
import EvaluationRecordList from './EvaluationRecordList';
import ReviseRecordList from './ReviseRecordList';
import EvaluationAnalysis from './EvaluationAnalysis'; //评价分析
import { mapGetters } from 'vuex';
export default {
  name: 'detail',
  components: {
    CreateRecord,
    SafetyList,
    EvaluationRecordList,
    ReviseRecordList,
    EvaluationAnalysis,
  },
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
          name: 'name',
          label: '档位名称',
        },
        {
          name: 'companyName',
          label: '所属商户',
          render(h, v, r) {
            return r || '--';
          },
        },
        {
          name: 'owner',
          label: '所属人姓名',
          render(h, v, r) {
            return r || '--';
          },
        },
        {
          name: 'mobile',
          label: '电话号码 ',
        },
        {
          name: 'score',
          label: '今年安全生产值（分）',
        },
        {
          name: 'honestyScore',
          label: '诚信经营值（星）',
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
          name: 'zScoreAvg',
          label: '商品质量（星）',
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
          name: 'zScoreAvg',
          label: '诚实守信（星）',
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
          name: 'tScoreAvg',
          label: '服务态度（星）',
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
          name: 'wScoreAvg',
          label: '环境卫生（星）',
          render(h, v, r) {
            return (
              <span>
                <a-rate value={r} disabled allow-half />
                <span class="ant-rate-text">{r}(星)</span>
              </span>
            );
          },
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
      this.model = await this.$restful(`GET:/project-merchant/stall-score/${id}`, {
        projectId: this.project.id,
      });
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
.dw-container {
  height: 450px;
}
.tab-pane-container,
.tab-panel-container {
  height: 100% !important;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
