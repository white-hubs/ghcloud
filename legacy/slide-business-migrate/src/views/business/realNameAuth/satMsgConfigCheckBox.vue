<template lang="pug">
a-form(:model="model" v-bind="layout" ref="form")
  //- a-checkbox(v-model:checked="model.enabled" :value="model.name" @change="objChange")
  span.title {{model.name}}
  div.pt2
    a-form-item(
      label="通知方式" 
      :name="model.enabled ? 'channelParams' : '' ")
      a-checkbox-group(v-model:value="model.channelParams" @change="change")
        a-checkbox(v-for="item in noticeMethod" :value="`${item.terminal}&${item.value}`" @change="(e)=>itemChange(e,item)") {{item.label}}
    a-form-item(
      label="通知内容" 
      :name="model.enabled ? 'msgTmpContent' : '' ")
      span {{model.msgTmpContent.replace('${supplierName}','【铺面名称】')}}
      //- a-textarea(:value="model.msgTmpContent.replace('${name}','【申请人】').replace('${merchantName}','【铺面名称】').replace('${reason}','【不通过原因】')" disabled)
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  props: {
    model: {
      type: Object,
    },
    noticeMethod: {
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const form = ref();

    const state = reactive({
      // rules: {
      //   channelParams: [
      //     { required: true, message: "请选择通知方式" },
      //   ],
      //   msgTmpContent: [{ required: true, message: "请填写通知模板" }],
      // },
      layout: {
        labelCol: { span: 2 },
        wrapperCol: {
          span: 20,
        },
      },
    });

    const change = (e) => {
      emit("changeItem", e);
    };
    const itemChange = (e, item) => {
      emit("itemChange", e.target.checked, item);
    };

    return {
      form,
      // noticeMethod,
      ...toRefs(state),
      change,
      itemChange,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.title {
  font-family: @fontMedium;
  font-weight: 500;
  font-size: 16px;
}
</style>
