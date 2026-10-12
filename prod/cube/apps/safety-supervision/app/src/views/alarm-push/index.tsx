import { defineComponent, onMounted, ref } from 'vue'
import { Tabs, TabPane, Switch, Button, message } from '@ghcloud/cube-ui'
import { AlarmList } from './components/alarm-list'
import { AlarmTimeoutList } from './components/alarm-timeout-list'
import { Layout } from '@ghcloud/generic-component'
import { alarmNotice, setAlarmNotice } from '../../api/alarm'
import { usePageName } from '@ghcloud/cube-utils'

export const AlarmPush = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const activeKey = ref('SAFETY_ALARM_NOTIFY')
    const msgConfigList = ref<any>([
      {
        name: '一级报警',
        alarmLevelCode: 'one_level',
        enabled: true,
        sceneCode: 'SAFETY_ALARM_NOTIFY',
        value: '',
        noticeObjs: [],
        noticeWay: [],
      },
      {
        name: '二级报警',
        alarmLevelCode: 'two_level',
        enabled: true,
        value: '',
        noticeObjs: [],
        noticeWay: [],
        sceneCode: 'SAFETY_ALARM_NOTIFY'
      },
      {
        name: '三级报警',
        alarmLevelCode: 'three_level',
        enabled: true,
        value: '',
        noticeObjs: [],
        noticeWay: [],
        sceneCode: 'SAFETY_ALARM_NOTIFY'
      },
      {
        name: '四级报警',
        alarmLevelCode: 'four_level',
        enabled: true,
        value: '',
        noticeObjs: [],
        noticeWay: [],
        sceneCode: 'SAFETY_ALARM_NOTIFY'
      }
    ])
    const msgTimeoutList = ref<any>([
      {
        name: '一级报警',
        alarmLevelCode: 'one_level',
        enabled: true,
        sceneCode: 'SAFETY_ALARM_NOTIFY',
        noticeObjs: [],
        noticeWay: [],
        notification: 0,
      },
      {
        name: '二级报警',
        alarmLevelCode: 'two_level',
        enabled: true,
        noticeObjs: [],
        noticeWay: [],
        notification: 0,
        sceneCode: 'SAFETY_ALARM_NOTIFY'
      },
      {
        name: '三级报警',
        alarmLevelCode: 'three_level',
        enabled: true,
        noticeObjs: [],
        noticeWay: [],
        notification: 0,
        sceneCode: 'SAFETY_ALARM_NOTIFY'
      },
      {
        name: '四级报警',
        alarmLevelCode: 'four_level',
        enabled: true,
        noticeObjs: [],
        noticeWay: [],
        notification: 0,
        sceneCode: 'SAFETY_ALARM_NOTIFY'
      }
    ])
    const loading = ref(false)
    const getAlarmNotice = async (data?: string): Promise<void> => {
      const value = data ?? activeKey.value
      activeKey.value = data ?? activeKey.value
      const res: any = await alarmNotice({ businessType: value })
      if (value === 'SAFETY_ALARM_NOTIFY') {
        res.data.forEach((item: { noticeObjs: { objInfo: string; }[]; enabled: any; noticeWays: { noticeWay: any; }[]; }, index: string | number) => {
          msgConfigList.value[index].noticeObjs = item.noticeObjs.map((e: { objInfo: string; }) => JSON.parse(e.objInfo))
          msgConfigList.value[index].enabled = item.enabled
          msgConfigList.value[index].noticeWay = item.noticeWays.map((e: { noticeWay: any; }) => e.noticeWay)
        })
      } else {
        res.data.forEach((item: { value: number; noticeObjs: { objInfo: string; }[]; enabled: any; noticeWays: { noticeWay: any; }[]; }, index: string | number) => {
          msgTimeoutList.value[index].noticeObjs = item.noticeObjs.map((e: { objInfo: string; }) => JSON.parse(e.objInfo))
          msgTimeoutList.value[index].enabled = item.enabled
          msgTimeoutList.value[index].notification = item.value
          msgTimeoutList.value[index].noticeWay = item.noticeWays.map((e: { noticeWay: any; }) => e.noticeWay)
        })
      }
    }
    // 报警通知
    const confirm = (index: number, value: any): void => {
      msgConfigList.value[index].noticeObjs = value.alarmNotice
      msgConfigList.value[index].noticeWay = value.notificationMethod
    }
    // 报警超时通知
    const confirmTimeout = (index: number, value: any): void => {
      msgTimeoutList.value[index].noticeObjs = value.alarmNotice
      msgTimeoutList.value[index].noticeWay = value.notificationMethod
      msgTimeoutList.value[index].notification = value.notification
    }
    const submit = async (): Promise<void> => {
      let flag = true
      for (const iterator of activeKey.value === 'SAFETY_ALARM_NOTIFY' ? msgConfigList.value : msgTimeoutList.value) {
        if (iterator.enabled) {
          if (iterator.noticeObjs.length === 0) {
            message.warning('请选择通知对象')
            flag = false
            return
          }
          if (iterator.noticeWay.length === 0) {
            message.warning('请选择通知方式')
            flag = false
            return
          }
          flag = true
        }
      }
      if (!flag) {
        return
      }
      loading.value = true

      const sceneConfigDTOS: { alarmLevelCode: string; value: string; enabled: boolean; sceneCode: string; noticeWays: { noticeWay: never; }[]; noticeObjs: any[]; }[] = []
      const sceneConfigTimeout: { alarmLevelCode: any; enabled: any; sceneCode: string; noticeWays: { noticeWay: any; }[]; noticeObjs: { objId: string; objType: string; objInfo: any; }[]; value: any; }[] = []
      msgConfigList.value.forEach((item: { noticeWay: any[]; noticeObjs: any[]; alarmLevelCode: any; value: any; enabled: any; }) => {
        const noticeWays = item.noticeWay.map((noticeWay: any) => {
          return {
            noticeWay
          }
        })
        const noticeObjs: { objId: string; objType: string;objInfo: any; }[] = []
        item.noticeObjs.forEach((item: any) => {
          noticeObjs.push({
            objId: item.value.map((e: { id: string; }) => e.id).join(),
            objType: item.name,
            objInfo: JSON.stringify(item)
          })
        })
        const obj = {
          alarmLevelCode: item.alarmLevelCode,
          value: item.value,
          enabled: item.enabled,
          sceneCode: activeKey.value === 'SAFETY_ALARM_NOTIFY' ? 'SAFETY_ALARM_NOTIFY' : 'SAFETY_ALARM_TIMEOUT_NOTIFY1',
          noticeWays,
          noticeObjs
        }
        // @ts-ignore
        sceneConfigDTOS.push(obj)
      })
      msgTimeoutList.value.forEach((item: { noticeWay: any[]; noticeObjs: any[]; alarmLevelCode: any; enabled: any; notification: any; }) => {
        const noticeWays = item.noticeWay.map((noticeWay: any) => {
          return {
            noticeWay
          }
        })
        const noticeObjs: { objId: string; objType: string;objInfo: any; }[] = []
        item.noticeObjs.forEach((item: any) => {
          noticeObjs.push({
            objId: item.value.map((e: { id: string; }) => e.id).join(),
            objType: item.name,
            objInfo: JSON.stringify(item)
          })
        })
        const obj = {
          alarmLevelCode: item.alarmLevelCode,
          enabled: item.enabled,
          sceneCode: activeKey.value === 'SAFETY_ALARM_NOTIFY' ? 'SAFETY_ALARM_NOTIFY' : 'SAFETY_ALARM_TIMEOUT_NOTIFY1',
          noticeWays,
          noticeObjs,
          value: item.notification
        }
        sceneConfigTimeout.push(obj)
      })
      const params = {
        businessType: activeKey.value,
        sceneConfigDTOS: activeKey.value === 'SAFETY_ALARM_NOTIFY' ? sceneConfigDTOS : sceneConfigTimeout
      }
      setAlarmNotice(params).then(() => {
        message.success('保存成功！')
        getAlarmNotice()
        loading.value = false
      })
    }
    onMounted(() => {
      getAlarmNotice()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs v-model:activeKey={activeKey.value} onTabChange={getAlarmNotice}>
              <TabPane key='SAFETY_ALARM_NOTIFY' tab='报警通知'>
                {
                  msgConfigList.value.map((item: Record<string, any>, index: number) =>
                    <div style='margin-bottom:10px' key={item.alarmLevelCode}>
                      {item.name}  <Switch v-model:checked={item.enabled} />
                      {/* @ts-ignore */}
                      <AlarmList onConfirm={(value: any) => {
                        confirm(index, value)
                      }} config={item} />
                    </div>)
                }
              </TabPane>
              <TabPane key='SAFETY_ALARM_TIMEOUT_NOTIFY' tab='报警超时通知'>
                {
                  msgTimeoutList.value.map((item: { alarmLevelCode: string; name: any; enabled: any; }, index: number) =>
                    <div style='margin-bottom:10px' key={item.alarmLevelCode}>
                      {item.name}  <Switch v-model:checked={item.enabled} />
                      {/* @ts-ignore */}
                      <AlarmTimeoutList onConfirm={(value: any) => {
                        confirmTimeout(index, value)
                      }} config={item} />
                    </div>)
                }
              </TabPane>
            </Tabs>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button type='primary' onClick={submit} loading={loading.value}>保存</Button>
          </>
        )
      }
    }
    return (): JSX.Element=>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
