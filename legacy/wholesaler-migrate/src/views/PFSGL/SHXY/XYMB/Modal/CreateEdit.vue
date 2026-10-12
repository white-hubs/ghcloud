<template lang="pug">
app-page-layout(
  fix-header
)
  div.train-coursewares.my3.px3.abs-fit.overflow-auto    
    app-form(
      :model='model',
      :rules='rules',
      ref='form'
      oneline
      :labelWidth="100"
    )
      a-form-model-item(label='名称', prop='name')
        a-input(v-model='model.name' placeholder="请输入名称") 
      a-form-model-item(label='协议类型',prop="type")
        app-remote-select(
          placeholeder="请选择"
          v-model='model.type',
          api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-protocolType" 
          :field="{name:'code', label: 'name'}"
        )
      a-form-model-item(label='协议附件', prop='protocolFileIds')
        appUploadFiles(v-model="model.protocolFileIds" :files.sync="model.protocolFileDTOS" :useCenterApi="true" :fileNumberLimit="4" :fileSizeLimit="100" :btn-label="'上传视频'")
      a-form-model-item(label="备注" prop="remark")
        a-textarea(v-model="model.remark" placeholder="请输入备注" :maxlength="200" allow-clear )
    .mt2
      a-button(
        type='primary',
        @click='handleSubmit("save")',
        :disabled='!!loading',
        :loading='loading === "save"'
      ) 保存
      app-link-btn.ml1(to='/agreement-mould') 
        a-button 取消
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      colspans: {
        md: 8,
        sm: 24,
      },
      id: null,
      model: {
        projectId: null,
        name: '',
        type: '',
        remark: null,
        protocolFileIds: [],
        protocolFileDtos: [],
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
        type: [{ required: true, message: '必填项' }],
        protocolFileIds: [{ required: true, message: '必填项' }],
      },
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return { projectId: this.project.id };
    },
  },
  async created() {
    this.id = this.$route.params.id;
    if (this.id) {
      this.loadModel(this.$route.params.id);
    }
  },
  methods: {
    async loadModel(id) {
      if (id) {
        const model = await this.$restful(
          `GET:/project-merchant/wholesaler-protocol-template/${id}`,
          {
            id: id,
          },
        );
        this.model = {
          ...model,
          protocolFileIds: model?.protocolFileDtos
            ? model?.protocolFileDtos?.map((f) => f.id)
            : null,
        };
      }
    },
    async handleSubmit(type) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        if (this.id) {
          // 修改
          try {
            this.loading = type;
            await this.$restful('PUT:/project-merchant/wholesaler-protocol-template', {
              ...this.model,
              projectId: this.project.id,
            });
            this.$message.success('保存成功。');
            try {
              this.$back();
            } catch {
              this.$router.push({ path: '/train-coursewares' });
            }
          } finally {
            this.loading = false;
          }
        } else {
          // 新增
          try {
            this.loading = type;
            await this.$restful('POST:/project-merchant/wholesaler-protocol-template', {
              ...this.model,
              projectId: this.project.id,
            });
            this.$message.success('保存成功。');
            try {
              this.$back();
            } catch {
              this.$router.push({ path: '/train-coursewares' });
            }
          } finally {
            this.loading = false;
          }
        }
      }
    },
    handleCancel() {
      this.$back();
    },
  },
};
</script>
<style lang="less">
.train-coursewares {
  width: 500px;
}
.ant-input-affix-wrapper.ant-input-affix-wrapper-textarea-with-clear-btn .ant-input{
  float: left;
}
</style>
