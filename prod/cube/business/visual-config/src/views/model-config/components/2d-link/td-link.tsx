import { Button, Upload, Form, FormItem, Input, Modal, PopConfirm, Table, type FormInstance, Cascader, message } from '@ghcloud/cube-ui'
import styles from './td-link.module.less'
import { defineComponent, reactive, ref, type PropType, watch, onMounted, nextTick } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { getAreaList, getScenePage, type GetAreaList } from '@/api/mdata'
import { addModel } from '@/api/model'
import { createUuid } from '@/utils/common'
import type { GetSceneMenu } from '@/api/models/mdata'
import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'

interface FormDataType {
  id: string;
  menu: string | string[] | undefined;
  area: string | string[] | undefined;
  url: string | undefined;
}
interface FileListItem {
  uid: string;
  name: string;
  url: string;
  size: number;
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
      type: String,
      default: ''
    },
  },
  setup (props) {
    const modelConfigData = ref<ModelConfigItf>()
    watch(() => props.data, () => {
      modelConfigData.value = props.data
    }, { immediate: true, deep: true })
    const tableData = ref<FormDataType[]>([])
    const fileList = ref<FileListItem[]>([])
    const scrollY = ref<number>(200)
    const xlsList = ref([])
    const tableLoading = ref<boolean>(false)
    const areaOptions = ref<GetAreaList[]>([])
    const menuOptions = ref<GetSceneMenu[]>([])
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void => {
      getscrollY()
    }
    const searchFormData = reactive<FormDataType>({
      area: '',
      menu: '',
      url: '',
      id: ''
    })
    // 获取区域数据
    const areaList = async (): Promise<void> => {
      const data = await getAreaList()
      if (props.modelType === 'views-2d') {
        areaOptions.value = data
      } else {
        areaOptions.value = data[0].children
      }
    }
    watch(() => props.modelType, () => {
      areaList()
    }, { immediate: true })
    // 获取业务菜单
    const getSceneList = async (): Promise<void> => {
      const res = await getScenePage()
      menuOptions.value = res
    }
    // 获取二维组态列表
    const tdLinkList = (): void => {
      const menu = searchFormData.menu
      const area = searchFormData.area ? (searchFormData.area as string[]).join('-') : null
      if (area && !menu) {
        const list = modelConfigData.value?.scada.url.filter(x =>
          x.area === area)
        tableData.value = list ?? []
      } else if (menu && !area) {
        const list = modelConfigData.value?.scada.url.filter(x =>
          x.menu === menu)
        tableData.value = list ?? []
      } else if (area && menu) {
        const list = modelConfigData.value?.scada.url.filter(x =>
          x.area === area && x.menu === menu)
        tableData.value = list ?? []
      } else {
        tableData.value = modelConfigData.value?.scada.url ?? []
      }
      // tableData.value = records
      // search.total = total
      // tableLoading.value = false
    }
    onMounted(() => {
      areaList()
      getSceneList()
      tdLinkList()
      nextTick(() => {
        getscrollY()
      })
    })
    const columns = [
      {
        title: '业务菜单',
        dataIndex: 'menu',
        key: 'menu'
      },
      {
        title: '区域',
        dataIndex: 'area',
        key: 'area'
      },
      {
        title: '二维组态链接',
        dataIndex: 'url',
        key: 'url'
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
              title='是否确认删除该视角?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record)
              }}
            >
              <Button type='text' danger>移除</Button>
            </PopConfirm>
          </>
      }
    ]
    // const search = reactive({
    //   pageNumber: 1,
    //   pageSize: 10,
    //   total: 0
    // })
    // const changePage = (page: number, pageSize: number): void => {
    //   search.pageNumber = page
    //   search.pageSize = pageSize
    // }
    // const changeSize = (current: number, size: number): void => {
    //   search.pageNumber = 1
    //   search.pageSize = size
    // }
    const searchView = (): void => {
      // search.pageNumber = 1
      tdLinkList()
    }
    const resetSearchView = (): void => {
      // search.pageNumber = 1
      searchFormData.menu = undefined
      searchFormData.area = undefined
      searchFormData.url = undefined
      tdLinkList()
    }

    // 单个设置组态链接================================================================================================
    const operateType = ref('add')
    const formData = reactive<FormDataType>({ menu: '1', area: '', id: '', url: '' })
    const formRef = ref<FormInstance>()
    const currentItem = ref<FormDataType>()
    const modal = reactive({
      visible: false,
      title: '新增组态链接',
    })
    const rulesRef = {
      url: [
        { required: true, message: '请输入组态链接' },
      ],
    }
    // 打开弹窗
    const openModal = (type: string, item?: FormDataType): void => {
      modal.visible = true
      if (type === 'edit') {
        modal.title = '编辑组态链接'
        formData.menu = item?.menu ?? undefined
        formData.area = item?.area ?? undefined
        formData.url = item?.url ?? undefined
        formData.id = item?.id ?? ''
        operateType.value = 'edit'
        currentItem.value = item
      } else {
        modal.title = '新增组态链接'
        formData.menu = undefined
        formData.area = undefined
        formData.url = undefined
        formData.id = ''
        operateType.value = 'add'
      }
    }

    // 添加/修改
    const handelSave = (): void => {
      formRef.value?.validate().then(async () => {
        if (modelConfigData.value) {
          if (operateType.value === 'add') {
            // @ts-ignore
            modelConfigData.value.scada.url.push({ menu: (formData.menu as string[]).join('-') ?? '', area: (formData.area as string[]).join('-') ?? '', url: formData.url ?? '', id: createUuid() })
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          } else {
            const item = modelConfigData.value?.scada.url.find(x => x.id === currentItem.value?.id) ?? { menu: '', area: '', url: '', id: '' }
            typeof formData.area === 'object' ? item.area = (formData.area)?.join('-') ?? '' : item.area = formData.area ?? ''
            typeof formData.menu === 'object' ? item.menu = (formData.menu).join('-') ?? '' : item.menu = formData.menu ?? ''
            item.url = formData.url ?? ''
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          }
        }
        message.success('保存成功')
        modal.visible = false
        tdLinkList()
        // search.pageNumber = 1

        modal.visible = false
      })
    }
    // 删除
    const handelDelete = async (item: FormDataType): Promise<void> => {

      try {
        const index = modelConfigData.value?.scada.url.findIndex(x => x.id === item.id) ?? -1
        if (index >= 0) {
          modelConfigData.value?.scada.url.splice(index, 1)
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      } catch {
      }
      // search.pageNumber = 1
      tdLinkList()
    }

    // 批量设置组态链接===============================================================================================
    const batchModal = reactive({
      visible: false,
      title: '新增建筑视角',
    })
    const openBatchModal = (): void => {
      batchModal.visible = true
      batchModal.title = '批量导入组态链接'
      fileList.value = []
    }
    // 下载模板
    const downLoadTemp = (): void => {
      const worksheet = XLSX.utils.aoa_to_sheet([['业务菜单', '区域', '二维组态链接']])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.ms-excel',
      })
      FileSaver.saveAs(blob, '组态链接模板')
    }
    const beforeUpload = (file: Blob, filelist: any[]): boolean => {
      fileList.value = filelist
      const reader = new FileReader()
      reader.readAsBinaryString(file)
      reader.onload = async (ev): Promise<void> => {
        const data = ev.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        xlsList.value = XLSX.utils.sheet_to_json(worksheet)
      }
      return false
    }
    const submitBatchModal = async (): Promise<void> => {
      xlsList.value.forEach((item: any) => {
        // @ts-ignore
        modelConfigData.value?.scada.url.push({
          menu: item['业务菜单'],
          area: item['区域'],
          url: item['二维组态链接'],
          id: createUuid()
        })
      })
      await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
      tdLinkList()
      batchModal.visible = false
    }
    return (): JSX.Element=>
      <div class={styles.wrapper}>
        <div class={styles.header}>
          <Form model={searchFormData} layout='inline'>
            <FormItem label='业务菜单' name='menu'>
              <Input
                v-model:value={searchFormData.menu}
                placeholder='请输入业务菜单'
              />
            </FormItem>
            <FormItem label='区域' name='area'>
              <Cascader
                v-model:value={searchFormData.area} placeholder='请选择区域' field-names={{ label: 'name', value: 'name', children: 'children' }}
                options={areaOptions.value} allow-clear show-search change-on-select
              />
            </FormItem>
          </Form>
          <div class={styles.search}><Button onClick={resetSearchView}>重置</Button><Button type='primary' onClick={searchView}>查询</Button></div>
        </div>
        <Button type='primary' style={{ margin: '0 10px 10px 0px' }} onClick={() => {
          openModal('add')
        }}>新增组态链接</Button>
        <Button type='primary' onClick={openBatchModal}>批量导入组态链接</Button>
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
          okText='确定'
          title={modal.title}
          onOk={handelSave}
          onCancel={() => {
            modal.visible = false; formRef.value?.resetFields()
          }}
        >
          <Form model={formData} ref={formRef} rules={rulesRef} label-col={{ style: { width: '100px' } }}>
            <FormItem label='业务菜单' name='menu'>
              <Cascader
                v-model:value={formData.menu} placeholder='请选择业务菜单' field-names={{ label: 'name', value: 'name', children: 'children' }}
                options={menuOptions.value} allow-clear show-search change-on-select
              />
            </FormItem>
            <FormItem label='选择区域' name='area'>
              <Cascader
                v-model:value={formData.area} placeholder='请选择区域' field-names={{ label: 'name', value: 'name', children: 'children' }}
                options={areaOptions.value} allow-clear show-search change-on-select
              />
            </FormItem>
            <FormItem label='组态链接' name='url'>
              <Input
                v-model:value={formData.url}
                maxlength={200}
                placeholder='请输入'
              />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          visible={batchModal.visible}
          width='700px'
          title={batchModal.title}
          onCancel={() => {
            batchModal.visible = false
          }}
          okText='提交'
          onOk={submitBatchModal}
        >
          <p>导入说明</p>
          <p>1、请先下载模板再导入。<a onClick={downLoadTemp}>下载模板</a></p>
          <p>2、文件内条数不超过1000条，超过请分次导入</p>
          <p>3、请务必保证业务菜单、区域名称不要有偏差，否则导入失败。</p>
          <Upload accept='.xlsx,.xls' file-list={fileList.value} beforeUpload={beforeUpload}>
            <Button>导入文件</Button>
          </Upload>
        </Modal>
      </div>
  }
})
