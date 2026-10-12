import { defineComponent, onMounted, reactive, ref, nextTick } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Input, Button, Table, message, Form, FormItem, Modal, Empty, Tree, Select } from '@ghcloud/cube-ui'

import { cubeDeviceCenterService, cubeMdataService } from '@/api/service'
import type {
  GenreList,
  SearchType,
  TableData,
  ModalTableData,
  SubmitDeviceSceneConfig,
} from './device-relation-i'
import styles from './device.module.less'
import type { ProductModel } from '@ghcloud/cube-iot-center-service'
import { useUtils } from '@/hooks/use-utils'

export const DeviceRelation = defineComponent({
  setup: () => {
    const tableLoading = ref<boolean>(false)
    const selectedCode = ref<string | null>(null)
    const genreList = ref<GenreList[]>([])
    const productList = ref<ProductModel[]>([])
    const tableData = ref<unknown[]>([])
    // 获取设备表格数据
    const requestDevicePage = async (): Promise<void> => {
      tableLoading.value = true
      // if (selectedCode.value) {
      const res = await cubeDeviceCenterService.getDeviceInstancePageAll({ ...search, categoryCode: selectedCode.value ?? '' })
      total.value = res.total
      tableData.value = res.records
      // }
      tableLoading.value = false
    }
    // 获取产品列表
    const getProductList = async (): Promise<void> => {
      if (selectedCode.value)productList.value = await cubeDeviceCenterService.getProductModel(selectedCode.value)
    }
    // 获取产品品类树列表
    const requestProjectGenreList = async (): Promise<void> => {
      tableLoading.value = true
      genreList.value = await cubeDeviceCenterService.getIotProductCategoryTree()
      tableLoading.value = false
    }
    // 获取关联业务菜单(弹窗)
    const requestSceneList = async (): Promise<void> => {
      const res = await cubeMdataService.getScenePage(projectId)
      modalTableData.value = res
    }
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 240
      }
    }
    window.onresize = (): void=> {
      getscrollY()
    }
    onMounted(() => {
      requestProjectGenreList()
      requestSceneList()
      requestDevicePage()
      nextTick(() => {
        getscrollY()
      })
    })
    const { getProjectId } = useUtils()
    const projectId = getProjectId()
    const searchItem: SearchType = {
      pageNumber: 1,
      pageSize: 10
    }
    const total = ref<number>(0)
    const search = reactive<SearchType>({ ...searchItem })
    const scrollY = ref<number>(200)
    const visible = ref<boolean>(false)
    const modalTableLoading = ref<boolean>(false)
    const modalTableData = ref<ModalTableData[]>([])
    const selectedRowKeys = ref<string[]>([])
    const submitData = reactive<SubmitDeviceSceneConfig>({
      sceneTypes: [],
      businessType: 'DEVICE_PROD_CATEGORY_CODE',
      businessId: '',
    })
    // 查询设备表格数据===================================================================================================
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestDevicePage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestDevicePage()
    }
    // 选择产品分类
    const changeProductGenre = (selectedValue: string[]): void => {
      search.productId = undefined
      tableData.value = []
      selectedCode.value = selectedValue[0]
      getProductList()
      requestDevicePage()
    }
    // 选择产品
    const changeProduct = (item: string): void => {
      search.productId = item
    }
    // 查询设备
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestDevicePage()
    }
    // 重置
    const reset = (): void => {
      search.keyword = undefined
      search.productId = undefined
      search.pageNumber = 1
      search.pageSize = 10
      requestDevicePage()
    }
    // 获取当前业务（设备类型/设备）与场景的配置(处理回显)
    const requestDeviceSceneConfig = async (businessId: string): Promise<void> => {
      modalTableLoading.value = true
      const res = await cubeDeviceCenterService.deviceSceneConfig(businessId)
      modalTableLoading.value = false
      selectedRowKeys.value = res.map((item) => {
        return item.sceneType
      })
      submitData.sceneTypes = selectedRowKeys.value
    }
    // 打开弹窗
    const openModal = (businessType: BusinessType, businessId: string): void => {
      visible.value = true
      /**
       * 确定当前业务参数
       */
      submitData.businessId = businessId
      submitData.businessType = businessType
      requestDeviceSceneConfig(businessId)
    }
    const onSelectChange = (changableRowKeys: string[]): void => {
      submitData.sceneTypes = selectedRowKeys.value = changableRowKeys
    }
    // 保存/取消==========================================================================================================
    const handelSubmit = async (): Promise<void> => {
      await cubeDeviceCenterService.submitBusinessSceneConfig(submitData)
      handelCancel()
      message.success('配置成功')
    }
    const handelCancel = (): void => {
      visible.value = false
    }
    // 表格列名==========================================================================================================
    const modalTableColumn = [
      {
        title: '场景名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '场景编号',
        dataIndex: 'code',
        key: 'code'
      }
    ]
    const devTableColumns = [
      {
        title: '设备名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '设备编号',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        key: 'areaName',
        customRender: ({ record }: { record: TableData; }): JSX.Element=> {
          return <>{record.area?.pathName ?? '-'}</>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                openModal('DEVICE', record.id)
              }}>关联业务</Button>
            </>
          )
        }
      }
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-left': (): JSX.Element=> {
        return (
          <>
            <div class={styles['content-left']}>
              {genreList.value.length
                ? <Tree
                  tree-data={genreList.value}
                  fieldNames={{ title: 'categoryName', key: 'categoryCodeConcat', children: 'children' }}
                  onSelect={changeProductGenre}
                />
                : <Empty />}
            </div>
          </>
        )
      },
      'content-search': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem>
                <Select
                  style={{ width: '200px' }}
                  v-model:value={search.productId}
                  options={productList.value}
                  fieldNames={{ label: 'name', value: 'id' }}
                  allow-clear placeholder='请选择模型'
                  onChange={changeProduct}
                />
              </FormItem>
              <FormItem>
                <Input
                  v-model:value={search.keyword}
                  placeholder='请输入设备名称搜索'
                  onChange={() => {
                    search.keyword = search.keyword ? search.keyword.replace(/\s+/g, '') : ''
                  }}
                />
              </FormItem>
              <FormItem>
                <div class={styles.btns}>
                  <Button onClick={reset}>重置</Button>
                  <Button type='primary' onClick={handelSearch}>查询</Button>
                </div>
              </FormItem>
            </Form>
            <Button type='primary' disabled={!selectedCode.value} onClick={() => {
              openModal('DEVICE_PROD_CATEGORY_CODE', selectedCode.value ?? '')
            }}>关联业务</Button>
          </div>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <div class={styles['content-right']}>
              <Table
                columns={devTableColumns}
                data-source={tableData.value}
                loading={tableLoading.value}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
              <div class={styles['table-footer']}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={total.value}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div>
            </div>
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <GLayout title='场景关联' showFooter={false} v-slots={gLayoutSlots} />
        <Modal
          visible={visible.value}
          title='关联业务菜单'
          width='50%'
          onOk={handelSubmit}
          onCancel={handelCancel}
        >
          <Table
            columns={modalTableColumn}
            dataSource={modalTableData.value}
            loading={modalTableLoading.value}
            rowKey='id'
            pagination={false}
            scrollY={440}
            rowSelection={{ selectedRowKeys: selectedRowKeys.value, onChange: onSelectChange }}
          />
        </Modal>
      </>
  }
})
