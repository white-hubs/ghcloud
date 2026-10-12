import { AntModal, Image, Row, Col, Select, Button, Empty, Spin } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, watchEffect, type PropType } from 'vue'
import styles from './index.module.less'
import { getDeviceDetail, getDeviceMonitorRuningAttr } from '@/api/device-center'

export const MapModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    deviceOptions: {
      type: Array as PropType<{ deviceId: string;deviceName: string; }[]>,
      default: () => []
    }
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit }) => {
    const state = reactive<{ selectValue: string;loading: boolean;runingState: Record<string, unknown>;basicInfo: Record<string, unknown>; }>({
      selectValue: '',
      runingState: {
      },
      loading: false,
      basicInfo: {
        images: []
      }
    })
    watchEffect(async () => {
      try {
        if (!props.deviceOptions.length) return
        state.loading = true
        state.selectValue = props.deviceOptions[0].deviceId
        getDeviceRuningData(state.selectValue)
        getDeviceInfo(state.selectValue)
      } catch {
      } finally {
        state.loading = false
      }
    })
    const getDeviceRuningData = async (deviceId: string): Promise<void> => {
      const { data } = await getDeviceMonitorRuningAttr(deviceId)
      state.runingState = data
    }
    const getDeviceInfo = async (deviceId: string): Promise<void> => {
      const { data } = await getDeviceDetail(deviceId)
      state.basicInfo = data
    }
    const handleView = (): void => {
      history.pushState({}, '', `/portal/cooling-water/device-monitor/${state.selectValue}`)
      emit('update:visible', false)
    }
    const handleCancel = (): void => {
      emit('update:visible', false)
    }
    onMounted(() => {
    })
    const modalSlots = (): JSX.Element => {
      return <Button type='link' onClick={handleView}>查看详情</Button>
    }
    return (): JSX.Element => (
      <>
        <AntModal
          v-model:visible={props.visible}
          title='设备信息'
          width={600}
          footer={modalSlots()}
          onCancel={handleCancel}
          destroyOnClose
        >
          <Spin spinning={state.loading}>
            <Select options={props.deviceOptions} v-model:value={state.selectValue} style={{ marginBottom: '20px', width: '300px' }} fieldNames={{ label: 'deviceName', value: 'deviceId' }} />
            <div class={styles['map-modal']}>
              {(state.basicInfo.images as { path: string; }[])[0] && <Image src={(state.basicInfo.images as { path: string; }[])[0].path} width={200} />}
              {!(state.basicInfo.images as { path: string; }[])[0] && <Empty description='暂无图片' />}
              <div class={styles.content}>
                <Row gutter={[32, 32]}>
                  <Col span={6}>所属区域</Col>
                  <Col span={18}>{state.basicInfo.areaName ?? '--'}</Col>
                </Row>
                <Row gutter={[32, 32]}>
                  <Col span={6}>设备名称</Col>
                  <Col span={18}>{state.basicInfo.deviceName ?? '--'}</Col>
                </Row>
                <Row gutter={[32, 32]}>
                  <Col span={6}>设备编号</Col>
                  <Col span={18}>{state.basicInfo.code ?? '--'}</Col>
                </Row>
                <Row gutter={[32, 32]}>
                  <Col span={6}>设备状态</Col>
                  <Col span={18}>{state.runingState.status ?? '--'}</Col>
                </Row>
                <Row gutter={[32, 32]}>
                  <Col span={6}>控制面板</Col>
                  <Col span={18}>{state.runingState.controlBox ?? '--'}</Col>
                </Row>
                <Row gutter={[32, 32]}>
                  <Col span={8}>今日运行时长</Col>
                  <Col span={16}>{state.runingState.dayTime ? `${state.runingState.dayTime as unknown as string}h` : '--'}</Col>
                </Row>
              </div>
            </div>
          </Spin>
        </AntModal>
      </>
    )
  }
})
