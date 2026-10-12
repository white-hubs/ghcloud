<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="500" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="100" )
      a-form-model-item(label="类型")
        a-radio-group(v-model="model.type")
          a-radio( :value="true") 相加
          a-radio( :value="false") 相减
      a-form-model-item( label="分值" prop="point" )
        a-input-number(placeholder="请输入分值" v-model="model.point" :min="1")
      a-form-model-item(label="备注")
        a-textarea(v-model="model.remark" placeholder="请输入备注信息")
    template(slot="footer")
      a-button(@click="hide") 取消
      a-button(type="primary" :loading="loading" @click="handleSubmit") 保存
</template>

<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';

export default {
  components: {},
  data() {
    return {
      visible: false,
      loading: false,
      title: '添加安全生产值',
      model: {
        type: true,
        stallId: null,
        point: null,
        remark: null,
        createDay: null,
      },
      rules: {
        point: [{ required: true, message: '必填项' }],
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return {
        projectId: this.project.id,
      };
    },
  },
  mounted() {},
  methods: {
    show(model) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        type: true,
        stallId: null,
        point: null,
        remark: null,
        createDay: null,
      };
      this.loading = false;
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        await this.$restful(`POST:/project-merchant/stall-safety-mark-logs`, {
          stallId: this.model.stallId,
          point: this.model.type ? this.model.point : '-' + this.model.point,
          remark: this.model.remark,
        });
        this.$emit('on-save');
        this.$message.success('保存成功。');
        this.visible = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-item {
  padding-left: 90px;
  margin: -10px 0 16px 0;
}
</style>
<style lang="less">
.label-width-120 {
  .ant-form-item-label {
    width: 125px !important;
  }
}
</style>
