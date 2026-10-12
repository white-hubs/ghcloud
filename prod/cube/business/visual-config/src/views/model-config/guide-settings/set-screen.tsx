
import { GLayout } from '@/components/common/layout'
import { GVerticalLine } from '@/components/common/vertical-line'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { createUuid } from '@/utils/common'
import { useRoute, useRouter } from 'vue-router'
import { Button, Form, FormItem, Input, InputNumber, Modal, PopConfirm, Radio, RadioGroup, Select, Table, Textarea } from '@ghcloud/cube-ui'
import { addModel, getModelConfig } from '@/api/model'
import { type ModelConfig as ModelConfigItf, modelConfigInit } from '../model-config-init'

export const SetScreen = defineComponent({
  setup: () => {
    const { query } = useRoute()
    const scrollY = ref<number>(400)
    const modelConfigObj = ref<ModelConfigItf>(modelConfigInit())
    const setGuide = ref({
      name: '',
      sort: 0,
      describe: '',
      indicatorType: '',
      id: '',
      setScreen: {
        initPerspective: '',
        durationStay: 1,
        effectList: [{ name: '效果展示', value: '' }],
      },
      pointList: []
    })
    const router = useRouter()
    const indicatorData = [
      {
        label: '今日访客人数',
        value: 'NumberVisitors'
      },
      {
        label: '会议室使用率',
        value: 'ConferenceRoomUtilizationRate'
      },
      {
        label: '能耗电用量',
        value: 'EnergyConsumption'
      },
      {
        label: 'PM2.5',
        value: 'PM2.5'
      },
    ]
    const productList = [
      {
        label: '效果展示',
        value: '效果展示',
      },
      {
        label: '模型环游',
        value: '模型环游',
      },
    ]
    const ue5Columns = [
      {
        title: '点位',
        dataIndex: 'point',
        key: 'point',
        align: 'center',
        customRender: ({ record }: { record: { point: string; }; index: number; }): JSX.Element =>
          <>
            <span>{record.point} </span>
          </>
      },
      {
        title: '点位视角',
        dataIndex: 'angleView',
        key: 'angleView',
        align: 'center',
        customRender: ({ record }: { record: { angleView: string; }; index: number; }): JSX.Element=>
          <>
            <span>{record.angleView} </span>
          </>
      },
      {
        title: '点位介绍',
        dataIndex: 'describe',
        key: 'describe',
        align: 'center',

        customRender: ({ record }: { record: { describe: string;locationParam: string; }; index: number; }): JSX.Element=>
          <>
            <span>{record.describe} </span>
          </>
      },
      {
        title: '停留时长',
        dataIndex: 'time',
        key: 'time',
        align: 'center',

        customRender: ({ record }: { record: { time: string;locationParam: string; }; index: number; }): JSX.Element=>
          <>
            <span>{record.time} </span>
          </>
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        align: 'center',

        customRender: ({ index, record }: { record: { sort: number;name: string;describe: string;id: string; }; index: number; }): JSX.Element =>
          <>
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
    const modal = reactive({
      visible: false,
      title: ''
    })
    const formData = reactive({
      id: '',
      title: '',
      point: '',
      angleView: '',
      type: 'characters',
      time: 1,
      describe: '',
      indicatorType: '',
    })
    const getScrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 250
      }
    }
    window.onresize = (): void => {
      getScrollY()
    }
    const addEffect = (): void => {
      setGuide.value.setScreen.effectList.push({
        name: '效果展示', value: ''
      })
    }
    const deleteEffect = (i: number): void => {
      setGuide.value.setScreen.effectList.splice(i, 1)
    }
    const deleteGuideModel = async (i: number): Promise<void> => {
      setGuide.value.pointList.splice(i, 1)
      modelConfigObj.value.ue5.guideData.guideList.forEach(e => {
        if (e.id === setGuide.value.id) {
          e = setGuide.value
        }
      })
      await addModel({ modelConfiguration: JSON.stringify(modelConfigObj.value) })
    }
    const editGuideModel = async (record: { sort: number; name: string; describe: string; id: string; }): Promise<void> => {
      Object.assign(formData, record)
      modal.title = '编辑轮播点位'
      modal.visible = true
    }
    const addPoint = (): void => {
      Object.assign(formData, {
        id: '',
        title: '',
        point: '',
        angleView: '',
        type: 'characters',
        time: 1,
        describe: '',
        indicatorType: '',
      })
      modal.visible = true
      modal.title = '添加轮播点位'
    }
    const handelSave = async (): Promise<void> => {
      if (modal.title === '添加轮播点位') {
        formData.id = createUuid()
        // @ts-ignore
        setGuide.value.pointList.push(JSON.parse(JSON.stringify(formData)))
      } else {
        setGuide.value.pointList = setGuide.value.pointList.map(e => {
          // @ts-ignore
          if (e.id === formData.id) {
            // @ts-ignore
            e = JSON.parse(JSON.stringify(formData))
          }
          return e
        })
      }
      modelConfigObj.value.ue5.guideData.guideList.forEach(e => {
        if (e.id === setGuide.value.id) {
          e = setGuide.value
        }
      })
      await addModel({ modelConfiguration: JSON.stringify(modelConfigObj.value) })
      modal.visible = false
    }
    const getModelConfigEvent = async (): Promise<void> => {
      const res = await getModelConfig()
      if (res) {
        const modelConfig = JSON.parse(res.modelConfiguration)
        if (Object.keys(modelConfig).length > 0) {
          modelConfigObj.value = modelConfig
          // @ts-ignore
          setGuide.value = modelConfigObj.value.ue5.guideData.guideList.find(e => e.id === query.id)
          setGuide.value.pointList = setGuide.value.pointList ?? []
          setGuide.value.setScreen = setGuide.value.setScreen ?? {
            initPerspective: '',
            durationStay: 1,
            effectList: [{ name: '效果展示', value: '' }],
          }
        }
      }
    }
    const goBack = (): void => {
      router.back()
    }
    const save = async (): Promise<void> => {
      modelConfigObj.value.ue5.guideData.guideList.forEach(e => {
        if (e.id === setGuide.value.id) {
          e = setGuide.value
        }
      })
      await addModel({ modelConfiguration: JSON.stringify(modelConfigObj.value) })
      goBack()
    }
    onMounted(async () => {
      getModelConfigEvent()
    })
    const gLayoutSlots = {
      'content-data': (): JSX.Element=> {
        return (
          <div>
            <GVerticalLine title='初始画面' />
            <div class={styles['set-screen-box']}>
              <div class={styles['set-screen-item']}>
                <div class={styles['set-screen-title']}>初始视角：</div> <Textarea maxlength={500} autosize={{ minRows: 2, maxRows: 2 }} value={setGuide.value.setScreen.initPerspective} onChange={(e: string) => {
                  setGuide.value.setScreen.initPerspective = e
                }} />
              </div>
              <div class={styles['set-screen-item']}>
                <div class={styles['set-screen-title']}>停留时长：</div>
                <InputNumber
                  style={{ height: '50px' }}
                  placeholder='请输入'
                  v-model:value={setGuide.value.setScreen.durationStay}
                />
              </div>
            </div>
            <div class={styles['set-screen-box']}>
              <div>初始效果：
                {
                  setGuide.value.setScreen.effectList.map((e, i) => {
                    return (
                      <div key={i} class={styles['set-effect-item']}>
                        <Select
                          style={{ width: '100px' }}
                          v-model:value={e.name}
                          options={productList}
                          allow-clear placeholder='请选择模型'
                        />
                        {
                          e.name !== '模型环游' &&
                        <Input
                          v-model:value={e.value}
                          style={{ width: '500px' }}
                          maxlength={100}
                          placeholder='请输入模型标签，多个用「,」隔开'
                        />
                        }
                        {
                          i === 0
                            ? <div class={styles['set-screen-add']} onClick={addEffect}>添加</div>
                            : <div class={styles['set-screen-delete']} onClick={() => {
                              deleteEffect(i)
                            }}>删除</div>
                        }
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <GVerticalLine title='轮播点位' />
              <Button type='primary' onClick={addPoint}>新增点位</Button>
              <Table
                style={{ marginTop: '10px' }}
                columns={ue5Columns}
                dataSource={setGuide.value.pointList}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
            </div>
          </div>
        )
      },
      'footer-btn': (): JSX.Element=> {
        return (
          <div class={styles['footer-btn']}>
            <Button onClick={goBack}>返回</Button>
            <Button style={{ marginLeft: '10px' }} type='primary' onClick={save}>保存</Button>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title={setGuide.value.name} showFooter v-slots={gLayoutSlots} />
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
            <FormItem label='点位' name='contentType'>
              <Input
                style={{ width: '300px !important' }}
                placeholder='请输入'
                v-model:value={formData.point}
              />
            </FormItem>
            <FormItem label='点位视角' name='name'>
              <Textarea maxlength={500} autosize={{ minRows: 2, maxRows: 2 }} value={formData.angleView} onChange={(e: string) => {
                formData.angleView = e
              }} />
            </FormItem>
            <FormItem label='停留时长' name='contentType'>
              <InputNumber
                style={{ width: '100px !important' }}
                placeholder='请输入'
                v-model:value={formData.time}
              />
            </FormItem>
            <FormItem label='说明描述' name='describe'>
              <RadioGroup value={formData.type} onChange={(value: string) => {
                formData.type = value
              }}>
                <Radio value='characters'>文字介绍</Radio>
                <Radio value='chart'>统计图表</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label='标题' name='name'>
              <Input
                style={{ width: '300px' }}
                maxlength={20}
                placeholder='请输入'
                v-model:value={formData.title}
              />
            </FormItem>
            {
              formData.type === 'characters' &&
            <FormItem label='详细' name='name'>
              <Textarea maxlength={100} value={formData.describe} onChange={(e: string) => {
                formData.describe = e
              }} />
            </FormItem>
            }
            {
              formData.type === 'chart' &&
            <FormItem label='指标' name='name'>
              <Select
                style={{ width: '300px' }}
                v-model:value={formData.indicatorType}
                options={indicatorData}
                allow-clear placeholder='请选择指标'
              />
            </FormItem>
            }
          </Form>
        </Modal>
      </>
  }
})
