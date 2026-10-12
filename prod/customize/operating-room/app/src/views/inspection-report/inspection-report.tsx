import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Page, PopOver, message, Table, notification, QuestionCircleOutlined } from '@ghcloud/cube-ui'
import dayjs, { type Dayjs } from 'dayjs'
import { usePageName } from '@ghcloud/cube-utils'
import { InspectionTimeRange } from '@/components/business/inspection-time-range/inspection-time-range'
import { generatePDFReport } from './utils/report-utils'
import { ProjectCascaderSelect } from '@/components/business/project-cascader-select/project-cascader-select'
import type { CompanyVO, DetectionReportVO, ReportDataState, ReportRecord, ReportStampInfoDTO, StandardTreeVO } from '@ghcloud/cube-operating-room-service'
import { cubeOperatingRoomService } from '@/api/service'
import ReportPreview from './components/report-preview/report-preview'
import { useTableScroll } from '@/hook/use-table-scroll'
import { DeviceFormItem } from '@/components/business/device-form-item/device-form-item'
import { authStore } from '@/api/auth-store'

/** 检测报告 */
export const InspectionReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const formState = reactive<{
      projectSelect: StandardTreeVO[] | null;
      project: string[] | null;
      period: [Dayjs, Dayjs] | [string, string] | null;
      device: {
        productId: string | string[] | undefined;
        deviceList: { deviceName: string; deviceId: string; }[];
      };
    }>({
      projectSelect: null,
      project: [],
      period: null,
      device: {
        productId: [],
        deviceList: []
      }
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
        }
        const res = await cubeOperatingRoomService.getDetectionReportPage(params)
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
    const getTemplateContent = async (): Promise<string> => {
      const res = await cubeOperatingRoomService.getCompanyDetail(authStore.tenant)
      let templateContent = ''
      if (res) {
        companyInfo.value = res
        templateContent = res.templateContent ?? ''
      }
      return templateContent
    }
    const handleTimeChange = (dates: [Dayjs, Dayjs]): void => {
      if (dates && dates[0] && dates[1]) {
        formState.period = [dates[0].format('YYYY-MM-DD HH:mm'), dates[1].format('YYYY-MM-DD HH:mm')]
      } else {
        formState.period = null
      }
    };
    const handleProjectChange = (selectedOptions: StandardTreeVO[]): void => {
      if (!formState.device.productId) {
        message.warning('请选择所属产品')
        formState.projectSelect = null
        return
      }
      const projectSelect = selectedOptions.map(items => {
        if (Array.isArray(items)) {
          const end = items[items.length - 1]
          const propertyList = items[0]?.propertyList?.filter((item: { id: number | string; }) => item.id === end.id)
          if (propertyList && propertyList.length > 0) {
            return {
              ...items[0],
              propertyList
            }
          }
        }
      }).map(item => {
        delete item?.children
        return item
      })
      formState.projectSelect = projectSelect
    };
    const checkFormState = (): boolean => {
      if (!formState.device.deviceList || formState.device.deviceList.length === 0) {
        message.warning('请选择检测设备')
        return false
      }
      if (!formState.projectSelect || formState.projectSelect.length === 0) {
        message.warning('请选择检测项目')
        return false
      }
      if (!formState.period) {
        message.warning('请选择检测时间')
        return false
      }
      return true
    }
    const previewVisible = ref(false)
    const currentReportData = ref<ReportDataState>({
      pdfUrl: '',
      filename: '检测报告.pdf',
      blob: null
    })
    const generateReport = async (params: {
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
        // 如果报告生成成功但有警告，显示警告信息
        if (pdfData.filename.includes('错误')) {
          message.warning('报告生成过程中出现问题，已生成部分内容，请查看报告中的错误信息')
        }
        previewVisible.value = true
      } catch (error) {
        message.destroy()
        message.error(`生成报告失败: ${(error as { message: string; }).message || '请重试'}`)
      } finally {
        loading.value = false
        getTableData()
      }
    }
    const getInspectionData = async (): Promise<ReportRecord | null> => {
      try {
        const params = {
          deviceIdList: formState.device?.deviceList ? formState.device?.deviceList.map((e: { deviceId: string; }) => {
            return e.deviceId
          }) : [],
          period: formState.period ? (Array.isArray(formState.period) ? formState.period?.join(',') : formState.period) : '',
          list: (formState.projectSelect ?? []) as StandardTreeVO[]
        }
        const data = await cubeOperatingRoomService.generateDetectionReport(params)
        return data
      } catch {
        return null
      }
    };
    const createLoading = ref(false)
    const handleCreateClick = async (): Promise<void> => {
      try {
        createLoading.value = true
        const customTemplate = await getTemplateContent()
        const checkState = checkFormState()
        if (!checkState) return
        const reportData = await getInspectionData() as unknown as Partial<ReportRecord>
        const resultRows: ReportStampInfoDTO[] = reportData?.reportStampInfoList ? (typeof reportData.reportStampInfoList === 'string' ? JSON.parse(reportData.reportStampInfoList) : reportData.reportStampInfoList) : []
        if (reportData) {
          generateReport({ reportData, resultRows, customTemplate, type: 'create' })
        }
      } catch {
      } finally {
        createLoading.value = false
      }
    }
    const previewReport = async (record: ReportRecord): Promise<void> => {
      try {
        const customTemplate = await getReportTemplateContent(record?.id ?? '')
        const reportData = await cubeOperatingRoomService.getDetectionReportDetail(record?.id ?? '')
        const resultRows: ReportStampInfoDTO[] = reportData?.reportStampInfoList ? (typeof reportData.reportStampInfoList === 'string' ? JSON.parse(reportData.reportStampInfoList) : reportData.reportStampInfoList) : []
        if (reportData) {
          generateReport({ reportData, resultRows, customTemplate, type: 'preview' })
        }
      } catch {}
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
    const companyCountdown = ref(0)
    const getCountdown = async (): Promise<void> => {
      companyCountdown.value = await cubeOperatingRoomService.getCompanyCountdown()
      const notifyMsg = companyCountdown.value < 1 ? '设备未校准，请校准后生成报告' : companyCountdown.value < 30 && companyCountdown.value > 1 ? `校准期剩余 ${companyCountdown.value} 天，请及时校准` : ''
      if (companyCountdown.value > 30) return
      notification.info({
        message: `校准提醒`,
        description: notifyMsg,
        key: `open${Date.now()}`,
        placement: "bottomRight",
        duration: 4,
      });
    }
    const reset = (): void=> {
      dataSource.value = []
      formState.projectSelect = null
      formState.device = {
        deviceList: [],
        productId: undefined
      }
      getTableData()
    }
    onMounted(() => {
      getTableData()
      getCountdown()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            {/* <div v-html={getDefaultTemplate()}></div> */}
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='检测设备' name='device' style={{ display: 'flex', paddingRight: 0, marginBottom: '10px' }}>
                <DeviceFormItem
                  v-model:value={formState.device}
                  onProductChange={(value: string[]): void => {
                    formState.device.productId = value
                  }}
                  placeholder='请选择检测设备'
                  disRequired={true}
                  style={{ width: '200px' }}
                />
              </FormItem>
              <FormItem style={{ display: 'flex', paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='检测项目'>
                <ProjectCascaderSelect
                  prodId={formState.device.productId}
                  multiple
                  onChange={handleProjectChange}
                  placeholder='请选择检测项目'
                  width='300px'
                />
              </FormItem>
              <FormItem label='检测时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <InspectionTimeRange onChange={handleTimeChange} />
                <PopOver content={'时间跨度必须在30分钟到1小时之间'}><Button type='link' style={{ padding: '0' }}><QuestionCircleOutlined /></Button></PopOver>
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={handleCreateClick}>生成报告</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
                <Button type='link' onClick={queryForm} style={{ display: 'none' }}>查询</Button>
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
        {
          previewVisible.value &&
          <ReportPreview
            v-model:visible={previewVisible.value}
            pdfUrl={currentReportData.value.pdfUrl}
            filename={currentReportData.value.filename}
            onDownload={async () => downloadPDF()}
          />
        }
      </>
  }
})
