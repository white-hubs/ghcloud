<template>
  <!-- <div class="login-body">
    <div class="login-title">使用微信扫一扫{{ !props.bind?'登录':'绑定' }}</div>
  </div> -->
  <div>
    <!-- <div class="wechat-title">微信登录</div> -->
    <div class="wechat-img">
      <div class="wechat-img-main" id="login_container">
        <!-- 添加loading状态 -->
        <div v-if="isLoading" class="loading-container">
          <a-spin></a-spin>
          <div class="loading-text">{{ loadingText }}</div>
        </div>
        <!-- 使用vue-next-wxlogin组件替换静态图片 -->
        <div v-else class="wxlogin-container">
          <wxlogin
            :appid="appid"
            :scope="scope"
            :redirect_uri="redirect_uri"
            :state="state"
            :theme="theme"
            :href="href"
          />
        </div>
      </div>
    </div >
    <div class="wechat-img-title" v-if="props.wechatLogin">打开微信，扫描二维码登录</div>
    <div class="wechat-img-title" v-else>打开微信，扫描二维码验证绑定</div>
   
    <div class="login-other" v-if='props.wechatLogin'>
      <div class="title"> <div class="left"></div> <span>其它登录方式</span> <div class="right"></div> </div>
      <div class="other-img" > <div @click="$emit('change-method', 'password')" class='imgItem'><img :src="MAC_ICON" alt=""> 帐号</div><div @click="$emit('change-method', 'phone')"  v-if="props.smsCode" class='imgItem'><img :src="PHONE_ICON" alt=""> 手机</div> </div>
    </div>
     <div class="login-footer" v-else>
        <span @click="backToLogin">其它方式?</span>
      </div>
  </div>
</template>

<script  setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import wxlogin from './vue-next-wxlogin/wxlogin.vue';
import qs from "qs";
import * as api from '@/api'
import { CubeMfRootGlobalState } from '@ghcloud/cube-mf-root';
import { CubeTerminalEnum } from '@ghcloud/cube-protocol';
import { useRouter,useRoute } from 'vue-router';
import { redirectAfterLogin } from '../utils/login-success-redirect';
const props = defineProps({
  smsCode: {
    type: Boolean,
    default: false
  },
  wechatLogin:{
    type: Boolean,
    default: true
  },
  loginSuccessRedirectPath: {
    type: String,
    default: '/index'
  }
});
// 微信登录配置参数
const appid = ref('wxcb94649fa1496d1f'); // 请替换为实际的微信应用appid
const scope = ref('snsapi_login'); // 网页应用固定为snsapi_login
const redirect_uri = ref(encodeURIComponent('https://cube-test.guhecloud.com:3000/login')); // 添加协议和回调路径
const state = ref('STATE'); // 可以是任意字符串，用于防止CSRF攻击
const theme = ref('black'); // 主题颜色
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const isDevEnv = import.meta.env.DEV
const RESOURCE_BASE = isDevEnv
  ? `${import.meta.env.VUE_APP_DOMAIN_URL}/resource/v1/bimops-fe-web-migrate`
  : '/resource/v1/bimops-fe-web-migrate'

const PHONE_ICON = `${RESOURCE_BASE}/icons/image/phone.png`
const MAC_ICON = `${RESOURCE_BASE}/icons/image/mac.png`
const loadingText = ref('');
// 添加loading状态控制
const isLoading = ref(true);
const emit = defineEmits(['change-method','bind','other-method']);
const backToLogin = ()=>{
  emit('other-method')
}
/**
 * 使用定时器模拟二维码加载过程
 */
onMounted(() => {
  // 设置一个合理的延迟时间，模拟二维码加载过程
  // 通常微信二维码加载需要1-3秒，这里设置为2秒

  // 页面加载时检查是否有微信登录的code
  if(!props.wechatLogin){
    redirect_uri.value = encodeURIComponent('https://cube-test.guhecloud.com:3000/login?forget=true')
  }
});

/**
 * 获取租户列表
 */
const getTenantList = async () => {
  const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance()
  const data = await api.tenant();
  let tenant = ''
  if (data && data instanceof Array) {
    if (data.length === 0) {
      proxy.$message.warn("您尚未加入任何企业，请联系管理员添加!");
      sessionStorage.removeItem("GH-Token");
      cubeMfRootGlobalState.mfRootState.clearAuthInfo()
      return;
    } else if (data.length === 1) {
      tenant = data[0].code
    } else {
      const index = data.findIndex((item) => item.mainEnterprise);
      if (index !== -1) {
        tenant = data[index].code
      } else {
        tenant = data[0].code
      }
    }
    cubeMfRootGlobalState.mfRootState.setAuthInfo({
      ...cubeMfRootGlobalState.mfRootState.authInfo,
      tenant: tenant,
    })
    await cubeMfRootGlobalState.initGlobalState()
    await redirectAfterLogin(props.loginSuccessRedirectPath, router);
  } else {
    proxy.$message.warn("该用户未加入企业");
  }
};

/**
 * 处理表单提交
 */
const wechatLogin = async (code) => {
  const params = qs.stringify({
    grant_type: "wechat-v2",
    registerNewUser:false,
    code,
  });
  api
    .Login(params)
    .then(async (token) => {
       if(token.status === 409){
        emit('bind',token.details)
        loadingText.value = ''
        isLoading.value = false;
        return;
      }
      if (token) {
        CubeMfRootGlobalState.getInstance().mfRootState.setAuthInfo({
          token: token.access_token,
          tenant:'',
          terminal: CubeTerminalEnum.BUSINESS
        },token.refresh_token,token.jti)
        await getTenantList();
      }
    })
    .catch((error) => {
      router.replace({ path: "/login" }); 
    }).finally(() => {
      loadingText.value = ''
      isLoading.value = false;
    });
};
const beginLoading = () => {
  loadingText.value = '二维码加载中...'
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
};

// 检查URL中是否有code参数，如果有则表示微信扫码登录成功并重定向回来
const checkWxLoginCode = () => {
  const query = route.query;
  
  if (query?.code && !query?.forget && !query?.tokenId) {
    let code = query?.code;
    let state = query?.state;
    const wxCode = localStorage.getItem('wx-login-code')
    if(wxCode !== code && state === 'STATE'){
       localStorage.setItem('wx-login-code', code)
       loadingText.value = '微信登录中'
       wechatLogin(code);
    }else{
      beginLoading()
    }
  }else{
    beginLoading()
  }
};
  checkWxLoginCode();
</script>

<style lang="less" scoped>
.wechat-title{
     height: calc((30 / var(--design-width)) * 100vw);
      font-size: calc((26 / var(--design-width)) * 100vw);
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: 500;
      text-align: left;
      color: #02112b;
      line-height: calc((30 / var(--design-width)) * 100vw);
      text-align: center;
      margin-bottom:20px;
}

.wechat-img{
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  overflow: hidden;
  // position: relative;
  // height: calc((500 / var(--design-width)) * 100vw);
  .wechat-img-main{
      // width: 100%;
      // position: relative;
      background: #ffffff;
      border-radius: 8px;
  }
  .wxlogin-container{
    // max-width:100%;
    // overflow: hidden;
    // position: relative;
    // left: calc(100% - 328px)
    // width:328px;
    
  }
  img{
    width: 100%; 
    height:100%;
  }
}
.wechat-img-title{
  margin-top: 20px; 
  margin-bottom: 40px;
  color: #a4afca;
}
.title{
  width: 100%;
  color: #a4afca;
  display: flex;
  justify-content: center;
  align-items: center;
  gap:15px;
  font-size: calc((16 / var(--design-width)) * 100vw);;
  .left,.right{
    height: 1px;
    width: 30%;
    background-color: #e9eef1;
  }
}

.other-img{
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  cursor: pointer;
  font-size: 14px;
  font-family: Source Han Sans CN, Source Han Sans CN-Regular;
  font-weight: Regular;
  text-align: left;
  color: #738292;
  line-height: 14px;
  gap: calc((10 / var(--design-width)) * 100vw);;
}

.other-img img{
  // width:16px;
  // height: 16px;
  // margin-right: 2px;
  width:calc((16 / var(--design-width)) * 100vw);;
  height: calc((16 / var(--design-width)) * 100vw);;
}
.imgItem{
  display: flex;
  align-items: center;
    font-size:calc((14 / var(--design-width)) * 100vw);;

  gap:3px
}
/* 添加loading样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.login-footer{
  padding: calc((10 / var(--design-width)) * 100vw) 0;
  display: flex;
  justify-content: flex-end;
  font-size: calc((14 / var(--design-width)) * 100vw);
  color: #666;
  cursor: pointer;
  color: #1578ff;

}
.login-body{
 padding-bottom: calc((10 / var(--design-width)) * 100vw);
}
.login-title{
  font-size: calc((23 / var(--design-width)) * 100vw);
  font-weight: 500;
}
</style>