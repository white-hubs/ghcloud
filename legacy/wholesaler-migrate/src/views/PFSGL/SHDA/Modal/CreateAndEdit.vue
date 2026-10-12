<template lang="pug">
app-modal(:title= "model.id ? '编辑商户' : '添加商户'", v-model='visible', :width='800', @cancel='close')
  app-form(
    :model='model',
    :rules='rules',
    ref='form',
    oneline,
    :labelWidth='126'
  )
    a-form-model-item(label='商户名称', prop='name')
      a-input(v-model='model.name' placeholder="请输入商户名称" max-length=20)
    a-form-model-item(label='所属人姓名', prop='owner' max-length=20)
      a-input(v-model='model.owner' placeholder="请输入所属人姓名")
    a-form-model-item(label='电话号码', prop='mobile' max-length=11)
      a-input(v-model='model.mobile' placeholder="请输入电话号码")
    a-form-model-item(label='关联空间', prop='remark', v-if='!nosapce')
      app-remote-dialog-select(
        v-model='model.spaceIds',
        placeholder="请选择"
        modelName='Space',
        rowKey='id',
        :width="1200",
        title='关联空间',
        :columns='["name", "acreage", "area", "deptName", "attributeName", "tradeModelName"]',
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
    a-form-model-item(label="所属档位" prop="stallId")
      app-remote-dialog-select(
        title="选择所属档位"
        v-model='model.stallId',
        placeholder="请选择"
        modelName='Gear',
        hideKeyword
        showPageNumber
        rowKey='id',
        selectionMode="single"
        :options.sync="model.stallOptions"
        :columns='["code", "name", "typeName", "areaNames", "deptNames"]',
        api='/mdata/stall/page',
        :field='{ name: "id", label: "name" }',
        :filterFieleds='stallFilterFieleds',
        :filters='stallFilters'
        :width="1200"
        @change="handleStallChange"
      )
    a-form-model-item(label='安全协议', prop='securityFileIds')
      app-upload-files(
        v-model='model.securityFileIds',
        :files='model.securityFileVOS',
        :fileNumberLimit='1'
      )
    a-form-model-item(label='安全培训照片', prop='trainingPhotoFileIds')
      app-upload-imgs(
        v-model='model.trainingPhotoFileIds',
        :files='model.trainingPhotoFileVOS',
        :fileNumberLimit='8'
      )
    a-form-model-item(label='商户灭火器/消防栓', prop='companyPhotoFileIds')
      app-upload-imgs(
        v-model='model.companyPhotoFileIds',
        :files='model.companyPhotoFileVOS',
        :fileNumberLimit='8'
      )
    a-form-model-item(label='营业执照', prop='businessLicenseFileList')
      app-upload-imgs(
        v-model='model.businessLicenseFileList',
        :files='model.businessLicenseFileVOS',
        :fileNumberLimit='3'
      )
    a-form-model-item(label='营业期限')
      a-radio-group(v-model="model.longTerm")
        a-radio(
          :value="true"
          :style="{ display: 'block', height: '30px', lineHeight: '30px' }"
        ) 
          span 长期
        a-radio(
          :value="false" 
          :style="{ display: 'block', height: '30px', lineHeight: '30px' }"
        ) 
          span.mr1 自定义日期
          a-range-picker(
            v-if='model.longTerm !== null && !model.longTerm'
            v-model="businessTerm" 
            format="YYYY-MM-DD"
            valueFormat='YYYY-MM-DD'
          )
    a-form-model-item(label='经营信息', prop='introduction')
      a-textarea(v-model='model.introduction', :max-length='100' placeholder="请输入经营信息")
    a-form-model-item(label='附件', prop='companyFileIds')
      app-upload-files(
        v-model='model.companyFileIds',
        :files='model.companyFileIdsFileVOS',
        :fileNumberLimit='100'
      )
    a-form-model-item(label='备注', prop='remark')
      a-textarea(v-model='model.remark', :max-length='100' placeholder="请输入备注")
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
      businessTerm: [],
      stallInfo: null,
      model: {
        name: null,
        owner: null,
        mobile: null,
        spaceIds: [],
        stallId: null,
        stallOptions: null,
        securityFileIds: [],
        securityFileDTOS: [],
        companyFileIds: [],
        companyFileIdsFileDTOS: [],
        companyFileIdsFileVOS: [],
        trainingPhotoFileIds: [],
        trainingPhotoFileDTOS: [],
        companyPhotoFileIds: [],
        businessLicenseFileList: [],
        longTerm: null,
        companyPhotoFileDTOS: [],
        businessLicenseFileVOS: [],
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
      stallFilters: {
        enabled: true
      },
      stallFilterFieleds: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        projectId: this.project?.id,
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
        width: '160px',
        component: 'app-cascader',
        api: '/project-merchant/areas/all-graph',
        params: { projectId: this.project.id },
        mode: 'single',
      },
    ];
    this.stallFilterFieleds = [
      {
        name: 'keyword', 
        placeholder: '请输入关键字',
        width: '200px',
        component: 'a-input-search',
        customStyle: {
          'marginRight': '10px',
        },
      },
      {
        name: 'type', 
        placeholder: '请选择档位类型',
        width: '150px',
        component: 'app-cascader',
        api: '/mdata/stall-category/list',
        params: { projectId: this.project.id },
        mode: 'single',
      },
      {
        name: 'areaId',
        placeholder: '请选择所属区域',
        width: '200px',
        component: 'app-cascader',
        api: '/mdata/area/list',
        params: { projectId: this.project.id },
        mode: 'single',
      },
      {
        name: 'departmentId',
        component: 'app-tree-select',
        width: '200px',
        uid: 'dept',
        placeholder: '请选择部门',
        api: '/ouaa/authenticated/organizations/list?enabled=true',
        params: { projectId: this.project.id },
        dataFormatter: (data) => {
          data[0].selectable = false;
          return data;
        },
      },
    ];
  },
  methods: {
    handleStallChange(v, select) {
      this.stallInfo = select
      if(select){
        this.model.stallId = select.id
        this.model.stallName = select.name
      }
    },
    show(model) {
      this.model = { ...this.model, ...model };
      this.model.companyFileIds = []
      this.model.companyFileIdsFileDTOS = []
      this.model.companyFileIdsFileVOS = []
      if (model.id) {
        this.loadModel();
      }
      this.visible = true;
    },
    async loadModel() {
      const model = await this.$restful('GET:/project-merchant/companies/' + this.model.id);
      const trainingPhoto = model.trainingPhotoFileDTOS || model.trainingPhotoFileVOS
      const companyPhoto = model.companyPhotoFileDTOS || model.companyPhotoFileVOS
      const security = model.securityFileDTOS || model.securityFileVOS
      const company = model.companyFileIdsFileDTOS || model.companyFileIdsFileVOS
      const businessLicense = model.businessLicenseFileVOS || model.businessLicenseFileDTOS
      
      this.model.companyFileIds = []
      this.model.companyFileIdsFileDTOS = []
      this.model.companyFileIdsFileVOS = []
      this.model = {
        ...this.model,
        ...model,
        spaceIds: model.spaces?.map((item) => item.id),
        stallId: model?.stallId,
        stallName: model?.stallName,
        securityFileIds: security?.map((item) => item.id),
        companyFileIds: company?.map((item) => item.id),
        trainingPhotoFileIds: trainingPhoto?.map(
          (item) => item.id,
        ),
        companyPhotoFileIds: companyPhoto?.map((item) => item.id),
        businessLicenseFileList: businessLicense?.map((item) => item.id),
      };
      this.businessTerm = model.longTerm ? [] : model.startTime && model.endTime ? [model.startTime, model.endTime] : []
      this.stallInfo = {
        id: model.stallId,
        name: model.stallName,
      }
      this.model.stallOptions = [
        {
          id: model.stallId,
          name: model.stallName,
        }
      ]
    },
    async handleSubmit(proceed) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = proceed ? 'process' : 'save';
          const res = await this.$restful(`save:/project-merchant/companies`, {
            ...this.model,
            startTime: this.model.longTerm ? '' : this.businessTerm.length > 0 ? this.businessTerm[0] : '',
            endTime: this.model.longTerm ? '' : this.businessTerm.length > 0 ? this.businessTerm[1] : '',
            projectId: this.project.id,
            stallId: this.model?.stallId || '',
            stallName: this.model?.stallName || '',
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
        stallId: null,
        securityFileIds: [],
        securityFileDTOS: [],
        companyFileIds: [],
        companyFileIdsFileDTOS: [],
        trainingPhotoFileIds: [],
        trainingPhotoFileDTOS: [],
        companyPhotoFileIds: [],
        businessLicenseFileList: [],
        longTerm: null,
        companyPhotoFileDTOS: [],
        businessLicenseFileVOS: [],
        introduction: null,
      };
      this.businessTerm = []
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

<style lang="less" scoped>
:deep(.ant-modal .ant-modal-body .ant-form .ant-form-item-label) {
  width: 120px !important;
}
</style>