import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { AntModal, Button, message, Page, PopConfirm, PopOver, Upload, UploadOutlined } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { cubeMdataService, cubeOuaaService, cubePropertyService, cubeIdentityService, cubeElectricVehicleService } from '@/api/service'
import type { RiskSourceLedgerVO } from '@ghcloud/cube-risk-management-service'
import { useRouter } from 'vue-router'
import style from './index.module.less'
import { CarType } from './type'
interface SearchParamsType {
  pageNumber: number;
  pageSize: number;
  total: number;
  keyword: string | undefined;
  electronMobileType: string | undefined;
  brand: string | undefined;
  maintenanceDepId: string | undefined;
  areaId: string | undefined;
}

export const Ledger = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const codeLoading = ref(false)
    const loadTemplateLoading = ref(false)
    const batchDeleteLoading = ref(false)
    const deleteLoading = ref(false)
    const selectedRowKeys = ref<number[]>([])
    const selectedRowsData = ref<RiskSourceLedgerVO[]>([])
    const searchParams = reactive<SearchParamsType>({
      pageNumber: 1,
      pageSize: 10,
      total: 100,
      keyword: undefined,
      maintenanceDepId: undefined,
      areaId: undefined,
      electronMobileType: undefined,
      brand: undefined,
    })

    // 详情
    const detailsRow = async (record: RiskSourceLedgerVO): Promise<void> => {
      router.push({
        path: '/ledger-details',
        query: {
          id: record.id,
        }
      })
    }
    // 编辑
    const editRow = (record: RiskSourceLedgerVO): void => {
      router.push({
        path: '/ledger-operate',
        query: {
          type: 'edit',
          id: record.id,
        }
      })
    }
    // 删除
    const delRow = async (record: RiskSourceLedgerVO): Promise<void> => {
      if (record.id) {
        await cubePropertyService.riskSourceLedgerDelete([record.id])
        message.success('删除成功')
        tableApi.query()
      }
    }
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 60,
        align: 'center',
        customRender: ({ index }: { index: string; }): string => {
          return index + 1
        }
      },
      {
        title: '编码',
        dataIndex: 'serialNumber',
        align: 'center',
        defaultVisible: true,
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '名称',
        dataIndex: 'name',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '分类',
        dataIndex: 'electronMobileType',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={CarType.get(text) ?? '--'}>{CarType.get(text) ?? '--'}</PopOver>
        }
      },
      {
        title: '规格型号',
        dataIndex: 'norms',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '品牌',
        dataIndex: 'brand',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '车牌号',
        dataIndex: 'plateNumber',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '关联档位',
        dataIndex: 'stallName',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '关联现场点',
        dataIndex: 'sitePointName',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '详细位置',
        dataIndex: 'attribute',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },

      {
        title: '维护部门',
        dataIndex: 'maintenanceDepName',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '使用人',
        dataIndex: 'receiveUserName',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '联系方式',
        dataIndex: 'receiveUserPhone',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最近修改时间',
        dataIndex: 'updateTime',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={dayjs(text).format('YYYY-MM-DD')}>{dayjs(text).format('YYYY-MM-DD')}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        defaultVisible: true,
        width: 200,
        customRender: ({ record }: { record: RiskSourceLedgerVO; }): VNode=> {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailsRow(record)
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                editRow(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                delRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const carTypeOptions = [
      {
        label: '全部',
        value: ''
      },
      {
        label: '电动单车',
        value: 'BICYCLE'
      },
      {
        label: '电动三轮车',
        value: 'TRICYCLE'
      },
      {
        label: '电动四轮车',
        value: 'FOUR_WHEELED'
      }
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'ELECTRIC_VEHICLE_LEDGER',
      rowSelection: 'checkbox',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeElectricVehicleService.genElectronMobilePage({
          ...searchParams
        })
      },
      rowSelectionChange: (keys, rows) => {
        selectedRowKeys.value = keys as number[]
        selectedRowsData.value.length = 0
        selectedRowsData.value.push(...rows as Record<string, unknown>[])
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      }
    })
    const formSchema = ref([
      {
        component: 'Select',
        label: '电动车分类',
        fieldName: 'electronMobileType',
        defaultValue: '',
        componentProps: {
          options: carTypeOptions,
          buttonStyle: 'solid',
          optionType: 'button',
          onChange: (value: string): void => {
            searchParams.pageNumber = 1
            searchParams.electronMobileType = value
            tableApi.query()
          }
        },
      },
      {
        component: 'Input',
        label: '品牌',
        fieldName: 'brand',
        componentProps: {
          placeholder: '请输入品牌'
        },
      },
      {
        component: 'Select',
        label: '维护部门',
        fieldName: 'maintenanceDepId',
        defaultValue: '',
        componentProps: {
        },
      },
      {
        component: 'Cascader',
        label: '所在区域',
        fieldName: 'areaId',
        defaultValue: '',
        componentProps: {
        },
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '编号、名称、型号、使用人、车牌号'
        }
      },
    ])

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.pageNumber = 1
        searchParams.keyword = data.keyword ? data.keyword as string : ''
        searchParams.brand = data.brand ? data.brand as string : ''
        searchParams.electronMobileType = data.electronMobileType ? data.electronMobileType as string : ''
        tableApi.query()
      },
      handleReset: () => {
        searchParams.pageNumber = 1
        searchParams.keyword = ''
        searchParams.electronMobileType = ''
        searchParams.maintenanceDepId = ''
        searchParams.areaId = ''
        searchParams.brand = ''
        tableApi.query()
      },
      schema: formSchema.value,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
    })
    // 分页
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    // 上传数据
    const fileUpload = async (options: { file: File; onProgress: (arg0: { percent: number; }) => void; }): Promise<void> => {
      const file = options.file
      const progress = { percent: 1 }
      const speed = 100 / (file.size / 65000)
      const intervalId = setInterval(() => {
        if (progress.percent < 100) {
          progress.percent += speed
          options.onProgress(progress)
        } else {
          clearInterval(intervalId)
        }
      }, 100)
      const formData = new FormData()
      formData.append('file', file)
      cubeElectricVehicleService.importElectronMobile((formData as unknown as Record<string, FormData>)).then(async () => {
        tableApi.query()
        message.success('导入成功')
      }).catch((e => {
        message.error(e.errorMessage)
      }))
    }
    // 下载模板
    const downloadTemplate = async (): Promise<void> => {
      loadTemplateLoading.value = true
      try {
        const res = await cubeElectricVehicleService.downloadElectronMobileTemplate()
        const blob = new Blob([res], {
          type: 'application/xls;charset-UTF-8',
        })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = '电动车台账模板.xlsx'
        a.style.display = 'none'
        a.click()
        URL.revokeObjectURL(blobUrl)
      } catch (e) {
      } finally {
        loadTemplateLoading.value = false
      }
    }
    // 批量删除
    const handleBatchDelete = (): void => {
      AntModal.confirm({
        centered: true,
        content: '确定要删除当前选中?',
        async onOk () {
          try {
            deleteLoading.value = true
            await cubePropertyService.riskSourceLedgerDelete(selectedRowKeys.value)
            message.success('操作成功')
            tableApi.query()
          } catch (error) {
            message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
          } finally {
            AntModal.destroyAll()
            deleteLoading.value = false
          }
        },
        onCancel () {
          AntModal.destroyAll()
        }
      })
    }
    // 下载二维码
    const handleOk = async (): Promise<void> => {
      if (selectedRowKeys.value.length) {
        const params = {
          entityType: 'RISK_SOURCE',
          entityInfo: selectedRowsData.value.map((item: RiskSourceLedgerVO) => {
            return {
              entityId: item.id,
              entityName: item.name,
              serialNumber: item.serialNumber
            }
          }),
        }
        codeLoading.value = true
        try {
          const res = await cubeIdentityService.generateBatch(params)
          if (res) {
            saveQrcodeZip(res)
          }
        } catch (error) {
          message.error((error as { errorMessage: string; })?.errorMessage ?? '下载失败')
        } finally {
          codeLoading.value = false
        }
      } else {
        message.warning('请选择要下载的二维码')
      }
    }
    const saveQrcodeZip = (blob: Blob): void => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.download = '二维码.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
    const slots = {
      'layout-header': (): VNode =>
        <div style={{ display: 'flex' }}>
          <Button
            type='primary' onClick={() => {
              router.push({
                path: '/ledger-operate',
                query: {
                  type: 'add'
                }
              })
            }}
          >新增
          </Button>
          <Button class={style.ml10} loading={codeLoading.value} type='primary' onClick={handleOk}>下载二维码</Button>
          <Button loading={loadTemplateLoading.value} class={style.ml10} type='primary' onClick={downloadTemplate}>下载模板</Button>
          <Upload
            name='file'
            showUploadList={false}
            // 限制文件格式
            accept='.xlsx,.xls'
            // 自定义上传行为
            customRequest={fileUpload}
          >
            <Button class={style.ml10} type='primary'>
              <UploadOutlined />
              导入
            </Button>
          </Upload>
        </div>,
      'layout-content': (): VNode => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        )
      },
      'footer-page': (): VNode => {
        return (
          <Page
            current={searchParams.pageNumber}
            pageSize={searchParams.pageSize}
            total={searchParams.total}
            onPageChange={handleChange}
          />
        )
      },
      'footer-btn': (): VNode => {
        return (
          <>
            <span style={{ marginRight: '16px' }}>已选 {selectedRowKeys.value.length} 项</span>
            <Button disabled={selectedRowKeys.value.length === 0} type='primary' danger loading={batchDeleteLoading.value} onClick={handleBatchDelete}>批量删除</Button>
          </>
        )
      },
    }
    // 获取区域数据
    const getAreaData = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      const schema = {
        component: 'Cascader',
        label: '所在区域',
        fieldName: 'areaId',
        defaultValue: '',
        componentProps: {
          options: res,
          placeholder: '请选择',
          allowClear: true,
          fieldNames: { label: 'name', value: 'id' },
          onChange: (value: string): void=> {
            searchParams.areaId = value[value.length - 1]
            tableApi.query()
          }
        }
      }
      formApi.updateFieldSchema(schema)
    }
    // 获取部门数据
    const getDeptData = async (): Promise<void> => {
      const res = await cubeOuaaService.getDeptList()
      const schema = {
        component: 'Select',
        label: '维护部门',
        fieldName: 'maintenanceDepId',
        defaultValue: '',
        componentProps: {
          options: res,
          placeholder: '请选择',
          allowClear: true,
          fieldNames: { label: 'name', value: 'id' },
          onChange: (value: string): void => {
            searchParams.maintenanceDepId = value
            tableApi.query()
          }
        },
      }
      formApi.updateFieldSchema(schema)
    }
    onMounted(async () => {
      getAreaData()
      getDeptData()
    })

    return (): VNode=> (
      <>
        <CubeLayout title={pageTitle} v-slots={slots} />
      </>
    )
  }
})
