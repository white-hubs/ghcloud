<template lang="pug">
g-layout(title="微信支付配置")
    template(#content-table)
        .detail-form 
            a-form(ref="payConfig" :model="data" :rules="rules" layout="inline")
                //- a-form-item(label="支付状态" name="enabled")
                //-     a-switch(v-model:checked="data.enabled" checked-children="启用" un-checked-children="禁用")    
                a-form-item(label="appId" name="appId")
                    a-input(v-model:value="data.appId" placeholder="请输入商户申请的appId")
                a-form-item(label="appSecret" name="appSecret")
                    a-input(v-model:value="data.appSecret" placeholder="请输入商户申请的appSecret")
                a-form-item(label="直连商户号" name="mchId")
                    a-input(v-model:value="data.mchId" placeholder="请输入直连商户号")
                a-form-item(label="支付回调地址" name="notifyUrl")
                    a-input(v-model:value="data.notifyUrl" placeholder="请输入支付回调地址")
                a-form-item(label="API v3密钥" name="apiV3Key")
                    a-input(v-model:value="data.apiV3Key" placeholder="请输入apiV3Key")
                a-form-item(label="证书序列号" name="mchSerialNo")
                    a-input(v-model:value="data.mchSerialNo" placeholder="请输入商户证书序列号")
                a-form-item(label="密钥附件" name="fileId")
                  g-upload(:max="1" accept=".pem" @changeFile="changeFile" :file="fileList" listType="text" :sceneCode="GLOBAL_SCENE_CODE.financial")
    template(#footer-page)
        a-button(type="primary" @click="onSubmit") 确定
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
} from "vue";
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const payConfig = ref();
    const state = reactive({
      data: {
        enabled: true,
        appId: null,
        appSecret: null,
        id: null,
        mchId: null,
        notifyUrl: null,
        apiV3Key: null,
        mchSerialNo: null,
        fileId: null,
        fileVO: [],
      },
      rules: {
        appId: [{ required: true, message: "请输入" }],
        appSecret: [{ required: true, message: "请输入" }],
        mchId: [{ required: true, message: "请输入" }],
        notifyUrl: [{ required: true, message: "请输入" }],
        apiV3Key: [{ required: true, message: "请输入" }],
        mchSerialNo: [{ required: true, message: "请输入" }],
        fileId: [{ required: true, message: "请上传附件" }],
      },
      fileList: [],
    });
    onMounted(() => {
      getData();
    });
    const getData = () => {
      proxy.$api.getWeixinPayConfig().then((res) => {
        if (res.appId) {
          state.data = res;
          state.fileList = res.fileVO
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
          state.data.fileId = res.fileVO.id;
        }
      });
    };
    const onSubmit = () => {
      payConfig.value.validate().then(() => {
        if (state.data.id) {
          proxy.$api.putWeixinPayConfig(state.data).then((res) => {
            proxy.$message.success("操作成功");
            getData();
          });
        } else {
          proxy.$api.postWeixinPayConfig(state.data).then((res) => {
            proxy.$message.success("操作成功");
            getData();
          });
        }
      });
    };
    const changeFile = (data) => {
      if (data[0]) {
        state.data.fileId = data[0];
      } else {
        state.data.fileId = null;
      }
    };
    return {
      ...toRefs(state),
      payConfig,
      onSubmit,
      getData,
      changeFile,
      GLOBAL_SCENE_CODE
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
