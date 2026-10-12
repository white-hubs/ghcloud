import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DatePicker, Form, FormItem, Input, Page, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeMeetRoomService } from '@/api/service'
import { AppointmentReserveStatus, type AppointmentReserveVo, type AppointmentVo, type ChoiceVO } from '@ghcloud/cube-meet-room-service'
import styles from './index.module.less'
import dayjs from 'dayjs'
import { generateTimes } from '@/utils'
import { InfoModal } from './info-modal'
import { ReservationModal } from './reservation-modal'

/** 会议室预约 */
export const Reservation = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const formState = reactive<{
      name: string | undefined;
      date: string | undefined;
    }>({
      name: undefined,
      date: dayjs().format('YYYY-MM-DD'),
    })
    const columns = [
      {
        title: '会议室名称',
        dataIndex: 'conferenceName',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || '--'}>
              <span style={{ paddingLeft: '10px' }}>{text || '--'}</span>
            </PopOver>
          )
        }
      },
    ]
    const loading = ref(false)
    const infoModalRef = ref<{ openModal: (record?: AppointmentVo) => void; }>()
    const reserveModalRef = ref<{ openModal: (date: string, rowState?: ChoiceVO) => void; }>()
    const dataSource = ref<AppointmentVo[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeMeetRoomService.getConferenceAppointment({
          keyword: formState.name || '',
          date: formState.date || '',
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber
        })
        if (res) {
          const { records, total } = res
          dataSource.value = records ?? []
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

    const queryForm = async (): Promise<void> => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      formState.date = dayjs().format('YYYY-MM-DD')
      dataSource.value = []
      queryForm()
    }
    const times = generateTimes()
    const statusMap = new Map([
      ['RESERVED', { name: '已预约', color: 'reserved' }],
      ['APPROVAL', { name: '预约中', color: 'approval' }],
      ['RESERVABLE', { name: '空闲中', color: 'reservable' }],
      ['BEING_USED', { name: '使用中', color: 'used' }],
      ['EXPIRE', { name: '不可用', color: 'no_reservable' }],
      ['CANCEL_RESERVATION', { name: '不可用', color: 'no_reservable' }],
      ['NO_RESERVABLE', { name: '不可用', color: 'no_reservable' }],
      ['FINISH', { name: '不可用', color: 'no_reservable' }],
    ])

    // 获取当前状态
    const getCurCellInfo = (record: AppointmentVo, column: { title: string; }): AppointmentReserveVo => {
      const title = column?.title?.replaceAll(' ', '')
      const find = record?.appointmentDetails?.find((item) => item?.timeInterval?.replaceAll(' ', '') === title)
      // const status = statusMap.get(find?.bookStatus || 'NO_RESERVABLE')
      // 后端未返回，默认不可用
      return find ?? {
        name: '不可用',
        color: 'no_reservable',
        bookStatus: AppointmentReserveStatus.noReservable
      }
    }
    const choiceList = ref<ChoiceVO[]>([])
    const curIndex = ref()
    const clickCell = (record: AppointmentVo, column: { title: string; }): unknown => {
      const { conferenceId } = record
      const { title } = column
      const curCell = getCurCellInfo(record, column)
      const { bookId, bookStatus } = curCell
      // 使用中 已预约，查看详情
      if (bookStatus && [AppointmentReserveStatus.BeingUsed, AppointmentReserveStatus.Reserved, AppointmentReserveStatus.Approval].includes(bookStatus) && bookId) {
        choiceList.value = []
        infoModalRef.value?.openModal({ ...record, bookId: `${bookId ?? ''}` })
      }
      // 可预约
      if (bookStatus && [AppointmentReserveStatus.Reservable].includes(bookStatus)) {
        const key = conferenceId + title
        const current = {
          ...record,
          key: `${conferenceId}${title}`,
          timeInterval: title,
          bookStatus,
          bookId
        }
        if (choiceList.value.length) {
          const findConferenceId = choiceList.value.findIndex(item => item.conferenceId === conferenceId)
          if (findConferenceId === -1) return message.warning('会议预约只能选择一个会议室哦')
        }
        const findInd = choiceList.value.findIndex(item => item.key === key)
        if (findInd > -1) {
          curIndex.value = ''
          choiceList.value.splice(findInd, 1)
        } else {
          curIndex.value = key
          choiceList.value.push(current)
        }
      }
    }
    // 动态列
    const tableColumns = computed(() => {
      const columnList = times.map((item, index) => {
        return {
          title: `${item}`,
          dataIndex: `HeadTime${index}`,
          width: 145,
          align: 'center',
          customRender: ({ column, record }: { column: { title: string; }; record: AppointmentVo; }): JSX.Element => {
            const title = column?.title?.replaceAll(' ', '')
            const find = record?.appointmentDetails?.find((item) => item?.timeInterval?.replaceAll(' ', '') === title)
            const status = statusMap.get(find?.bookStatus || 'NO_RESERVABLE')
            return (
              <div class={[styles.tag_wrap, choiceList.value.some(item => item.key === `${record.conferenceId + column.title}`) ? styles.select : '']} onClick={() => {
                clickCell(record, column)
              }}>
                <div class={[styles.my_tag, styles[`${status?.color}`]]}>{status?.name}</div>
              </div>
            )
          }
        }
      })
      return [...columns, ...columnList]
    })
    const autoScroll = (): void => {
      const clientWidth = Number(document.getElementById('meetReserveTable')?.querySelector('.meet-room-table-container')?.clientWidth)
      const h = Number(dayjs(new Date()).format('HH'))
      const min = Math.floor(clientWidth / 145)
      const part = clientWidth / 2
      let left = h * 2 * 145
      if (h > min) {
        left = left - part + 145
      }
      if (left < part) {
        left = 0
      }
      const box = document.getElementById('meetReserveTable')?.querySelector('.meet-room-table-body')
      if (box) {
        box.scrollTo({
          top: 0,
          left,
          behavior: 'smooth'
        })
      }
    }
    const { scrollY } = useTableScroll()

    const enterReserve = (): void => {
      const timeStr = choiceList.value.map(e => e.timeInterval as string).toString()
      const choice = choiceList.value[0]
      const rowState = {
        ...choice,
        timeInterval: timeStr,
        capacity: choice.capacity ?? 999
      }
      reserveModalRef.value?.openModal(formState.date || '', rowState)
    }
    onMounted(async () => {
      await queryForm()
      setTimeout(() => {
        autoScroll()
        window.addEventListener('resize', autoScroll, false)
      }, 500)
    })
    const tips = ['空闲中', '不可用', '使用中', '已预约', '预约中']
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button type='primary' disabled={!choiceList.value.length} onClick={enterReserve}>确认预约</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='预约时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DatePicker v-model:value={formState.date} valueFormat='YYYY-MM-DD' />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input
                  v-model:value={formState.name} placeholder='会议室名称' showCount={false} allowClear
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <div id='meetReserveTable'>
              <Table
                rowKey='id'
                columns={tableColumns.value}
                loading={loading.value}
                dataSource={dataSource.value}
                pagination={false}
                scrollY={scrollY.value}
                size='small' />
            </div>
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
      },
      'footer-btn': (): JSX.Element => {
        return (
          <div class={styles.foot_tip}>
            {
              tips.map(e => {
                return (
                  <div class={styles.item}>
                    <span class={styles.dot} />{e}
                  </div>
                )
              })
            }
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <InfoModal ref={infoModalRef} onEnter={queryForm} labelWidth='110px' />
        <ReservationModal ref={reserveModalRef} onEnter={queryForm} labelWidth='110px' />
      </>
  }
})
