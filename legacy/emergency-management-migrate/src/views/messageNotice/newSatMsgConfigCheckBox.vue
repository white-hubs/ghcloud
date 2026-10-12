<template>
  <a-form :model="model" v-bind="layout" ref="form"><span class="title">{{ model.name }}</span>
    <div class="pt2">
      <a-form-item label="通知条件" :name="model.enabled ? 'channelParams' : ''">
        <div style="display: flex;align-items: center;">
           距离任务超时时间还有
        <a-input-number id="inputNumber" style="margin: 0 5px;" v-model:value="model.notificationTime" :min="1" :max="100" />分钟提醒
        </div>
       
      </a-form-item>
      <a-form-item label="通知方式" :name="model.enabled ? 'channelParams' : ''">
        <a-checkbox-group v-model:value="model.channelParams" @change="change">
          <a-checkbox v-for="item in noticebox" :key="item.value" :value="item.value"
            @change="(e) => itemChange(e, item)">{{ item.label }}</a-checkbox>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item label="通知模板" :name="model.enabled ? 'msgTmpContent' : ''">
        <span> {{model.msgTmpContent}}</span>
      </a-form-item>
    </div>
  </a-form>
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
    const moduleID = ref();
    moduleID.value = props?.model?.satMsgChannelConfigVOS?.find((res) => res.channelType == 'CHANNEL_VOICE')?.channelTmpId
    let noticebox = ref(props.noticeMethod)
    if (props.model.satMsgDefineCode == "EMERGENCY_ALARM") {
      noticebox.value.push({
        value: "CHANNEL_VOICE",
        label: "语音通知",
        terminal: "bimops-manage-web",
        terminalName: "常德高铁站web",
      },)
    }
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
      moduleID,
      noticebox,
      ...toRefs(state),
      change,
      itemChange,
    };
  },
});
</script>
<style lang="less" scoped>
.title {
  font-family: @fontMedium;
  font-weight: 500;
  font-size: 16px;
}
.pt2{
  // display: flex;
  // align-items: center;
}
</style>
