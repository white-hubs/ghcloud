import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Table, Form, FormItem, Modal } from '@ghcloud/cube-ui'
import { getDate } from '@/utils/common'
import { bedFile } from '@/api/record'
import type { SearchType, TableData } from './bed-file-i'
import styles from './bed-file.module.less'
import Input from '@ghcloud/cube-ui/src/components/input/input'
import type { CallBedType } from '@/api/models/record'
import type { JSX } from 'vue/jsx-runtime'

export const BedFile = defineComponent({
  setup: (): (() => JSX.Element) => {
    onMounted((): void => {
      requestDevicePage()
    })
    // 获取床位表格数据
    const requestDevicePage = async (): Promise<void> => {
      tableLoading.value = true
      const res = await bedFile({ ...search })
      tableLoading.value = false
      total.value = res.total
      tableData.value = res.records
    }
    const item: SearchType = {
      bedNum: undefined,
      currentPatient: undefined,
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<CallBedType[]>([])
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
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestDevicePage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      search.pageNumber = 1
      requestDevicePage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '床位编号',
        dataIndex: 'bed',
        key: 'bed',
      },
      {
        title: '当前就诊ID',
        dataIndex: 'currentVisitId',
        key: 'currentVisitId',
      },
      {
        title: '住院日期',
        dataIndex: 'dateHospitalization',
        key: 'dateHospitalization',
        customRender: ({ text }: { text: number; }): string => {
          return getDate(text, 'YYYY-MM-DD HH:mm:ss')
        },
      },
      {
        title: '出院日期',
        dataIndex: 'dischargeDate',
        key: 'dischargeDate',
        customRender: ({ text }: { text: number; }): string => {
          return getDate(text, 'YYYY-MM-DD HH:mm:ss')
        },
      },
      {
        title: '当前病人',
        dataIndex: 'currentPatient',
        key: 'currentPatient',
      },
      {
        title: '管床医生',
        dataIndex: 'bedManagementDoctor',
        key: 'bedManagementDoctor',
      },
      {
        title: '管床护士',
        dataIndex: 'bedNurse',
        key: 'bedNurse',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: TableData; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={(): void => {
                handleBedDetail(record)
              }}>详情</Button>
            </>
          )
        },
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='床位编号'>
                <Input
                  v-model:value={search.bedNum}
                  placeholder='请输入编号'
                />
              </FormItem>
              <FormItem label='当前病人'>
                <Input
                  v-model:value={search.currentPatient}
                  placeholder='请输入病人名称'
                  onChange={(): void => {
                    search.currentPatient = search.currentPatient ? search.currentPatient.replace(/\s+/g, '') : ''
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
    const visible = ref(false)
    const currentCallBed = ref<TableData>()
    const handleBedDetail = (record: TableData): void => {
      currentCallBed.value = record
      visible.value = true
    }
    const handelSubmit = (): void => {}
    const modalSlot = (): VNode =>
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
    return (): JSX.Element =>
      <>
        <GLayout title='床位档案' showFooter={false} v-slots={gLayoutSlots} />
        <Modal
          visible={visible.value}
          title='床位档案'
          width='50%'
          onOk={handelSubmit}
          onCancel={(): void => {
            visible.value = false
          }}
          footer={<Button type='primary' onClick={(): void => {
            visible.value = false
          }}>关闭</Button>}
        >
          {modalSlot()}
        </Modal>
      </>
  },
})
