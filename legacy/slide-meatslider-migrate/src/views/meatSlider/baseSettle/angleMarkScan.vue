<template lang="pug">
g-layout(title="编码设置")
  template(#content-table)
    .detail-form
      a-form(layout="inline" class="config")
        a-form-item(label="是否读取角标编码" name="value")
            a-radio-group(v-model:value="config.value")
                a-radio(:value="1") 是
                a-radio(:value="0") 否
  template(#footer-page)
    a-button(type="primary" @click="submit") 保存  
</template>
<script>
import {defineComponent,getCurrentInstance,onMounted,ref } from "vue"
export default defineComponent({
    setup() {
        const { proxy } = getCurrentInstance();
        const config = ref({value:""});
        const getGngleMarkConfig = async () =>{
            const data = await proxy.$api.getGngleMarkConfig();
            if(data){
                config.value = data
            }
        }
        const submit = async() =>{
            const data = await proxy.$api.editGngleMarkConfig(config.value);
            if(data){
                proxy.$message.success("操作成功");
            }
        }
        onMounted(() =>{
            getGngleMarkConfig()
        })
        return{
            config,
            submit
        }
    }
})
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.config :deep(.ant-form-item-label){
    width: auto !important;
}
</style>