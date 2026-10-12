<template lang="pug">
g-layout(title="密码设置")
  template(#content-table)
    a-form(ref="form", :model="model", :rules="rules", v-bind="layout")
      div(class="form-content")
        a-form-item(name="usefulLife")
            p 密码时效性
            span 超过
            a-input-number(v-model:value="model.usefulLife")
            span 天，未修改密码时：
            a-checkbox(v-model:checked="model.forced")  强制用户修改密码
        a-form-item(name="dueToPromptDay")
            p 密码到期提醒
            span 距离到期
            a-input-number(v-model:value="model.dueToPromptDay")
            span 天，提醒用户修改密码

  template(#footer-page) 
    a-button(type="primary", @click="onSubmit") 保存
</template>

<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  setup() {
    const {proxy} = getCurrentInstance()
    const state = reactive({
      model: {
        usefulLife: 0,
        dueToPromptDay: 0,
        forced:true
      },
      rules: {
        dueToPromptDay: [{ required: true, message: "请输入密码到期提醒时间" }],
        usefulLife: [{ required: true, message: "请输入密码时效性时间" }],
      },
    });
    const onSubmit =()=>{
        proxy.$api.passwordSetting('post',state.model).then(res=>{
            getData()
            proxy.$message.success('操作成功')
        })
    }
    const getData = ()=>{
        proxy.$api.passwordDetail().then(res=>{
            state.model = res
        })
    }
    onMounted(()=>{
        getData()
    })
    return {
      ...toRefs(state),
      onSubmit,
      useAdmin:window.config.useAdmin
    };
  },
});
</script>

<style lang="less" scoped>
.form-content{
    text-align: left;
    .ant-input-number{
        margin: 0 10px;
    }
    p{
        font-weight: bold;
    }
}
</style>