import { computed, defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue'
import styles from './alarm-list-panel.module.less'
import { Button, Card, Form, FormItem, Input, Space } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AlertOutlined } from '@ant-design/icons-vue'
import enumerateData from '@/utils/enumeratie'
import { hex2Rgba } from '@/utils/common'
import { alarmrecords } from '@/api/alarm'
import { openAlarmDetailModal } from '@/pages/widget/modal/alarm-detail-modal/alarm-detail-modal'
import { eventInstance } from '@/pages/event/event'

export const AlarmListPanel = defineComponent({
  setup () {
    const alarmListRef = ref()
    const search = reactive({
      period: [],
      keyword: ''
    })
    const page = reactive({
      total: 0,
      pageSize: 10,
      pageNumber: 1,
      pages: 0,
    })
    const loading = ref(false)
    const unReadAlarmList = ref([])
    const { alarmLeaveOptions } = enumerateData()
    const alarmStyle = computed(() => (item): string => {
      const data = alarmLeaveOptions.value.find(element => item.alarmLevelCode === element.value)
      return `color:${data.color};background:${hex2Rgba(data.color, 0.2)}`
    })
    const requestUnreadAlarmList = async (): Promise<void> => {
      try {
        loading.value = true
        const period =
        search.period?.length
          ? [
            dayjs(search.period[0]).format('YYYY-MM-DD 00:00:00'),
            dayjs(search.period[1]).format('YYYY-MM-DD 23:59:59'),
          ]
          : []
        const params = {
          keyword: search.keyword,
          period: period.length ? period.join(',') : '',
          pageSize: page.pageSize,
          pageNumber: page.pageNumber,
        }
        const res = await alarmrecords(params)
        unReadAlarmList.value = [...unReadAlarmList.value, ...res.records]
        page.total = res.total
        page.pages = res.pages
      } catch {

      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      requestUnreadAlarmList()
    })
    onUnmounted(()=>{
      eventInstance.emitEvent('alarmPlaneUnmounted')
    })

    function handelScroll (e): void {
      const { scrollTop, clientHeight, scrollHeight } = e.target
      const threshold = 5
      if (scrollTop + clientHeight >= scrollHeight - threshold && !loading.value) {
        if (page.pageNumber < page.pages) {
          page.pageNumber++
          requestUnreadAlarmList()
        }
      }
    }

    function searchAlarm (): void {
      page.pageNumber = 1
      unReadAlarmList.value = []
      requestUnreadAlarmList()
    }
    function openAlarmModal (item: { alarmTypeName: string;alarmEventName: string; }): void {
      openAlarmDetailModal({
        title: item.alarmEventName,
        alarmData: item,
      })
      eventInstance.emitEvent('openDeviceFloor', item)
    }
    return (): JSX.Element=>
      <div class={styles['alarm-list-panel']}>
        <div class={styles.search}>
          <Form model={search}>
            <FormItem>
              <a-range-picker v-model:value={search.period} value-format='YYYY-MM-DD' />
            </FormItem>
            <FormItem>
              <Space size={16}>
                <Input
                  v-model:value={search.keyword}
                  placeholder='请输入报警事件名称'
                />
                <Button type='primary' onClick={searchAlarm}>搜索</Button>
              </Space>
            </FormItem>
          </Form>
        </div>
        <div class={styles['alarm-list']} ref={alarmListRef} onScroll={handelScroll}>
          {
            unReadAlarmList.value.map(item => {
              return (
                <Card
                  size='small'
                  title={item.alarmEventName}
                  key={item.id}
                  v-slots={{
                    extra: () => dayjs(item.alarmTime).format('YYYY-MM-DD HH:mm:ss')
                  }}
                >
                  <div class={styles['alarm-info']} onClick={() => {
                    openAlarmModal(item)
                  }}>
                    <div class={styles.icon} style={alarmStyle.value(item)}>
                      <AlertOutlined />
                    </div>
                    <div class={styles.describe}>
                      <p class={styles['equipment-name']}>{item.alarmTargetName}</p>
                      <p>{item.areaName}</p>
                    </div>
                  </div>
                </Card>
              )
            })
          }
        </div>
      </div>
  }
})
