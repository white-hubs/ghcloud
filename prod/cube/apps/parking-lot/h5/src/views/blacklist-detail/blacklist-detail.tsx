import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, Button, Popup, Icon, showNotify, PickerGroup, Cell } from 'vant'
import styles from './blacklist-detail.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeParkingLotService } from '@/api/server'
import type { VehiclePenaltyRecordVO } from '@ghcloud/cube-parking-lot-service/src/type'
import { useGlobalRouter } from '@/hook/use-global-router'
import VueHashCalendar from 'vue3-hash-calendar'
import 'vue3-hash-calendar/es/index.css'
import dayjs from "dayjs";

export const BlacklistDetail = defineComponent({
  name: 'BlacklistDetail',
  setup () {
    const { route } = useGlobalRouter()
    const plateNumber = route.query?.plateNumber as string
    
    const dataSource = ref<VehiclePenaltyRecordVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 0,
      pageSize: 10,
      period: ''
    })

    // Filter State
    const showPop = ref(false)
    const showDatePicker = ref(false)
    const datePicker = reactive({
      start: '',
      end: ''
    })

    const onLoad = async (): Promise<void> => {
      try {
        if (!plateNumber) {
          finished.value = true
          return
        }
        loading.value = true
        search.pageNumber++
        
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          plateNumber: plateNumber,
          period: search.period,
          violationTime: search.period,
        }
        
        const res = await cubeParkingLotService.getParkingBlackDetail(params)
        search.total = res.total
        
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        
        dataSource.value = [...dataSource.value, ...res.records]
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }

    const handleFilterClick = () => {
      showPop.value = true
    }

    const onDateChange = (value: string, type: 'start' | 'end'): void => {
      datePicker[type] = value
      if (datePicker.start === datePicker.end) {
        datePicker.end = ''
      }
    }

    const pickerConfirm = (): void => {
      if (datePicker.start === datePicker.end) {
        showNotify('开始时间不能等于结束时间')
      }
      if (datePicker.start === '') {
        showNotify('请选择开始时间')
        return
      }
      if (datePicker.start === '' || datePicker.end === '') {
        showNotify('请选择结束时间')
        return
      }
      if (new Date(datePicker.start).getTime() > new Date(datePicker.end).getTime()) {
        showNotify('开始时间不能大于结束时间')
        return
      }
      showDatePicker.value = false
    }

    const onFilterConfirm = (): void => {
      if (datePicker.start && datePicker.end && new Date(datePicker.start).getTime() > new Date(datePicker.end).getTime()) {
        showNotify('开始时间不能大于结束时间')
        return
      }
      
      if (datePicker.start && datePicker.end) {
          search.period = `${datePicker.start},${datePicker.end}`
      } else if (datePicker.start || datePicker.end) {
          showNotify('请选择完整的时间范围')
          return
      } else {
          search.period = ''
      }

      showPop.value = false
      onRefresh()
    }

    const onFilterReset = (): void => {
      datePicker.start = ''
      datePicker.end = ''
      search.period = ''
      // showPop.value = false
      // onRefresh()
    }

    const toDetail = (item: VehiclePenaltyRecordVO): void => {
        const path = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=ILLEGAL_PARKING&processId=${item?.processInstanceId}`
        window.location.href = path
    }

    onMounted(() => {
      // onRefresh is called by PullRefresh automatically or we call it
      // onRefresh()
    })

    return (): JSX.Element => (
      <div class={styles['blacklist-detail']}>
        <CubeNavBar showBack title={'违停记录'} rightSlot={() => 
          <div class={styles['filter-btn']} onClick={handleFilterClick}>
            <Icon name="filter-o" class={styles.icon} />
            <span>筛选</span>
          </div>
        } />
      

        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['pull-refresh']}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text="没有更多了"
            onLoad={onLoad}
          >
            {dataSource.value.length > 0 ? (
              dataSource.value.map((item, index) => (
                <div class={styles['detail-card']} key={index}>
                  <div onClick={() => toDetail(item)}>
                    <Cell
                      is-link
                      center
                      v-slots={{
                        title: () => (
                          <div class={styles['cell-title']}>
                            <span class={styles.text}>{item.plateNumber || '--'}</span>
                          </div>
                        )
                      }}
                    />
                    <div class={styles['cell-content']}>
                      <div class={styles['info-item']}>
                        <span>车主：{item.ownerName || '--'}</span>
                      </div>
                      <div class={styles['info-item']}>
                        <span>联系方式：{item.ownerPhone || '--'}</span>
                      </div>
                      <div class={styles['info-item']}>
                          <span>违停时间：{item.illegalTime ? dayjs(item.illegalTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
                      </div>
                      <div class={styles['info-item']}>
                        <span>违停工单：
                          <span class={styles.link} onClick={() => toDetail(item)}>
                            {item?.worKOrderName || '--'}
                          </span>
                        </span>
                      </div>
                      <div class={styles['info-item']}>
                        <span>违停扣分：{item.violationScore || 0}分</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              !loading.value && <Empty description="暂无数据" />
            )}
          </List>
        </PullRefresh>

        <Popup
          v-model:show={showPop.value}
          position="right"
          style={{ width: '80%', height: '100%' }}
        >
          <div class={styles['pop-form']}>
            <div class={styles['form-item']}>
              <div class={styles['label']}>时间范围</div>
              <input
                class={styles['value-input']}
                placeholder="开始时间 ~ 结束时间"
                readonly
                value={datePicker.start && datePicker.end ? `${datePicker.start} ~ ${datePicker.end}` : ''}
                onClick={() => showDatePicker.value = true}
              />
            </div>
          </div>
            
          <div class={styles['pop-footer']}>
              <span class={styles.reset} onClick={onFilterReset}>重置</span>
              <Button type="primary" onClick={onFilterConfirm}>确定</Button>
          </div>
        </Popup>

        <Popup
          v-model:show={showDatePicker.value}
          position='bottom'
          style={{ width: '100%' }}
        >
          <PickerGroup title='时间选择' tabs={['开始时间', '结束时间']} onConfirm={pickerConfirm}>
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e: string) => {
              onDateChange(e, 'start')
            }} show-today-button={false} />
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e: string) => {
              onDateChange(e, 'end')
            }} show-today-button={false} />
          </PickerGroup>
        </Popup>
      </div>
    )
  }
})
