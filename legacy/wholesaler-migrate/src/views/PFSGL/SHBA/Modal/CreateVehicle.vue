<template lang="pug">
app-modal(
  v-model='visible',
  :title='title',
  :width='500',
  :confirm-loading='loading',
  @ok='handleSubmit',
  @cancel='hide'
)
  app-form(
    :model='model',
    :rules='rules',
    ref='form',
    oneline,
    :labelWidth='90'
  )
    a-form-model-item(label='车牌号', prop='vehiclePlate')
      a-input(v-model="model.vehiclePlate" placeholder="请输入车牌号")
    a-form-model-item(label="车型" prop="vehicleType")
      app-remote-select(
        placeholeder="请选择车型"
        v-model='model.vehicleType',
        api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-vehicleType" 
        :field="{name:'code', label: 'name'}"
        )
    a-form-model-item(label="所在档位" prop="stallId")
      app-remote-dialog-select(
        title="选择档位"
        v-model='model.stallId',
        placeholder="请选择"
        modelName='Space',
        rowKey='id',
        selectionMode="single"
        :options.sync="model.spaceDTOS"
        :columns='["name", "acreage", "area", "deptName", "tradeModel","companyName"]',
        api='/project-merchant/spaces/page',
        :params='params',
        :field='{ name: "id", label: "name" }',
        :filterFieleds='filterFieleds',
        :filters='filters'
        :width="1200"
        @change="handleStallChange"
      )
    a-form-model-item(label='所属人', prop='owner')
      a-input(v-model="model.owner" placeholder="请输入所属人")
    a-form-model-item(label='颜色', prop='color')
      a-input(v-model="model.color" placeholder="请输入车辆颜色")
    a-form-model-item(label='联系电话', prop='mobile') 
      a-input(v-model="model.mobile" placeholder="请输入联系电话")
    a-form-model-item(label='图片') 
      app-upload-imgs(v-model="model.fileIds" :files.sync="model.fileDTOS")
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
      title: '创建诉求',
      filters: {},
      filterFieleds: [],
      model: {
        vehiclePlate: null,
        vehicleType: null,
        color: null,
        owner: null, // 是否加急
        mobile: null,
        fileIds: [],
      },
      rules: {
        vehiclePlate: [{ required: true, message: '必填项' }],
        vehicleType: [{ required: true, message: '必填项' }],
        color: [{ required: true, message: '必填项' }],
        owner: [{ required: true, message: '必填项' }],
        mobile: [{ required: true, message: '必填项' }],
        stallId: [{ required: true, message: '必填项' }],
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return { projectId: this.project.id };
    },
  },
  async created() {
    this.initFilters();
  },
  methods: {
    show(model) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.title = model?.id ? '编辑车辆信息' : '添加车辆信息';
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        vehiclePlate: null,
        vehicleType: null,
        color: null,
        owner: null, // 是否加急
        mobile: null,
      };
    },
    initFilters() {
      this.filterFieleds = [
        {
          name: 'areaId',
          placeholder: '请选择所属区域',
          width: '250px',
          component: 'app-cascader',
          api: '/project-merchant/areas/all-graph',
          params: { projectId: this.project.id },
          mode: 'single',
        },
        {
          name: 'deptId',
          component: 'app-tree-select',
          width: '150px',
          uid: 'dept',
          placeholder: '请选择部门',
          api: '/ouaa/authenticated/organizations/list?pageNumber=1&pageSize=999',
          params: { projectId: this.project.id },
          // field:{},
          dataFormatter: (data) => {
            data[0].selectable = false;
            return data;
          },
        },
      ];
    },
    handleStallChange(v, select) {
      // this.model.companyId = select?.companyId;
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.$restful(
          `${this.model?.id ? 'PUT' : 'POST'}:/project-merchant/wholesaler-vehicle`,
          {
            ...this.model,
          },
        )
          .then((res) => {
            this.$emit('modal-success', res, this.model.description);
            this.$message.success('保存成功!');
            this.hide();
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
