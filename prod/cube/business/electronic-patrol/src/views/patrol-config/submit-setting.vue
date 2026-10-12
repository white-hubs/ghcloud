<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #content-data>
      <Tabs type="card" style="margin-top: 10px;">
        <TabPane key="巡更图片" tab="巡更图片">
          <Alert message="用于对巡更结果的图片进行配置，以约束用户的巡更行为" type="info" show-icon style="width: 50%;margin-bottom: 5px;" />
          <Form :model="settingPicture" :label-col="{ style: 'width: 130px' }">
            <FormItem label="图片是否必填:">
              <Switch v-model:checked="settingPicture.requirePic" />
            </FormItem>
            <FormItem label="图片上传方式:">
              <CheckboxGroup
                v-model:value="settingPicture.uploadMethod" :options="[
                  { label: '拍照', value: 'camera' },
                  { label: '相册', value: 'album' },
                ]"
              />
            </FormItem>
            <FormItem label="是否添加水印:">
              <CheckboxGroup
                v-model:value="settingPicture.watermark" :options="[
                  { label: '添加地点定位', value: 'location' },
                  { label: '添加时间戳', value: 'timestamp' },
                ]"
              />
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
import { Switch, CheckboxGroup, Alert } from 'ant-design-vue'
import { message } from '@ghcloud/cube-ui'
import { getDataDictionaryByItem, updateDataDictionary, addDataDictionary } from '@/api/dictionary'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
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
      await updateDataDictionary({
        id: id.value, code, version: version.value, name: '巡更图片配置', variable: JSON.stringify({ ...settingPicture })
      })
    } else {
      await addDataDictionary({
        code, name: '巡更图片配置', itemCode: 'ELECTRONIC_PATROL_SUBMIT_CONFIG', variable: JSON.stringify({ ...settingPicture })
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
  const { data } = await getDataDictionaryByItem('ELECTRONIC_PATROL_SUBMIT_CONFIG', code)
  if (data.length) {
    id.value = data[0].id
    version.value = data[0].version
  }
  let config = { ...settingPicture }
  if (data.length && data.find((e: { code: string; }) => e.code === code)) {
    const variable = data.find((e: { code: string; }) => e.code === code).variable
    config = JSON.parse(variable)
  }
  settingPicture.requirePic = config.requirePic
  settingPicture.watermark = config.watermark
  settingPicture.uploadMethod = config.uploadMethod
})
</script>
