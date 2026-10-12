import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, Table, message, AntModal, DateRangePicker, Upload, Tag } from '@ghcloud/cube-ui'
import { getReportPage, deleteReport, downLoadTemplate, importExcel } from '@/api/food-safety-report.ts'
import '@/styles/common.less'
import dayjs from 'dayjs'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { type RecordState, type InsertState, StatusOptions } from './index.i.ts'
import { AddModal } from './add-modal'
import { getNowEnterprise } from '@/tools'

export const FoodSafetyReport = defineComponent({
  setup: () => {
    const formState = reactive({
      stallCode: '',
      goodsCategoryName: '',
      checkResult: null,
      period: '',
    })
    const checkResultOptions = ref([
      { label: '阳性', value: 'POS' },
      { label: '阴性', value: 'NEG' },
    ])
    const columns = [
      {
        title: '档位号 ',
        dataIndex: 'stallCode',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '品名',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '产地',
        dataIndex: 'goodsFrom',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '检测日期',
        dataIndex: 'checkDate',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '检测名称',
        dataIndex: 'checkItem',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '检测结果',
        dataIndex: 'checkResult',
        key: 'checkResult',
        // align: 'center',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          const curState = StatusOptions.find((e: { value: string;label: string; }) => e.value === text || e.label === text)
          return (
            <>
              <PopOver content={curState?.label || '--'}>
                {curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '创建人',
        dataIndex: 'checkerName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        fixed: 'right',
        customRender: ({ record }: { record: RecordState & InsertState & { secretKey: string; }; }) => {
          return (
            <>
              <Button type='link' size='small' onClick={() => { editClick(record, 'edit') }}>编辑</Button>
              <Button type='link' size='small' danger onClick={() => { delRow(record) }}>删除</Button>
            </>
          )
        }
      }
    ]
    const loading = ref(false)
    const dataSource = ref<RecordState[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          stallCode: formState.stallCode,
          goodsCategoryName: formState.goodsCategoryName,
          checkResult: formState.checkResult,
          period: formState.period ? formState.period.toString() : '',
        }
        const res = await getReportPage(params)
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records as RecordState[]
          pagination.value.total = total
        }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.stallCode = ''
      formState.goodsCategoryName = ''
      formState.checkResult = null
      formState.period = ''
      queryForm()
    }

    const delRow = (record: RecordState): void => {
      AntModal.confirm({
        centered: true,
        content: '确定要删除该项?',
        async onOk () {
          await deleteReport({ id: record.id })
          AntModal.destroyAll()
          message.success('操作成功')
          getTableData()
        },
        onCancel () {
          AntModal.destroyAll()
        }
      })
    }
    const addModalRef = ref<{
      editTemplate: (id: string, type?: 'add' | 'edit') => void;
      addTemplate: () => void;
    }>()
    const editClick = (record: RecordState, type: 'add' | 'edit'): void => {
      addModalRef.value?.editTemplate(record.id, type)
    }
    const addClick = (): void => {
      addModalRef.value?.addTemplate()
    }

    const importLoading = ref(false)
    const fileList = ref<unknown[]>([])
    const customRequest = async (data: { file: File & { uid: string; }; }): Promise<void> => {
      if (data.file.size / 1024 > 1024 * 300) {
        message.warning('附件上传大小不能超过300MB')
        return
      }
      importLoading.value = true
      try {
        const formData = new FormData()
        formData.append('file', data.file)
        formData.append('tenant', getNowEnterprise().code)
        await importExcel(formData)
        message.success('导入成功')
        getTableData()
      } catch (error) {
        message.error('网络异常')
      } finally {
        importLoading.value = false
        getTableData()
      }
    }
    const downLoading = ref(false)
    const downTemplate = async (): Promise<void> => {
      downLoading.value = true
      downLoadTemplate().then(res => {
        const { data } = res
        const link = document.createElement('a')
        const blob = new Blob([data as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '食安报表导入模板.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        downLoading.value = false
      }).catch(() => {
        message.warn('未查询到数据，无法导出')
        downLoading.value = false
      })
    }
    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-header': () => {
        return (
          <>
            <div>
              <Button type='primary' onClick={addClick}>添加</Button>
              <Button style={{ margin: '0 10px' }} type='primary' loading={downLoading.value} onClick={downTemplate}>模板下载</Button>
              <Upload
                accept='.xls, .xlsx'
                customRequest={customRequest}
                file-list={fileList.value}
              >
                <Button type='primary' loading={importLoading.value} onClick={() => {}}>导入检测</Button>
              </Upload>
            </div>
          </>
        )
      },
      'layout-content': () => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 ' }}>
              <FormItem label='档位' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.stallCode} placeholder='请输入档位' showCount={false} />
              </FormItem>
              <FormItem label='品名' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.goodsCategoryName} placeholder='请输入品名' showCount={false} />
              </FormItem>
              <FormItem label='检测结果' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select v-model:value={formState.checkResult} options={checkResultOptions.value} placeholder='请选择检测结果' />
              </FormItem>
              <FormItem label='检测日期' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              rowKey='id'
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false} size='small'
              scrollY={500}
            />
            <AddModal ref={addModalRef} onChange={() => { queryForm() }} />
          </>
        )
      },
      'footer-page': () => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        )
      }
    }
    return () =>
      <>
        <Layout title='食安报表' v-slots={layoutSlots} />
      </>
  }
})
