import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GLayout } from '@/components/common/layout'
import { Button, Cascader, Checkbox, Form, FormItem, Input, Modal, Page, PopConfirm, Table, message } from '@ghcloud/cube-ui'
import type {
  GenreList,
  SearchType,
  TableData,
} from '../device-relation/device-relation-i'
import { cubeDeviceCenterService } from '@ghcloud/generic-component/src/api/service'
import styles from './associated.module.less'

export const AssociatedDevices = defineComponent({
  setup: () => {
    const { param } = useRoute().query
    const router = useRouter()
    const total = ref<number>(0)
    const menuParam = JSON.parse((param as string))
    const modal = reactive({
      visible: false,
      title: '新增实例',
      submitLoading: false,
      action: 'add'
    })
    const checkAll = ref<boolean>(false)
    const removeDisabled = ref<boolean>(true)
    const deviceColumns = [
      {
        title: '设备名称',
        dataIndex: 'name',
        align: 'center',
        key: 'name'
      },
      {
        title: '设备编号',
        dataIndex: 'code',
        align: 'center',
        key: 'code'
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        align: 'center',
        key: 'areaName',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return <>{record.area?.pathName ?? '-'}</>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        align: 'center',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return (
            <>
              <PopConfirm
                title='确定要移除该数据吗?'
                onConfirm={() => {
                  deleteDevice(record)
                }}
              >
                <Button type='link' size='small'>移除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const selectTableColumn = [
      {
        dataIndex: 'code',
        title: '设备编码',

      },
      {
        dataIndex: 'name',
        title: '设备名称',
      },
      {
        dataIndex: 'deviceProdCategoryName',
        title: '产品品类',
      },
      {
        dataIndex: 'deviceProdName',
        title: '产品名称',
      },
      {
        dataIndex: 'brandName',
        title: '设备品牌',
      },
      {
        dataIndex: 'areaName',
        title: '所属区域',
      }
    ]
    const goBack = (): void => {
      router.push('/business-menu')
    }
    const selectTableData = ref<unknown>([])
    const styleRowKeysData = ref<string[]>([])
    const rowKeysData = ref<string[]>([])
    const styleRowSelection = reactive({
      selectedRowKeys: styleRowKeysData.value,
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string []) => {
        styleRowKeysData.value.length = 0
        styleRowKeysData.value.push(...selectedRowKeys)
      },
    })
    const rowSelection = reactive({
      selectedRowKeys: rowKeysData.value,
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string []) => {
        rowKeysData.value.length = 0
        rowKeysData.value.push(...selectedRowKeys)
        if (rowKeysData.value.length) {
          removeDisabled.value = false
        } else {
          removeDisabled.value = true
        }
      },
    })
    const genreList = ref<GenreList[]>([])
    const selectTableLoading = ref(false)
    const formData = reactive({
      categoryCode: [],
      keyword: '',
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const search = reactive<SearchType>({
      categoryCode: [],
      keyword: '',
      pageNumber: 1,
      pageSize: 10
    })
    const deviceTableData = ref<unknown[]>([])
    const deviceTableLoading = ref(false)
    const emptyArea = ref(0)
    const reset = async (): Promise<void> => {
      search.keyword = ''
      search.pageNumber = 1
      search.pageSize = 10
      search.categoryCode = []
      requestDevicePage()
    }
    const requestDevicePage = async (): Promise<void> => {
      deviceTableLoading.value = true
      const params = {
        keyword: search.keyword,
        pageNumber: search.pageNumber,
        pageSize: search.pageSize,
        tagCodes: [`custom.app::visual.${menuParam.id}`],
        categoryCode: search.categoryCode?.join('-')
      }
      const res = await cubeDeviceCenterService.getDeviceInstancePageAll(params)
      total.value = res.total
      deviceTableData.value = res.records
      deviceTableLoading.value = false
    }
    const selectDevicePage = async (): Promise<void> => {
      selectTableLoading.value = true
      const res = await cubeDeviceCenterService.getDeviceInstancePageAll({ ...formData, filterTagCodes: [`custom.app::visual.${menuParam.id}`], categoryCode: formData.categoryCode?.join('-') })
      selectTableData.value = res.records.map(e => {
        return {
          ...e,
          deviceProdCategoryName: e.productInfo?.productCategory?.name,
          deviceProdName: e.productInfo?.name,
          brandName: e.productInfo?.brandName,
          areaName: e.area?.pathName,

        }
      })
      formData.total = res.total
      selectTableLoading.value = false
    }
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestDevicePage()
    }
    const selectChangePage = (page: number, pageSize: number): void => {
      formData.pageNumber = page
      formData.pageSize = pageSize
      selectDevicePage()
    }
    const addDevice = async (): Promise<void> => {
      await selectDevicePage()
      modal.visible = true
    }
    const gLayoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <Button type='primary' onClick={addDevice}>添加</Button>
        )
      },
      'content-search': (): JSX.Element=> {
        return (
          <>
            <Form layout='inline' model={search}>
              <FormItem label='产品分类:' name='categoryCode'>
                <Cascader
                  changeOnSelect
                  fieldNames={{ label: 'categoryName', value: 'categoryCode', children: 'children' }}
                  v-model:value={search.categoryCode} options={genreList.value} placeholder='请选择产品分类'
                />
              </FormItem>
              <FormItem label='设备名称:' name='keyword'>
                <Input
                  maxlength={20}
                  placeholder='请输入设备名称'
                  v-model:value={search.keyword}
                />
              </FormItem>
              <FormItem>
                <Button class={styles.ml10} type='primary' onClick={requestDevicePage}>查询</Button>
                <Button style={{ 'margin-left': '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <div class={styles['deice-title']}>以下有 <span class={styles['deice-value']}>{emptyArea.value}</span>  个设备的所在区域为空，会导致可视化模型上展示不出来，请到物联设备台账中补充。</div>
          </>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <Table
              columns={deviceColumns}
              dataSource={deviceTableData.value}
              loading={deviceTableLoading.value}
              pagination={false}
              scrollY={440}
              rowKey='id'
              rowSelection={rowSelection}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class={styles.flex}>
            <Button class={styles.ml10} type='primary' danger disabled={removeDisabled.value} onClick={deleteDeviceAll}>批量移除</Button>
            <div class={styles.w200}>
              <Page
                style='margin-bottom:20px;text-align: right;'
                v-model:current={search.pageNumber}
                v-model:pageSize={search.pageSize}
                v-model:total={total.value}
                onPageChange={changePage}
              />
              <Button class={styles.ml10} type='primary' onClick={goBack}>返回</Button>
            </div>
          </div>
        )
      }
    }
    // 获取产品品类树列表
    const requestProjectGenreList = async (): Promise<void> => {
      genreList.value = await cubeDeviceCenterService.getIotProductCategoryTree()
    }
    const deleteDevice = async (params: TableData): Promise<void> => {
      const res = await cubeDeviceCenterService.delDeviceConfig(menuParam.id, { businessIds: [params.id] })
      if (res === 'OK') {
        message.success('删除成功')
        search.pageNumber = 1
        requestDevicePage()
      }
    }
    const deleteDeviceAll = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.delDeviceConfig(menuParam.id, { businessIds: rowKeysData.value })
      if (res === 'OK') {
        message.success('删除成功')
        search.pageNumber = 1
        requestDevicePage()
      }
    }
    const handelAdd = async (): Promise<void> => {
      const params = {
        ...formData,
        deviceBindWay: checkAll.value ? 'ALL_EQUIPMENT' : 'APPOINT_EQUIPMENT',
        sceneType: menuParam.id,
        businessIds: styleRowKeysData.value,
        deviceProdCategoryCodeConcat: formData.categoryCode?.join('-')
      }
      await cubeDeviceCenterService.addDeviceSceneConfig(params)
      requestDevicePage()
      modal.visible = false
    }
    const handelCancel = async (): Promise<void> => {
      modal.visible = false
    }

    onMounted(() => {
      if (param) {
        requestDevicePage()
        requestProjectGenreList()
      }
    })
    return (): JSX.Element=>
      <>
        <GLayout title={'业务菜单：' + menuParam.name} showFooter v-slots={gLayoutSlots} />
        <Modal
          style='width:1000px;'
          visible={modal.visible}
          title={modal.title}
          onOk={handelAdd}
          onCancel={handelCancel}
        >
          <Form layout='inline' model={formData}>
            <FormItem label='产品分类:' name='categoryCode'>
              <Cascader
                changeOnSelect
                fieldNames={{ label: 'categoryName', value: 'categoryCode', children: 'children' }}
                v-model:value={formData.categoryCode} options={genreList.value} placeholder='请选择产品分类'
              />
            </FormItem>
            <FormItem label='设备名称:' name='keyword'>
              <Input
                maxlength={20}
                placeholder='请输入设备名称'
                v-model:value={formData.keyword}
              />
            </FormItem>
            <FormItem label='勾选当前所有' name='instanceName'>
              <Checkbox v-model:checked={checkAll.value} />
            </FormItem>
            <FormItem>
              <Button class={styles.ml10} type='primary' onClick={selectDevicePage}>查询</Button>
            </FormItem>
          </Form>
          <Table
            style={{ marginTop: '10px' }}
            columns={selectTableColumn}
            dataSource={selectTableData.value}
            loading={selectTableLoading.value}
            pagination={false}
            scrollY={440}
            rowKey='id'
            rowSelection={styleRowSelection}
          />
          <Page
            style='margin-top:20px;text-align: right;'
            v-model:current={formData.pageNumber}
            v-model:pageSize={formData.pageSize}
            v-model:total={formData.total}
            onPageChange={selectChangePage}
          />
        </Modal>
      </>
  }
})
