<template>
  <div class="loginCtr">
    <div class="proName">市场业务管理系统</div>
    <div class="proPanel">
      <div class="proPanel-icon">
        <img src="./image/logoIcon.png" alt="" />
      </div>
      <div class="proPanel-form">
        <div class="form-title">登录</div>
        <a-form
          name="custom-validation"
          ref="formRef"
          :model="formState"
          :rules="rules"
          v-bind="layout"
          @finish="handleFinish"
          :layout="'horizontal'"
          labelAlign="right"
        >
          <a-row :gatter="1">
            <a-col :span="24">
              <a-form-item
                label=""
                name="username"
                :wrapper-col="{ span: 24, offset: 0 }"
              >
                <a-input
                  v-model:value="formState.username"
                  type="text"
                  placeholder="账号"
                  allowClear
                >
                  <template #prefix></template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label=""
                name="password"
                :wrapper-col="{ span: 24, offset: 0 }"
              >
                <a-input-password
                  v-model:value="formState.password"
                  type="password"
                  placeholder="密码"
                  allowClear
                >
                  <template #prefix></template>
                </a-input-password>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :wrapper-col="{ span: 24, offset: 0 }">
                <a-button
                  type="primary"
                  html-type="submit"
                  :style="{ width: '279px', height: '42px', marginTop: '20px' }"
                  >登录</a-button
                >
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
    <div class="copyright"></div>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  ref,
  getCurrentInstance,
  toRefs,
} from "vue";
import { getToken, setToken, setUserInfo } from "@/utils/auth";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import qs from "qs";
// import axios from "axios";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    // const state = reactive({
    // 	copyright: window.config.copyright
    // })
    const formState = reactive({
      username: "18380425946",
      password: "123456",
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
      // debugger
      const params = qs.stringify({
        grant_type: "pwd",
        scope: "select",
        code: "1995",
        // ...model,
        username: formState.username,
        password: formState.password,
      });
      store.dispatch("user/login", params).then(() => {
        getUserInfo()
        getTenantList();
        
      });
    };
    const getTenantList = async () => {
      const data = await proxy.$api.getTenant();
      if (data && data instanceof Array) {
        if (data.length === 0) {
          proxy.$message.warn("该用户未加入企业");
          sessionStorage.removeItem("token");
          return;
        } else if (data.length === 1) {
          store.commit("user/SET_NOW_ENTERPRISE", JSON.stringify(data[0]));
          
          history.pushState(
            { current: location.pathname + location.search }, '',
            `/portal/park/`
          )
        }
        // 多个企业
        else {
          const index = data.findIndex((item) => item.mainEnterprise);
          if (index !== -1) {
            store.commit(
              "user/SET_NOW_ENTERPRISE",
              JSON.stringify(data[index])
            );
          } else {
            store.commit("user/SET_NOW_ENTERPRISE", JSON.stringify(data[0]));
          }
          history.pushState(
            { current: location.pathname + location.search }, '',
            `/portal/park/`
          )
        }
      } else {
        proxy.$message.warn("该用户未加入企业");
      }
    };
    const resetForm = () => {
      formRef.value.resetFields();
    };
    const getUserInfo = async () => {
      // 获取用户信息
      const data = await proxy.$api.userInfo( { id: getToken().id },"get");
      if (data) {
        setUserInfo(data)
      }
    };
    return {
      // ...toRefs(state),
      formState,
      formRef,
      rules,
      verifyRef,
      layout,

      handleFinish,
      resetForm,
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
.copyright {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translate(-50%);
  font-size: 12px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
}
.loginCtr {
  width: 100%;
  height: 100%;
  // background-color: rgba(24, 143, 255, 0.76);
  background: url("/resource/v1/legacy-admin/loginbackground.png") rgba(24, 143, 255, 0.76)
    no-repeat;
  // background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  form {
    width: 355px;
    height: 360px;
    // flex: 1;
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
