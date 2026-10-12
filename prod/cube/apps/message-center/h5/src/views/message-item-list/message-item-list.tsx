import { defineComponent, onMounted, ref } from 'vue'
import styles from './message-item-list.module.less'
import { Cell, CellGroup, closeToast, List, PullRefresh, showFailToast, showLoadingToast, showNotify } from 'vant'
import { useRoute } from 'vue-router'
import { cubeMessageCenterService } from '@/api/server'
import type { MsgRecordCustomGroupItem } from '@ghcloud/cube-message-center-service/src/types'
import dayjs from 'dayjs'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const MessageItemList = defineComponent({
  setup: () => {
    const route = useRoute()
    const loading = ref(false)
    const finished = ref(false)
    const page = {
      pageSize: 20,
      pageNumber: 0
    }
    const msgList = ref<MsgRecordCustomGroupItem[]>([])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        page.pageNumber++
        const res = await cubeMessageCenterService.geMsgRecordCustomGroupPage({
          pageSize: page.pageSize,
          pageNumber: page.pageNumber,
          channelType: 'CHANNEL_SITE',
          customType: route.query?.type as string,
          category: route.query?.category as string,
        })
        msgList.value = [...msgList.value, ...res.records]
        if (res.pages <= page.pageNumber || res.records.length === 0) {
          finished.value = true
        }
      } catch {
        showNotify({ type: 'danger', message: '获取消息列表失败' })
      } finally {
        loading.value = false
      }
    }
    const onRefresh = (): void => {
      page.pageNumber = 0
      getData()
    }
    const toDetail = async (item: MsgRecordCustomGroupItem): Promise<void> => {
      showLoadingToast({
        message: '',
        forbidClick: true,
        loadingType: 'spinner',
      })
      if (!item.hasRead) {
        await cubeMessageCenterService.geMsgRecordById(item.id)
      }
      const applicationCode = item.applicationCode ?? ''
      closeToast()
      switch (applicationCode) {
        // 日常巡检
        case 'INSPECTION':
          return
        // 通知公告
        case 'TECHNICAL_BULLETIN':
          return
        // 安全教育
        case 'SECURE_EDU':
          return
        // 报警中心
        case 'ALARM_CENTER':
        case 'SECURITY_MONITORING':
        case 'ELECTRICMANAGE':
        case 'AIRSUPPLYANDEXHAUST':
        case 'FIRECONTROL':
        case 'ROTATINGMANAGE':
        case 'WATERSUPPLYDRAINAGE':
        case 'AIRCONDITIONER':
        case 'ENERGY_CONSUMPTION':
        case 'GAS_MANAGEMENT':
          // 标准报警详情页
          return
        case 'RETROFIT':
        case 'OUTSOURCE_REPAIR':
        case 'HIDDENDANGER':
        case 'FAULT':
        case 'ATTENDANCE_MANAGEMENT':
        case 'PERSONNELMANAGEMENT':
        case 'WORK_REPORT':
        case 'SMALLENFINEERING':
          // 跳转流引擎表单详情页
          return
        case 'PROPERTY_MANAGEMENT':
          // 资产管理
          return
        case 'ELECTRONIC_PATROL':
          // 电子巡更
          return
        default:
          showFailToast('暂无业务详情')
          onRefresh()
      }
    }

    document.title = route.query?.typeName as string || '消息中心'
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title={route.query.typeName} />
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <div class={styles['message-list']}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text='暂无更多数据'
              onLoad={getData}
            >
              {
                msgList.value.map(item => {
                  return (
                    <div class={styles['message-list-item']} key={item.id} onClick={() => {
                      toDetail(item)
                    }}>
                      <div class={styles['message-list-item-time']}>{dayjs(item.sendTime).format('YYYY-MM-DD HH:mm')}</div>
                      <CellGroup>
                        <Cell title={item.satMsgDefineName} label={item.msgContent} class={{ 'un-read-dot': !item.hasRead }} />
                        <Cell title='查看详情' isLink class={styles['message-list-item-link']} />
                      </CellGroup>
                    </div>
                  )
                })
              }
            </List>
          </div>
        </PullRefresh>
      </>
  }
})
