<template>
  <div class="loginCtr">
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
    <a-modal title="请选择要登录的企业" v-model:visible="dialogVisible">
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
import { setNowEnterprise, setToken, getToken, getNowEnterprise } from "@/utils/auth";
import { login, getLoginCode } from '../../api/ouaa'
import { getTenant } from '../../api/mdata.ts'
import Crypto from "@/utils/crypto.js";
import { message } from 'ant-design-vue'
export default {
  name: "loginContainer",
  components: {},
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
      tenantList: []
    };
  },
  mounted() {
    sessionStorage.removeItem("GH-Token");
    sessionStorage.removeItem("GH-NowEnterprise");
    this.handleGetLoginCode()
  },
  methods: {
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
          this.getTenantList()
        }).catch(error => {
          this.handleGetLoginCode()
          message.error(error.error_description)
        })
      } catch (error) {
      } finally {
        this.loadingBtn = false
      }
    },
    async getTenantList() {
      const data = await getTenant();
      this.tenantList = data
      if (data && data instanceof Array) {
        if (data.length === 0) {
          message.warn("该用户未加入企业");
          sessionStorage.removeItem("token");
          return;
        } else if (data.length === 1) {
          sessionStorage.setItem("GH-NowEnterprise", JSON.stringify(token));
        } else {
          this.dialogVisible = true
        }
      } else {
        message.warn("该用户未加入企业");
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
      window.location.href = window.location.href + `?access_token=${token.access_token}&name=${token.name}&nowEnterprise=${JSON.stringify(item)}`
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
  right: 309px;
  transform: translateY(-50%);
  padding: 83px 42px;
  box-sizing: border-box;

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
  width: 100%;
  height: 100%;
  background: url("/resource/v1/ue5-sn/login-bg.webp") rgba(24, 143, 255, 0.76) no-repeat;
  background-size: cover;
  background-position: center center;

  form {

    >div {
      width: 100%;
    }

    :deep(.ant-input) {
      background-color: transparent !important;
      color:white
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

    :deep(.ant-row.ant-form-item) {
      height: 40px;
      margin-bottom: 25px;

      div {
        height: 100%;
        text-align: left;

        >.ant-input-affix-wrapper {
          height: 100%;
          background: rgba(42, 64, 99, 0.50);
          border-color: #90ACDC;
        }
      }
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
    overflow: hidden;
    cursor: pointer;
  }
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 14px;
  border-radius: 4px;
  margin-top: 30px;
}
</style>
<style>
:-webkit-autofill,
:-webkit-autofill:hover,
:-webkit-autofill:focus,
:-webkit-autofill:active {
  -webkit-text-fill-color: white !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>