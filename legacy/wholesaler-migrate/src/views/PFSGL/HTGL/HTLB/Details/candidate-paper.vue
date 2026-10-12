<template lang="pug">
app-page-layout.no-bg-body(title='考试详情', showHeader, fix-header)
  div.my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='5')
        app-card
          .test_container
            div.test 考生得分
              div.totalQuestion {{model.userScore}}
            div.test 试卷总分
              div.totalScore {{model.totalScore}}
          .test_container
            div.test 试题总数
              div.totalQuestion {{model.totalQuestion}}
            div.test 及格分数
              div.totalScore {{model.passScore}}
      a-col(:sm='19')
        div.base-container
          app-card(title='试题')
            .questions_container
              .questions(v-for="(que,index) in model.questions")
                .questions_item
                  .questions_title {{groupNum[index]}}、 {{que.groupName}}
                .questionDTOS(v-for="(item,j) in que.questionDTOS")
                  .item
                    .title {{j+1}} 、{{item.name}}
                     trainSelect(v-if="item.type==='examQuestionType_select'",:data="item")
                     trainMult(v-if="item.type==='examQuestionType_mult_select'",:data="item")
                     trainJudge(v-if="item.type==='examQuestionType_judge'",:data="item")
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import trainMult from '../Modal/trainMult';
import trainJudge from '../Modal/trainJudge';
import trainSelect from '../Modal/trainSelect';
export default {
  name: 'detail',
  components: { trainMult, trainJudge, trainSelect },
  data() {
    return {
      groupNum: [
        '一',
        '二',
        '三',
        '四',
        '五',
        '六',
        '七',
        '八',
        '九',
        '十',
        '十一',
        '十二',
        '十三',
        '十四',
        '十五',
        '十六',
        '十七',
        '十八',
        '十九',
        '二十',
        '二一',
        '二二',
        '二三',
        '二四',
        '二五',
        '二六',
        '二七',
        '二八',
        '二九',
        '三十',
      ],
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      loading: false,
      taskId: '',
      userTaskId: '',
      userId: '',
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  async created() {
    if (this.$route.query) {
      this.userId = this.$route.query.userId;
      this.userTaskId = this.$route.query.userTaskId;
      this.taskId = this.$route.query.taskId;
      this.loadModel();
    }
  },
  methods: {
    async loadModel() {
      await this.$restful(`GET:/edu/exam-paper/user`, {
        taskId: this.taskId,
        userTaskId: this.userTaskId,
        userId: this.userId,
      }).then((res) => {
        this.model = {
          ...res,
        };
      });
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

.mt16 {
  margin-top: 16px;
}
.questions_container {
  padding: 20px;
}
.test_container {
  display: flex;
  margin-bottom: 20px;
  .test {
    flex: 1;
    padding: 20px 12px;
    font-size: 14px;
    font-family: Roboto-Regular, Roboto;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.44999998807907104);
    text-align: center;
    .totalScore,
    .totalQuestion {
      font-weight: 500;
      font-size: 24px;
      color: rgba(0, 0, 0, 0.8500000238418579);
      margin-top: 9px;
    }
  }
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
