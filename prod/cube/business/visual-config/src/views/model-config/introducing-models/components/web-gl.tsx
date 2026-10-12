import { defineComponent, reactive, ref, type PropType, watch, onMounted, markRaw } from 'vue'
import styles from '../../model-config.module.less'
import { Button, Form, FormItem, Input, Modal, PopConfirm, Table, message, type FileType, TreeSelect } from '@ghcloud/cube-ui'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { addModel } from '@/api/model'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import { FileUpload } from '@ghcloud/generic-component'
import { treeFindItemById, topRegionId } from '@/utils/common'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

export const WebGlModel = defineComponent({
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
      title: '新增模型',
      index: 0,
      textValue: ''
    })
    const areaOptions = ref<GetAreaList[]>([])
    const webGlColumns = [
      {
        title: '模型名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '模型文件',
        dataIndex: 'url',
        key: 'url'
      },
      {
        title: '关联区域',
        dataIndex: 'areaList',
        key: 'areaList',
        customRender: ({ record }: { record: { areaList: { name: string; }[]; url: string; }; }): JSX.Element =>
          <>
            <div>{record.areaList && Array.isArray(record.areaList) ? record.areaList.map(item => item.name)?.join('，') : '--'}</div>
          </>
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record, index }: { record: { name: string; url: string; }; index: number; }): JSX.Element =>
          <>
            <Button type='link' onClick={() => {
              editUe5Model(record, index)
            }}>编辑</Button>
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
    const scrollY = ref<number>(800)
    const modelServer = ref(props.data.three.modelServer)
    const uploadRef = ref<{ clearAll: () => void; }>()
    const fileList = ref<FileType[]>([])
    const formData = reactive<{
      name: string;
      url: string;
      area: string[];
      areaList: {
        id: string;
        name: string;
        aliasName: string;
      }[];
    }>({
      name: '',
      url: '',
      area: [],
      areaList: []
    })

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
    watch(() => props.data, () => {
      modelServer.value = props.data.three.modelServer
    })
    const queryModel = (): void => {

      modelServer.value = props.data.three.modelServer.filter(e => {
        if (e.name.includes(modal.textValue)) {
          return e
        }
      })
    }
    const resetting = (): void => {
      modal.textValue = ''
      queryModel()
    }
    const handelSave = async (): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      if (modal.title === '编辑模型') {
        ueModel.three.modelServer[modal.index] = formData
      } else {
        ueModel.three.modelServer.push(formData)
      }
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      modal.visible = false
      message.success(modal.title === '编辑模型' ? '编辑成功' : '新增成功')
    }
    const addUe5Model = (): void => {
      formData.name = ''
      formData.url = ''
      formData.area = []
      formData.areaList = []
      modal.title = '新增模型'
      modal.index = 0
      modal.visible = true
    }
    const editUe5Model = (record: { name: string; url: string; }, index: number): void => {
      Object.assign(formData, record)
      modal.title = '编辑模型'
      modal.index = index
      modal.visible = true
    }
    const deleteUe5Model = async (index: number): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      ueModel.three.modelServer.splice(index, 1)
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      message.success('删除成功')
    }
    // 获取区域数据
    const areaList = async (): Promise<void> => {
      const data = await getAreaList()
      const initParkNode = {
        id: topRegionId,
        level: 1,
        children: data,
        name: '园区',
        code: '',
        sequence: '',
        aliasName: '园区',
        sort: 1,
        builtUpArea: null,
        areaManagerId: '',
        areaDepartmentId: '',
        areaManagerIds: [],
        areaManagerName: [],
        visualizationAreaType: null,
        areaExtend: null
      }
      areaOptions.value = [initParkNode]
    }
    const handleChangeTreeSelect = (values: string[]): void => {
      const nodes = values.map(value => {
        return treeFindItemById(markRaw(areaOptions.value), value) as unknown as GetAreaList
      })
      formData.areaList = nodes.map(node => {
        return {
          id: node.id,
          name: node.name,
          aliasName: node.aliasName
        }
      })
    }
    const uploadEnd = (data: FileType[]): void => {
      formData.url = (data[0] as unknown as { path: string; }).path
      fileList.value = data
    }
    onMounted(() => {
      areaList()
      getScrollY()
    })
    return (): JSX.Element=>
      <>
        <div class={styles['model-head']}>
          <div>
            <span> 模型名称：</span>
            <Input
              style={{ width: '300px' }}
              maxlength={50}
              placeholder='请输入模型名称'
              v-model:value={modal.textValue}
            />
          </div>
          <div>
            <Button type='primary' style={{ marginLeft: '10px' }} onClick={queryModel}>查询</Button>
            <Button style={{ marginLeft: '10px' }} onClick={resetting}>重置</Button>
          </div>
        </div>
        <Button type='primary' style={{ marginTop: '10px' }} onClick={addUe5Model}>新增</Button>
        <Table
          style={{ marginTop: '10px' }}
          columns={webGlColumns}
          dataSource={modelServer.value}
          scrollY={scrollY.value}
          rowKey='id'
          pagination={false}
        />
        <Modal
          visible={modal.visible}
          okText='保存'
          title={modal.title}
          width='900px'
          destroyOnClose
          onOk={handelSave}
          onCancel={() => {
            modal.visible = false
          }}
        >
          <Form model={formData} label-col={{ style: { width: '70px' } }}>
            <FormItem label='模型名称' name='name'>
              <Input
                maxlength={20}
                placeholder='请输入模型名称'
                v-model:value={formData.name}
              />
            </FormItem>
            <FormItem label='选择区域' name='area'>
              <TreeSelect
                v-model:value={formData.area} onChange={handleChangeTreeSelect} multiple treeCheckStrictly={false} placeholder='请选择区域' field-names={{ label: 'name', value: 'id', children: 'children' }}
                treeData={areaOptions.value} maxTagCount={6} allow-clear show-search
              />
            </FormItem>
            <FormItem label='模型文件' name='url'>
              {!formData.url &&
             <FileUpload
               ref={uploadRef}
               sceneCode={GLOBAL_SCENE_CODE.visualConfig}
               type='picture-card'
               onEnd={uploadEnd}
               typelist={['.glb', '.gltf']}
               customText='请上传glb，gltf格式文件'
               size={200}
               maxNum={1}
               showtext
               onError={() => {
                 message.error('上传失败')
               }}
             />}
              {
                formData.url && <>
                  <a type='link' href={formData.url} download>{formData.url}</a> <Button
                    type='link' onClick={() => {
                      formData.url = ''
                      fileList.value = []
                      uploadRef.value?.clearAll()
                    }}
                  >删除
                  </Button>
                </>
              }

            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
