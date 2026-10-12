
import { GLayout } from '@/components/common/layout'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { type ModelConfig as ModelConfigItf, modelConfigInit } from '../model-config-init'
import { addModel, getModelConfig } from '@/api/model'
import { Button, Form, FormItem, Input, InputNumber, Modal, PopConfirm, Radio, RadioGroup, Table, Textarea } from '@ghcloud/cube-ui'
import { createUuid } from '@/utils/common'
import styles from './index.module.less'
import { useRoute, useRouter } from 'vue-router'

export const GuideSettings = defineComponent({
  setup: () => {
    const { query } = useRoute()
    const modelConfigObj = ref<ModelConfigItf>(modelConfigInit())
    const router = useRouter()
    const modal = reactive({
      visible: false,
      title: ''
    })
    const formData = reactive({
      describe: '',
      name: '',
      sort: 1,
      id: ''
    })
    const scrollY = ref<number>(600)
    const ue5Columns = [
      {
        title: '排序',
        dataIndex: 'sort',
        key: 'sort',
        align: 'center',
        customRender: ({ record }: { record: { sort: string; }; index: number; }): JSX.Element =>
          <>
            <span>{record.sort} </span>
          </>
      },
      {
        title: '导览名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        customRender: ({ record }: { record: { name: string; }; index: number; }): JSX.Element =>
          <>
            <span>{record.name} </span>
          </>
      },
      {
        title: '说明',
        dataIndex: 'describe',
        key: 'describe',
        align: 'center',

        customRender: ({ record }: { record: { describe: string;locationParam: string; }; index: number; }): JSX.Element =>
          <>
            <span>{record.describe} </span>
          </>
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        align: 'center',

        customRender: ({ index, record }: { record: { sort: number;name: string;describe: string;id: string; }; index: number; }): JSX.Element=>
          <>
            <Button type='link' onClick={() => {
              setScreen(record)
            }}>设置画面</Button>
            <Button type='link' onClick={() => {
              editGuideModel(record)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                deleteGuideModel(index)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const getScrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void => {
      getScrollY()
    }
    const getModelConfigEvent = async (): Promise<void> => {
      const res = await getModelConfig()
      if (res) {
        const modelConfig = JSON.parse(res.modelConfiguration)
        if (Object.keys(modelConfig).length > 0) {
          modelConfigObj.value = modelConfig
          modelConfigObj.value.ue5.guideData = modelConfigObj.value.ue5.guideData ?? modelConfigInit().ue5.guideData
        }
      }
    }
    const addGuideData = (): void => {
      modal.visible = true
      modal.title = '新增导览'
      formData.id = createUuid()
    }
    const deleteGuideModel = async (index: number): Promise<void> => {
      modelConfigObj.value.ue5.guideData.guideList.splice(index, 1)
      await addModel({ modelConfiguration: JSON.stringify(modelConfigObj.value) })
      getModelConfigEvent()
    }
    const editGuideModel = (value: { sort: number;name: string;describe: string;id: string; }): void => {
      modal.title = '编辑导览'
      Object.assign(formData, value)
      modal.visible = true
    }
    const setScreen = (value: { sort: number;name: string;describe: string;id: string; }): void => {
      router.push({ path: '/set-screen', query: { id: value.id, projectId: query.projectId } })
    }
    const handelSave = async (): Promise<void> => {
      if (modal.title === '新增导览') {
        modelConfigObj.value.ue5.guideData.guideList.push({
          ...formData,
        })
      } else {
        modelConfigObj.value.ue5.guideData.guideList.forEach(e => {
          if (e.id === formData.id) {
            Object.assign(e, formData)
          }
        })
      }
      modelConfigObj.value.ue5.guideData.guideList = modelConfigObj.value.ue5.guideData.guideList.sort((a, b) => a.sort - b.sort)
      await addModel({ modelConfiguration: JSON.stringify(modelConfigObj.value) })
      modal.visible = false
      Object.assign(formData, {
        sort: 1,
        name: '',
        describe: ''
      })
      getModelConfigEvent()
    }
    onMounted(async () => {
      getModelConfigEvent()
    })
    const gLayoutSlots = {
      'content-data': (): JSX.Element=> {
        return (
          <div class={styles['guide-box']}>
            <div class={styles['guide-head']}>
              模型渲染：
              <RadioGroup value={modelConfigObj.value.ue5.guideData.isOld} onChange={(value: string) => {
                modelConfigObj.value.ue5.guideData.isOld = value; modelConfigObj.value.ue5.guideData.modelLine = ''
              }}>
                <Radio value='old'>复用实例</Radio>
                <Radio value='new'>新实例</Radio>
              </RadioGroup>
              <Input
                style={{ width: '300px' }}
                maxlength={50}
                placeholder='请输入'
                disabled={modelConfigObj.value.ue5.guideData.isOld === 'old'}
                v-model:value={modelConfigObj.value.ue5.guideData.modelLine}
              />
            </div>
            <div>
              <Button type='primary' style={{ marginLeft: '10px' }} onClick={addGuideData}>新增</Button>
            </div>
            <div>
              <Table
                style={{ marginTop: '10px' }}
                columns={ue5Columns}
                dataSource={modelConfigObj.value.ue5.guideData.guideList}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
            </div>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='导览设置' showFooter v-slots={gLayoutSlots} />
        <Modal
          visible={modal.visible}
          okText='保存'
          title={modal.title}
          width='700px'
          onOk={handelSave}
          onCancel={() => {
            modal.visible = false
          }}
        >
          <Form model={formData} label-col={{ style: { width: '70px' } }}>
            <FormItem label='序号' name='contentType'>
              <InputNumber
                style={{ width: '100px !important' }}
                placeholder='请输入'
                v-model:value={formData.sort}
              />
            </FormItem>
            <FormItem label='导览名称' name='name'>
              <Input
                style={{ width: '300px' }}
                maxlength={20}
                placeholder='请输入'
                v-model:value={formData.name}
              />
            </FormItem>
            <FormItem label='说明描述' name='describe'>
              <Textarea maxlength={100} value={formData.describe} onChange={(e: string) => {
                formData.describe = e
              }} />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
