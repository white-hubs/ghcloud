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
    a-form-model-item(label='姓名', prop='nickname')
     a-input(v-model="model.nickname" placeholder="请输入姓名" :disabled="edit")
    a-form-model-item(label="性别" prop="gender")
      app-enum-select(v-model="model.gender" code="Gender" placeholder="请选择" :disabled="edit")
    a-form-model-item(label='电话号码', prop='mobile')
      a-input(v-model="model.mobile" allow-clear :max-length="100" placeholder="请输入手机号码" :disabled="edit")
    a-form-model-item(label='所在档位', prop='stallId') 
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
    a-form-model-item(label="职位" prop="owner")
      a-radio-group(v-model="model.owner")
        a-radio(:value="true") 档主
        a-radio(:value="false") 从业人员
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
      edit: false,
      model: {
        projectId: null,
        stallId: null,
        owner: 0,
        nickname: null,
        gender: null,
        mobile: null,
        companyId: null,
      },
      rules: {
        nickname: [{ required: true, message: '必填项' }],
        owner: [{ required: true, message: '必填项' }],
        gender: [{ required: true, message: '必填项' }],
        mobile: [{ required: true, message: '必填项' }],
        stallId: [{ required: true, message: '必填项' }],
      },
    };
  },
  computed: {
    // mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性
    // 获取并存储用户信息
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return {
        projectId: this.project.id,
        attribute: 'spaceAttr_booth',
        hasCompanyId: true,
      };
    },
  },
  created() {
    this.initFilters();
  },
  methods: {
    // 接收父组件传入的值model并填入输入框中,当对象键名重复时，后出现的覆盖先出现的
    show(model) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.title = this.model?.id ? '编辑人员' : '添加人员';
      this.edit = this.model?.id ? true : false;
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        projectId: null,
        stallId: null,
        owner: 0,
        nickname: null,
        gender: null,
        mobile: null,
      };
    },
    handleStallChange(v, select) {
      this.model.companyId = select?.companyId;
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
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        if (this.model?.id) {
          this.$restful(`PUT:/project-merchant/wholesaler/user`, {
            stallId: this.model.stallId,
            companyId: this.model.companyId,
            userId: this.model.userId,
            owner: this.model.owner,
            projectId: this.project.id,
          })
            .then((res) => {
              this.$emit('modal-success', res);
              this.$message.success('保存成功!');
              this.hide();
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          await this.$restful(`POST:/project-merchant/public/wx/company/user`, {
            userType: 'userType_store',
            nickname: this.model.nickname,
            gender: this.model.gender,
            mobile: this.model.mobile,
            projectId: this.project.id,
          })
            .then((res) => {
              if (res) {
                this.$restful(`POST:/project-merchant/companies/user`, {
                  userId: res,
                  projectId: this.project.id,
                  companyId: this.model.companyId,
                  stallId: this.model.stallId,
                  owner: this.model.owner,
                })
                  .then((res) => {
                    this.$emit('modal-success', res);
                    this.$message.success('保存成功!');
                    this.hide();
                  })
                  .finally(() => {
                    this.loading = false;
                  });
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
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
