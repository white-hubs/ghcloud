<template lang="pug">
app-page-layout.no-bg-body(title='配置详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(
              :baseInfo='model',
              :fields='fields',
              :labelWidth='170'
            )
          app-card(title='图片信息', v-if='model.fileDTOS.length > 0')
            .imgs
              app-imgs-display(:files='model.fileDTOS')
              //- span(v-else) 暂无图片
          app-card(title='评价结果', v-if='statu == "Handled"')
            .result 
              span 结果
              .content {{ model.examineStatus == "1" ? "通过" : "未通过" }}
            .result 
              span 备注
              .areaText {{ model.examineRemark ? model.examineRemark : "--" }}

    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
      app-link-btn(v-if='statu == "noHandled"') 
        a-button.handled(type='primary', @click='handledModal(model)') 处理
  a-modal(
    :visible='visible',
    @cancel='closeImg',
    :width='800',
    title='处理评价',
    @ok='save'
  )
    app-form(
      :model='models',
      :rules='rules',
      ref='form',
      :labelWidth='90',
      oneline
    )
      a-form-model-item(label='评价人', prop='nickname')
        a-input.border(v-model='models.nickname', disabled)
      a-form-model-item(label='评价时间', prop='nickname')
        a-input.border(v-model='models.createTime', disabled)
      a-form-model-item(label='评价内容', prop='descr')
        a-input.border(v-model='models.descr', disabled)
        .picBox(v-if='model.fileDTOS.length > 0')
          //- img(:url='baseUrL+item.path' v-for='item in model.fileDTOS' :key='item.id')
          app-imgs-display(:files='model.fileDTOS')
      a-form-model-item(label='结果', prop='examineStatus')
        a-select.handledSelect(v-model='models.examineStatus')
          a-select-option(
            :value='item.value',
            v-for='item in selectArr',
            :key='item.value'
          ) {{ item.lable }}
      a-form-model-item(label='备注', prop='examineRemark')
        a-input(
          v-model='models.examineRemark',
          type='textarea',
          :maxLength='150'
        )
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: '',
  components: {},
  data() {
    return {
      activeKey: 1,
      colspans: {
        md: 8,
        sm: 12,
      },
      model: { fileDTOS: [] },
      // 筛选
      filters: {},
      filterFieleds: [],
      companyData: [],
      fields: [
        {
          name: 'code',
          label: '档位名称',
        },
        {
          name: 'stallName',
          label: '所属商户',
        },
        {
          name: 'username',
          label: '所属人姓名',
        },
        {
          name: 'score',
          label: '诚信经营值（星）',
        },
        {
          name: 'nickname',
          label: '评价人',
        },
        {
          name: 'createTime',
          label: '评价时间',
        },
        {
          name: 'descr',
          label: '评价内容',
        },
      ],
      loading: false,
      selectArr: [
        { value: '1', lable: '通过' },
        { value: '2', lable: '不通过' },
      ],
      visible: false,
      models: {
        name: null,
        fileDTOS: [],
        examineStatus: '1',
        examineRemark: '', //备注
      },
      rules: {
        examineStatus: [{ required: true, message: '必填项' }],
      },
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
    statu() {
      const statu = this.$route.params.statu;
      return statu;
    },
  },
  async created() {
    this.loadModel(this.id);
  },
  methods: {
    async loadModel(id) {
      this.model = await this.$restful(
        `GET:/project-merchant/stall-evaluation-records/${id}`,
      );
    },
    handleCreate() {
      this.$refs.record.show();
    },
    handleCompanyDetail() {},
    back() {
      this.$back();
    },
    //关闭图片模态框
    closeImg() {
      this.visible = false;
    },
    //打开处理模态框
    handledModal(data) {
      this.visible = true;
      this.models = { ...data, examineStatus: '1' };
    },
    //点击确定,发送处理结果
    async save() {
      const valid = await this.$refs.form.validate();

      if (valid) {
        this.$restful(`POST:/project-merchant/stall-evaluation-records/examine`, {
          ...this.models,
        }).then((res) => {
          this.$message.success('处理成功');
          this.visible = false;
          this.$router.go(-1);
        });
      }
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
.imgs {
  padding-left: 30px;
}
.footer-btns {
  margin: 16px 0;
  .handled {
    margin-left: 20px;
  }
}
.border {
  border: 0;
  background-color: white;
}
.picBox {
  height: 100px;
  display: flex;
  > img {
    height: 100px;
    width: 100px;
    margin-right: 20px;
  }
}
.handledSelect {
  width: 200px;
}
.result {
  display: flex;
  padding-left: 80px;
  .content {
    padding-left: 10px;
  }
  .areaText {
    padding: 0 12px;
    padding-bottom: 15px;
  }
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
