<template lang="pug">
app-modal(title="重置密码" v-model="visible" :width="500" @ok="handleSubmit" :confirm-loading="loading")
  a-alert(type="warning" show-icon)
    span(slot="message") 正在重置
      span(v-if="user") 
        span(v-if="user.nickname") 【{{ user.nickname}}({{user.username}})】
        span(v-else) 【{{user.username}}】
      span 的密码。
  app-form(:model="model" :rules="rules" ref="form")
    a-form-model-item(label="填写密码" prop="password")
      a-input(type="password" v-model="model.password")
</template>
<script>
import { isValidPassword } from '@/models/common/Validators';
export default {
  data() {
    return {
      user: null,
      visible: false,
      loading: false,
      model: {
        password: null,
      },
      rules: {
        password: [
          {
            required: true,
            message: '请填写密码。',
          },
          {
            validator: (r, v) => !v || isValidPassword(v),
            message: '至少8个字符最多20个字符,必须包含数字和字母',
          },
        ],
      },
    };
  },
  watch: {
    visible(nv) {
      if (!nv) {
        this.reset();
      }
    },
  },
  methods: {
    show(user) {
      this.user = user;
      this.visible = true;
    },
    reset() {
      this.$refs.form.resetFields();
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        await this.$restful(`put:/sys/users/${this.user.id}/password-reset`, {
          password: this.model.password,
        });
        this.$message.success('重置密码成功。');
        this.reset();
        this.visible = false;
      }
    },
  },
};
</script>
