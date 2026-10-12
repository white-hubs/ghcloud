<template>
  <div>
    <div class="wechat-img">
      <div class="wechat-img-main" id="login_container">
        <!-- 添加loading状态 -->
        <div v-if="isLoading" class="loading-container">
          <a-spin></a-spin>
          <div class="loading-text">二维码加载中...</div>
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
    <div class="wechat-img-title">打开微信，扫描二维码登录</div>

  </div>
</template>

<script  setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import wxlogin from './vue-next-wxlogin/wxlogin.vue';
import { useRouter } from 'vue-router';

// 微信登录配置参数
const appid = ref('wxcb94649fa1496d1f'); // 请替换为实际的微信应用appid
const scope = ref('snsapi_login'); // 网页应用固定为snsapi_login
const redirect_uri = ref(encodeURIComponent('https://cube-test.guhecloud.com:3000/portal/legacy-personal/info')); // 添加协议和回调路径
const state = ref('STATE'); // 可以是任意字符串，用于防止CSRF攻击
const theme = ref('black'); // 主题颜色 
const router = useRouter();
const { proxy } = getCurrentInstance();

// 添加loading状态控制
const isLoading = ref(true);

/**
 * 使用定时器模拟二维码加载过程
 */
onMounted(() => {
  // 设置一个合理的延迟时间，模拟二维码加载过程
  // 通常微信二维码加载需要1-3秒，这里设置为2秒
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
});





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
  // height: calc((500 / var(--design-width)) * 100vw);
  .wechat-img-main{
  
      position: relative;
      background: #ffffff;
      border-radius: 8px;
  }
  .wxlogin-container{

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
  text-align: center;
}
.title{
  width: 100%;
  color: #a4afca;
  display: flex;
  justify-content: center;
  align-items: center;
  gap:15px;
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
  gap:20px ;
}

.other-img img{
  width:16px;
  height: 16px;
  // margin-right: 2px;
}

/* 添加loading样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 200px;
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
</style>