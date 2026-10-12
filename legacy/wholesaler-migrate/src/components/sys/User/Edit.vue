<template lang="pug">
app-page-layout(title="新建用户" showHeader fix-header)
  div.my3.px3.abs-fit.overflow-auto
    app-form(:model="model" :rules="rules" ref="form")
      a-row(:gutter="16")
        a-col(v-bind="colspans")
          a-form-model-item(label="登录账号" prop="username")
            a-input(v-model="model.username" :maxLength="30" :disabled="!!model.id")  
        a-col(v-bind="colspans")
          a-form-model-item(label="用户昵称" prop="nickname")
            a-input(v-model="model.nickname" :maxLength="20")  
        a-col(v-bind="colspans")
          a-form-model-item(label="启用" prop="enabled")
            a-switch(v-model="model.enabled")
        a-col(v-bind="colspans")
          a-form-model-item(label="性别" prop="gender")
            app-enum-select(v-model="model.gender" code="Gender")  
        a-col(v-bind="colspans")
          a-form-model-item(label="手机号码" prop="mobile")
            a-input(v-model="model.mobile" :maxLength="20")  
        a-col(v-bind="colspans")
          a-form-model-item(label="邮箱" prop="email")
            a-input(v-model="model.email" :maxLength="50")  
        a-col(v-bind="colspans")
          a-form-model-item(label="身份证号码" prop="identityCard")
            a-input(v-model="model.identityCard" :maxLength="20")  
        a-col(v-bind="colspans")
          a-form-model-item(label="备注" prop="remark")
            a-input(v-model="model.remark" :maxLength="500")
      div.px3(style="background-color:#f0f0f0")
        a-row(:gutter="16")
          a-col(v-bind="colspans")
            a-form-model-item(label="部门" prop="deptId")
              dept-tree-select(v-model="model.deptId" allow-clear)  
          a-col(v-bind="colspans")
            a-form-model-item(label="岗位" prop="postId")
              post-select(v-model="model.postId" allow-clear)
        a-row(:gutter="16")
          a-col(:span="24")
            a-form-model-item(label="角色" prop="roleIds")
              role-checkbox-group(v-model="model.roleIds")
    div.mt2
      a-button(type="primary" @click="handleSubmit('save')" :disabled="!!loading" :loading="loading==='save'") 保存
      a-button.ml1(@click="handleSubmit('process')" :disabled="!!loading" :loading="loading==='process'" v-if="!model.id") 保存并继续
</template>
<script>
import { buildDefaults, buildFormRules } from '@/services/ModelService';
import DeptTreeSelect from '@/components/sys/Dept/TreeSelect';
import RoleCheckboxGroup from '@/components/sys/Role/CheckboxGroup';
import PostSelect from '@/components/sys/Post/Select';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { DeptTreeSelect, RoleCheckboxGroup, PostSelect },
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      model: buildDefaults('User'),
      rules: buildFormRules('User'),
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {
    this.$route.params.id && this.loadModel(this.$route.params.id);
  },
  methods: {
    async loadModel(id) {
      if (id) {
        this.model = await this.$restful(`/sys/users/${this.project.id}/${id}`);
      } else {
        this.model = buildDefaults('User');
      }
    },
    async handleSubmit(type) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = type;
          await this.$restful('save:/sys/users', {
            ...this.model,
          });
          this.$message.success('保存成功。');
          if ('process' === type) {
            this.reset();
          } else {
            this.$back();
          }
        } finally {
          this.loading = false;
        }
      }
    },
    async reset() {
      this.model = buildDefaults('User');
      this.$refs.form.resetFields();
    },
  },
};
</script>
