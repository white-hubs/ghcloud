<template lang="pug">
app-page-layout.no-bg-body(
  fix-header
)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm="5")
        app-card
          div.question_types
            div.que_title 题型
            .btn_group
              a-button.ml2(
                type='primary',
                icon='plus',
                @click="handleAdd('questionType_select')",
              ) 单选题
              a-button.ml2(
                type='primary',
                icon='plus',
                @click="handleAdd('questionType_mult_select')",
              ) 多选题
              a-button.ml2(
                type='primary',
                icon='plus',
                @click="handleAdd('questionType_question_answer')",
              ) 问答题
      a-col(:sm="19")
        div.base-container
          app-form(ref="ruleForm",:model="model",:rules="rules",:labelWidth="100",oneline)
            a-row
              a-col(:sm="7")
                a-form-model-item(label="模板名称:",prop="name")
                  a-input(placeholder='请输入模板名称',v-model="model.name" :maxLength="50")
              a-col(:sm="7")
                a-form-model-item(label="调查类型",prop="type")
                  app-remote-select(
                    placeholeder="请选择"
                    v-model='model.type',
                    api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-questionnaireType" 
                    :field="{name:'code', label: 'name'}"
                  )   
          .question_container 
            .questions(v-for="(que,i) in questionDtos")
              .item 
                .subject
                  div {{i+1}} 、
                    app-dict-display(:value="que.type")
                  div
                    app-link-btn(@click="deleteTest(i)") 删除
                //- 单选
                div.train_select(v-if="que.type==='questionType_select'")
                  div.margin_mb
                    a-textarea(v-model="que.name",placeholder="请输入题目")
                  a-radio-group(v-model="que.answer")
                    a-radio(v-for='(radio,j) in que.options', :value='radio.label', :key='radio.label',:style="radioStyle") {{radio.label}}、{{ radio.value }}
                      a-button(type="link",@click="handleDelete(i,j)") 删除
                  a-row
                    a-button.margin_mb(@click="handleAddSelect(i)") 添加选项
                    a-col.margin_mb(v-if="que.isSel")
                      a-input-search(v-model="que.value",placeholder="请输入选项",enter-button="保存",@search="handleTypeSelect($event,i)")
                //- 多选
                div.train_select(v-if="que.type==='questionType_mult_select'")
                  div.margin_mb
                    a-textarea(v-model="que.name",placeholder="请输入题目")
                  a-checkbox-group(v-model="que.answer")
                    a-checkbox(v-for='(radio,j) in que.options', :value='radio.label', :key='radio.label',:style="radioStyle") {{radio.label}}、{{ radio.value }}
                      a-button(type="link",@click="handleDelete(i,j)") 删除
                  a-row
                    a-button.margin_mb(@click="handleAddSelect(i)") 添加选项
                    a-col.margin_mb(v-if="que.isSel")
                      a-input-search(v-model="que.value",placeholder="请输入选项",enter-button="保存",@search="handleTypeSelect($event,i)")
                //- 问答     
                div.train_select(v-if="que.type==='questionType_question_answer'")
                  a-textarea(v-model="que.name",placeholder="请输入题目")
          .mt2
            a-button(
              type='primary',
              @click='handleSubmit',
              :disabled='!!loading',
              :loading='loading === "save"'
            ) 保存
            app-link-btn.ml1(to='/questionnaire-temp') 
              a-button 取消
</template>
<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {},
  data() {
    return {
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
      questionDtos: [],
      model: {
        name: null,
        type: null,
      },
      rules: {
        name: [
          {
            required: true,
            message: '必填项',
          },
        ],
        type: [
          {
            required: true,
            message: '必填项',
          },
        ],
      },
      loading: false,
      letter: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    id() {
      const id = this.$route.params.id;
      return id;
    },
    params() {
      return { projectId: this.project.id };
    },
  },
  async created() {
    if (this.id) {
      this.loadModel(this.id);
    }
  },
  methods: {
    async loadModel(id) {
      if (id) {
        const model = await this.$restful(
          `GET:/project-merchant/wholesaler-ques-temp/${id}`,
        );

        this.model = {
          ...model,
        };
        this.questionDtos = model.questionDtos.map((item) => {
          return {
            ...item,
            options: item.options ? JSON.parse(item.options) : null,
            isSel: false,
          };
        });
      }
    },
    handleAddSelect(index) {
      this.questionDtos[index].isSel = true;
    },
    handleTypeSelect(e, index) {
      if (e == '') {
        this.$message.error('选项内容不能为空');
      } else {
        var i = this.questionDtos[index].options.length || 0;
        this.questionDtos[index].options.push({
          value: e,
          label: this.letter[i],
        });
        this.questionDtos[index].value = '';
        this.questionDtos[index].isSel = false;
      }
    },
    // 删除选项
    handleDelete(i, j) {
      this.questionDtos[i].options.splice(j, 1);
      this.$nextTick(() => {
        this.questionDtos[i].options.map((ele, k) => {
          return (ele.label = this.letter[k]);
        });
      });
    },
    // 添加题型
    handleAdd(type) {
      if (type === 'examQuestionType_question_answer') {
        this.questionDtos.push({
          type: type,
          isSel: false,
        });
      } else {
        this.questionDtos.push({
          type: type,
          options: [],
          isSel: false,
        });
      }
    },
    deleteTest(i) {
      this.questionDtos.splice(i, 1);
    },
    async handleSubmit() {
      const valid = await this.$refs.ruleForm.validate();
      if (valid) {
        if (this.questionDtos && this.questionDtos.length === 0) {
          this.$message.info('请至少增加一道题!');
          return;
        }
        try {
          this.$restful('POST:/project-merchant/wholesaler-ques-temp', {
            ...this.model,
            projectId: this.project.id,
            questionDtos: this.questionDtos.map((item, i) => {
              return {
                // ...item,
                number: i,
                type: item.type,
                name: item.name,
                options: JSON.stringify(item.options),
              };
            }),
          }).then((res) => {
            this.$message.success('保存成功。');
            try {
              this.$back();
            } catch {
              //
            }
          });
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>
<style lang="less">
.train_select {
  .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    margin-left: 0;
  }
}
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
<style lang="less" scoped>
.question_types {
  padding: 20px;
  .que_title {
    font-weight: 500;
    font-size: 20px;
    color: rgba(0, 0, 0, 0.8500000238418579);
    margin-bottom: 9px;
  }
  .btn_group {
    display: flex;
    flex-wrap: wrap;
    .ml2 {
      margin-bottom: 10px;
    }
  }
}
.train_select {
  width: 600px;
}
.margin_mb {
  margin-bottom: 10px;
}
.base-container {
  padding: 20px;
  min-height: calc(100vh - 300px);
  background-color: #fff;
}

.question_container {
  .subject {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 15px;
    background: #f9f9f9;
    border-radius: 0px 0px 0px 0px;
    margin: 10px 0;
  }
  .questions {
    .group_item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      line-height: 48px;
      border-top: 1px dashed #e8e8e8;
      border-bottom: 1px dashed #e8e8e8;
      .group_title {
        font-size: 14px;
        font-family: PingFang SC-Medium, PingFang SC;
        font-weight: 600;
        color: #000 !important;
      }
    }
  }
}
</style>
