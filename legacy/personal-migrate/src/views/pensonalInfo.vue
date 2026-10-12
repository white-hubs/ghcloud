<template lang="pug">
g-layout(
  title="个人资料"
)
  template(#content-table)
    .detail-form()
      a-form(:model="data" ref="formRef" v-if="!isEdit" layout="inline" )
        a-form-item(label="帐号") {{data.username? data.username:'--'}}
        a-form-item(label="手机号")  <div class='phoneBody'><div>{{data.mobile? data.mobile:'--'}} </div><div :class="data.isBindTel?'phoneBind':'phoneNotBind'" v-if='data.mobile'>{{data.isBindTel?'已验证':'未验证'}}</div><a @click="phoneClick" v-if='smsCode'>{{(data.mobile&&data.isBindTel)? '解绑':'绑定'}}</a></div>
        a-form-item(label="微信")  <div class='phoneBody'><div>{{data.wechatName? data.wechatName:'--'}} </div><div :class="data.isBindWechat?'phoneBind':'phoneNotBind'" v-if='data.wechatName'>{{data.isBindWechat?'已验证':'未验证'}}</div> <div v-if='wechatCode'> <a @click="wechatClick" v-if='!data.wechatName||!data.isBindWechat'>绑定</a> <a-popconfirm v-else title="是否确认解绑该微信账号?" ok-text="确认" cancel-text="取消" @confirm="wechatClick" > <a href="#">解绑</a> </a-popconfirm></div></div>
        a-form-item(label="姓名") {{data.name? data.name:'--'}}
        a-form-item(label="性别")
          span.itemContent  
            span(v-if="data.gender === 'NONE'") 保密
            span(v-else-if="data.gender === 'MALE'") 男
            span(v-else-if="data.gender === 'FEMALE'") 女
        a-form-item(label="注册时间") {{data?.createTime? timeFormat(data?.createTime,true):'--'}}
        a-form-item(label="最后登录时间") {{data?.lastLoginTime? timeFormat(data?.lastLoginTime,true):'--'}} 
        a-form-item(label="头像") 
          a-image(v-if="imageUrl" :src="imageUrl" :width="100")  
          span(v-else) --
      a-form(layout="inline" :model="data")(v-else)
        a-form-item(label="帐号")
          a-input(:value="data.username" disabled )
        a-form-item(label="手机号码")
           <div class='phoneBody'><div>{{data.mobile? data.mobile:'--'}} </div><div :class="data.isBindTel?'phoneBind':'phoneNotBind'" v-if='data.mobile'>{{data.isBindTel?'已验证':'未验证'}}</div><a @click="phoneClick">{{(data.mobile&&data.isBindTel)? '解绑':'绑定'}}</a></div>

        a-form-item(label="姓名")
          a-input(v-model:value="data.name" )
        a-form-item(label="性别")
          a-radio-group(v-model:value="data.gender" )
            a-radio(:value="'NONE'") 保密
            a-radio(:value="'MALE'") 男
            a-radio(:value="'FEMALE'") 女
        a-form-item(label="头像")
          g-upload(
            :file="fileList"
            :sceneCode="GLOBAL_SCENE_CODE.ouaaUser"
            @changeFile="changeFile"
            businessKey="ouaa"
            :max="1")
  template(#footer-page)
    template(v-if="isEdit")
      a-button(@click="cancel") 取消
      a-button(type="primary" @click="save") 保存
    template(v-else)  
      a-button(type="primary" @click="edit") 编辑  
    <a-modal v-model:visible="modalVisible" :title=title width='380px' centered class='phone-verify-modal' @ok="phoneSave" :confirmLoading="buttonLoading">
      <phone-verify v-if='modalVisible' ref="phoneVerifyRef" :changePhone=changePhone @success='bindPhone' @loading='loadingChange'/>
    </a-modal>
    <a-modal v-model:visible="wechatModalVisible" title='微信绑定' width='380px'  centered footer>
      <wechat-verify v-if='wechatModalVisible' />
    </a-modal>
    <a-apin></a-apin>
</template>
<script>
import { getToken } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/services/AccountService";
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons-vue";
import {
defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs
} from "vue";
import { useRoute, useRouter } from "vue-router";
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout";
import gUpload from "./components/gUpload.vue";
import {GLOBAL_SCENE_CODE} from "@ghcloud/cube-file-service"
import PhoneVerify from "./components/phone-verify.vue";
import WechatVerify from "./components/wechat-verify.vue";
import { message } from "ant-design-vue";
import { cubeOuaaService } from '@/api/server'
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}
export default defineComponent({
  components: {
    PlusOutlined,
    LoadingOutlined,
    gLayout,
    gUpload,
    PhoneVerify,
    WechatVerify
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const title = ref('解绑手机号')
    const router = useRouter();
    const fileList = ref([]);
    const imageUrl = ref("");
    const updateLoading = ref(false);
    const buttonLoading = ref(false);
    const modalVisible = ref(false);
    const wechatCode = ref(false)
    const smsCode = ref(false)
    const wechatModalVisible = ref(false);
    const changePhone = ref('')
    const phoneVerifyRef = ref()
    const formState = reactive({
      data: {},
      loading: false,
      isEdit: false,
      headers: null,
      token: null,
      userId: null,
    });

    const edit = () => {
      formState.isEdit = true;
    };
  const phoneClick = () =>{
    title.value = (formState.data.isBindTel&&formState.data.mobile)?'解绑手机号':'绑定手机号'
    if(formState.data.isBindTel&&formState.data.mobile){
      changePhone.value = formState.data.mobile
    }else{
      changePhone.value = ''
    }
    modalVisible.value = true
  }  
  const wechatClick = () =>{
    if(!formState.data.isBindWechat){
      wechatModalVisible.value = true
    }else{
      // ...解绑
      wechatUnbind()
    }
  }
  const bindPhone =() =>{
    modalVisible.value  = false
    if(changePhone.value === ''){
      message.success('绑定成功')
    }else{
      message.success('解绑成功')
    }
    localStorage.removeItem('verify-code-last-send-time');
    getUser()
  }
  const loadingChange = (loading) =>{
    buttonLoading.value = loading
  }
    const cancel = () => {
      // history.go(-1);
      getUser();
      formState.isEdit = false;
    };

    const handleChange = (info) => {
      if (info.file.status === "uploading") {
        updateLoading.value = true;
        return;
      }

      if (info.file.status === "done") {
        // Get this url from response in real world.
        getBase64(info.file.originFileObj, (base64Url) => {
          imageUrl.value = base64Url;
          updateLoading.value = false;
        });
      }

      if (info.file.status === "error") {
        updateLoading.value = false;
        proxy.$message.error("上传失败");
      }
    };

    const save = async () => {
      await proxy.$api.user(formState.data, "put");
      proxy.$message.success("操作成功");
      formState.isEdit = false;
      getUser();
      // window.location.reload()
    };
    const phoneSave = async () => {
        phoneVerifyRef.value.handleFinish()
    };  
    const getUser = () => {
      formState.loading = true;
      proxy.$api
        .userInfo({ id: formState.userId }, "get")
        .then(async (res) => {
          formState.data = res;
          Object.assign(formState.data, {
            fileId: res.fileVO ? res.fileVO.id : "",
          });
          fileList.value = res.fileVO
            ? [
              {
                uid: res.fileVO.id,
                id: res.fileVO.id,
                name: res.fileVO.name,
                status: "done",
                url: res.fileVO.path,
                response: {
                  data: { id: res.fileVO.id },
                },
              },
            ]
            : [];
          if (res.fileVO) {
            imageUrl.value = `${res.fileVO.path}`;
          }
          sessionStorage.setItem('GH-UserInfo', JSON.stringify(formState.data));
        })
        .finally(() => {
          formState.loading = false;
        });
    };

    const changeFile = (data) => {
      if (data[0]) {
        formState.data.fileId = data[0];
      } else {
        formState.data.fileId = null;
        imageUrl.value = null;
      }
    };
  // 检查URL中是否有code参数，如果有则表示微信扫码登录成功并重定向回来
  const checkWxLoginCode = () => {
    if (window.location.href.indexOf('code') >= 0) {
      let code = window.location.href.split('?')[1];
      const obj = code.split('&');
      code = obj[0].substring(5, code.indexOf('&'));
      let state = obj[1].substring(6);
      const wxCode = sessionStorage.getItem('wx-login-code')
      if(wxCode !== code && state === 'STATE'){
        sessionStorage.setItem('wx-login-code', code)
         wechatLogin(code);
      }
        
    }
  };
    const wechatLogin =  (code) => {
      formState.loading = true
        cubeOuaaService.bindWechat({code}).then(res => { 
            message.success('绑定成功')
            getUser()
          }).catch(err => {
            message.error(err?.errorMessage??'绑定失败，请重试');
        }).finally(() => {
          formState.loading = false
        });
    }
    const wechatUnbind =  (code) => {
      formState.loading = true
        cubeOuaaService.unbindWechat({code}).then(res => { 
            message.success('解绑成功')
            getUser()
          }).catch(err => {
            message.error(err?.errorMessage??'解绑失败，请重试');
        }).finally(() => {
          formState.loading = false
        });
    }

    const getProjectInfo = async () => {
      try {
        const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
          itemCode: 'SYS_ABILITY_CONFIG',
          code: 'sms_code'
        });
        if(res.variable === 'true'){
          smsCode.value = true
        }else{
          smsCode.value = false
        }
      } catch (error) {
      } finally {
      
      }
    };
    const getWechatInfo = async () => {
      try {
        const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
          itemCode: 'SYS_ABILITY_CONFIG',
          code: 'wechat_login'
        });
        if(res.variable === 'true'){
          wechatCode.value = true
        }else{
          wechatCode.value = false
        }
      } catch (error) {
        // (function(){})('获取项目信息失败', error);
      } finally {
      
      }
    };
    onMounted(async () => {
      // 页面加载时检查是否有微信登录的code
      checkWxLoginCode();
      getWechatInfo()
      getProjectInfo()
      formState.userId = JSON.parse(sessionStorage.getItem("GH-UserInfo")).id;
      getUser();
      const token = await getToken();
      formState.headers = {
        Authorization: "Bearer " + token.access_token,
        terminal: window.config.terminal,
        tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
      };
    });

    return {
      fileList,
      imageUrl,
      labelCol: {
        span: 4,
      },
      updateLoading,
      modalVisible,
      wrapperCol: {
        span: 14,
      },
      ...toRefs(formState),
      cancel,
      timeFormat,
      edit,
      phoneClick,
      handleChange,
      phoneVerifyRef,
      title,
      save,
      changeFile,
      bindPhone,
      GLOBAL_SCENE_CODE,
      phoneSave,
      changePhone,
      wechatModalVisible,
      wechatClick,
      loadingChange,
      buttonLoading,
      smsCode,
      wechatCode,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

</style>
<style lang="scss">
.phoneBody {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .phoneBind {
    color: #52c41a;
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .phoneNotBind {
    color: #faad14;
    background-color: #fffbe6;
    border: 1px solid #ffe58f;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  a {
    color: #1890ff;
    margin-left: 4px;
    
    &:hover {
      color: #40a9ff;
    }
  }
}
</style>