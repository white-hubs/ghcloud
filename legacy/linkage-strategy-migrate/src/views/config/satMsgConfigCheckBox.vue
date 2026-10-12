<template>
  <a-form :model="model" v-bind="layout" ref="form"
    ><span class="title">{{ model.name }}</span>
    <div class="pt2">
      <a-form-item
        label="通知方式"
        :name="model.enabled ? 'channelParams' : ''"
      >
        <a-checkbox-group v-if="noticeMethod.length" v-model:value="model.channelParams" @change="change">
          <a-checkbox
            v-for="item in noticeMethod"
            :key="item.value"
            :value="`${item.terminal}&${item.value}&${item.terminalName}`"
            @change="(e) => itemChange(e, item)"
            >{{ item.label }}</a-checkbox
          >
        </a-checkbox-group>
        <span v-else>当前场景未配置可使用的通知方式</span>
      </a-form-item>
      <a-form-item label="通知内容" :name="model.enabled ? 'msgTmpContent' : ''"
        ><span>{{
          model.msgTmpContent
            .replace("${triggerTime}", "【当前时间】")
            .replace("${eventName}", "【策略名称】")
            .replace("${operatorName}", "【人员名称】")
        }}</span></a-form-item
      >
    </div>
  </a-form>
</template>
<script>
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
// @import url("@legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
.title {
  font-family: @fontMedium;
  font-weight: 500;
  font-size: 16px;
}
</style>
