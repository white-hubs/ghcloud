// import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Modal, PopConfirm, Table } from '@ghcloud/cube-ui'
import Textarea from '@ghcloud/cube-ui/src/components/textarea/textarea'
import { defineComponent, nextTick, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { addModel } from '@/api/model'
import { message } from 'ant-design-vue/es'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { createUuid } from '@/utils/common'
type EntryType = 'views' | 'views-2d' | 'views-three'
interface FormDataType {
  id?: string;
  label?: string ;
  value?: string ;
}
export default defineComponent({
  name: '',
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    },
    modelType: {
      type: String as PropType<EntryType>,
      default: () => 'views-three'
    },
  },
  setup (props) {
    const modelConfigData = ref<ModelConfigItf>()
    const formData = ref<FormDataType>({})
    watch(() => props.data, () => {
      modelConfigData.value = props.data
    }, { immediate: true, deep: true })
    const columns = [
      {
        title: '视角名称',
        dataIndex: 'label',
        key: 'label'
      },
      {
        title: '视角参数',
        dataIndex: 'value',
        key: 'value'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: { id: string; name: string; remark: string; }; }): JSX.Element=>
          <>
            <Button type='link' onClick={() => {
              openModal('edit', record)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除该视角?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record.id)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const operateType = ref('add')
    const currentItem = ref<FormDataType>()
    const openModal = (type: string, item?: FormDataType): void => {
      modal.visible = true
      if (type === 'edit') {
        modal.title = '编辑全局视角'
        formData.value.label = item?.label ?? ''
        formData.value.value = item?.value ?? ''
        formData.value.id = item?.id ?? ''
        operateType.value = 'edit'
        currentItem.value = item
      } else {
        modal.title = '新增全局视角'
        formData.value.label = ''
        formData.value.value = ''
        operateType.value = 'add'
      }
    }
    const modal = reactive({
      visible: false,
      title: '新增全局视角',
    })
    const tableData = ref<FormDataType[]>([])
    const scrollY = ref<number>(800)
    const tableLoading = ref<boolean>(false)
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
    // 获取列表数据
    const getGlobalPerspectiveList = async (): Promise<void> => {
      tableData.value = ['views-three', 'views-3d'].includes(props.modelType) ? modelConfigData.value?.three.modelPerspective ?? [] : modelConfigData.value?.ue5.modelPerspective ?? []
      search.total = tableData.value.length
    }
    onMounted(() => {
      nextTick(() => {
        getscrollY()
        getGlobalPerspectiveList()
      })
    })
    // 保存
    const handelSave = async (): Promise<void> => {
      try {
        if (modelConfigData.value) {
          if (operateType.value === 'add') {
            if (['views-three', 'views-3d'].includes(props.modelType)) {
              // @ts-ignore
              modelConfigData.value.three.modelPerspective.push({ label: formData.value?.label ?? '', value: formData.value?.value ?? '', id: createUuid() })
            } else {
              modelConfigData.value.ue5.modelPerspective.push({ label: formData.value?.label ?? '', value: formData.value?.value ?? '', id: createUuid() })
            }
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          } else {
            if (['views-three', 'views-3d'].includes(props.modelType)) {
              const item = modelConfigData.value?.three.modelPerspective.find(x => x.id === currentItem.value?.id) ?? { label: '', value: '' }
              item.label = formData.value.label ?? ''
              item.value = formData.value.value ?? ''
              await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
            } else {
              const item = modelConfigData.value?.ue5.modelPerspective.find(x => x.id === currentItem.value?.id) ?? { label: '', value: '' }
              item.label = formData.value.label ?? ''
              item.value = formData.value.value ?? ''
              await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
            }
            // const item = modelConfigData.value?.ue5.modelPerspective.find(x => x.id === currentItem.value?.id) ?? { label: '', value: '' }
            // item.label = formData.value.label ?? ''
            // item.value = formData.value.value ?? ''
            // await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          }
        }
        message.success('保存成功')
        modal.visible = false
        getGlobalPerspectiveList()
        search.pageNumber = 1
      } catch {
      }
    }
    // 删除
    const handelDelete = async (id: string): Promise<void> => {
      let index = -1
      try {
        if (['views-three', 'views-3d'].includes(props.modelType)) {
          index = modelConfigData.value?.ue5.modelPerspective.findIndex(x => x.id === id) ?? -1
        } else {
          index = modelConfigData.value?.ue5.modelPerspective.findIndex(x => x.id === id) ?? -1
        }
        if (index >= 0) {
          if (['views-three', 'views-3d'].includes(props.modelType)) {
            modelConfigData.value?.three.modelPerspective.splice(index, 1)
          } else {
            modelConfigData.value?.ue5.modelPerspective.splice(index, 1)
          }
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      } catch {
      }
      search.pageNumber = 1
      getGlobalPerspectiveList()
    }
    const search = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })

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
          loading={tableLoading.value}
          pagination={false}
        />
        {/* <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={search.total}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div> */}
        <Modal
          visible={modal.visible}
          okText='保存'
          title={modal.title}
          width='900px'
          onOk={handelSave}
          onCancel={() => {
            modal.visible = false
          }}
        >
          <Form model={formData} label-col={{ style: { width: '70px' } }}>
            <FormItem label='视角名称' name='label'>
              <Input
                maxlength={8}
                placeholder='请输入视角名称'
                v-model:value={formData.value.label}
                onChange={() => {
                  formData.value.label = formData.value.label ? formData.value.label.replace(/\s+/g, '') : ''
                }}
              />
            </FormItem>
            <FormItem label='视角参数' name='value'>
              <Textarea v-model:value={formData.value.value} showCount={false} />
            </FormItem>
          </Form>
        </Modal>
      </div>
  }
})
