<template>
  <div class="loginCtr">
    <div class="proName">{{ systemName }}</div>
    <div class="proPanel">
      <div class="proPanel-icon">
        <img src="./assets/logoIcon.png" alt="Logo Icon">
      </div>
      <div class="proPanel-form">
        <div class="form-title">登录</div>
        <LoginForm />
      </div>
    </div>
    <div class="bottom-text">
      Copyright ©2007-{{ toYear }} www.guhecloud.com, All Rights Reserved.成都古河云科技有限公司 技术支持
    </div>
  </div>
</template>
<script>
import qs from "qs";
import {
  computed,
  defineComponent, getCurrentInstance, onMounted, reactive,
  ref, toRefs
} from "vue";
import LoginForm from '../../components/login-form.vue';

export default defineComponent({
  components: {
    LoginForm
  },
  setup() {
    const systemName = computed(() => {
      let configName = window.config.systemName ? window.config.systemName : null
      return localStorage.getItem('system-alias-name') || configName
    })
    const toYear = new Date().getFullYear()

    return {
      systemName,
      toYear
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
  border-radius: 10px;
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
    width: 512px;
    height: 100%;

    img {
      width: 512px;
      height: 500px;
    }
  }

  .proPanel-form {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 40px;
  
    .form-title {
      width: 100%;
      font-size: 24px;
      font-weight: 500;
      color: #262626;
      font-family: "PingFang SC-Medium";
      text-align: center;
    }
    :deep(.ant-form-item-control-input) {
      .ant-input-affix-wrapper {
        border-color: #e2e7f5 !important;
        input {
          color: #000;
          &::placeholder {
            color: #A4AFCA;
          }
        }
      }
    }

    :deep(.ant-input-prefix) {
      color: #A4AFCA
    }

    :deep(.remember-account) {
      margin-bottom: calc((30 / var(--design-width)) * 100vw);
      span {
        color: #A4AFCA !important;
      }
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
.bottom-text{
  font-size: 12px;
  color: #000000;
  position: fixed;
  bottom: 2%;
  left: 50%;
  transform: translate(-50%);
}

.loginCtr {
  width: 100%;
  height: 100%;
  background: url("/resource/v1/bimops/background.png") no-repeat;
  background-position: center center;
}

</style>
