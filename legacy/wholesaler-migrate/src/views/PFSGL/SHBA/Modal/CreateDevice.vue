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
    :labelWidth='100'
  )
    a-form-model-item(label='设备类型', prop='typeId')
      app-tree-select(
        placeholeder="请选择"
        v-model='model.typeId',
        api="/project-merchant/wholesaler-device-types/all-graph" 
        )

    a-form-model-item(label="所属档位" prop="stallId")
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
      //- app-remote-select(v-model="model.stallId" api="/project-merchant/wholesaler/stall" :params="params" allow-clear placeholder="请选择所在档位")
    a-form-model-item(label="数量" prop="count")
      a-input-number(v-model="model.count" allow-clear :min="0" placeholder="请输入数量")
    //- a-form-model-item(label="危险品" prop="danger")
    //-   a-radio-group(v-model="model.danger")
    //-     a-radio(:value="0") 是
    //-     a-radio(:value="1") 否
    a-form-model-item(label='描述') 
      a-textarea(v-model='model.description' placeholder="请输入描述")
    a-form-model-item(label='图片') 
      app-upload-imgs(v-model="model.fileIds" :files.sync="model.fileDTOS")
</template>

<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';
// import axios from '../../../../../utils/axios.js';
export default {
  components: {},
  data() {
    return {
      visible: false,
      loading: false,
      title: '添加设备',
      filters: {},
      filterFieleds: [],
      model: {
        typeId: null,
        count: null,
        danger: null,
        fileIds: [], // 是否加急
        description: null,
      },
      typeId: null,
      rules: {
        typeId: [{ required: true, message: '必填项' }],
        count: [{ required: true, message: '必填项' }],
        danger: [{ required: true, message: '必填项' }],
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
    //看数据用
    // getData(params) {
    //     return axios({
    //         url: '/project-merchant/wholesaler-device-types/all-graph',
    //         method: 'GET',
    //         params,
    //     });
    // },
    // async getList() {
    //     const res = await this.getData();
    // },
    show(model) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.title = model?.id ? '编辑设备' : '添加设备';
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        vehiclePlate: null,
        vehicleType: null,
        color: null,
        owner: null,
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
    handleStallChange(v, select) { },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        // 编辑
        this.$restful(
          `${this.model?.id ? 'PUT' : 'POST'}:/project-merchant/wholesaler-device`,
          {
            ...this.model,
          },
        )
          .then((res) => {
            this.$emit('modal-success', res);
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
