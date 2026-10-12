<template lang="pug">
g-layout(title="极光推送配置")
  template(#content-table)
    a-form(ref="form" :model="model" :rules="rules" v-bind="layout")
      a-form-item(label="服务商名称")
        span 极光
      a-form-item(label="appKey" name="appKey")
        a-input(v-model:value.trim="model.appKey" placeholder="请输入appKey")
      a-form-item(label="secret" name="secret")  
        a-input(v-model:value.trim="model.secret" placeholder="请输入秘钥")
  template(#footer-page)      
    a-button(type="primary" @click="submit") 保存
</template>
<script>
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { defineComponent, getCurrentInstance, reactive, toRefs, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  components: { gLayout },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      model: {
        id: "",
        appKey: "",
        secret: "",
      },
      rules: {
        appKey: [{ required: true, message: "请输入appKey" }],
        secret: [{ required: true, message: "请输入secret" }],
      },
      layout: {
        labelCol: { span: 4 },
        wrapperCol: {
          span: 12,
        },
      },
    });

    const form = ref();

    const getData = async (params) => {
      const data = await proxy.$api.jgMsgSet(params, "get");
      if (data && typeof data === "object") {
        state.model = data;
      } else {
        state.model = {
          id: "",
          appKey: "",
          secret: "",
        };
      }
    };

    const submit = () => {
      form.value.validate().then(async () => {
        state.model.id ? await proxy.$api.shortMsgConfigEdit(state.model, "put") : await proxy.$api.shortMsgConfigAdd(state.model, "post");
        proxy.$message.success("操作成功");
      });
    };

    onMounted(() => {
      getData();
    });

    return {
      form,
      ...toRefs(state),
      submit,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-form) {
  max-width: 50%;
  text-align: left;
  // margin: 0 auto;
}
</style>
