import { defineComponent, onMounted, ref, watch } from 'vue'
import { CheckboxGroup, Button, Select, InputNumber } from '@ghcloud/cube-ui'
import { OuaaPicker } from '@/components/ouaa-picker/ouaa-picker.tsx'
import { ouaaOptions, OuaaEnum } from '@/components/ouaa-picker/ouaa-picker'
import { cubeMessageCenterService } from '@/api/server'
import './alarm-list.less'
interface Receive {
  value: string;
  label: string;
}
export const AlarmTimeoutList = defineComponent({
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
  },
  setup: (props, { emit }) => {
    const notificationMethod = ref<string[]>([])

    const notification = ref(0)
    const plainOptions = ref<Receive[]>([])
    const alarmNotice = ref<any>([
      { name: OuaaEnum.USER, value: [] }
    ])
    const addNoticeType = (): void => {
      alarmNotice.value.push(
        { name: OuaaEnum.USER, value: [] }
      )
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value, notification: notification.value })
    }
    // 该通知下的通知方式
    const getReceive = async (): Promise<void> => {
      plainOptions.value = await cubeMessageCenterService.sceneNotificationMethod('SAFETY_ALARM_TIMEOUT_NOTIFY1')
    }
    const delNoticeType = (i: number): void => {
      alarmNotice.value.splice(i, 1)
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value, notification: notification.value })
    }
    const changeValue = (item: { name: OuaaEnum; value: never[]; }): void => {
      item.value = []
    }
    const confirm = (index: number, value: { id: string; }[]): void => {
      alarmNotice.value[index].value = value
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value, notification: notification.value })
    }
    watch(() => props.config, () => {
      const propsConfig = JSON.parse(JSON.stringify(props.config ?? []))
      alarmNotice.value = propsConfig.noticeObjs.length ? propsConfig.noticeObjs : [{ name: OuaaEnum.USER, value: [] }]
      notificationMethod.value = propsConfig.noticeWay
      notification.value = propsConfig.notification
    }, { deep: true })
    const confirmNotification = (value: string[]): void => {
      notificationMethod.value = value
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value, notification: notification.value })
    }
    const confirmValue = (value: number): void => {
      notification.value = value
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value, notification: notification.value })
    }
    onMounted(() => {
      getReceive()
    })
    return (): JSX.Element=>
      <>
        <div class='alarm-box'>
          <div class='alarm-item'>
            通知条件：报警事件超时未处理
          </div>
          <div class='alarm-item'>
            通知条件：<span class='text'>任务超时</span>
            <InputNumber style='width:100px !important' v-model:value={notification.value} min={0} max={100} onChange={confirmValue} />
            <span class='text'>分钟还未处理</span>
          </div>
          <div class='alarm-item'>
            通知方式：
            <CheckboxGroup v-model:value={notificationMethod.value} options={plainOptions.value} onChange={confirmNotification} />
          </div>
          <div class='alarm-item'>
            消息模版：【xxx市场】在【报警事件发生地点】发生【车辆违停】报警事件已超时【xxx分钟】当前还未处理，请知悉！
          </div>
          <div class='alarm-item'>
            通知人员：
            <div>
              {
                alarmNotice.value.map((item: { name: string; value: string; }, index: number) => {
                  return (
                    <div key={index} class='notice-box'>
                      <Select
                        v-model:value={item.name} style='width: 200px; margin-right: 10px;height: 30px;'
                        options={ouaaOptions} placeholder='请选择' onChange={() => {
                          // @ts-ignore
                          changeValue(item)
                        }}
                      />
                      {/* @ts-ignore */}
                      <OuaaPicker v-model:value={item.value} type={item.name} multiple onConfirm={(value: any) => {
                        confirm(index, value)
                      }} />
                      <Button
                        v-show={index === 0}
                        type='primary' style='margin-left: 10px;'
                        onClick={addNoticeType}
                      >
                        添加
                      </Button>
                      <Button
                        v-show={index !== 0}
                        danger style='margin-left: 10px;'
                        onClick={() => {
                          delNoticeType(index)
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </>
  }
})
