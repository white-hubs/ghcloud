import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Table, Form, FormItem, DateRangePicker, Input, Modal } from '@ghcloud/cube-ui'
import {
  getCallRecordPage, bedFile, callProcessingRecords
} from '@/api/record'
import type {
  GenreList,
  SearchType,
  TableData,
} from './call-records-i'
import styles from './call-records.module.less'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { getDate } from '@/utils/common'
import type { CallBedType } from '@/api/models/record'
export const CallRecords = defineComponent({
  setup: () => {
    // 获取呼叫记录表格数据
    const requestCallRecordPage = async (): Promise<void> => {
      const params = {
        deviceId: selectedLi.value?.id,
        callType: search.callType,
        pageNumber: search.pageNumber,
        pageSize: search.pageSize,
        deviceName: search.deviceName,
        callTime: search.callTime ? search.callTime.join(',') : '',
      }
      tableLoading.value = true
      const res = await getCallRecordPage(params)
      tableLoading.value = false
      total.value = res.total
      tableData.value = res.records
    }
    onMounted(() => {
      requestCallRecordPage()
    })
    const selectedLi = ref<GenreList | null>(null)
    const item: SearchType = {
      deviceName: '',
      deviceId: '',
      callTime: [],
      callType: 'ORDINARY',
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 查询设备表格数据===================================================================================================
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestCallRecordPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestCallRecordPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestCallRecordPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      search.pageNumber = 1
      requestCallRecordPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '呼叫时间',
        dataIndex: 'callTime',
        key: 'callTime',
        customRender: ({ text }: { text: number; }): string => {
          return getDate(text, 'YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        title: '呼叫设备',
        dataIndex: 'deviceName',
        key: 'deviceName'
      },
      {
        title: '设备所在区域',
        dataIndex: 'areaName',
        key: 'areaName'
      },
      {
        title: '呼叫床位',
        dataIndex: 'bed',
        key: 'bed',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleCallBed(record)
              }}>{record.bed}</Button>
            </>
          )
        }
      },
      {
        title: '呼叫类型',
        dataIndex: 'areaName',
        key: 'areaName'
      },
      {
        title: '通话时长min',
        dataIndex: 'areaName',
        key: 'areaName'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleRecod(record)
              }}>处理记录</Button>
            </>
          )
        }
      }
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='呼叫设备'>
                <Input v-model:value={search.deviceName} onChange={() => {
                  search.deviceName = search.deviceName ? search.deviceName.replace(/\s+/g, '') : ''
                }} />
              </FormItem>
              <FormItem label='呼叫时间'>
                <DateRangePicker v-model:value={search.callTime} />
              </FormItem>
              <FormItem label='呼叫类型'>
                <Select allowClear options={[{ label: '紧急呼叫', value: 'EMERGENT' }, { label: '加强', value: 'STRENGTHEN' }, { label: '普通呼叫', value: 'ORDINARY' }]} v-model:value={search.callType} />
              </FormItem>
              <FormItem>
                <div class={styles.btns}>
                  <Button onClick={reset}>重置</Button>
                  <Button type='primary' onClick={handelSearch}>查询</Button>
                </div>
              </FormItem>
            </Form>
          </div>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <div class={styles['content-right']}>
              <Table
                columns={recordTableColumns}
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
    // 详情弹窗==========================================================================================================
    const bedFileVisible = ref(false)
    const currentCallBed = ref<CallBedType>()
    const handleCallBed = async (record: TableData): Promise<void> => {
      const { id } = record
      const res = await bedFile({ id })
      currentCallBed.value = res.records[0]
      bedFileVisible.value = true
    }
    const handelSubmit = (): void => {}
    const bedFileModalSlot = (): VNode =>
      <div class={styles['modal-content']}>
        <div>呼叫设备对应床号：{currentCallBed.value?.bed}</div>
        <div>|| 基本信息</div>
        <div class={styles.item}><span>病人姓名 {currentCallBed.value?.currentPatient}</span><span>病人年龄：{currentCallBed.value?.age}</span></div>
        <div class={styles.item}><span>病人性别：{currentCallBed.value?.patientGender === 0 ? '女' : '男'}</span><span>就诊ID：{currentCallBed.value?.currentVisitId}</span></div>
        <div>|| 医护信息</div>
        <div class={styles.item}><span>主治医生：{currentCallBed.value?.attendingPhysician}</span><span>管床医生：{currentCallBed.value?.bedManagementDoctor}</span></div>
        <div>管床护士：{currentCallBed.value?.bedNurse}</div>
        <div>|| 病理信息</div>
        <div>{currentCallBed.value?.pathologicalInformation}</div>
        <div>|| 用药信息</div>
        <div>{currentCallBed.value?.medicationInformation}</div>
      </div>
    // 处理记录弹窗======================================================================================================
    const reCordTableColumn = [
      {
        title: '处理人',
        dataIndex: 'processedBy',
        key: 'processedBy'
      },
      {
        title: '处理时间',
        dataIndex: 'processedTime',
        key: 'processedTime',
        customRender: ({ text }: { text: number; }): string => {
          return getDate(text, 'YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        title: '处理结果',
        dataIndex: 'processedResult',
        key: 'processedResult'
      }
    ]
    const reCordTableData = ref<CallBedType[]>([])
    const reCordTableLoading = ref(false)
    const reCordVisible = ref(false)
    const reCord = {
      pageNumber: 1,
      pageSize: 10
    }
    const reCordTotal = ref<number>(0)
    const callRecordId = ref()
    const handleRecod = async (record: TableData): Promise<void> => {
      const { recordId } = record
      callRecordId.value = recordId
      getCallProcessingRecords()
      reCordVisible.value = true
    }
    const getCallProcessingRecords = async (): Promise<void> => {
      const res = await callProcessingRecords({ callId: callRecordId.value, pageNumber: reCord.pageNumber, pageSize: reCord.pageSize })
      reCordTableData.value = res.records
      reCordTotal.value = res.total
    }
    const changeReCordPage = (page: number, pageSize: number): void => {
      reCord.pageNumber = page
      reCord.pageSize = pageSize
      getCallProcessingRecords()
    }
    const changeReCordSize = (current: number, size: number): void => {
      reCord.pageNumber = 1
      reCord.pageSize = size
      getCallProcessingRecords()
    }
    const reCordModalSlot = (): VNode =>
      <>
        <Table
          columns={reCordTableColumn}
          dataSource={reCordTableData.value}
          loading={reCordTableLoading.value}
          rowKey='id'
          scrollY={440}
          pagination={false}
        />
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <GPagination
            current={reCord.pageNumber}
            pageSize={reCord.pageSize}
            total={reCordTotal.value}
            onChangePage={changeReCordPage}
            onChangeSize={changeReCordSize}
          />
        </div>

      </>

    return (): JSX.Element =>
      <>
        <GLayout title='呼叫记录' showFooter={false} v-slots={gLayoutSlots} />
        <Modal
          visible={bedFileVisible.value}
          title='床位档案'
          width='50%'
          onOk={handelSubmit}
          onCancel={() => {
            bedFileVisible.value = false
          }}
          footer={<Button type='primary' onClick={() => {
            bedFileVisible.value = false
          }}>关闭</Button>}
        >
          {bedFileModalSlot()}
        </Modal>
        <Modal
          visible={reCordVisible.value}
          title='处理记录'
          width='50%'
          onOk={handelSubmit}
          onCancel={() => {
            reCordVisible.value = false
          }}
          footer={<Button type='primary' onClick={() => {
            reCordVisible.value = false
          }}>关闭</Button>}
        >
          {reCordModalSlot()}
        </Modal>
      </>
  }
})
