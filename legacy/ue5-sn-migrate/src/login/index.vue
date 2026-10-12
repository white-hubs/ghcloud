<template>
  <div class="loginCtr">
    <!-- <Earth @renderCompleted="renderCompleted"/> -->
    <div class="proPanel">
      <div class="proPanel-title">欢迎登录</div>
      <div class="proPanel-form">
        <a-form name='custom-validation' ref='formRef' :model='formState' :rules='rules' v-bind='layout'
          @finish='handleFinish' :layout="'horizontal'" labelAlign="right">
          <a-row :gatter="1">
            <a-col :span="24">
              <a-form-item label='' name='username' :wrapper-col='{ span: 24, offset: 0 }'>
                <a-input v-model:value='formState.username' type='text' placeholder="账号" allowClear>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label='' name='password' :wrapper-col='{ span: 24, offset: 0 }'>
                <a-input-password v-model:value='formState.password' type='password' placeholder="密码" allowClear>
                </a-input-password>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label='' name='verify' :wrapper-col='{ span: 24, offset: 0 }'>
                <div class="identify">
                  <a-input v-model:value='formState.verify' type='text' placeholder="验证码" allowClear></a-input>
                  <img :src="loginCode" @click="handleGetLoginCode">
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label='' :wrapper-col='{ span: 24, offset: 0 }'>
                <a-button :loading="loadingBtn" type='primary' html-type='submit' class="login-btn">登录</a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
    <a-modal title="请选择要登录的企业" v-model:visible="dialogVisible" centered width="40%" :footer="null" class="login-modal">
      <div class="dialogContent">
        <div v-for="item in tenantList" :key="item.id" @click="clickTenant(item)">
          <el-card shadow="always">
            {{item.name}}
          </el-card>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import qs from "qs";
import { getToken } from "@/utils/auth";
import { login, getLoginCode } from '@/api/ouaa'
import { getTenant } from '@/api/mdata.ts'
import Crypto from "@/utils/crypto.js";
import { message } from 'ant-design-vue'
import Earth from './earth/index.vue'
import router from "@/router";
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { initAuthStore } from '@ghcloud/cube-safety-supervision-app/src/api/auth-store'

export default {
  name: "loginContainer",
  components: {Earth},
  data() {
    return {
      formState: {
        username: "",
        password: "",
        verify: "",
        remberMe: false,
        loginKey: ''
      },
      loadingBtn: false,
      loginCode: '',
      rules: {
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
      },
      layout: {
        labelCol: {
          span: 4,
        },
        wrapperCol: {
          span: 14,
        },
      },
      dialogVisible: false,
      tenantList: [],
      showLoginPanle:false
    };
  },
  mounted() {
    sessionStorage.removeItem("GH-Token");
    sessionStorage.removeItem("GH-NowEnterprise");
    this.handleGetLoginCode()
    const loginCache = localStorage.getItem("cube-login-info")?JSON.parse(localStorage.getItem("cube-login-info")):{};
    if(loginCache.username&&loginCache.password){
      this.formState.username=loginCache.username
      this.formState.password=Crypto.decrypt(loginCache.password)
    }

  },
  methods: {
    renderCompleted(){
      setTimeout(() => {
        this.showLoginPanle=true
      }, 1000);
    },
    handleFinish() {
      sessionStorage.removeItem("GH-Token");
      sessionStorage.removeItem("GH-NowEnterprise");
      const params = qs.stringify({
        grant_type: "pwd_simple_code",
        code: this.formState.verify,
        key: this.formState.loginKey,
        username: this.formState.username,
        password: Crypto.encrypt(this.formState.password),
      });
      try {
        this.loadingBtn = true
        login(params).then((token) => {
          sessionStorage.setItem("GH-Token", JSON.stringify(token));
          localStorage.setItem("cube-login-info", JSON.stringify({
            username: this.formState.username,
            password: Crypto.encrypt(this.formState.password),
          }));
          this.getTenantList()
        }).catch(error => {
          this.handleGetLoginCode()
          message.error(error?.message || error?.error_description)
        })
      } catch (error) {
      } finally {
        setTimeout(() => {
          this.loadingBtn = false
        }, 1000);
      }
    },
    async getTenantList() {
      const res = await getTenant();
      const data = res?.data || res
      this.tenantList = data.length > 0 ? data.filter((item) => item.code !== 0 && item.name !== '0租户	') : data
      if (data && data instanceof Array) {
        if (data.length === 0) {
          message.warn("该用户未加入企业");
          sessionStorage.removeItem("token");
          return;
        } else if (data.length === 1) {
          this.clickTenant(data[0])
        } else {
          this.dialogVisible = true
        }
      }
    },
    handleGetLoginCode() {
      getLoginCode().then((res) => {
        this.formState.loginKey = res.key;
        this.loginCode = res.code;
      })
    },
    async clickTenant(item) {
      const token = await getToken();
      sessionStorage.setItem("GH-NowEnterprise", JSON.stringify(item));
      window.__CUBE_AUTH_INFO__ = {
        token:getToken().access_token,
        tenant:item.code,
        terminal:CubeTerminalEnum.BUSINESS
      }
      initAuthStore(window.__CUBE_AUTH_INFO__)
      router.push({name:"home"})
    },
    goOutsideTenant(item) {
      if(item.path) window.open(item.path, '_blank')
    }
  },
};
</script>

<style lang="less" scoped>
.proPanel {
  width: 454px;
  min-height: 500px;
  background: rgba(57, 83, 123, 0.25);
  border-radius: 8px 8px 8px 8px;
  opacity: 1;
  border: 1px solid rgba(144, 172, 220, 0.7);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  padding: 83px 42px;
  box-sizing: border-box;
  transition: all 0.3s ease-in-out;
  &::before,&::after{
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    content: '';
    width: 214px;
    height: 6px;
    background: url("/resource/v1/ue5-migrate/login/image/login-line.png") no-repeat;
    background-size: cover;
  }
  &::after{
    top: unset;
    bottom: 0 !important;
    transform: translateX(-50%) rotate(180deg);
  }
  &.show{
    opacity: 1;
  }

  .proPanel-title {
    font-size: 36px;
    font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
    font-weight: 400;
    color: #FFFFFF;
    text-align: center;
    margin-bottom: 30px;
  }

  .proPanel-form {
    width: 100%;
    height: 100%;
  }
}


.loginCtr {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center center;
  position: relative;
  background-image: url("/resource/v1/ue5-sn-migrate/globe-map/assets/earth/sky-texture2.jpg");
  overflow: hidden;
  form {

    >div {
      width: 100%;
    }

    :deep(.ant-input) {
      background-color: transparent !important;
      color:white;
      border: none !important;
    }

    :deep(.ant-input::placeholder) {
      color: rgba(255, 255, 255, 0.7);
    }
    :deep(.ant-input-suffix){
      span{
        color: white;
      }
    }

    :deep(.ant-form-item-control-input) {
      min-height: 40px;
      height: 44px !important;
    }

    :deep(.ant-row .ant-form-item) {
      height: 40px; 
      margin-bottom: 25px;

      div {
        height: 100%;
        text-align: left;
      }
    }

    :deep(.ant-input-affix-wrapper) {
      height: 100%;
      background: rgba(42, 64, 99, 0.50) !important;
      border-color: #90ACDC;
    }
  }
}

.identify {
  display: flex;
  justify-content: space-between;
}

.dialogContent {
  max-height: 500px;
  overflow-y: scroll;

  >div {
    display: inline-block;
    width: 200px;
    margin: 10px;
    padding: 10px;
    overflow: hidden;
    cursor: pointer;
    color: #fff;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: all 0.3s;
    text-align: center;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: #2989FF;
    }
  }
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 14px;
  border-radius: 4px;
  margin-top: 30px;
}
.login-modal{
  color: rgba(0, 0, 0, 0.85) !important;
  background: #fff !important; 
}
</style>
<style lang="less">
:-webkit-autofill,
:-webkit-autofill:hover,
:-webkit-autofill:focus,
:-webkit-autofill:active {
  -webkit-text-fill-color: white !important;
  transition: background-color 5000s ease-in-out 0s;
}

.ant-btn-primary{
  background:#1890ff !important;
  border-color:#1890ff !important;
}
.ant-modal-root .ant-modal .ant-modal-content {
  border: 1px solid #2989FF !important;
  background: rgba(4, 17, 32, 0.8) !important;
  padding: 20px 0;
}

.ant-modal-root .ant-modal .ant-modal-header {
  background-color: transparent !important;
  border-bottom: 1px solid #2989FF !important;
  padding: 0 24px ;
  padding-bottom: 20px  !important;
}

.ant-modal-root .ant-modal .ant-modal-title {
  color: #ffffff !important;
  font-size: 18px !important;
}
.anticon{
  color:#fff;
}
.ant-modal-root .ant-modal .ant-modal-footer {
  background-color: transparent !important;
  border-color: #2989FF !important;
  color: #ffffff !important;
}
  .ant-spin-text {
    text-shadow: none !important;
  }
</style>
