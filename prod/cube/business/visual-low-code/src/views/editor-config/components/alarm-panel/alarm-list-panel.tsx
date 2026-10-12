import { defineComponent, nextTick, onMounted, reactive, ref, watch, type VNode, Teleport } from 'vue'
import { Button, Card, DatePicker, Drawer, Form, FormItem, Icon, Input, Notifications } from '@ghcloud/visual-view-ui'
import { getAlarmMsgUnConfirmed } from '@/apis/business/alarm'
import styles from './alarm-list-panel.module.less'
import { useRouter } from 'vue-router'
import { getDate } from '@/utils'
import { logger } from '@/logger'
import NoData from '@/components/config-components/business-panel/components/public/no-data'
import enumerateData from '@/utils/enumeratie.ts'
import { hex2Rgba } from '@/utils/style'
import DevicePanel from '@/components/config-components/business-panel/components/device-panel'
import Equ from '@/components/config-components/business-panel/components/equipmentdetails/index'
import type { CameraViewType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import UeClient from '@/static/model/ue-client'
interface AlarmTakeNotesList {
  id: string;
  businessKey: string;
  alarmTime: string;
  alarmTypeName: string;
  alarmLevelName: string;
  alarmEventName: string;
  alarmStatus: string;
  alarmStatusName: string;
  alarmTargetName: string;
  areaName: string;
  alarmLevelCode: string;
  code: string;
}
export default defineComponent({
  emits: ['isShowPanel'],
  name: 'alarm-list-panel',
  props: {
    isShowPanel: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const isShow = ref(true)
    const router = useRouter()
    const currentRoute = router.currentRoute
    const search = ref({ period: [], keyword: '' })
    const showSmallPanel = ref(false)
    const showBigPanel = ref(false)
    const alarmListRef = ref()
    const currentDevice = ref()
    const ueClient = UeClient.getInstance()
    const page = reactive({
      total: 0,
      pageSize: 10,
      pageNumber: 1,
      pages: 0,
    })
    const { alarmLeaveOptions } = enumerateData()
    const unReadAlarmList = ref<AlarmTakeNotesList[]>([])
    const alarmStyle = (item: AlarmTakeNotesList, type: string) => {
      const data = alarmLeaveOptions.value.find((element) => {
        if (item.alarmLevelCode === element.value) {
          return element
        } else {
          return false
        }
      })
      if (type === 'color') {
        return data?.color
      } else if (type === 'background') {
        return hex2Rgba(data?.color ?? '', 0.2)
      } else {
        return ''
      }
    }
    onMounted(() => {
      nextTick(() => {
        setTimeout(() => {
          alarmListRef.value.addEventListener('scrοll', scroll)
        }, 500)
      })
    })
    const scroll = (e): void => {
      const clientHeight: number = e.target?.clientHeight
      const scrollTop: number = e.target.scrollTop
      const scrollHeight: number = e.target.scrollHeight
      if (scrollTop + clientHeight + 2 >= scrollHeight) {
        if (page.pageNumber < page.pages) {
          page.pageNumber++
          requestUnreadAlarmList()
        }
      }
    }
    const requestUnreadAlarmList = async (): Promise<void> => {
      logger.debug(search.value.period, 'search.value.period')
      const period =
        search.value.period?.length
          ? [
              getDate(search.value.period[0]) + ' 00:00:00',
              getDate(search.value.period[1]) + ' 23:59:59',
            ]
          : []
      const params = {
        keyword: search.value.keyword,
        period: period.length ? period.join(',') : '',
        pageSize: page.pageSize,
        pageNumber: page.pageNumber,
      }
      const res = await getAlarmMsgUnConfirmed(params)
      unReadAlarmList.value = [...unReadAlarmList.value, ...res.data.records]
      page.total = res.data.total
      page.pages = res.data.pages
    }
    const searchAlarm = (): void => {
      page.pageNumber = 1
      unReadAlarmList.value = []
      requestUnreadAlarmList()
    }
    // 点击行
    const lastView = ref<CameraViewType>()
    const handleClickItem = (item: AlarmTakeNotesList): void => {
      currentDevice.value = item
      showSmallPanel.value = true
      // 获取聚焦前的视角
      ueClient.send('getCameraView', function (cameraView: CameraViewType) {
        lastView.value = cameraView
      })
      // 聚焦设备
      ueClient.send('focusActor', { id: item.code })
    }
    watch(() => props.isShowPanel, () => {
      isShow.value = props.isShowPanel
      if (isShow.value) {
        page.pageNumber = 1
        requestUnreadAlarmList()
        nextTick(() => {
          setTimeout(() => {
            alarmListRef.value.addEventListener('scroll', scroll)
            logger.debug(alarmListRef.value)
          }, 500)
        })
      }
    }, { immediate: true })
    const cardSlot = (item: AlarmTakeNotesList): { header: object; default: object; } => {
      return {
        header: () => {
          return <div class={styles.header}><span>{item.alarmEventName}</span><span>{getDate(item.alarmTime, 'YYYY-MM-DD HH:mm:ss')}</span></div>
        },
        default: () => {
          return (
            <div class={styles['alarm-info']} onClick={() => { handleClickItem(item) }}>
              <div class={styles.icon} style={{ background: alarmStyle(item, 'background') }}>
                <Icon color={alarmStyle(item, 'color') ?? ''}><Notifications /></Icon>
              </div>
              <div class={styles.describe}>
                <p class={styles['equipment-name']}>
                  {item.alarmTargetName}
                </p>
                <p>{item.areaName}</p>
              </div>
            </div>
          )
        },
      }
    }
    const listDom = (): VNode =>
      <div class={styles['alarm-list']} ref={alarmListRef} onScroll={scroll}>
        {unReadAlarmList.value.map(item =>
          <Card
            key={item.id}
            headerStyle={{ borderBottom: '1px solid rgba(36, 47, 60,.5)', padding: '4px', fontSize: '16px', fontWeight: '400' }}
            contentStyle={{ padding: '10px' }}
            style={{ background: 'rgba(9,18,33,.2)', border: 'none', color: '#fff', marginBottom: '14PX', cursor: 'pointer' }}
            v-slots={cardSlot(item)}
          />
        )}
      </div>
    return () =>
      <div>
        <Drawer zIndex={currentRoute.value.name === 'editor-config' ? -10 : 1000} show={isShow.value} trapFocus={false} blockScroll to={currentRoute.value.name === 'editor-config' ? '#drawer' : '#renderView'} placement='right'>
          <div class={styles.panel}>
            <div class={`${styles.search} flex-center`}>
              <Form model={search.value}>
                <FormItem path='period'>
                  <DatePicker type='daterange' onUpdate:value={(val) => { search.value.period = val.value }} closeOnSelect />
                </FormItem>
                <FormItem path='keyword'>
                  <Input
                    v-model:value={search.value.keyword}
                    placeholder='请输入报警事件名称'
                  />
                  <Button type='primary' onClick={searchAlarm}>搜索</Button>
                </FormItem>
              </Form>
            </div>
            <div class={styles['alarm-content']}>
              {unReadAlarmList.value.length
                ? listDom()
                : <NoData />}
            </div>
          </div>
        </Drawer>
        <Teleport to='body'>
          <div v-show={showSmallPanel.value}>
            <DevicePanel
              v-model:isShow={showSmallPanel.value}
              device={currentDevice.value}
              onItemShow={(show) => { showBigPanel.value = show }}
            />
          </div>
          <div v-show={showBigPanel.value}>
            <Equ
              id={currentDevice.value?.id} v-model:itemShow={showBigPanel.value}
            />
          </div>
        </Teleport>
      </div>
  }
})
