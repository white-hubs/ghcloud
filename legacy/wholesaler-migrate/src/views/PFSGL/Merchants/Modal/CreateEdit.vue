<template lang="pug">
app-modal(title='添加商户', v-model='visible', :width='800', @cancel='close')
  app-form(
    :model='model',
    :rules='rules',
    ref='form',
    oneline,
    :labelWidth='126'
  )
    a-form-model-item(label='商户名称', prop='name')
      a-input(v-model='model.name')
    a-form-model-item(label='所属人姓名', prop='owner')
      a-input(v-model='model.owner')
    a-form-model-item(label='电话号码', prop='mobile')
      a-input(v-model='model.mobile')
    a-form-model-item(label='关联空间', prop='remark', v-if='!nosapce')
      app-remote-dialog-select(
        v-model='model.spaceIds',
        modelName='Space',
        rowKey='id',
        :width="1200"
        :columns='["name", "acreage", "area", "deptName", "attribute", "tradeModel"]',
        api='/project-merchant/spaces/company/page',
        :params='params',
        :field='{ name: "id", label: "name" }',
        :dataFormatter='(res) => res.records',
        :options.sync='model.spaces',
        :filterFieleds='filterFieleds',
        :filters='filters',
        @update:options='handleSelectionChange',
        @change='handleElementChange'
      )
    a-form-model-item(label='安全协议', prop='securityFileIds')
      app-upload-files(
        v-model='model.securityFileIds',
        :files='model.securityFileDTOS',
        :fileNumberLimit='1'
      )
    a-form-model-item(label='安全培训照片', prop='trainingPhotoFileIds')
      app-upload-imgs(
        v-model='model.trainingPhotoFileIds',
        :files='model.trainingPhotoFileDTOS',
        :fileNumberLimit='8'
      )
    a-form-model-item(label='商户灭火器/消防栓', prop='companyPhotoFileIds')
      app-upload-imgs(
        v-model='model.companyPhotoFileIds',
        :files='model.companyPhotoFileDTOS',
        :fileNumberLimit='1'
      )
    a-form-model-item(label='经营信息', prop='introduction')
      a-textarea(v-model='model.introduction', :max-length='100')
    a-form-model-item(label='备注', prop='remark')
      a-textarea(v-model='model.remark', :max-length='100')
  template(#footer)
    a-button(@click='handleCancel()') 取消
    a-button.ml2(
      :disabled='!!loading',
      type='primary',
      :loading='loading === "save"',
      @click='handleSubmit(false)'
    ) 确定
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  // components: { ResourceSelect },
  props: {
    nosapce: Boolean,
  },
  data() {
    return {
      visible: false,
      loading: false,
      model: {
        name: null,
        owner: null,
        mobile: null,
        spaceIds: [],
        securityFileIds: [],
        securityFileDTOS: [],
        trainingPhotoFileIds: [],
        trainingPhotoFileDTOS: [],
        companyPhotoFileIds: [],
        companyPhotoFileDTOS: [],
        introduction: null,
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
        owner: [{ required: true, message: '必填项' }],
        // mobile: [{ required: true, message: '必填项' }],
      },
      parentlevel: 0,
      action: null,
      filterFieleds: [],
      filters: {
        search: null,
        modelFileId: null,
        buildingId: null,
        levelId: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        projectId: this.project.id,
      };
    },
    levelParams() {
      return { typeCode: this.model.type };
    },
  },
  async created() {
    this.filterFieleds = [
      {
        name: 'areaId',
        placeholder: '请选择所属区域',
        width: '150px',
        component: 'app-cascader',
        api: '/project-merchant/areas/all-graph',
        params: { projectId: this.project.id },
        mode: 'single',
      },
    ];
  },
  methods: {
    show(model) {
      this.model = { ...this.model, ...model };
      if (model.id) {
        this.loadModel();
      }
      this.visible = true;
    },
    async loadModel() {
      const model = await this.$restful('GET:/project-merchant/companies/' + this.model.id);
      this.model = {
        ...this.model,
        ...model,
        spaceIds: model.spaces?.map((item) => item.id),
        securityFileIds: model.securityFileDTOS?.map((item) => item.id),
        trainingPhotoFileIds: model.trainingPhotoFileDTOS?.map(
          (item) => item.id,
        ),
        companyPhotoFileIds: model.companyPhotoFileDTOS?.map((item) => item.id),
      };
    },
    async handleSubmit(proceed) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = proceed ? 'process' : 'save';
          const res = await this.$restful(`save:/project-merchant/companies`, {
            ...this.model,
            projectId: this.project.id,
          });
          this.$emit('on-save', res);
          this.$message.success('保存成功。');
          if (proceed) {
            this.resetFieldsForProceed();
          } else {
            this.close();
          }
        } finally {
          this.loading = false;
        }
      }
    },
    handleCancel() {
      this.close();
    },
    close() {
      this.visible = false;
      this.reset();
      this.model = {
        name: null,
        owner: null,
        mobile: null,
        spaceIds: [],
        securityFileIds: [],
        securityFileDTOS: [],
        trainingPhotoFileIds: [],
        trainingPhotoFileDTOS: [],
        companyPhotoFileIds: [],
        companyPhotoFileDTOS: [],
        introduction: null,
      };
    },
    reset() {
      this.$refs.form.resetFields();
    },
    resetFieldsForProceed() {
      this.$refs.form.resetFields();
    },
    handleSelectionChange(selection) {
      // debugger;
      // this.model.spaceIds
    },
    handleElementChange(select, option) {
      // 构件改变
      // if (select) {
      //   const data = option;
      //   this.model.remark = {
      //     ecode: data.elementCode,
      //     ename: data.name,
      //     modelLevel: data.levelName,
      //     modelLevelId: data.levelId,
      //     modelLevelName: data.levelName,
      //     modelFileId: data.modelFileId,
      //     objectId: data.objectId,
      //   };
      // } else {
      //   this.model.remark = {};
      // }
    },
  },
};
</script>
