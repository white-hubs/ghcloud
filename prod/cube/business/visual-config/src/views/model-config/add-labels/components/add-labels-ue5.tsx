
import { defineComponent, onMounted, reactive, ref, watch, type PropType } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { Button, Form, FormItem, Input, Modal, PopConfirm, Radio, RadioGroup, Select, Table, Textarea, Tooltip, TreeSelect } from '@ghcloud/cube-ui'
import styles from '../../model-config.module.less'
import { businessTypes, labelColors, labelTypes } from './add-label'
import { getAreaDetails, getAreaList, type GetAreaList } from '@/api/mdata'
import { FileUpload } from '@ghcloud/generic-component'
import { addModel } from '@/api/model'
import _ from 'lodash'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

export const AddLabelUe5 = defineComponent({
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    }
  },
  emits: ['getModelData'],
  setup: (props, { emit }) => {
    const modal = reactive({
      visible: false,
      title: '新增标签',
      index: 0,
      textValue: ''
    })
    const uploadEnd = (data: { path: string; }[]): void => {
      formData.image = data[0]?.path
    }
    const scrollY = ref<number>(800)
    const modelServer = ref(props.data.ue5.labelList)
    const areaOptions = ref<GetAreaList[]>([])
    const ue5Columns = [
      {
        title: '标签类型',
        dataIndex: 'type',
        key: 'type',
        customRender: ({ record }: { record: { type: string; }; index: number; }): JSX.Element =>
          <>
            <span>{record.type === 'textLabel' ? '文本标签' : '卡片标签'} </span>
          </>
      },
      {
        title: '位置',
        dataIndex: 'location',
        key: 'location',
        customRender: ({ record }: { record: { location: string;locationParam: string; }; index: number; }): JSX.Element =>
          <>
            <span>{record.location === 'default' ? '模型中心' : record.locationParam} </span>
          </>
      },
      {
        title: '详情',
        dataIndex: 'contentType',
        key: 'contentType',
        customRender: ({ record }: { record: { contentType: string;contentParam: string; }; index: number; }): JSX.Element =>
          <>
            <Tooltip title={record.contentParam || '--'}>
              <div class={styles['text-ellipsis']}>标题:{record.contentParam || '--'}</div>
            </Tooltip>
          </>
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ index }: { record: { name: string; url: string; }; index: number; }): JSX.Element =>
          <>
            <PopConfirm
              title='是否确认删除?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                deleteUe5Model(index)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const uploadRef = ref()
    const formData = reactive({
      type: '',
      location: '',
      area: [''],
      locationParam: '',
      contentType: '',
      businessType: '',
      contentParam: '',
      labelColor: '',
      title: '',
      details: '',
      image: '',
    })
    const queryModel = (): void => {

    }
    const resetting = (): void => {
      modal.textValue = ''
      queryModel()
    }
    const deleteUe5Model = async (index: number): Promise<void> => {
      const modelConfig: ModelConfigItf = _.cloneDeep(props.data)
      modelConfig.ue5.labelList.splice(index, 1)
      await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
      emit('getModelData')
    }
    // const textContent =
    // 获取区域数据
    const areaList = async (): Promise<void> => {
      const data = await getAreaList()
      areaOptions.value = data
    }
    // 计算table-y的高度
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
    const addUeLabel = (): void => {
      Object.assign(formData, {
        location: 'default',
        type: 'textLabel',
        locationParam: '',
        contentType: 'default',
        businessType: 'name',
        labelColor: '0',
        area: []
      })
      areaValue.value = []
      modal.visible = true
    }
    const areaValue = ref<string[]>([])
    const getAreaSelect = (value: string[], label: string[], node: { triggerNode: { props: { id: string;name: string;aliasName: string; }; }; }): void => {
      const index = (formData.area as unknown as string[]).findIndex((item) => JSON.parse(item).id === node.triggerNode.props.id)
      areaValue.value = value
      if (index !== -1) {
        (formData.area as unknown as string[]).splice(index, 1)
        return
      }
      formData.area = [...formData.area, JSON.stringify({ id: node.triggerNode.props.id, name: node.triggerNode.props.name, aliasName: node.triggerNode.props.aliasName })]
    }
    const handelSave = async (): Promise<void> => {
      const modelConfig: ModelConfigItf = _.cloneDeep(props.data)
      const params: { contentParam: string; type: string; location: string; area: string[]; locationParam: string; contentType: string; businessType: string; labelColor: string; title: string; details: string; image: string; }[] = []
      if (formData.type === 'textLabel') {
        if (formData.location === 'default') {
          for (let index = 0; index < formData.area.length; index++) {
            const res = await getAreaDetails(JSON.parse(formData.area[index]).id)
            params.push({
              ...formData,
              area: JSON.parse(formData.area[index]),
              contentParam: formData.businessType === 'name' ? res.name : res.areaExtend.introduce
            })
          }
        } else {
          params.push({
            ...formData,
          })
        }
        !modelConfig.ue5.labelList && (modelConfig.ue5.labelList = [])
        modelConfig.ue5.labelList.push(...params)
        await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
        emit('getModelData')
      }
      modal.visible = false
    }
    watch(() => props.data, () => {
      modelServer.value = props.data.ue5.labelList
    })
    onMounted(() => {
      areaList()
      getScrollY()
    })
    return (): JSX.Element =>
      <>
        <div class={styles['model-head']}>
          <div>
            <span> 标签详情：</span>
            <Input
              style={{ width: '300px' }}
              maxlength={50}
              placeholder='请输入'
              v-model:value={modal.textValue}
            />
          </div>
          <div>
            <Button type='primary' style={{ marginLeft: '10px' }} onClick={queryModel}>查询</Button>
            <Button style={{ marginLeft: '10px' }} onClick={resetting}>重置</Button>
          </div>
        </div>
        <Button type='primary' style={{ marginTop: '10px' }} onClick={addUeLabel}>新增标签</Button>
        <Table
          style={{ marginTop: '10px' }}
          columns={ue5Columns}
          dataSource={modelServer.value}
          scrollY={scrollY.value}
          rowKey='id'
          pagination={false}
        />
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
            <FormItem label='标签类型' name='type'>
              <Select
                style={{ width: '200px' }}
                v-model:value={formData.type}
                options={labelTypes}
                allow-clear={false}
                placeholder='请选择标签类型'
              />
            </FormItem>
            <FormItem label='标签位置' name='location'>
              <RadioGroup value={formData.location} onChange={(value: string) => {
                formData.location = value
              }}>
                <Radio value='default'>模型中心</Radio>
                <Radio value='custom'>自定义</Radio>
              </RadioGroup>
              <div>
                {
                  formData.location === 'default'
                    ? <TreeSelect
                      style={{ width: '400px' }}
                      onChange={getAreaSelect}
                      v-model:value={areaValue.value} multiple treeCheckStrictly={false} placeholder='请选择区域' field-names={{ label: 'name', value: 'id', children: 'children' }}
                      treeData={areaOptions.value} maxTagCount={6} allow-clear show-search
                    />
                    : <Textarea value={formData.locationParam} onChange={(e: string) => {
                      formData.locationParam = e
                    }} />
                }
              </div>
            </FormItem>
            {
              formData.type === 'textLabel' &&
            <FormItem label='标签文案' name='contentType'>
              <RadioGroup value={formData.contentType} onChange={(value: string) => {
                formData.contentType = value
              }}>
                <Radio value='default'>关联业务</Radio>
                <Radio value='custom'>自定义</Radio>
              </RadioGroup>
              <div>
                {
                  formData.contentType === 'default'
                    ? <Select
                      style={{ width: '200px' }}
                      v-model:value={formData.businessType}
                      options={businessTypes}
                      allow-clear={false}
                      placeholder='请选择'
                    />
                    : <Textarea value={formData.contentParam} onChange={(e: string) => {
                      formData.contentParam = e
                    }} />
                }
              </div>
            </FormItem>
            }
            {
              formData.type === 'cardLabel' &&
            <FormItem label='标签文案' name='contentType'>
              <RadioGroup value={formData.contentType} onChange={(value: string) => {
                formData.contentType = value
              }}>
                <Radio value='default'>关联业务</Radio>
                <Radio value='custom'>自定义</Radio>
              </RadioGroup>
              {
                formData.contentType === 'custom' &&
              <div>
                <div class={styles['flex-center']}>
                  <span>标题：</span>
                  <Input
                    style={{ width: '300px' }}
                    maxlength={50}
                    placeholder='请输入'
                    v-model:value={modal.title}
                  />
                </div>
                <div class={styles['flex-center']}>
                  <span>详情：</span>
                  <Textarea value={formData.details} />
                </div>
                <div class={styles['flex-center']}>
                  <span>图片：</span>
                  <FileUpload
                    ref={uploadRef}
                    sceneCode={GLOBAL_SCENE_CODE.visualConfig}
                    type='picture-card'
                    onEnd={uploadEnd}
                    customText='上传图片'
                    size={200}
                    maxNum={1}
                  />
                </div>
              </div>
              }
            </FormItem>
            }

            <FormItem label='标签颜色' name='labelColor'>
              <RadioGroup buttonStyle='solid' options={labelColors} value={formData.labelColor} />
            </FormItem>
            <FormItem label='点击交互' name='labelColor'>
              <span>聚焦模型</span>
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
