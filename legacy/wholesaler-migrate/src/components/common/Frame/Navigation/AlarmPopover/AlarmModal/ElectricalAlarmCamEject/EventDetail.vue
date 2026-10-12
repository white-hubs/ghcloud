<template lang="pug">
  div.event-detail
    appCard(title="报警预警事件")
      div.p2.px3
        AppCardBaseInfo(:baseInfo="eventData" :fields="fields" style="padding: 0; height: auto;" :labelWidth="false" :lineHeight="24")
        TriggerCondition(:triggers="[eventData]" :name="'触发设备'")
        //- LinkageActionResult(v-if="results&&results.length>0" :triggers="results")
        //- EventFlow(:flows="flows")
</template>

<script>
import TriggerCondition from '@/pages/CJLD/SBBJ/Details/TriggerCondition';
import LinkageActionResult from '@/pages/CJLD/SBBJ/Details/LinkageActionResult';
import EventFlow from '@/pages/CJLD/SBBJ/Details/EventFlow';

import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';

import CompareMapProvider from '@/pages/CJLD/CompareMapProvider';
export default {
  components: {
    TriggerCondition,
    LinkageActionResult,
    EventFlow,
  },
  mixins: [CompareMapProvider],
  props: {
    eventData: Object,
  },
  data() {
    return {
      loading: false,
      model: {},
      fields: [
        {
          name: 'eventCode',
          label: '日志ID',
        },
        {
          name: 'iotEventName',
          label: '事件名称',
          render(h, r, v) {
            return (
              <div>
                <span>{v}</span>
                <app-link-btn
                  class="ml2"
                  to={'/security-fire/devices/monitorDetail?id=' + r.id}
                >
                  处理报警
                </app-link-btn>
              </div>
            );
          },
        },
        // {
        //   name: 'eventType',
        //   label: '事件类型',
        //   render(h, model) {
        //     return <app-dict-display value={model.eventType} />;
        //   },
        // },
        {
          name: 'linkageName',
          label: '策略名称',
          isHide(model) {
            return !!model.linkageName;
          },
        },
        {
          name: 'triggeTime',
          label: '发生时间',
        },
        {
          name: 'eventStatus',
          label: '状态',
          render(h, model) {
            return <app-dict-display value={model.eventStatus} />;
          },
        },
      ],
      triggers: null,
      results: null,
      flows: null,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
  },
  mounted() {
    // this.loadModel();
  },
  methods: {
    // async loadModel() {
    //   const model = await this.$restful(
    //     'GET:/lnk/linkage-events/' + this.eventData.id,
    //   );
    //   this.model = {
    //     ...this.model,
    //     ...model,
    //   };
    //   this.triggers = this.model.triggerCondition;
    //   this.results = this.model.action;
    // },
    // async loadTriggers() {
    //   const triggers = await this.$restful(
    //     'GET:/lnk/linkages/' + this.model.linkageId,
    //   );
    //   this.triggers = triggers;
    // },
    // async loadResults() {
    //   const results = await this.$restful(
    //     'GET:/lnk/linkage-events/' + this.model.id,
    //   );
    //   this.results = results;
    // },
    // async loadFlows() {
    //   const flows = await this.$restful(
    //     'GET:/lnk/linkage-events/flow/' + this.eventData.id,
    //   );
    //   this.flows = flows;
    // },
    handleSubmit() {},
    handleContractChange(info) {
    },
  },
};
</script>

<style lang="less" scoped>
.event-detail {
  height: 400px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
