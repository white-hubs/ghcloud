<template lang="pug">
app-page-layout.no-bg-body(title='调查详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        app-card(title='基本信息')
          app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90" :colspans="colspans")
    a-row.mt16
      app-card
        .questions_container
          .questions(v-for="(que,index) in model.questionDtos")
            .questions_item
              .questions_title {{index+1}}、 {{que.name}}
                .questions_type
                   app-dict-display(:value="que.type") 
            .questionDTOS
              .item
                  trainSelect(v-if="que.type==='questionType_select'",:data="que")
                  trainMult(v-if="que.type==='questionType_mult_select'",:data="que")
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import trainMult from '../Modal/trainMult';
import trainSelect from '../Modal/trainSelect';
export default {
  name: 'detail',
  components: { trainMult, trainSelect },
  data() {
    return {
      colspans: {
        // md: 8,
        sm: 12,
      },
      model: {},
      fields: [
        {
          name: 'name',
          label: '名称',
          render(h, r, v) {
            return r.questionnaire?.name || '--';
          },
        },
        {
          name: 'description',
          label: '调查描述',
          render(h, r, v) {
            return r.questionnaire?.description || '--';
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
  },
  async created() {
    this.loadModel();
  },
  methods: {
    async loadModel() {
      this.model = await this.$restful(
        `GET:/project-merchant/wholesaler-questionnaire/${this.$route.query.id}/${this.$route.query.stallId}`,
      );
    },
    back() {
      this.$back();
    },
  },
};
</script>
<style lang="less" scoped>
.base-container {
  min-height: calc(100vh - 300px);
  background-color: #fff;
}
.questions_container {
  padding: 20px;
}

.questions_type {
  display: inline-block;
  margin-left: 15px;
  color: #000;
}
.sqxx-container {
  height: 450px;
}

.train-plan {
  padding: 20px;
}

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
