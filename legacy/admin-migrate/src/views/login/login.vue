<template lang="pug">
div.loginCtr
  div.proName {{formState.systemName}}
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
            
      //- a-col(:span="24")   
        div.left 
          a-checkbox(v-model='formState.remberMe') 记住我
      a-col(:span="24")
        a-form-item(:wrapper-col='{ span: 24, offset: 0 }')
          a-button(type='primary' html-type='submit' :style="{width: '279px',height: '42px',marginTop: '20px'}") 登录
</template>
<script lang='jsx'>
import { defineComponent, reactive, ref, getCurrentInstance, onMounted, toRefs } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { storeToken } from "../../services/AccountService.js";
import qs from "qs";
import Crypto from '../../utils/crypto.js'
/** 登录背景（MinIO） */
const loginbackground = '/resource/v1/legacy-admin/loginbackground.png'
// import axios from "axios";
export default defineComponent({
  setup() {
    onMounted(() => {

    })
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const formState = reactive({
      username: "",
      password: "",
      verify: "",
      remberMe: false,
      systemName: window.config.systemName
    });

    const store = useStore();
    const state = reactive({
      loginKey: null,
      loginCode: null,
    });
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
        scope: "select",
        code: formState.verify,
        key: state.loginKey,
        // ...model,
        username: formState.username,
        password: Crypto.encrypt(formState.password),
      });
      const token = await proxy.$api.Login(params);
      if (token) {
        await storeToken(token);
        const data = await proxy.$api.UserTenant("get");
        if (data && data.length) {
          store.commit("tenant/SET_TENANT", JSON.stringify(data[0]));
        } else {
          proxy.$message.error("该用户当前没有租户!!");
          getLoginCode()
        }
        router.push({ path: "/index" });
      }
    };

    const resetForm = () => {
      formRef.value.resetFields();
    };
    const getLoginCode = () => {
      proxy.$api.getLoginCode().then(res => {
        state.loginKey = res.key
        state.loginCode = res.code
      })
    }
    onMounted(() => {
      getLoginCode()
    })

    return {
      formState,
      formRef,
      rules,
      verifyRef,
      layout,
      ...toRefs(state),
      handleFinish,
      resetForm,
      getLoginCode
    };
  },
});
</script>
<style lang="less" scoped>
.proName {
  // font-family: "pangmenzhengdaoBiao";
  font-size: 36px;
  color: #fff;
  position: fixed;
  top: 23%;
  left: 50%;
  transform: translate(-50%);
}

.loginCtr {
  width: 100%;
  height: 100%;
  // background-color: rgba(24, 143, 255, 0.76);
  background-image: url('/resource/v1/legacy-admin/loginbackground.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;

  form {
    width: 355px;
    height: 360px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 7px;
    padding: 56px 38px;

    >div {
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

        >.ant-input-affix-wrapper {
          height: 100%;
        }
      }
    }
  }
}

.identify {
  display: flex;
  justify-content: space-between;
}
</style>
