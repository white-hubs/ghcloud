import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Form, FormItem, Switch, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeDictionaryService } from '@/api/service'

/** 审批设置 */
export const ApproveSet = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const updateLoading = ref(false)
    const config = reactive({
      name: '',
      value: false,
    })
    const dictionary = {
      itemCode: 'APP_BUSINESS_CONFIG',
      code: 'MEETING_ROOM_MANAGEM_ABILITY',
    }
    const changeStatus = async (): Promise<void> => {
      const findConfig = await cubeDictionaryService.getDictionaryByItem({
        itemCode: dictionary.itemCode,
        code: dictionary.code
      })
      try {
        updateLoading.value = true
        const params = {
          name: findConfig[0].name || '',
          code: findConfig[0].code || '',
          itemCode: findConfig[0].itemCode || '',
          variable: JSON.stringify({
            MEETING_ROOM_RESERVATION: config
          }),
        }
        if (findConfig?.length) {
          await cubeDictionaryService.updateDataDictionary({ ...params, id: findConfig[0].id })
        } else {
          await cubeDictionaryService.addDataDictionary(params)
        }
        message.success('操作成功')
      } catch {
        config.value = !config.value
      } finally {
        updateLoading.value = false
      }
    }
    const getConfig = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({
        itemCode: dictionary.itemCode,
        code: dictionary.code
      })
      if (res.length > 0) {
        const data = res[0]
        const info = data.variable ? JSON.parse(data.variable) : {}
        Object.assign(config, info['MEETING_ROOM_RESERVATION'])
      }
    }
    onMounted(() => {
      getConfig()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form style={{ margin: '10px 0 0 0' }}>
              <FormItem label='是否开启审批流程'>
                <Switch v-model:checked={config.value} loading={updateLoading.value} checked-children='启用' un-checked-children='停用' onChange={async () => changeStatus()} />
              </FormItem>
            </Form>
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
