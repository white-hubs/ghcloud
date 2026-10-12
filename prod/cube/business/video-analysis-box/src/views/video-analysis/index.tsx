import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import styles from './index.module.less'
import { Button, Form, Modal, type FormExpose, FormItem, Input, message, PopConfirm } from '@ghcloud/cube-ui'
import { cubeDictionaryService } from '@/apis/water-purification'
import type { GetDictionaryByItem } from '@ghcloud/cube-dictionary-service'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { usePageName } from '@ghcloud/cube-utils'

export const VideoAnalysis = defineComponent({
  setup: () => {
    const state = reactive({
      visibleTitle: '新增',
      visible: false
    })
    const { pageTitle } = usePageName()
    const videoBox = ref<GetDictionaryByItem[]>([])
    const loadingModal = ref(false)
    const formState = reactive({
      name: '',
      variable: '',
    })
    const currentData = ref<GetDictionaryByItem>({
      id: '',
      name: '',
      code: '',
      remarks: '',
      version: '',
      flag: false,
      variable: '',
      itemCode: ''
    })
    const rules = {
      url: { required: true, message: '请输入URL链接' },
      name: { required: true, message: '请输入名称' },
    }
    const confirmLoading = ref(false)
    const formRef = ref<FormExpose>()
    const getVideoList = async (): Promise<void> => {
      videoBox.value = await cubeDictionaryService.getDictionaryByItem({ itemCode: 'VIDEO_ANALYSIS_BOX' })
    }
    const handleOk = async (): Promise<void> => {
      formRef.value?.validate().then(async () => {
        loadingModal.value = true
        confirmLoading.value = true
        if (state.visibleTitle === '新增') {
          try {
            await cubeDictionaryService.addDataDictionary({ ...formState, itemCode: 'VIDEO_ANALYSIS_BOX' })
            getVideoList()
            message.success('新增成功')
          } catch (err) {
            message.error('新增失败')
          }
        } else {
          try {
            await cubeDictionaryService.updateDataDictionary({ ...currentData.value, ...formState })
            getVideoList()
            message.success('修改成功')
          } catch (err) {
            message.error('修改失败')
          }
        }
        state.visible = false
        loadingModal.value = false
        confirmLoading.value = false
      })
    }
    const add = async (): Promise<void> => {
      state.visibleTitle = '新增'
      formState.variable = ''
      formState.name = ''
      formRef.value?.resetFields()
      state.visible = true
    }
    const confirm = async (data: GetDictionaryByItem): Promise<void> => {
      await cubeDictionaryService.deleteDataDictionary({ id: data.id })
      await getVideoList()
      message.success('删除成功')
    }
    const handleClick = (event: MouseEvent, data: GetDictionaryByItem): void => {
      // router.push({
      //   path: '/video-view',
      //   query: {
      //     url: data.variable,
      //   }
      // })
      window.open(data.variable)
    }
    const deleteClick = (data: GetDictionaryByItem): void => {
      currentData.value = data
      formState.variable = data.variable
      formState.name = data.name
      state.visibleTitle = '编辑'
      state.visible = true
    }
    onMounted(async () => {
      getVideoList()
    })
    const layoutSlots = {
      'header-btn': () => {
        return (<Button type='primary' onClick={add}>新增</Button>)
      },
      'content-data': () => {
        return (
          <>
            <div class={styles.box}>
              {
                videoBox.value.map((item, index) => {
                  return (
                    <div key={index + item.name} class={styles.item}>
                      <div class={styles.item_title} onClick={(event) => { handleClick(event, item) }}>{item.name}</div>
                      <div class={styles.operation}>
                        <div class={styles.item_delete}>
                          <PopConfirm
                            title='确定要删除该条数据吗?'
                            onConfirm={async () => confirm(item)}
                          >
                            <DeleteOutlined /> 删除
                          </PopConfirm>
                        </div>
                        <div class={styles.item_update} onClick={async () => { deleteClick(item) }}><EditOutlined />编辑</div>
                      </div>
                    </div>
                  )
                })
              }

            </div>
          </>
        )
      },
    }
    return () =>
      <>
        <GLayout title={pageTitle} v-slots={layoutSlots} />
        <Modal
          style={{ width: '600px' }}
          v-model:visible={state.visible} title={state.visibleTitle}
          onOk={handleOk}
          confirmLoading={confirmLoading.value}
          ok-button-props={{ loading: loadingModal.value }}
        >
          <Form ref={formRef} rules={rules} labelCol={{ style: { width: '100px', textAlign: 'left' } }} layout='inline' model={formState}>
            <FormItem label='名称' name='name'>
              <Input placeholder='请输入名称' style={{ width: '400px' }} v-model:value={formState.name} />
            </FormItem>
            <FormItem style={{ 'margin-top': '10px' }} label='URL链接' name='variable'>
              <Input maxlength='100' placeholder='请输入URL链接' style={{ width: '400px' }} v-model:value={formState.variable} />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
