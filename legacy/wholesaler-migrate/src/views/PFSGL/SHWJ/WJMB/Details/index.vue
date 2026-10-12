<template lang="pug">
app-page-layout.no-bg-body(title='问卷模板详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        app-card(title='基本信息')
          app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90" :colspans="colspans")
    a-row.mt16
      app-card(title='问卷模板')
        .questions_container
          .questions(v-for="(que,index) in model.questionDtos")
            .questions_item
              div.p1.questions_type
                app-dict-display(:value="que.type") 
              .questions_title {{index+1}}、 {{que.name}}
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
        { name: 'name', label: '模板名称' },
        {
          name: 'typeName',
          label: '调查类型',
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
      this.model = await this.$restful(`GET:/project-merchant/wholesaler-ques-temp/${id}`);
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

.questions_item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.questions_type {
  margin-right: 15px;
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
