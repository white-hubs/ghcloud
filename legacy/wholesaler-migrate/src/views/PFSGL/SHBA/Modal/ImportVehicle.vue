<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="500" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="90")
      a-form-model-item(label="选择文件" prop="files" )
        AppManualUpload(v-model="model.files" :files="model.fileDTOS" :fileNumberLimit="1" :fileSizeLimit="100" :btn-label="'上传EXCEL文件'")
        
        
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
      title: '导入车辆数据',
      model: {
        files: null,
        fileDTOS: [],
      },
      rules: {
        files: [{ required: true, message: '必填项' }],
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
  },
  mounted() {},
  methods: {
    show(model, action) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.action = action;
      this.title = model === undefined ? '导入车辆数据' : '导入车辆数据';
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        files: null,
        fileDTOS: [],
      };
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        const formData = new FormData();
        formData.append('file', this.model.files[0]);
        this.$restful(
          `POST:/project-merchant/wholesaler-vehicle/data-import?projectId=${this.project.id}`,
          formData,
          {
            processData: false,
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        )
          .then((errorData) => {
            this.hide();
            this.$emit('modal-success');
            if (errorData?.length) {
              this.$emit('modal-error', errorData);
              this.$message.error(this.title + '失败!');
            } else {
              this.$message.success(this.title + '成功!');
            }
          })
          .finally(() => {
            this.loading = false;
          });
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
