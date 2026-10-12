<template lang="pug">
g-layout(title="银行卡验证")
    template(#content-table)
        .detail-form 
            a-form(ref="payConfig" :model="data" :rules="rules" layout="inline")
                //- a-form-item(label="启用状态" name="enabled")
                //-     a-switch(v-model:checked="data.enabled" checked-children="启用" un-checked-children="禁用")    
                a-form-item(label="appCode" name="appCode" class="a-form-item-100")
                    a-input(v-model:value="data.appCode" placeholder="请输入商户申请的appCode")
                //- a-form-item(label="APPSecre" name="APPSecre")
                //-     a-input(v-model:value="data.APPSecre" placeholder="请输入商户申请的APPSecre")
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

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const payConfig = ref();
    const state = reactive({
      data: {
        enabled: true,
        appCode: null,
        APPSecre: null,
        id: null,
      },
      rules: {
        appCode: [{ required: true, message: "请输入商户申请的appCode" }],
      },
    });
    onMounted(() => {
      getData();
    });
    const getData = () => {
      proxy.$api.getBankCardValid().then((res) => {
        if (res.appCode) {
          state.data = res;
        }
      });
    };
    const onSubmit = () => {
      payConfig.value.validate().then(() => {
        if (state.data.id) {
          proxy.$api
            .putBankCardValid({
              appCode: state.data.appCode,
              id: state.data.id,
            })
            .then((res) => {
              proxy.$message.success("操作成功");
              getData();
            });
        } else {
          proxy.$api
            .postBankCardValid({ appCode: state.data.appCode })
            .then((res) => {
              proxy.$message.success("操作成功");
              getData();
            });
        }
      });
    };
    return {
      ...toRefs(state),
      payConfig,
      onSubmit,
      getData,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
