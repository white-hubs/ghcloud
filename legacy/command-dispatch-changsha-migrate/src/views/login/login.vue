<template lang="pug">
div.loginCtr
  div.proName {{systemName}}
  div.proPanel
    div.proPanel-icon
      img(src="./image/logoIcon.png")
    div.proPanel-form
      div.form-title 登录
      a-form(name='custom-validation' ref='formRef' :model='formState' :rules='rules' v-bind='layout' @finish='handleFinish' :layout="'horizontal'" labelAlign="right")
        a-row(:gatter="1")
          a-col(:span="24")
            a-form-item(label='' name='username' :wrapper-col='{ span: 24, offset: 0 }')
              a-input(v-model:value='formState.username' type='text' placeholder="账号" allowClear)
                template(#prefix)
                  IconFont(type="icon-user" :style="{ fontSize: '12px', color: '#000' }")
          a-col(:span="24")
            a-form-item(label='' name='password' :wrapper-col='{ span: 24, offset: 0 }')
              a-input-password(v-model:value='formState.password' type='password'  placeholder="密码" allowClear)
                template(#prefix)
                  IconFont(type="icon-suo" :style="{ fontSize: '12px', color: '#000' }")
          a-col(:span="24")
            a-form-item(label='' name='verify' :wrapper-col='{ span:24, offset: 0 }')
              div.identify
                a-input(v-model:value='formState.verify' type='text'  placeholder="验证码" allowClear style="width: 145px")
                  template(#prefix)
                    IconFont(type="icon-yanzhengma" :style="{ fontSize: '12px', color: '#000' }")
                img(:src="loginCode" @click="getLoginCode") 
          a-col(:span="24")
            a-form-item(:wrapper-col='{ span: 24, offset: 0 }')
              a-button(type='primary' html-type='submit' :style="{width: '279px',height: '42px',marginTop: '20px'}") 登录
</template>
<script>
import qs from "qs";
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import { storeToken } from "../../services/AccountService.js";
import Crypto from "@/utils/crypto.js";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const state = reactive({
      systemName: window.config.systemName ? window.config.systemName : null,
      loginKey: null,
      loginCode: null,
    });
    const formState = reactive({
      username: "",
      password: "",
      verify: "",
      remberMe: false,
    });

    const store = useStore();

    const verifyRef = ref(null);
    const router = useRouter();
    const rules = {
      username: [
        {
          required: true,
          message: "请输入账号",
          trigger: "change",
        },
      ],
      password: [
        {
          required: true,
          message: "请填写密码",
          trigger: "change",
        },
      ],
      verify: [
        {
          required: true,
          message: "请输入验证码",
          trigger: "change",
        },
      ],
    };
    const layout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
    };

    const handleFinish = async (values) => {
      const params = qs.stringify({
        grant_type: "pwd_simple_code",
        code: formState.verify,
        key: state.loginKey,
        username: formState.username,
        password: Crypto.encrypt(formState.password),
      });
      proxy.$api
        .Login(params)
        .then(async (token) => {
          if (token) {
            await storeToken(token);
            await getTenantList();
          } else {
            getLoginCode();
          }
        })
        .catch(() => {
          console.log("请求出错");
          getLoginCode();
        });
    };
    const getTenantList = async () => {
      const data = await proxy.$api.tenant();
      if (data && data instanceof Array) {
        if (data.length === 0) {
          proxy.$message.warn("该用户未加入企业");
          sessionStorage.removeItem("GH-Token");
          return;
        } else if (data.length === 1) {
          store.commit("enterprise/SET_NOW_ENTERPRISE", data[0]);
          window.location.reload();
        }
        // 多个企业
        else {
          const index = data.findIndex((item) => item.code === 58197260);
          if (index !== -1) {
            store.commit("enterprise/SET_NOW_ENTERPRISE", data[index]);
          } else {
            store.commit("enterprise/SET_NOW_ENTERPRISE", data[0]);
          }
          window.location.reload();
        }
      } else {
        proxy.$message.warn("该用户未加入企业");
      }
    };
    const resetForm = () => {
      formRef.value.resetFields();
    };
    const getLoginCode = () => {
      proxy.$api.getLoginCode().then((res) => {
        state.loginKey = res.key;
        state.loginCode = res.code;
      });
    };
    onMounted(() => {
      getLoginCode();
    });
    return {
      ...toRefs(state),
      formState,
      formRef,
      rules,
      verifyRef,
      layout,
      handleFinish,
      resetForm,
      getLoginCode,
    };
  },
});
</script>
<style lang="less" scoped>
.proPanel {
  width: 927px;
  height: 500px;
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.05000000074505806);
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  border: 1px solid #ffffff;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;

  .proPanel-icon {
    width: 408px;
    height: 100%;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .proPanel-form {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .form-title {
      width: 100%;
      font-size: 24px;
      font-weight: 500;
      color: #262626;
      font-family: "PingFang SC-Medium";
      text-align: center;
    }
  }
}

.proName {
  font-family: "PingFang SC-Medium";
  font-size: 36px;
  font-weight: 500;
  color: #000000;
  position: fixed;
  top: calc(50% - 350px);
  left: 50%;
  transform: translate(-50%);
}
.loginCtr {
  width: 100%;
  height: 100%;
  background: url("/resource/v1/legacy-admin/loginbackground.png") rgba(24, 143, 255, 0.76) no-repeat;
  background-size: cover;
  background-position: center center;

  form {
    width: 355px;
    height: 360px;
    background-color: #fff;
    border-radius: 7px;
    padding: 20px 38px;

    > div {
      width: 100%;
    }

    :deep(.ant-form-item-control-input) {
      min-height: 40px;
    }

    :deep(.ant-row.ant-form-item) {
      height: 40px;
      margin-bottom: 25px;

      div {
        height: 100%;
        text-align: left;

        > .ant-input-affix-wrapper {
          height: 100%;
        }
      }
    }
  }

  // :deep( .ant-form.ant-form-horizontal) {
  //   width: 100%;
  //   height: 100%;
  // }
}

.identify {
  display: flex;
  justify-content: space-between;
}
</style>
