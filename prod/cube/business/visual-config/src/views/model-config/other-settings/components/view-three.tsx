import { defineComponent, markRaw, onMounted, reactive, ref, watch, type PropType } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { Button, Form, FormItem, Modal, PopConfirm, Table, TreeSelect, message } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { addModel } from '@/api/model'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import { createUuid, treeFindItemById, topRegionId } from '@/utils/common'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

interface FormDataType {
  id: string;
  url: string ;
  area: { id: string;name: string;aliasName: string; }[] ;
}
interface FormState {
  id: number | string;
  fileList: FileType[];
  area: string[];
}
interface FileType {
  accessPrefix: string;
  businessKey: null | string;
  id: string;
  name: string;
  path: string;
  url?: string;
  refCount: number;
  size: number;
  suffix: string;
  tag: string;
  type: string;

}
export const OtherViewThree = defineComponent({
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
      title: '新增背景图片',
    })
    const uploadRef = ref()
    const fileList = ref<FileType[]>([])
    const areaOptions = ref<GetAreaList[]>([])
    const tableData = ref<FormDataType[]>([])
    const scrollY = ref<number>(800)
    const currentItem = ref<FormDataType>()
    const formData = reactive<FormState>({ id: '', fileList: [], area: [] })
    const columns = [
      {
        title: '背景图片',
        dataIndex: 'url',
        key: 'url',
        customRender: ({ record }: { record: FormDataType; }): JSX.Element =>
          <><img src={record.url ?? ''} width='100' /></>
      },
      {
        title: '应用范围',
        dataIndex: 'area',
        key: 'area',
        customRender: ({ record }: { record: FormDataType; }): JSX.Element=>
          <>
            <div>{record.area && Array.isArray(record.area) ? record.area.map(item => item.name)?.join('，') : '--'}</div>
          </>
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: FormDataType; }): JSX.Element =>
          <>
            <Button type='link' onClick={() => {
              openModal('edit', record)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除该图片吗?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record.id ?? '')
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const currentFile = ref([
      {
        name: '',
        path: '',
        id: ''
      }
    ])
    // 打开弹窗
    const openModal = (type: string, item?: FormDataType): void => {
      modal.visible = true
      if (type === 'edit') {
        modal.title = '编辑背景图片'
        formData.area = item ? item.area.map(item => item.id) : []
        formData.id = item?.id ?? ''
        currentItem.value = item
        currentFile.value = [{ name: '', path: item?.url ?? '', id: '' }]
      } else {
        modal.title = '新增背景图片'
        formData.area = []
        fileList.value = []
        currentFile.value = []
      }

      uploadRef.value?.clearAll()
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
    const getBackgroundIMGList = (): void => {
      const list: FormDataType[] = []
      props.data.three.scene.background.images.forEach(e => {
        list.push({
          id: e.id,
          url: e.url,
          area: e.area
        })
      })
      tableData.value = list
    }
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void=> {
      getscrollY()
    }
    const uploadEnd = (data: FileType[]): void => {

      fileList.value = data
    }
    // 删除
    const handelDelete = async (id: string): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      ueModel.three.scene.background.images = ueModel.three.scene.background.images.filter(e => {
        return e.id !== id
      })
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      message.success('删除成功')
    }
    // 保存
    const handelSave = async (): Promise<void> => {
      const area = formData.area.map(value => {
        return treeFindItemById(markRaw(areaOptions.value), value) as unknown as GetAreaList
      }).map(item => {
        return {
          id: item.id,
          name: item.name,
          aliasName: item.aliasName
        }
      })

      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      if (modal.title === '新增背景图片') {
        ueModel.three.scene.background.images.push({
          area,
          url: fileList.value[0].path,
          id: createUuid()
        })
      } else {
        ueModel.three.scene.background.images.forEach(e => {
          if (e.id === formData.id) {
            e.area = area ?? []
            e.url = fileList.value[0].path
          }
        })
      }
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      modal.visible = false
      message.success(modal.title === '新增背景图片' ? '新增成功' : '编辑成功')
    }
    watch(() => props.data, () => {
      getBackgroundIMGList()
    }, { immediate: true, deep: true })
    onMounted(() => {
      areaList()
    })
    return (): JSX.Element =>
      <>
        <div>
          <Button type='primary' style={{ marginBottom: '10px' }} onClick={() => {
            openModal('add')
          }}>新增</Button>
          <Table
            columns={columns}
            dataSource={tableData.value}
            scrollY={scrollY.value}
            rowKey='id'
            pagination={false}
          />
          <Modal
            visible={modal.visible}
            okText='保存'
            title={modal.title}
            onOk={handelSave}
            onCancel={() => {
              modal.visible = false
            }}
          >
            <Form model={formData}>
              <FormItem label='背景图片'>
                <FileUpload
                  ref={uploadRef}
                  sceneCode={GLOBAL_SCENE_CODE.visualConfig}
                  type='picture-card'
                  onEnd={uploadEnd}
                  value={currentFile.value}
                  typelist={['.png', '.jpeg', '.jpg']}
                  customText='支持上传图片（.png/.jpeg/.jpg）'
                  size={4}
                  maxNum={1}
                  showtext
                />
              </FormItem>
              <FormItem label='应用范围' style={{ width: '375px' }}>
                <TreeSelect
                  v-model:value={formData.area} multiple treeCheckStrictly={false} placeholder='请选择区域' field-names={{ label: 'name', value: 'id', children: 'children' }}
                  treeData={areaOptions.value} maxTagCount={6} allow-clear show-search
                />
              </FormItem>
            </Form>
          </Modal>
        </div>
      </>
  }
})
