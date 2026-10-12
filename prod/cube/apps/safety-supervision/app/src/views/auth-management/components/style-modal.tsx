import { Form, FormItem, Input, InputNumber, Modal, RadioGroup, message } from '@ghcloud/cube-ui'
import { debounce } from 'lodash'
import { defineComponent, reactive, ref } from 'vue'
import type { GetDictionaryByItem } from '@ghcloud/cube-dictionary-service'
import { cubeDictionaryService } from '@/api/server'

interface MarketInfo {
  marketCode: string;
  marketName: string;
  marketTenant: string | number;
}
const dictCode = 'MARKET_STYLE_CONFIG'
export const StyleModal = defineComponent({
  emits: ['enter', 'cancel'],
  setup (props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const marketRecord = ref<MarketInfo>()

    const formState = reactive<{
      version: GetDictionaryByItem;
      projectId: GetDictionaryByItem;
      height: GetDictionaryByItem;
    }>({
      version: {
        variable: ''
      },
      projectId: {
        variable: ''
      },
      height: {
        variable: ''
      },
    } as any)
    const initConfig = (code: string): GetDictionaryByItem[] => {
      const versionConfig = {
        id: '',
        name: '市场版本',
        code: `${code}_version`,
        remarks: '',
        version: '',
        flag: false,
        variable: '',
        itemCode: dictCode,
      }
      const projectIdConfig = {
        id: '',
        name: 'UE5项目ID',
        code: `${code}_projectId`,
        remarks: '',
        version: '',
        flag: false,
        variable: '',
        itemCode: dictCode,
      }
      const heightConfig = {
        id: '',
        name: '地图标签高度',
        code: `${code}_height`,
        remarks: '',
        flag: false,
        version: '',
        variable: '',
        itemCode: dictCode,
      }
      return [versionConfig, projectIdConfig, heightConfig]
    }
    const getDetail = async (code: string): Promise<void> => {
      try {
        const res = await cubeDictionaryService.getDictionaryByItem({
          itemCode: dictCode
        })
        const filtercode = ['version', 'projectId', 'height'].map(item => `${code}_${item}`)
        const resConfig = res.filter(item => filtercode.includes(item.code))
        const config = !resConfig.length ? initConfig(code) : resConfig
        formState.version = config?.find(i => i.code === `${code}_version`) as unknown as GetDictionaryByItem ?? initConfig(code).find(config => config.code === `${code}_version`) as GetDictionaryByItem
        formState.projectId = config?.find(i => i.code === `${code}_projectId`) as unknown as GetDictionaryByItem ?? initConfig(code).find(config => config.code === `${code}_projectId`) as GetDictionaryByItem
        formState.height = config?.find(i => i.code === `${code}_height`) as unknown as GetDictionaryByItem ?? initConfig(code).find(config => config.code === `${code}_height`) as GetDictionaryByItem
      
      } catch {
        throw new Error('获取字典项失败')
      }
    }
    const getDictionary = async (code: string): Promise<void> => {
      try {
        const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({
          code: dictCode
        })
        if (!dictionaryItem) {
          await cubeDictionaryService.addDataDictionaryItem({
            code: dictCode,
            remarks: '市场样式配置'
          })
        }
        await getDetail(code)
      } catch {}
    }
    const openModal = async (record: unknown): Promise<void> => {
      marketRecord.value = record as MarketInfo
      modalVisible.value = true
      await getDictionary(marketRecord.value?.marketTenant as string)
    }
    const reset = (): void => {
      formState.version = { variable: '' } as any
      formState.projectId = { variable: '' } as any
      formState.height = { variable: '' } as any
    }
    const handleOk = debounce(async () => {
      try {
        submitLoading.value = true
        if (formState.version.variable === '2.0' && !formState.projectId.variable) {
          // message.error('请输入UE5项目ID')
          return
        }
        for (const keys of Object.keys(formState)) {
          if (!(formState as any)[keys].id) {
            await cubeDictionaryService.addDataDictionary({
              ...(formState as any)[keys]
            })
          } else {
            await cubeDictionaryService.updateDataDictionary({
              ...(formState as any)[keys]
            })
          }
        }
        message.success('操作成功')
        modalVisible.value = false
        emit('enter')
        reset()
      } catch (error) {
      } finally {
        submitLoading.value = false
      }
    }, 500)
    const handleCancel = (): void => {
      modalVisible.value = false
      emit('cancel')
      reset()
    }

    expose({
      openModal,
    })

    return (): JSX.Element =>
      <>
        <Modal
          title={`样式设置【${marketRecord.value?.marketName}】`}
          visible={modalVisible.value}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={submitLoading.value}
        >
          <Form style={{ margin: '0 0 0 40px' }} model={formState} labelCol={{style: { width: '100px' } }}>
            <FormItem label='市场版本' name='version.variable'>
              <RadioGroup
                v-model:value={formState.version.variable}
                options={[
                  { label: '一期', value: '1.0' },
                  { label: '二期', value: '2.0' },
                ]}
              />
            </FormItem>
            {
              formState.version?.variable === '2.0' && (
                <FormItem label='UE5项目ID' name='projectId.variable' required>
                  <Input v-model:value={formState.projectId.variable} placeholder='UE5项目projectId' maxlength={100} style={{ width: '400px !important' }}/>
                </FormItem>
              )
            }
            <FormItem label='地图标签高度' name='height.variable'>
              <InputNumber
                  min={0}
                  max={1000}
                  placeholder='参考高度 25'
                  v-model:value={formState.height.variable}
                  style={{ width: '400px !important' }}
                />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
