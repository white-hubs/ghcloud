<template lang="pug">
app-page-layout.no-bg-body(title='问卷分析', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        app-card(title='基本信息')
          app-card-base-info(:baseInfo="model.questionnaire" :fields="fields" :labelWidth="90" :colspans="colspans" v-if='model.questionnaire')
    a-row.mt16
      app-card(title='试题统计')
        .questions_container
          template(v-if='model.questionDtos')
            a-table(:columns="columns" :class='{"question_answer": item.type=="questionType_question_answer"}' :data-source="handlerTableData(item)" :pagination='false' :rowKey='record=>record.id' bordered v-for='item,index in model.questionDtos' :key='item.id')
             template( slot="ratios" slot-scope="text, record")
                a-progress(:percent="record.ratio")
             template(#title)
              .titleBox {{`${index+1}、${item.name}`}}
             template(#footer) 本题有效填写档位数
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
        { name: 'name', label: '调查名称' },
        // {
        //   name: 'type',
        //   label: '调查类型',
        //   render(h, r, v) {
        //     return <app-dict-display value={v} />;
        //   },
        // },
      ],
      loading: false,
      columns: [
        {
          key: 'value',
          title: '选项',
          dataIndex: 'value',
          width: '40%',
        },
        {
          key: 'count',
          title: '小计',
          dataIndex: 'count',
          width: '120px',
          align: 'center',
        },
        {
          key: 'ratio',
          title: '比例',
          dataIndex: 'ratio',
          scopedSlots: { customRender: 'ratios' },
        },
      ],
      dataSource: [],
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
        `GET:/project-merchant/wholesaler-questionnaire/analysis`,
        { id },
      );
    },
    //处理table中每一行的数据源
    handlerTableData(recode) {
      let arr = JSON.parse(recode.options).map((item, index) => {
        let Answer = this.filterAnswerAnalysItem(
          recode.answerAnalysisDTOS,
          item.label,
        );

        return { ...item, ...Answer, id: item.value + index };
      });
      // arr.push({value:"本题有效填写档位数",count:recode.stallCount})
      return arr;
    },
    //查找answerAnalysisDTOS 里面的数据
    filterAnswerAnalysItem(source, term) {
      let obj = source.filter((item) => item.option == term)[0];
      if (obj) {
        return obj;
      } else {
        return { count: 0, ratio: 0 };
      }
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
.titleBox {
  font-weight: bold;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
.question_answer {
  .ant-table-placeholder {
    display: none;
  }
  .ant-table-thead {
    display: none;
  }
}
</style>
