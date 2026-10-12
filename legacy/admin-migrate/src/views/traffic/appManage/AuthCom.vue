<template lang="pug">
a-form(ref="authorityForm" :model="authModel" :rules="rules" layout="inline" style="height:56px")  
  a-form-item(label="功能名称" name="name")
    a-input(v-model:value.trim="authModel.name" placeholder="功能名称")
  a-form-item(label="功能编号" name="code")
    a-input(v-model:value.trim="authModel.code" placeholder="功能编号")
  a-form-item(label="状态" name="enabled")
    a-switch(v-model:checked="authModel.enabled" un-checked-children="禁用" checked-children="启用")
  a-form-item(label="备注")
    a-input(v-model:value.trim="authModel.remark" placeholder="请输入备注" showCount :maxlength="20" style="width:155px")
  a-form-item
    a-space(:size="16")
      a-button(type="danger" v-if='length > 1 || authModel.id' @click="deleteFun") 删除
</template>
<script lang='jsx'>
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  nextTick,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { Modal } from "ant-design-vue";
import _ from "lodash";
import { number } from "echarts";
export default defineComponent({
  props: {
    index: Number,
    authModel: Object,
    length: Number,
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const authorityForm = ref();

    const state = reactive({
      rules: {
        name: [{ required: true, message: "请输入功能名称" }],
        code: [{ required: true, message: "请输入功能编号" }],
        enabled: [{ required: true, message: "请选择功能状态" }],
      },
    });

    const refValidate = async () => {
      let res;
      await authorityForm.value
        .validate()
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };

    const deleteFun = () => {
      emit("deleteFunc", props.index);
    };

    onMounted(async () => {});

    return {
      authorityForm,
      ...toRefs(state),
      deleteFun,
      refValidate,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-form) {
  width: 800px;
  &.ant-form-inline {
    display: inline-block;
    height: 56px;
  }
}
:deep(.ant-input) {
  width: 120px;
}
</style>
