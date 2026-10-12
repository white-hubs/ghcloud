<template>
  <GLayout title="报警处理配置" :showfooter="true">
    <template #content-data>
      <div style="margin-top: 12px;">
        <Alert message="用于对报警处理内容进行配置，以约束用户的安全处理行为" type="info" show-icon style="width: 50%;margin-bottom: 5px;" />
        <Form :model="settingPicture" :label-col="{ style: 'width: 130px' }">
          <FormItem label="图片是否必填:">
            <Switch v-model:checked="settingPicture.requirePic" />
          </FormItem>
          <FormItem label="APP图片上传方式:">
            <CheckboxGroup v-model:value="settingPicture.uploadMethod" :options="[
                  { label: '拍照', value: 'camera' },
                  { label: '相册', value: 'album' },
                ]" />
          </FormItem>
          <FormItem label="是否添加水印:">
            <CheckboxGroup v-model:value="settingPicture.watermark" :options="[
                  { label: '添加地点定位', value: 'location' },
                  { label: '添加时间', value: 'timestamp' },
                ]" />
          </FormItem>
        </Form>
      </div>
    </template>
    <template #footer-page>
      <Button type="primary" @click="save">保存</Button>
    </template>
  </GLayout>
</template>
<script setup lang="ts">
import GLayout from '@/components/Common/gLayout.vue'
import { reactive, onMounted, ref } from 'vue'
import { Switch, CheckboxGroup, Alert,message,Form,FormItem,Button } from 'ant-design-vue'
import { cubeDictionaryService } from '@/api/service'
const DictCode='ALARM_HANDLE_CONFIG'
const loading = ref(false)
const id = ref('')
const code = 'uploadPicConfig'
const version = ref('')
const settingPicture = reactive({
  requirePic: false,
  watermark: [],
  uploadMethod: [],
})
const save = async (): Promise<void> => {
  try {
    loading.value = true
    if (id.value) {
      await cubeDictionaryService.updateDataDictionary({
        id: id.value, code, version: version.value, name: '报警处理图片设置', variable: JSON.stringify({ ...settingPicture })
      })
    } else {
      await cubeDictionaryService.addDataDictionary({
        code, name: '报警处理图片设置', itemCode: DictCode, variable: JSON.stringify({ ...settingPicture })
      })
    }
    message.success('保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}
const getConfigData = async ()=>{
  const result = await cubeDictionaryService.getDictionaryByItem({
    itemCode: DictCode,
    code
  })
    if (result.length) {
    id.value = result[0].id
    version.value = result[0].version
  }
    let config = { ...settingPicture }
  if (result.length && result.find((e: { code: string; }) => e.code === code)) {
    const variable = result.find((e: { code: string; }) => e.code === code)?.variable
    if(variable){
      config = JSON.parse(variable)
    }
  }

  settingPicture.requirePic = config.requirePic
  settingPicture.watermark = config.watermark
  settingPicture.uploadMethod = config.uploadMethod
}

onMounted(() => {

  getConfigData()


})
</script>
