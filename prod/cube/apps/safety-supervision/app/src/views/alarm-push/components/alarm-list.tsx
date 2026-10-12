import { defineComponent, onMounted, ref, watch } from 'vue'
import { CheckboxGroup, Button, Select } from '@ghcloud/cube-ui'
import { OuaaPicker } from '@/components/ouaa-picker/ouaa-picker.tsx'
import { ouaaOptions, OuaaEnum } from '@/components/ouaa-picker/ouaa-picker'
import './alarm-list.less'
import { cubeMessageCenterService } from '@/api/server'
interface Receive {
  value: string;
  label: string;
}
export const AlarmList = defineComponent({
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
  },
  setup: (props, { emit }) => {
    const notificationMethod = ref<string[]>([])
    const plainOptions = ref<Receive[]>([])
    const alarmNotice = ref<any>([
      { name: OuaaEnum.USER, value: [] }
    ])
    const addNoticeType = (): void => {
      alarmNotice.value.push(
        { name: OuaaEnum.USER, value: [] }
      )
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value })
    }
    // 该通知下的通知方式
    const getReceive = async (): Promise<void> => {
      plainOptions.value = await cubeMessageCenterService.sceneNotificationMethod('SAFETY_ALARM_NOTIFY')
    }
    const delNoticeType = (i: number): void => {
      alarmNotice.value.splice(i, 1)
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value })
    }
    const changeValue = (item: { name: OuaaEnum; value: never[]; }): void => {
      item.value = []
    }
    const confirm = (index: number, value: { id: string; }[]): void => {
      alarmNotice.value[index].value = value
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value })
    }
    const confirmNotification = (value: string[]): void => {
      notificationMethod.value = value
      emit('confirm', { alarmNotice: alarmNotice.value, notificationMethod: notificationMethod.value })
    }
    watch(() => props.config, () => {
      const propsConfig = JSON.parse(JSON.stringify(props.config ?? []))
      alarmNotice.value = propsConfig.noticeObjs.length ? propsConfig.noticeObjs : [{ name: OuaaEnum.USER, value: [] }]
      notificationMethod.value = propsConfig.noticeWay
    }, { deep: true })
    onMounted(() => {
      getReceive()
    })
    return (): JSX.Element=>
      <>
        <div class='alarm-box'>
          <div class='alarm-item'>
            通知条件：触发报警事件后通知
          </div>
          <div class='alarm-item'>
            通知方式：
            <CheckboxGroup v-model:value={notificationMethod.value} options={plainOptions.value} onChange={confirmNotification} />
          </div>
          <div class='alarm-item'>
            消息模版：【xxx市场】在【报警事件发生地点】发生【车辆违停】报警事件，请知悉！
          </div>
          <div class='alarm-item'>
            通知人员：
            <div>
              {
                alarmNotice.value.map((item: { name: any; value: string; }, index: number) => {
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
