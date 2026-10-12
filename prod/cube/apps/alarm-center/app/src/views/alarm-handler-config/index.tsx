import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useApplicationInfo, usePageName } from '@ghcloud/cube-utils'
import { Alert, Button, CheckboxGroup, Form, FormItem, message, TabPane, Tabs } from '@ghcloud/cube-ui'
import { CubeLayout } from '@ghcloud/cube-app-design'
import type { AlarmHandlerConfigVO } from '@ghcloud/cube-alarm-center-service/src/types/alarm-handler-config'
import { createDataDictionary, createDictionaryItem, getDataDictionaryByItem, getDictionaryItemByCode, getOrCreateDictionaryItem, updateDataDictionary } from '@ghcloud/cube-services-client/dictionary.client'
import { useAuthRequest } from '@ghcloud/cube-services-client'
import Checkbox from '@ghcloud/cube-ui/src/components/checkbox/checkbox'

const CONFIG_CODE = 'uploadPicConfig'

export const AlarmHandlerConfig = defineComponent({
  name: 'AlarmHandlerImageConfig',
  setup () {
    const { pageTitle } = usePageName()
    const loading = ref(false)
    const formState = reactive<AlarmHandlerConfigVO>({
      requirePic: false,
      watermark: [],
      uploadMethod: []
    })
    const { getCurrentApplicationStore } = useApplicationInfo()
    const appCode = getCurrentApplicationStore().code
    const ITEM_CODE = appCode + '_ALARM_HANDLER_SUBMIT_CONFIG'
    const currentConfigId = ref<string>('')
    const currentVersion = ref<string>('')
    const currnetRemark = ref<string>('')

    const handleSave = async (): Promise<void> => {
      loading.value = true
      if (currentConfigId.value) {
        await useAuthRequest(async ()=> updateDataDictionary({
          id: currentConfigId.value,
          itemCode: ITEM_CODE,
          name: '报警处理提交配置',
          code: CONFIG_CODE,
          variable: JSON.stringify(formState),
          version: currentVersion?.value,
          remarks: currnetRemark?.value
        }))
      } else {
        await useAuthRequest(async ()=> createDataDictionary({
          itemCode: ITEM_CODE,
          name: '报警处理提交配置',
          code: CONFIG_CODE,
          variable: JSON.stringify(formState),
        }))
      }
      loading.value = false
      fetchConfigData()
      message.success('保存成功')
    }

    const fetchConfigData = async (): Promise<void> => {
      try {
        //确保字典项存在
        await useAuthRequest(async ()=>getOrCreateDictionaryItem({code: ITEM_CODE,
          remarks: '报警处理提交配置'}))
      } catch (error) {
        message.error('加载字典数据失败')
      }
      const data = await useAuthRequest(async () => getDataDictionaryByItem({
        itemCode: ITEM_CODE
      }))
      if (data?.length) {
        currentConfigId.value = data[0].id || ''
        currentVersion.value = data[0].version || ''
        currnetRemark.value = data[0].remarks || ''
        const targetConfig = data.find(item => item.code === CONFIG_CODE)
        if (targetConfig?.variable) {
          const parsedConfig = JSON.parse(targetConfig.variable) as AlarmHandlerConfigVO
          formState.watermark = parsedConfig.watermark || []
          formState.uploadMethod = parsedConfig.uploadMethod || []
          formState.requirePic = parsedConfig.requirePic || false
        }
      }
    }

    const fileUploadOptions = [
      { label: '拍照', value: 'camera' },
      { label: '相册', value: 'album' }
    ]

    const watermarkOptions = [
      { label: '上传地点', value: 'location' },
      { label: '上传时间', value: 'timestamp' }
    ]
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <Tabs type="card" style={{ marginTop: '10px' }}>
              <TabPane key="inspection-image" tab="报警处理图片">
                <Alert
                  message="用于对报警处理的图片进行配置，以约束用户的处理行为"
                  type="info"
                  show-icon
                  style={{ width: '50%', marginBottom: '5px' }}
                />
                <Form model={formState} labelCol={{ style: 'width: 130px' }}>
                  <FormItem label="强制上传图片:">
                    <Checkbox
                      v-model={[formState.requirePic, 'checked']}
                    />
                  </FormItem>
                  <FormItem label="图片上传方式:">
                    <CheckboxGroup
                      v-model={[formState.uploadMethod, 'value']}
                      options={fileUploadOptions}
                    />
                  </FormItem>
                  <FormItem label="图片水印添加:">
                    <CheckboxGroup
                      v-model={[formState.watermark, 'value']}
                      options={watermarkOptions}
                    />
                  </FormItem>
                </Form>
              </TabPane>
            </Tabs>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button type='primary' loading={loading.value} onClick={() => {
              handleSave()
            }}>保存</Button>
          </>
        )
      }
    }

    onMounted(() => {
      fetchConfigData()
    })

    return (): JSX.Element =>
      <>
        <CubeLayout title={pageTitle} v-slots={layoutSlots} />
      </>
  },
})

