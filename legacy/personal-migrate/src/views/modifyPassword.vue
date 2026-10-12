<template lang="pug">
g-layout(
  title="个人资料"
)
  template(#content-table)
    a-spin(:spinning="loading")
      .detail-form
        a-form(ref="passwordForm" :model="data" :rules="rules" v-bind="layout")
          a-form-item(label="旧密码" name="password")
            a-input-password(v-model:value="data.password"  allowClear placeholder="请输入旧密码" )
          a-form-item(label="新密码" name="newPassword")
            a-input-password(v-model:value="data.newPassword"  allowClear placeholder="请输入新密码" :maxlength="16")
          a-form-item(label="确认新密码" name="secondNewPassword")
            a-input-password(v-model:value="data.secondNewPassword"  allowClear placeholder="再次输入新密码" :maxlength="16")
  template(#footer-page)
    a-button(type="primary" @click="save") 保存
</template>
<script>
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import Crypto from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/crypto.js";
import {
  defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout";

export default defineComponent({
  components: {
    gLayout
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    const passwordForm = ref();

    const formState = reactive({
      data: {
        id: "",
        password: "",
        newPassword: "",
        secondNewPassword: "",
      },
      loading: false,
      headers: null,
      layout: {
        labelCol: {
          span: 2,
        },
        wrapperCol: {
          span: 8,
        },
      },
    });

    const rules = {
      password: [
        {
          required: true,
          message: "请输入旧密码",
        },
      ],
      newPassword: [
        {
          required: true,
          message: "请输入新密码",
        },
        {
          pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/,"g"),
          trigger: "blur",
          message: "密码必须包含字母大写、小写、数字、特殊字符且至少8位",
        },
      ],
      secondNewPassword: [
        {
          required: true,
          message: "请确认新密码",
        },
        {
          validator(rule, value) {
            if (formState.data.newPassword) {
              if (
                value !== formState.data.newPassword &&
                formState.data.secondNewPassword
              ) {
                return Promise.reject("确认密码与新密码不相同");
              } else {
                return Promise.resolve();
              }
            }
          },
        },
      ],
    };

    const save = () => {
      formState.data.id = JSON.parse(sessionStorage.getItem("GH-UserInfo")).id;
      passwordForm.value.validate().then(() => {
        // 密码加密
        formState.data.password = Crypto.encrypt(formState.data.password)
        formState.data.newPassword = Crypto.encrypt(formState.data.newPassword)
        formState.data.secondNewPassword = Crypto.encrypt(formState.data.secondNewPassword)
        proxy.$api.modifyPassword(formState.data, "put").then(() => {
          proxy.$message.success("操作成功");
          setTimeout(() => {
            sessionStorage.removeItem("GH-Token");
            sessionStorage.removeItem("allowAdd");
            sessionStorage.removeItem("firstMenu");
            sessionStorage.removeItem("GH-UserInfo");
            sessionStorage.removeItem("GH-NowEnterprise");
            window.location.href = window.location.origin
            window.location.reload()
          }, 2000);
        }).catch(() => {
        formState.data.password = "";
        formState.data.newPassword = "";
        formState.data.secondNewPassword = "";
      });
      });
    };

    onMounted(async () => { });

    watch(
      () => formState.data.newPassword,
      (newVal, oldVal) => {
        if (oldVal !== newVal) {
          formState.data.secondNewPassword = "";
          passwordForm.value.clearValidate("secondNewPassword");
        }
      }
    );

    return {
      passwordForm,
      rules,
      ...toRefs(formState),
      timeFormat,
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

:deep(.ant-form) {
  text-align: left;
}
</style>
