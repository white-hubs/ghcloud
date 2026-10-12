<template>
  <g-layout :title="route.query.type==='add'?'新建模板':'编辑模板'">
    <template #content-table>
      <div style="margin-top: 20px;">
        <a-form ref="formRef" :rules="rules" :model="formState" style="width: 450px;margin: auto;"
          :label-col="{span: 5, offset: 0}">
          <a-form-item label="模板名称" name="name">
            <a-input v-model:value="formState.name" />
          </a-form-item>
          <a-form-item label="应用" name="applicationCode">
            <a-select optionFilterProp="label" show-search v-model:value="formState.applicationCode"
              @change="getSceneData" placeholder="请选择应用">
              <a-select-option :value="item.code" :label="item.name" v-for="item in applicationList">
                {{ item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="使用场景" name="msgSceneCode">
            <a-select v-model:value="formState.msgSceneCode" placeholder="请选择场景">
              <a-select-option :value="item.code" v-for="item in sceneData">
                {{ item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态" style="text-align: left;" name="enabled">
            <a-radio-group v-model:value="formState.enabled">
              <a-radio :value="false">禁用</a-radio>
              <a-radio :value="true">启用</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="模板内容" name="content">
            <a-textarea :maxlength="350" v-model:value="formState.content" />
          </a-form-item>
        </a-form>
        <div class="example">
          模版示例：验证码：<span v-pre>{{code}}</span> ，请尽快完成验证！<br />
          验证码短信模版中变量名必须为 code ，格式 <span v-pre>{{code}}</span>，验证码的生成、校验逻辑均由极光实现，若需自行实现验证码的生成、校验逻辑，请通过通知短信模版实现；
        </div>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="goPage">取消</a-button>
      <a-button type="primary" @click="save">保存</a-button>
    </template>
  </g-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted,getCurrentInstance} from 'vue'
import { useRouter,useRoute } from "vue-router";
import { RuleObject, ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
import { message } from 'ant-design-vue';
const { proxy } = getCurrentInstance();
const formRef = ref();
// 验证内容
const contentRules = async (rule: RuleObject, value: string) => {
   const regex = /{{([a-zA-Z]+)}}/;
   let strArr = value.split('}}')
   let flag = false
   strArr.forEach(item=>{
    if (item.indexOf("{{")!==-1) {
      flag=true
    }
   })
   if (flag) {
     for (let i = 0; i < strArr.length; i++) {
      if (strArr[i]!==''&&strArr[i].indexOf('{{')!==-1) {
        strArr[i]+='}}'
        regex.test(strArr[i])
        if (!regex.test(strArr[i])) {
          return Promise.reject("请按照格式填写内容");
        }
      }
     }
   }else{
    return Promise.reject("请按照格式填写内容");
   }
  };
const router = useRouter();
const route = useRoute();
const applicationList = ref<{id:string;code:string;name:string}[]>([])
const rules = {
      name: [
        { required: true, message: '请输入模板名称', trigger: 'blur' },
      ],
      applicationCode: [
        { required: true, message: '请选择应用', trigger: 'blur' },
      ],
      msgSceneCode: [
        { required: true, message: '请选择使用场景', trigger: 'blur' },
      ],
      content: [
        { required: true, message: '请输入模版内容', trigger: 'blur' },
      ],
}
const formState = reactive({
  id:'',
  name:'',
  content:'',
  channelCode:'',
  enabled:false,
  msgSceneCode:'',
  applicationCode:'',
  applicationName:''
})
const sceneData = ref<{code:string;name:string}[]>([])
const getSceneData = async ()=>{
  formState.msgSceneCode = ''
  sceneData.value =  await proxy.$api.sceneList({applicationCode:formState.applicationCode})
}
const getApplicationData = async ()=>{
  let res = await  proxy.$api.appList('get',{pageSize:1000})
  applicationList.value = res.records
}

const goPage = ()=>{
  router.go(-1)
}
const save = ()=>{
  formRef.value
        .validate()
        .then(async() => {
         let params = JSON.parse(JSON.stringify(formState))
         let code = applicationList.value.filter(item=>{
            if (item.code == formState.applicationCode) {
              return item
            }
           })
           params.applicationCode = code[0].code
           params.applicationName = code[0].name
           if (route.query.type === 'add') {
            params.channelCode = route.query.channelCode
            await proxy.$api.msgTmpAdd(params)
            message.success('新增模板成功');
          }else{
            await proxy.$api.templateUpdate(formState.id,params)
            message.success('修改模板成功');
          }
       goPage()
        }).catch((error: ValidateErrorEntity<any>) => {
        });
}
onMounted(async() => {
 await getApplicationData()
  if (route.query.type === 'modify'&&typeof route.query.data==='string') {
    
    Object.assign(formState,JSON.parse(route.query.data)) 
    sceneData.value =  await proxy.$api.sceneList({applicationCode:formState.applicationCode})
  }
})
</script>
<style scoped lang="less">
.example {
  font-size: 14px;
  width: 400px;
  margin: auto;
  text-align: left;
}
</style>