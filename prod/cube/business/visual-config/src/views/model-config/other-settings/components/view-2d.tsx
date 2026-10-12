import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { Button, Form, FormItem, Modal, PopConfirm, Select, Table, message } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { createUuid } from '@/utils/common'
import { addModel } from '@/api/model'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

interface FormDataType {
  id?: string;
  url?: string ;
  area?: string[] ;
}
interface FormState {
  id: number | string;
  fileList: FileType[];
  area: string[] | undefined;
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
export const OtherView2D = defineComponent({
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
    const tableData = ref<FormDataType[]>([])
    const scrollY = ref<number>(800)
    const currentItem = ref<FormDataType>()
    const formData = reactive<FormState>({ id: '', fileList: [], area: undefined })
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
        key: 'area'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: FormDataType; }): JSX.Element=>
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
        formData.area = item?.area
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
    const getBackgroundIMGList = (): void => {
      const list: FormDataType[] = []
      props.data.scada.background.forEach(item => {
        list.push({ url: item.url, area: item.area, id: item.id })
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
      ueModel.scada.background = ueModel.scada.background.filter(e => {
        return e.id !== id
      })
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      message.success('删除成功')
    }
    // 保存
    const handelSave = async (): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      if (modal.title === '新增背景图片') {
        ueModel.scada.background.push({
          area: formData.area ?? [],
          url: fileList.value[0].path,
          id: createUuid()
        })
      } else {
        ueModel.scada.background.forEach(e => {
          if (e.id === formData.id) {
            e.area = formData.area ?? []
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
                <Select
                  v-model:value={formData.area}
                  options={[{ label: '一级区域(白天图片)', value: '一级区域(白天图片)' }, { label: '一级区域(夜晚图片)', value: '一级区域(夜晚图片)' }, { label: '二级区域(白天图片)', value: '二级区域(白天图片)' }, { label: '二级区域(夜晚图片)', value: '二级区域(夜晚图片)' }]}
                  allow-clear placeholder='请选择应用范围'
                />
              </FormItem>
            </Form>
          </Modal>
        </div>
      </>
  }
})
