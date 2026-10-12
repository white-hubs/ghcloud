<template>
  <div class="content">
      <g-layout title="通用配置">
          <template #content-table>
              <div class="tips">
               <div style="padding-right:10px">三方扫码配置</div>
               <a-alert
                  message="用于三方应用扫码二维码时，配置是否需进行帐号登录才能查看业务数据"
                  type="warning"
                  show-icon
                />
              </div>
              <div class="form">
                <span style="padding-right:10px">扫码登录配置</span>
                 <a-switch v-model:checked="allowView" @click="changeViewPermission"/>
              </div>
          </template>
      </g-layout>
  </div>
</template>

<script>
import { defineComponent,provide,reactive,toRefs, ref, getCurrentInstance, onMounted } from "vue"
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { authStore } from "@/api/auth-store";
import {ITEM_CODE,COMMON_CONFIG} from './common-config.ts'
export default defineComponent({
  setup(props) {
    const { proxy } = getCurrentInstance();
    const commonConfigList=ref()
    const cubeDictionaryService = new CubeDictionaryService(authStore)
    const variableList=ref()
    onMounted(()=>{
      getDictionaryItem()
    })
    //初始化字典项
    const getDictionaryItem = async () => {
      try {
        const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({
          code: ITEM_CODE
        })
        if (!dictionaryItem) {
          await cubeDictionaryService.addDataDictionaryItem({
            code: ITEM_CODE,
            remarks: '二维码配置'
          })
        }
        await getFieldConfigService()
        variableList.value=(commonConfigList.value.find(x=>x.code==='common_config')?.variable&&JSON.parse(commonConfigList.value.find(x=>x.code==='common_config')?.variable??''))??[]
        allowView.value=variableList.value.find(x=>x.key==='allowView')?.value??false
      } catch (error) {
      }
    }
    //初始化字典
    const getFieldConfigService=async()=>{
      commonConfigList.value = await cubeDictionaryService.getDictionaryByItem({itemCode:ITEM_CODE})
      let insertNewDictionary = false
      const list=[]
      COMMON_CONFIG.forEach(x=>{
        const findItem =commonConfigList.value.find(item=>item.code===x.code)
        if(!findItem){
          list.push({
            code:x.code,
            itemCode: ITEM_CODE,
            name:x.name,
            variable:JSON.stringify(x.variable)
          })
          insertNewDictionary = true
        }else{
          findItem.name = x.name
        }
      })
      await Promise.all(list.map(async e => { await addDataDictionary(e) }))
      if(insertNewDictionary){
        commonConfigList.value = await cubeDictionaryService.getDictionaryByItem({itemCode:ITEM_CODE})
      }
    }
    //添加字典
    const addDataDictionary=async(item)=>{
      await cubeDictionaryService.addDataDictionary({
        code:item.code??'',
        itemCode: ITEM_CODE??'',
        name:item.name??'',
        variable:item.variable??''
      })
    }
    const allowView=ref(false)
    const changeViewPermission=async()=>{
      variableList.value.forEach(x=>{
        if(x.key==='allowView'){
          x.value=allowView.value
        }
      })
      try{
          const data=commonConfigList.value.find((x)=>x.code==='common_config')
          await cubeDictionaryService.updateDataDictionary( {
            id: data.id,
            itemCode: data.itemCode,
            name:data.name,
            code: data.code,
            variable:JSON.stringify(variableList.value) 
          })
          proxy.$message.success("操作成功");
        }catch(err){
          proxy.$message.error("操作失败");
        }
    }
    return{
      allowView,
      changeViewPermission
    }
  }
  
})
</script>

<style lang="less" scoped>
.tips{
  display: flex;
  align-items: center;
}
.form{
  margin:20px 0px
}
</style>