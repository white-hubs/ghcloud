import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Page, PopOver, message, Table, DateRangePicker } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { usePageName } from '@ghcloud/cube-utils'
import { generatePDFReport } from './utils/report-utils'
import type { CompanyVO, DetectionReportVO, ReportDataState, ReportRecord, ReportStampInfoDTO } from '@ghcloud/cube-operating-room-service'
import { cubeOperatingRoomService } from '@/api/service'
import ReportPreview from './components/report-preview/report-preview'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'

export const InspectionReportRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const formState = reactive<{
      period: number[] | undefined;
      tenant: string | undefined;
    }>({
      tenant: undefined,
      period: []
    })
    const columns = [
      {
        title: '报告编号',
        dataIndex: 'code',
        ellipsis: true,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '受检单位',
        dataIndex: 'tenantName',
        ellipsis: true,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '检测公司',
        dataIndex: 'company',
        ellipsis: true,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '检测时间',
        dataIndex: 'detectionDate',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        width: 250,
        customRender: ({ record }: { record: ReportRecord; }): JSX.Element => {
          return (
            <>
              <Button type='link' style={{ paddingLeft: '0px' }} onClick={async () => previewReport(record)}>查看报告</Button>
              <Button type='link' style={{ paddingLeft: '0px' }} onClick={async () => exportTemplateExcel(record)}>下载检测源数据</Button>
            </>
          )
        }
      }
    ]
    const loading = ref(false)
    const dataSource = ref<DetectionReportVO[]>([])
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
          period: formState.period ? (Array.isArray(formState.period) ? formState.period?.join(',') : formState.period) : '',
          tenant: formState.tenant
        }
        const res = await cubeOperatingRoomService.getDetectionReportAdminPage(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch {
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
    const timeRangeRef = ref<{ reset: () => void; }>()
    const { scrollY } = useTableScroll()
    const companyInfo = ref<CompanyVO>()
    const getReportTemplateContent = async (reportId: string | number): Promise<string> => {
      const res = await cubeOperatingRoomService.getReportCompanyDetail(reportId)
      let templateContent = ''
      if (res) {
        companyInfo.value = res
        templateContent = res.templateContent ?? ''
      }
      return templateContent
    }
    const previewVisible = ref(false)
    const currentReportData = ref<ReportDataState>({
      pdfUrl: '',
      filename: '检测报告.pdf',
      blob: null
    })
    const createReport = async (params: {
      customTemplate: string;
      reportData: Partial<ReportRecord>;
      resultRows: ReportStampInfoDTO[];
      type?: 'create' | 'preview';
    }): Promise<void> => {
      try {
        const { customTemplate, reportData, resultRows } = params
        const loadingKey = 'reportGenerating'
        const watermarkImg = companyInfo.value?.fileVO?.path ? `${window.location.origin}${companyInfo.value.fileVO.path}` : `${window.location.origin}/minio/medical-cleanliness/1942776044958892033.png`

        message.loading({ content: '正在生成报告 (0%)...', key: loadingKey, duration: 0 })
        const pdfData = await generatePDFReport(
          reportData,
          resultRows,
          (progress: number) => {
            const displayProgress = Math.floor(progress * 100)
            message.loading({
              content: `正在生成报告 (${displayProgress}%)...`,
              key: loadingKey,
              duration: 0
            })
            setTimeout(() => {
              message.destroy(loadingKey)
            }, 1000)
          },
          customTemplate,
          watermarkImg
        )
        currentReportData.value = {
          pdfUrl: pdfData.url,
          filename: pdfData.filename,
          blob: pdfData.blob
        }
        message.destroy(loadingKey)
        previewVisible.value = true
      } catch (error) {
        message.destroy()
        message.error(`生成报告失败: ${(error as { message: string; }).message || '请重试'}`)
      } finally {
        loading.value = false
      }
    }
    const previewReport = async (record: ReportRecord): Promise<void> => {
      const customTemplate = await getReportTemplateContent(record?.id ?? '')
      const reportData = await cubeOperatingRoomService.getDetectionReportAdminDetail(record?.id ?? '')
      const resultRows: ReportStampInfoDTO[] = reportData?.reportStampInfoList ? (typeof reportData.reportStampInfoList === 'string' ? JSON.parse(reportData.reportStampInfoList) : reportData.reportStampInfoList) : []

      if (reportData) {
        createReport({
          reportData,
          resultRows,
          customTemplate,
          type: 'preview'
        })
      }
    }
    const downloadPDF = async (pdfUrl: string = currentReportData.value.pdfUrl, filename: string = currentReportData.value.filename): Promise<void> => {
      if (!pdfUrl) {
        message.warning('没有可下载的报告')
        return
      }
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('报告下载成功')
    }
    const exportTemplateExcel = async (record: ReportRecord): Promise<void> => {
      const res = await cubeOperatingRoomService.exportDetectionSourceList({ recordId: record?.id ?? '' })
      if (res) {
        const link = document.createElement('a')
        const blob = new Blob([res as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)

        link.setAttribute('download', `检测报告_${record.company || ''}${record.code || ''}_数据源.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
    const reset = (): void=> {
      timeRangeRef.value?.reset()
      dataSource.value = []
      getTableData()
    }
    onMounted(() => {
      getTableData()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='受检单位' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect v-model:value={formState.tenant} width='180px' selectFirst={false} placeholder='请选择受检单位' />
              </FormItem>
              <FormItem label='检测时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              rowKey='id'
              dataSource={dataSource.value}
              columns={columns}
              loading={loading.value}
              pagination={false}
              scrollY={scrollY.value}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
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
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        {previewVisible.value && <ReportPreview
          v-model:visible={previewVisible.value}
          pdfUrl={currentReportData.value.pdfUrl}
          filename={currentReportData.value.filename}
          onDownload={async () => downloadPDF()}
        />}
      </>
  }
})
