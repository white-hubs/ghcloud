<template lang="pug">
g-layout(:title="formTitle")
  template(#content-table)
    .detail-form
      a-form(ref="formRef" :model="deptForm" :rules="rules" layout="inline")
        a-form-item(label="部门名称" name="name")
          a-input(v-model:value.trim="deptForm.name" placeholder="请输入部门名称" :maxlength="20")
        a-form-item(label="备注" name="remark")
          a-textarea.textArea(v-model:value="deptForm.remark" placeholder="请输入备注" :maxlength="200" showCount :auto-size="{ minRows: 2, maxRows: 9 }")
  template(#footer-page)
    a-space(:size="16")
      a-button(type="default" @click="goBack()") 取消
      a-button(type="primary" @click="onSubmit(true)") 保存
</template>

<script lang="jsx">
import { message } from "ant-design-vue";
import {
defineComponent, getCurrentInstance, onMounted,
reactive, ref, toRefs
} from "vue";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const formRef = ref(null);
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const rules = {
      name: { required: true, message: "请输入部门名称" },
    };
    const state = reactive({
      formTitle: "",
      deptForm: {
        name: "",
        remark: "",
      },
    });
    onMounted(() => {
      if (route.query.item) {
        state.formTitle = "编辑部门";
        state.deptForm = JSON.parse(route.query.item);
      } else {
        state.formTitle = "新增部门";
      }
    });
    const addDept = (back) => {
      formRef.value.validate().then(async () => {
        await proxy.$api.organization("post", {
          name: state.deptForm.name,
          remark: state.deptForm.remark,
          parentId: route.query.id ? route.query.id : "",
        });
        message.success("操作成功");
        formRef.value.resetFields();
        if (back) {
          goBack();
        }
      });
    };
    const editDept = () => {
      formRef.value.validate().then(async () => {
        await proxy.$api.organizationId("put", state.deptForm);
        message.success("操作成功");
        goBack();
      });
    };
    const onSubmit = (back) => {
      if (route.query.item) {
        editDept();
      } else {
        addDept(back);
      }
    };
    const goBack = () => {
      history.back()
    };
    const layout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 12,
      },
    };
    return {
      ...toRefs(state),
      rules,
      formRef,
      layout,
      route,
      onSubmit,
      goBack,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
