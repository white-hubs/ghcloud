import { defineComponent, reactive, ref, onMounted } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Input, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { cubeDictionaryService } from '@/api/service'
import { CorrectModal } from './correct-modal'
import type { GetDictionaryByItem } from '@ghcloud/cube-dictionary-service'
import { DeptSelect } from '@/components/business/dept-select/dept-select'
import { CorrectState, type CorrectNorm, type Device } from '@/types/correct-norm-type'
import dayjs from 'dayjs'
import { isTimeRange } from '@/utils/tool'
import { OperateRoomDictionaryKey } from '@/api/dictionary-key'

/** 修正指标 */
export const CorrectNormSet = defineComponent({
  setup: () => {
    const formState = reactive({
      period: undefined,
      tenant: undefined,
      tenantDefault: '',
      deptId: undefined,
      deviceName: undefined,
      tenantName: '',
      productId: []
    })
    const columns = [
      {
        title: '所属医院',
        dataIndex: 'tenantName',
        width: 150,
        ellipsis: true,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属产品',
        dataIndex: 'productName',
        width: 150,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属部门',
        dataIndex: 'deptName',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { device: { department?: { id: string;name: string; }[] | undefined; }; }; }): JSX.Element => {
          const textVal = record.device?.department?.map(item => item.name).join('、')
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '手术室',
        dataIndex: 'deviceName',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { device: { deviceList?: Device[]; }; }; }): JSX.Element => {
          const textVal = record.device?.deviceList?.map(item => item.name).join('、')
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '指标',
        dataIndex: 'normName',
        width: 150,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '修正值',
        dataIndex: 'correctValue',
        width: 150,
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const valTxt = text > 0 ? `+${text}` : `${text}`
          return (
            <PopOver content={valTxt ?? '--'}>
              <span style={{ color: text > 0 ? '#ff4d4f' : '#1890ff' }}>{valTxt ?? '--'}</span>
            </PopOver>
          )
        }
      },
      {
        title: '单位',
        dataIndex: 'unit',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { unit: string; unitName: string; }; }): JSX.Element => {
          const textVal = record.unit ?? record.unitName ?? ''
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '处理人',
        dataIndex: 'handleUser',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { handleUser: { name: string; }; }; }): JSX.Element => {
          const textVal = record.handleUser?.name ?? ''
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '处理时间',
        dataIndex: 'handleTime',
        width: 150,
        ellipsis: true,
        defaultSortOrder: 'descend',
        sorter: (a: { handleTime: string; }, b: { handleTime: string; }): number => (new Date(a.handleTime) as unknown as number) - (new Date(b.handleTime) as unknown as number),
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '取消修正人',
        dataIndex: 'cancelHandleUser',
        width: 150,
        ellipsis: true,
        customRender: ({ record }: { record: { cancelHandleUser: { name: string; }; }; }): JSX.Element => {
          const textVal = record.cancelHandleUser?.name ?? ''
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '取消处理时间',
        dataIndex: 'cancelHandleTime',
        width: 150,
        ellipsis: true,
        defaultSortOrder: 'descend',
        sorter: (a: { cancelHandleTime: string; }, b: { cancelHandleTime: string; }): number => (new Date(a.cancelHandleTime) as unknown as number) - (new Date(b.cancelHandleTime) as unknown as number),
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        width: 150,
        customRender: ({ record }: { record: GetDictionaryByItem & CorrectNorm; }): JSX.Element=> {
          return (
            <>
              {
                record.state === CorrectState.VAILD || !record.state
                  ? <PopConfirm title='确认取消该项？' onConfirm={() => {
                    cancelRow(record)
                  }}><Button type='link' size='small'>取消修正</Button></PopConfirm>
                  : <Button type='link' disabled>已取消</Button>
              }
            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeDictionaryService.getAdminDictionaryByItem({
          itemCode: OperateRoomDictionaryKey.OPERATING_ROOM_ADMIN_CORRECT_NORM_SET,
          tenant: formState.tenant
        })
        if (res) {
          const list = res.map(item => {
            let row = null
            if (item.variable) {
              row = JSON.parse(item.variable) as CorrectNorm
            }
            return {
              ...row,
              ...item,
              id: item.id,
            }
          })
          dataSource.value = list
          if (formState.tenant) {
            dataSource.value = dataSource.value.filter(c => (c as CorrectNorm).tenant === formState.tenant)
          }
          if (formState.deptId) {
            dataSource.value = dataSource.value.filter(c => {
              const deptIds = (c as CorrectNorm).device?.department ? (c as CorrectNorm).device?.department?.map(d => d.id) : []
              return deptIds && deptIds.includes(formState.deptId ?? '')
            })
          }
          if (formState.deviceName) {
            dataSource.value = dataSource.value.filter(c => (c as CorrectNorm).device?.deviceList?.some(d => d?.name && d?.name.includes(formState.deviceName ?? '')))
          }
          if (formState.period) {
            dataSource.value = dataSource.value.filter(c => isTimeRange((c as CorrectNorm)?.handleTime as string, formState.period ?? [] as string[]))
          }
        }
      } catch {
      } finally {
        loading.value = false
      }
    }
    const queryForm = (): void => {
      getTableData()
    }
    const reset = (): void => {
      Object.assign(formState, {
        period: undefined,
        tenant: formState.tenantDefault,
        deptId: undefined,
        deviceName: undefined,
        tenantName: '',
        productId: []
      })
      getTableData()
    }
    const { scrollY } = useTableScroll()

    const normModalRef = ref<{ openModal: () => void; }>()
    const add = (): void => {
      normModalRef.value?.openModal()
    }
    const dictionaryInfo = ref()
    const getDictionaryInfo = async (id: string): Promise<void> => {
      dictionaryInfo.value = await cubeDictionaryService.getDataDictionaryById({ id })
    }
    const cancelRow = async (record: GetDictionaryByItem): Promise<void> => {
      try {
        const userInfo = sessionStorage.getItem('userInfo')
        const variableBack = JSON.parse(record.variable)
        const variable = JSON.stringify({
          ...variableBack,
          cancelHandleTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          cancelHandleUser: typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo,
          deptId: '',
          deptName: '',
          state: CorrectState.INVAILD
        })
        await getDictionaryInfo(record.id)
        await cubeDictionaryService.updateDataDictionary({
          id: record.id,
          itemCode: OperateRoomDictionaryKey.OPERATING_ROOM_ADMIN_CORRECT_NORM_SET,
          name: '修正指标设置',
          variable,
          code: dictionaryInfo.value.code,
          remarks: dictionaryInfo.value.remarks,
          version: dictionaryInfo.value.version,
          tenant: formState.tenant || variableBack.tenant
        })
        message.success('操作成功')
        getTableData()
      } catch {
      } finally {
      }
    }
    const tenantChange = (tenant: { label: string; value: string; }): void => {
      formState.tenantName = tenant?.label ?? ''
      formState.deptId = undefined
    }
    onMounted(() => {
      queryForm()
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={add}>新增</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect v-model:value={formState.tenant} width='180px' selectFirst={false} onChange={tenantChange} />
              </FormItem>
              <FormItem label='维护部门' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DeptSelect tenant={formState.tenant} v-model:value={formState.deptId} width='180px' />
              </FormItem>
              <FormItem label='手术室' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.deviceName} placeholder='请输入手术室名称' />
              </FormItem>
              <FormItem label='时间范围' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table rowKey='id' columns={columns} loading={loading.value} dataSource={dataSource.value} pagination size='small' scrollY={scrollY.value} />
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title='修正指标' v-slots={layoutSlots} />
        <CorrectModal ref={normModalRef} tenant={formState.tenant ?? ''} onEnter={queryForm} labelWidth='100px' />
      </>
  }
})
