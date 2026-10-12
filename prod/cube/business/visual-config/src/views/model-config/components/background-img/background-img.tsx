import { Form, FormItem, Button, Select, Modal, Table, PopConfirm, message } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { defineComponent, nextTick, onMounted, reactive, ref, type PropType, watch } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { addModel } from '@/api/model'
import { createUuid } from '@/utils/common'
import { logger } from '@/logger'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
interface FormState {
  id: number | string;
  fileList: FileType[];
  area: string[] | undefined;
}
interface FormDataType {
  id?: string;
  url?: string ;
  area?: string[] ;
}
interface FileType {
  accessPrefix: string;
  businessKey: null | string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  tag: string;
  type: string;

}
interface FileType {
  accessPrefix: string;
  businessKey: null | string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  tag: string;
  type: string;

}
export default defineComponent({
  name: '',
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    }
  },
  setup (props) {
    const operateType = ref('add')
    const formData = reactive<FormState>({ id: '', fileList: [], area: undefined })
    const scrollY = ref<number>(800)
    const uploadRef = ref()
    const tableData = ref<FormDataType[]>([])
    const fileList = ref<FileType[]>([])
    const modal = reactive({
      visible: false,
      title: '新增背景图片',
    })
    // 获取列表数据
    const getBackgroundIMGList = (): void => {
      const list: FormDataType[] = []
      modelConfigData.value?.scada.background.forEach(item => {
        list.push({ url: item.url, area: item.area, id: item.id })
      })
      tableData.value = list
    }
    const modelConfigData = ref<ModelConfigItf>()
    watch(() => props.data, () => {
      modelConfigData.value = props.data
    }, { immediate: true, deep: true })
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
    onMounted(() => {
      nextTick(() => {
        getscrollY()
        getBackgroundIMGList()
      })
    })
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
    const currentItem = ref<FormDataType>()
    // 打开弹窗
    const openModal = (type: string, item?: FormDataType): void => {
      modal.visible = true
      if (type === 'edit') {
        modal.title = '编辑背景图片'
        formData.area = item?.area
        formData.id = item?.id ?? ''
        operateType.value = 'edit'
        currentItem.value = item
      } else {
        modal.title = '新增背景图片'
        formData.area = []
        operateType.value = 'add'
        fileList.value = []
      }

      uploadRef.value?.clearAll()
    }
    // 删除
    const handelDelete = async (id: string): Promise<void> => {
      try {
        const index = modelConfigData.value?.scada.background.findIndex(x => x.id === id) ?? -1
        if (index >= 0) {
          modelConfigData.value?.scada.background.splice(index, 1)
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      } catch {
      }
      // search.pageNumber = 1
      getBackgroundIMGList()
    }
    // 保存
    const handelSave = async (): Promise<void> => {
      logger.info(formData.area)
      const area = formData.area ? formData.area : []
      try {
        if (modelConfigData.value) {
          if (operateType.value === 'add') {
            // const list: { url: string; area: string;id: string; }[] = []
            fileList.value.forEach((item: FileType) => {
              modelConfigData.value?.scada.background.push({ url: item.path, area, id: createUuid() })
            })
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          } else {
            const item = modelConfigData.value?.scada.background.find(x => x.id === currentItem.value?.id) ?? { area: '', url: '' }
            item.area = formData.area ?? []
            item.url = fileList.value[0].path ?? ''
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          }
        }
        message.success('保存成功')
        modal.visible = false
        getBackgroundIMGList()
        // search.pageNumber = 1
      } catch {
      }
    }
    const uploadEnd = (data: FileType[]): void => {
      fileList.value = data
      // formref.value.validate()
    }
    return (): JSX.Element =>
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
                // mode='multiple'
              />
            </FormItem>
          </Form>
        </Modal>
      </div>
  }
})
