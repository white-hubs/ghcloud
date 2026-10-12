
import { computed, defineComponent, onMounted, reactive, ref, type PropType } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { Button, Form, FormItem, Image, Tooltip, Input, Modal, PopConfirm, Radio, RadioGroup, Select, Table, Textarea, TreeSelect } from '@ghcloud/cube-ui'
import styles from '../../model-config.module.less'
import { businessTypes, labelColors, labelTypes } from './add-label'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import { SelectWebGlLabelConfig } from './select-webgl-label-location'
import _ from 'lodash'
import { addModel } from '@/api/model'
import { FileUpload } from '@ghcloud/generic-component'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
interface LabelState {
  labelType: string;
  locationType: string;
  location: string;
  area: string[];
  labelContent: {
    type: string;
    title: string;
    image: string;
    detail: string;
  };
  labelColor: string;
  interactive: string;
}
export const AddLabelWebGl = defineComponent({
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
      textValue: '',
    })
    const uploadRef = ref()
    const selectLocationModal = reactive({
      visible: false,
    })
    const scrollY = ref<number>(800)
    const areaOptions = ref<GetAreaList[]>([])
    const threeColumns = [
      {
        title: '标签类型',
        dataIndex: 'labelType',
        key: 'labelType',
        customRender: ({ value }: { value: string; }): string | undefined => {
          return labelTypes.find((item) => item.value === value)?.label
        }
      },
      {
        title: '位置',
        dataIndex: 'location',
        key: 'location',
        customRender: ({ record, value }: { record: LabelState;value: string; }): string | undefined => {
          if (record.locationType === 'custom') {
            // @ts-ignore
            return JSON.parse(record.area as unknown as string).name + '：' + value
          }
          const areaNameList = (record.area as unknown as string[]).map(item => (JSON.parse(item) as { name: string; }).name)
          return areaNameList.join('、') + '：' + '  区域模型中心'
        }
      },
      {
        title: '文案',
        dataIndex: 'labelContent',
        key: 'labelContent',
        customRender: ({ record, value }: { record: LabelState; value: { title: string;detail: string;image: string; }; }): JSX.Element=> {
          if (record.labelType === 'textLabel') {
            if (record.labelContent.type === 'default') {
              return (
                <>
                  <span>标题:{businessTypes.find((item) => item.value === value.title)?.label}</span>
                </>
              )
            }
            return (
              <>
                <Tooltip title={value.title || '--'}>
                  <div class={styles['text-ellipsis']}>标题:{value.title || '--'}</div>
                </Tooltip>
              </>
            )
          }
          if (record.labelContent.type === 'default') {
            return (
              <>
                <div>标题:{businessTypes.find((item) => item.value === value.title)?.label ?? '--'}</div>
                <div>详情:{businessTypes.find((item) => item.value === value.detail)?.label ?? '--'}</div>
                <div>图片:{businessTypes.find((item) => item.value === value.image)?.label ?? '--'}</div>
              </>
            )
          }
          return (
            <>
              <Tooltip title={value.title || '--'}>
                <div class={styles['text-ellipsis']}>标题:{value.title || '--'}</div>
              </Tooltip>
              <Tooltip title={value.detail || '--'}>
                <div class={styles['text-ellipsis']}>标题:{value.detail || '--'}</div>
              </Tooltip>
              <div>图片:{value.image ? <Image src={value.image} width={80} height={80} /> : '--'}</div>
            </>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ index }: { record: LabelState; index: number; }): JSX.Element =>
          <>
            <PopConfirm
              title='是否确认删除?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                deleteThreeLabel(index)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const formData = reactive<LabelState>({
      labelType: '',
      locationType: 'default',
      location: '',
      area: [],
      labelColor: '',
      interactive: '',
      labelContent: {
        type: '',
        title: '',
        image: '',
        detail: ''
      }
    })
    const labelList = computed(() => {
      return props.data.three.labelList
    })
    const queryLabel = (): void => {
    }
    const resetting = (): void => {
      modal.textValue = ''
      queryLabel()
    }
    const deleteThreeLabel = async (index: number): Promise<void> => {
      const modelConfig: ModelConfigItf = _.cloneDeep(props.data)
      modelConfig.three.labelList.splice(index, 1)
      await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
      handleAreaLabelList(modelConfig)
    }
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
    const addThreeLabel = (): void => {
      Object.assign(formData, {
        locationType: 'default',
        labelType: 'textLabel',
        location: '',
        labelContent: {
          type: 'default',
          title: 'name',
          image: '',
          detail: ''
        },
        labelColor: '0',
        area: []
      })
      areaValue.value = []
      modal.visible = true
    }
    const handleAreaLabelList = async (modelConfig: ModelConfigItf): Promise<void> => {
      const areaLabelList = []
      for (const labelItem of modelConfig.three.labelList) {
        for (const areaJson of labelItem.area) {
          const areaItem = JSON.parse(areaJson)
          areaLabelList.push({
            areaName: areaItem.name,
            areaId: areaItem.id,
            aliasName: areaItem.aliasName,
            labelConfig: {
              title: labelItem.labelContent.title,
              detail: labelItem.labelContent.detail,
              type: labelItem.labelType,
              infoType: labelItem.labelContent.type,
              image: labelItem.labelContent.image,
              labelColor: labelItem.labelColor,
              interactive: labelItem.interactive,
              location: labelItem.location
            }
          })
        }
      }
      modelConfig.three.areaLabelList = areaLabelList
      await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
      emit('getModelData')
    }
    onMounted(async () => {
      const modelConfig: ModelConfigItf = _.cloneDeep(props.data)
      await handleAreaLabelList(modelConfig)
      getScrollY()
      areaList()
    })
    const handelSave = async (): Promise<void> => {
      const modelConfig: ModelConfigItf = _.cloneDeep(props.data)
      if (modal.title === '新增标签') {
        !modelConfig.three.labelList && (modelConfig.three.labelList = [])
        modelConfig.three.labelList.push(formData)
        await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
        handleAreaLabelList(modelConfig)
      } else {
        modelConfig.three.labelList[modal.index] = formData
        await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
        handleAreaLabelList(modelConfig)
      }
      modal.visible = false
      modal.index = -1
    }
    const handleSaveCustomLocation = (value: { area: string[];value: string; }): void => {
      selectLocationModal.visible = false
      formData.area = value.area
      formData.location = value.value
    }
    const uploadEnd = (data: { path: string; }[]): void => {
      formData.labelContent.image = data[0]?.path
    }
    const areaValue = ref<string[]>([])
    const handleChangeArea = (value: string[], label: string[], node: { triggerNode: { props: { id: string;name: string;aliasName: string; }; }; }): void => {
      const index = (formData.area as unknown as string[]).findIndex((item) => JSON.parse(item).id === node.triggerNode.props.id)
      areaValue.value = value
      if (index !== -1) {
        (formData.area as unknown as string[]).splice(index, 1)
        return
      }
      formData.area = [...(formData.area as unknown as string[]), JSON.stringify({ id: node.triggerNode.props.id, name: node.triggerNode.props.name, aliasName: node.triggerNode.props.aliasName })]
    }
    const imageLabelJsxEle = (): JSX.Element => {
      const businessJsxEle = (
        <div style={{ display: 'flex', marginTop: '12px', 'flex-direction': 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 'flex-shrink': '0' }}>标题:</span>
            <Select
              style={{ width: '200px' }}
              v-model:value={formData.labelContent.title}
              options={businessTypes}
              allow-clear={false}
              placeholder='请选择'
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 'flex-shrink': '0' }}>详情:</span>
            <Select
              style={{ width: '200px' }}
              v-model:value={formData.labelContent.detail}
              options={businessTypes}
              allow-clear={false}
              placeholder='请选择'
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 'flex-shrink': '0' }}>图片:</span>
            <Select
              style={{ width: '200px' }}
              v-model:value={formData.labelContent.image}
              options={[{
                label: '区域图片',
                value: 'regionImage',
              }]}
              allow-clear={false}
              placeholder='请选择'
            />
          </div>
        </div>
      )
      const customLabelJsxEle = (
        <div style={{ display: 'flex', marginTop: '12px', 'flex-direction': 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 'flex-shrink': '0' }}>标题:</span>
            <Input v-model:value={formData.labelContent.title} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ 'flex-shrink': '0' }}>详情:</span>
            <Textarea showCount={false} v-model:value={formData.labelContent.detail} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 'flex-shrink': '0' }}>图片:</span>
            <FileUpload
              sceneCode={GLOBAL_SCENE_CODE.visualConfig}
              ref={uploadRef}
              type='picture-card'
              onEnd={uploadEnd}
              customText='上传图片'
              size={200}
              maxNum={1}
            />
          </div>
        </div>
      )
      return formData.labelContent.type === 'default' ? businessJsxEle : customLabelJsxEle
    }
    return (): JSX.Element=>
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
            <Button type='primary' style={{ marginLeft: '10px' }} onClick={queryLabel}>查询</Button>
            <Button style={{ marginLeft: '10px' }} onClick={resetting}>重置</Button>
          </div>
        </div>
        <Button type='primary' style={{ marginTop: '10px' }} onClick={addThreeLabel}>新增标签</Button>
        <Table
          style={{ marginTop: '10px' }}
          columns={threeColumns}
          dataSource={labelList.value ?? []}
          scrollY={scrollY.value}
          rowKey='id'
          pagination={false}
        />
        <Modal
          visible={modal.visible}
          okText='保存'
          title={modal.title}
          width='700px'
          destroyOnClose
          onOk={handelSave}
          onCancel={() => {
            modal.visible = false
          }}
        >
          <Form model={formData} label-col={{ style: { width: '70px' } }}>
            <FormItem label='标签类型' name='labelType'>
              <Select
                style={{ width: '200px' }}
                v-model:value={formData.labelType}
                options={labelTypes}
                allow-clear={false}
                placeholder='请选择标签类型'
              />
            </FormItem>
            <FormItem label='标签位置' name='locationType'>
              <RadioGroup
                value={formData.locationType} onChange={(value: string) => {
                  formData.locationType = value
                  if (modal.title === '新增标签') {
                    formData.area = []
                    formData.location = ''
                  } else {
                    formData.area = value === 'default' ? [] : props.data.three.labelList[modal.index].area
                    formData.location = props.data.three.labelList[modal.index].location
                  }
                }}
              >
                <Radio value='default'>模型中心</Radio>
                <Radio value='custom'>自定义</Radio>
              </RadioGroup>
              {formData.locationType === 'custom' && <Button
                type='primary' onClick={() => {
                  selectLocationModal.visible = true
                }}
              >选择参数
              </Button>}
              <div style={{ marginTop: '12px' }}>
                {
                  formData.locationType === 'default'
                    ? <TreeSelect
                      style={{ width: '400px' }}
                      v-model:value={areaValue.value} onChange={handleChangeArea} multiple treeCheckStrictly={false} placeholder='请选择区域' field-names={{ label: 'name', value: 'id', children: 'children' }}
                      treeData={areaOptions.value} maxTagCount={6} allow-clear show-search
                    />
                    : <Textarea value={formData.location} readonly />
                }
              </div>
            </FormItem>
            <FormItem label='标签文案' name='contentType'>
              <RadioGroup
                value={formData.labelContent.type} onChange={(value: string) => {
                  formData.labelContent.type = value
                  formData.labelContent.title = ''
                  formData.labelContent.detail = ''
                  formData.labelContent.image = ''
                }}
              >
                <Radio value='default'>关联业务</Radio>
                <Radio value='custom'>自定义</Radio>
              </RadioGroup>
              {
                formData.labelType === 'textLabel' && <div style={{ marginTop: '12px' }}>
                  {
                    formData.labelContent.type === 'default'
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>标题:</span>
                        <Select
                          style={{ width: '200px' }}
                          v-model:value={formData.labelContent.title}
                          options={businessTypes}
                          allow-clear={false}
                          placeholder='请选择'
                        />
                      </div>
                      : <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ flexShrink: 0 }}>标题:</span>
                        <Input v-model:value={formData.labelContent.title} />
                      </div>
                  }
                </div>
              }
              {formData.labelType !== 'textLabel' && imageLabelJsxEle()}
            </FormItem>
            <FormItem label='标签颜色' name='labelColor'>
              <RadioGroup buttonStyle='solid' options={labelColors} v-model:value={formData.labelColor} />
            </FormItem>
            <FormItem label='点击交互' name='labelColor'>
              <span>聚焦模型</span>
            </FormItem>
          </Form>
        </Modal>
        {selectLocationModal.visible && <SelectWebGlLabelConfig onSave={handleSaveCustomLocation} data={props.data} title='获取位置' v-model:visible={selectLocationModal.visible} />}

      </>
  }
})
