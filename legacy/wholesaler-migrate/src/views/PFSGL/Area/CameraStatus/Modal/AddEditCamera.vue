<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="800" :confirm-loading="loading" @ok="handleSubmit")
    app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="90")
      a-form-model-item(label="名称" prop="name" )
        a-input(v-model="model.name" )
      a-form-model-item(label="启用" prop="enabled" )
        a-switch(v-model="model.enabled")
      a-form-model-item(label="BIM视角" prop="cameraState" )
        //- a-input.p1.mb1(:value="model.bimInfo ? `x: ${model.bimInfo.x}, y: ${model.bimInfo.y}, z: ${model.bimInfo.z}` : ''" read-only)
        div.camera-box
          AppModelSelect(ref="bim" v-model="model.bimInfo" :bimInfo="model.bimInfo" :disableCoordinate="true")
        
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
      title: '添加模型视角',
      model: {
        name: null,
        enabled: true,
        cameraState: null,
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
        enabled: [{ required: true, message: '必填项' }],
        // cameraState: [{ required: true, message: '必填项' }],
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
      this.title = model === undefined ? '添加模型视角' : '编辑模型视角';
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      const cameraState = this.$refs.bim.$refs.bim.getCameraStatus();
      if (valid) {
        this.loading = true;
        this.$restful(`save:/project-merchant/forms`, {
          ...this.model,
          projectId: this.project.id,
        })
          .then(() => {
            this.$message.success(this.title + '成功!');
            this.hide();
            this.$emit('modal-success');
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    handleContractChange(info) {
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-item {
  padding-left: 90px;
  margin: -10px 0 16px 0;
}
.camera-box {
  height: 400px;
  border: 1px solid #ddd;
}
</style>
