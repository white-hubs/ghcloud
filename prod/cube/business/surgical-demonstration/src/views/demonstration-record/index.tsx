import { defineComponent, reactive, onMounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, DateRangePicker, Button, Table, Input } from '@ghcloud/cube-ui'
import dayjs, { type Dayjs } from 'dayjs'
import { treatedWater } from '@/apis/water-purification'
type RangeValue = [Dayjs, Dayjs]
export const DemonstrationRecord = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        keyword: string;
        period: string[];
      };
    }>({
      loading: false,
      dataSource: [],
      searchParams: {
        keyword: '',
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        period: []
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          period: state.searchParams.period ? state.searchParams.period.join(',') : ''
        }
        const { data } = await treatedWater(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '手术名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center'
      },
      {
        title: '手术室',
        dataIndex: 'operatingRoom',
        key: 'operatingRoom',
        align: 'center'
      },
      {
        title: '主刀医生',
        dataIndex: 'chiefSurgeon',
        key: 'chiefSurgeon',
        align: 'center'

      }, {
        title: '手术日期',
        dataIndex: 'dateOperation',
        key: 'dateOperation',
        align: 'center',
        customRender: ({ text }: { text: number; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD') : ''
        }
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime',
        align: 'center',
        customRender: ({ text }: { text: number; }): string => {
          return text ? dayjs(text).format('HH:mm:ss') : ''
        }
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        key: 'endTime',
        align: 'center',
        customRender: ({ text }: { text: number; }): string=> {
          return text ? dayjs(text).format('HH:mm:ss') : ''
        }
      }, {
        title: '视频时长min',
        dataIndex: 'videoDuration',
        key: 'videoDuration',
        align: 'center',
        customRender: ({ text }: { text: number; }): number => {
          return text
        }
      }, {
        title: '课程分类',
        dataIndex: 'courseClassification',
        key: 'courseClassification',
        align: 'center',
        customRender: ({ text }: { text: number; }): string | undefined => {
          return {
            DISTANCE_TRAINING: '远程培训',
            REMOTE_GUIDANCE: '远程指导',
            DEPARTMENTAL_TRAINING: '科室内训',
            REMOTE_CONSULTATION: '远程会诊',
          }[text]
        }
      }, {
        title: '视频所属科室',
        dataIndex: 'subject',
        key: 'subject',
        align: 'center'

      }, {
        title: '示教形式',
        dataIndex: 'modality',
        key: 'modality',
        align: 'center'

      }, {
        title: '播放次数',
        dataIndex: 'playbackCount',
        key: 'playbackCount',
        align: 'center'

      },
    ]
    const dates = ref<RangeValue>()
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.keyword = ''
      state.searchParams.period = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      getList()
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    const disabledDate = (current: Dayjs): boolean => {
      if (!dates.value) {
        return false
      }
      const tooLate = dates.value[0] && current.diff(dates.value[0], 'days') > 365
      const tooEarly = dates.value[1] && dayjs(dates.value[1]).diff(current, 'days') > 365
      return tooLate || tooEarly
    }
    const calendarChange = (val: RangeValue): void => {
      dates.value = val
    }
    onMounted(async () => {
      await getList()
    })
    const layoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='视频名称'>
              <Input showCount={false} v-model:value={state.searchParams.keyword} placeholder='请输入视频名称' />
            </FormItem>
            <FormItem label='示教时间'>
              <DateRangePicker
                disabled-date={disabledDate} onCalendarChange={calendarChange}
                v-model:value={state.searchParams.period} picker='date'
              />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': (): JSX.Element=> {
        return <Table columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} size='small' scrollY={500} />
      },
      'footer-page': (): JSX.Element => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return (): JSX.Element => <GLayout title='手术示教' v-slots={layoutSlots} />
  }
})
