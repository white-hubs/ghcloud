import { Button, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { AreaPeriodModal } from './area-period-modal'
import type { DetailListState, TableState } from '@ghcloud/cube-visitor-management-service'

interface Props {
  title: string;
  readonly: boolean;
  value: DetailListState[];
}

export const AreaPeriodTable = defineComponent({
  props: ['title', 'readonly', 'value'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const periodModalRef = ref<{ openModal: () => void; }>()
    const periodList = ref<DetailListState[]>(props.value ?? [])

    watch(() => props.value, (val) => {
      periodList.value = val ?? []
    }, { immediate: true, deep: true })
    const list = ref<DetailListState[]>([])
    const handleOpenModal = (): void => {
      periodModalRef.value?.openModal()
      list.value = [...periodList.value.filter(i => !i.isDelete)]
    }
    const handlePeriodModal = (data: TableState): void => {
      const rowData = {
        startDateStr: data?.period ? data.period[0] : '',
        endDateStr: data?.period ? data.period[1] : '',
        timeList: data?.timeList
          ? data.timeList.map(t => {
            return {
              ...t,
              totalNumber: t.totalNumber,
              timeStr: t.startTime && t.endTime ? `${t.startTime} - ${t.nextDayBool ? '次日' : ''}${t.endTime}` : ''
            }
          })
          : []
      }
      data && list.value.push(rowData as DetailListState)
      periodList.value = [...list.value].filter(i => !i.isDelete)
      emit('update:value', periodList.value)
      emit('change', periodList.value)
    }
    const delRow = (index: number): void => {
      periodList.value.forEach((item, i) => {
        if (i === index) {
          item.isDelete = true
        }
      })
      periodList.value.splice(index, 1)
      emit('update:value', periodList.value)
      emit('change', periodList.value)
    }
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '访问日期',
        dataIndex: 'period',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: DetailListState; }): JSX.Element => {
          const textVal = `${record.startDateStr} ~ ${record.endDateStr} `
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '访问时间段',
        dataIndex: 'timeList',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: DetailListState; }): JSX.Element => {
          const textVal = record.timeList && record.timeList.length > 0
            ? (record.timeList).map(t => {
              if (t.timeStr && t.timeStr !== undefined) {
                return `${t.timeStr}【可访问数量: ${t.totalNumber}】`
              } else {
                return ''
              }
            }).join(', ')
            : ''
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        customRender: ({ index }: { index: number; }): JSX.Element => {
          return (
            <>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                delRow(index)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    if (props.readonly) {
      columns.pop()
    }

    return (): JSX.Element => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          {
            !props.readonly &&
              <>
                <Button type='primary' shape='round' onClick={handleOpenModal}>添加</Button>
                <AreaPeriodModal
                  ref={periodModalRef}
                  onOk={handlePeriodModal}
                />
              </>
          }
        </div>
      )

      const body = <Table columns={columns} dataSource={periodList.value} pagination={false} size='small' scrollY={400} />

      return (
        <>
          {header}
          {body}
        </>
      )
    }
  }
})
