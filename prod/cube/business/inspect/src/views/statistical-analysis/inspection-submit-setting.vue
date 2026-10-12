<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #content-data>
      <Tabs type="card" style="margin-top: 10px;">
        <TabPane key="巡检图片" tab="巡检图片">
          <Alert message="用于对巡检结果的图片进行配置，以约束用户的巡检行为" type="info" show-icon style="width: 50%;margin-bottom: 5px;" />
          <Form :model="settingPicture" :label-col="{ style: 'width: 130px' }">
            <FormItem label="图片上传方式:">
              <CheckboxGroup v-model:value="settingPicture.uploadMethod" :options="[
                  { label: '拍照', value: 'camera' },
                  { label: '相册', value: 'album' },
                ]" />
            </FormItem>
            <FormItem label="图片水印添加:">
              <CheckboxGroup v-model:value="settingPicture.watermark" :options="[
                  { label: '上传地点', value: 'location' },
                  { label: '上传时间', value: 'timestamp' },
                ]" />
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button type="primary" @click="save">保存</Button>
    </template>
  </GLayout>
</template>
<script setup lang="ts">
// @ts-ignore
import GLayout from '@/components/common/g-layout.vue'
import { reactive, onMounted, ref } from 'vue'
import { CheckboxGroup, Alert, message } from 'ant-design-vue'
import { usePageName } from '@ghcloud/cube-utils'

import { cubeDictionaryService } from "@/api/service";
const { pageTitle } = usePageName()
const ITEM_CODE = 'INSPECTION_PATROL_SUBMIT_CONFIG'

const loading = ref(false)
const id = ref('')
const code = 'uploadPicConfig'
const version = ref('')
const settingPicture = reactive({
  watermark: [],
  uploadMethod: [],
})
const save = async (): Promise<void> => {
  try {
    loading.value = true
    if (id.value) {
      await cubeDictionaryService.updateDataDictionary({
        id: id.value, itemCode: ITEM_CODE, name: '巡检提交配置', code: code, version: version.value, variable: JSON.stringify({ ...settingPicture })
      })
    } else {
      await cubeDictionaryService.addDataDictionary({
        itemCode: ITEM_CODE, name: '巡检提交配置', code: code, variable: JSON.stringify({ ...settingPicture })
      })
    }
    message.success('保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({
      code: ITEM_CODE
    })
    if (!dictionaryItem) {
      await cubeDictionaryService.addDataDictionaryItem({
        code: ITEM_CODE,
        remarks: '巡检提交配置'
      })
    }
  const data = await cubeDictionaryService.getDictionaryByItem({
      itemCode: ITEM_CODE,
    })
  if (data.length) {
    id.value = data[0].id
    version.value = data[0].version
  }
  let config = { ...settingPicture }
  if (data.length && data.find((item:{code:string}) => item.code=== code)) {
    const variable = data.find((item:{code:string}) => item.code=== code)!.variable
    config = JSON.parse(variable)
  }
  settingPicture.watermark = config.watermark
  settingPicture.uploadMethod = config.uploadMethod
})
</script>
