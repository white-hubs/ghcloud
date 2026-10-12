import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { Form, FormItem, Modal, type FormExpose, Select } from '@ghcloud/cube-ui'
import { BroadcastEnum, DevicePropStatus } from '@ghcloud/cube-operating-room-service'
import dayjs from 'dayjs'
import { service } from '@/api/service'
import { message } from 'ant-design-vue/es'
import { mqttServiceInstance, type DevicePropsForUI } from '@/hook/use-props'
import type { RoomItem } from '@/store/cache'
import styles from './index.module.less'
import { getImageThree } from '@/hook/use-utils'
import { useServiceTime } from '@/hook/use-service-time'

/** 发起求助 */
export const RequestHelp = defineComponent({
  emits: ['modalVisibleChange', 'roomSelect'],
  props: ['deviceList', 'deviceProps'],
  setup (props: { deviceList: RoomItem[];deviceProps: DevicePropsForUI[]; }, { emit }) {
    const showModal = ref(false)
    const modalLoading = ref(false)
    const { currentTime } = useServiceTime()

    const openModal = (): void => {
      if (props.deviceList.length === 1) {
        formState.room = props.deviceList[0].deviceId as unknown as undefined
      } else {
        formState.room = undefined
      }
      showModal.value = true
    }
    const formInstance = ref<FormExpose>()
    const formState = reactive({
      room: undefined,
      data: [],
    })

    const formRules = {
      room: [{ required: true, message: '请选择手术室', trigger: 'change' }],
      data: [{ required: true, message: '请选择异常数据', trigger: 'change' }],
    }

    const unNormalData = computed(() => {
      if (!props.deviceProps) {
        return []
      }
      return props.deviceProps.filter(e => e.status !== DevicePropStatus.NORMAL && e.display)
    })
    const alarmRecordSubmit = async (unNormal: DevicePropsForUI | undefined, businessKey: number): Promise<void> => {
      const unNormalStatusText = unNormal?.status === DevicePropStatus.UPPER_LIMIT ? '超过上限' : '低于下限'
      const device = props.deviceList.find((item) => item.deviceId === formState.room)
      if (unNormal && device) {
        const params = {
          alarmLevelId: '1546385498145112066',
          alarmEventName: '手动提交-' + unNormal.name + unNormalStatusText,
          alarmTargetKey: device.deviceId,
          alarmTargetCode: device.code,
          alarmTargetName: device.deviceName,
          alarmTargetTypeId: device.deviceProdCategoryCode,
          alarmTargetTypeName: device.deviceProdCategoryName,
          alarmTime: dayjs(currentTime.value).format('YYYY-MM-DD HH:mm:ss'),
          businessType: 'EMERGENCY_CENTER_ALARM',
          businessKey,
          area: device.areaId,
          areaName: device.areaName,
          applicationCode: device.applicationCode,
          applicationName: '洁净手术室'
        }

        try {
          modalLoading.value = true
          await service.cubeAlarmCenterService.satAlarmMsgSend(params)
          showModal.value = false
          message.success('发起求助成功')
        } catch (error) {
          const err = error as { toJSON: () => { errorMessage: string; }; }
          message.error(err.toJSON().errorMessage || '发起求助失败')
        } finally {
          modalLoading.value = false
          mqttServiceInstance?.publish(BroadcastEnum.HELP, { ...params, ...unNormal })
        }
      }
    }
    const handleOk = async (): Promise<void> => {
      await formInstance.value?.validate()

      const taskList = formState.data.map(async (ele, i) => {
        const unNormal = unNormalData.value.find(e => e.code === ele)
        const businessKey = dayjs().valueOf() + i
        return alarmRecordSubmit(unNormal, businessKey)
      })
      await Promise.all(taskList)
      modalLoading.value = false
      formState.data.length = 0
    }
    const handleCancel = (): void => {
      showModal.value = false
      formState.room = undefined
      formState.data = []
      formInstance.value?.clearValidate()
    }

    watch(() => showModal.value, () => {
      emit('modalVisibleChange', showModal.value)
    })

    return (): JSX.Element =>
      <>
        <div class={styles['request-help']} onClick={openModal}>
          <div class={styles.request}>
            <img class={styles.img} src={getImageThree('finger.png')} />
            <div class={styles.text}>发起求助</div>
          </div>
        </div>
        <Modal
          title='发起求助'
          v-model:visible={showModal.value}
          width='52rem'
          class='request-help-modal'
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form ref={formInstance} model={formState} labelCol={{ style: { width: '10rem' } }} rules={formRules}>
            <FormItem label='手术室' name='room' v-show={props.deviceList.length > 1}>
              <Select
                options={(props.deviceList ?? []).map(e => {
                  return {
                    label: e.deviceName,
                    value: e.deviceId
                  }
                })}
                v-model:value={formState.room}
                onChange={() => {
                  emit('roomSelect', formState.room)
                }}
                style='min-width: 15rem'
                showSearch={false}
              />
            </FormItem>
            <FormItem label='异常数据' name='data'>
              <Select
                mode='multiple'
                showSearch={false}
                options={unNormalData.value.map(e => {
                  return {
                    label: e.name + '——' + e.value + e.unit,
                    value: e.code
                  }
                })}
                v-model:value={formState.data}
              />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
