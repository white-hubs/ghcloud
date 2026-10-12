;
import Modal from '@ghcloud/cube-ui/src/components/modal/modal';
import { computed, defineComponent, nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { cubeDeviceCenterService, cubeVisualizationService } from '../../../api/service'
import { UeClient } from '@ghcloud/cube-visual-sdk'
import styles from './device-spatial-coordinate-binding-modal.module.less'
import { PopOver, Spin, Table } from '@ghcloud/cube-ui'

interface DeviceSpatialCoordinateBindingModalProps {
  visible: boolean;
  selectedDevices: {
    id: string;
    deviceCode: string;
    deviceName: string;
  }[];
  type?: 'BIND_DATA' | 'QUERY_DATA';
}
type ActorInfo = {
  transform: {
    location: {
      x: number;
      y: number;
      z: number;
    };
  };
};

export const DeviceSpatialCoordinateBindingModal = defineComponent({
  props: ['visible', 'selectedDevices', 'type'],
  emits: ['showBindButton', 'update:visible', 'getSpatialCoordinateValue'],
  setup (props: DeviceSpatialCoordinateBindingModalProps, { emit }) {
    let modelServerUrl = ''
    const ueClient = UeClient.getInstance()
    const step: Ref<'WAITING_CONNECT' | 'CONNECT_SUCCESS' | 'BINDING' | 'BIND_END'> = ref('WAITING_CONNECT')
    const loading = computed(()=>{
      switch (step.value) {
        case 'WAITING_CONNECT':
          return true
        case 'CONNECT_SUCCESS':
          return false
        case 'BINDING':
          return true
        case 'BIND_END':
          return false
      }
    })
    const loadText = computed(()=>{
      switch (step.value) {
        case 'WAITING_CONNECT':
          return '正在连接模型服务...';
        case 'CONNECT_SUCCESS':
          return '已连接模型服务';
        case 'BINDING':
          let count = '';
          if (bindDeviceList.value.length > 0){
            count = ` (${bindDeviceList.value.filter(e=>e.status === 'SUCCESS').length}/${bindDeviceList.value.length})`;
          }
          return `正在${props.type === 'QUERY_DATA' ? '查询' : '绑定'}设备空间坐标,请勿刷新页面或者关闭窗口${count}`;
        case 'BIND_END':
          return '绑定成功';
      }
    });
    const binding = ref(false)
    const bindDeviceList = ref<(typeof props.selectedDevices[number] & { status: "SUCCESS" | "FAIL" | "WAITING"; reason?: string; })[]>([]);
    const bindFailedList = computed(() => bindDeviceList.value.filter(item => item.status === 'FAIL'));
    const columns = [
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>;
        }
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>;
        }
      },
      {
        title: '所属产品',
        dataIndex: 'iotDeviceProductName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>;
        }
      },
      {
        title: '产品品类',
        dataIndex: 'iotDeviceCategoryNameConcat',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>;
        }
      },
      {
        title: '维护部门',
        dataIndex: 'departmentName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>;
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>;
        }
      },
    ];
    ueClient.onConnected(()=>{
      step.value = 'CONNECT_SUCCESS'
    })
    onMounted(async ()=>{
      const projectList = await cubeVisualizationService.getVisualProjectList()
      if (projectList.length === 0){
        return
      }
      const modalConfigString = await cubeVisualizationService.getModalConfigByProjectId(projectList[0].id)
      const modalConfig = JSON.parse(modalConfigString)
      const modelServer = modalConfig.ue5.modelServer
      if (modelServer.length > 0){
        modelServerUrl = modelServer[0].url
        modelServerUrl && emit('showBindButton')
      }
    })
    const closeModal = (): void => {
      emit('update:visible', false)
      step.value = 'WAITING_CONNECT'
      bindDeviceList.value.length = 0
      ueClient.ue5Close()
    }
    const bind = async (selectedDevices: typeof props.selectedDevices): Promise<void> => {
      bindDeviceList.value = selectedDevices.map(e=>{
        return {
          ...e,
          status: 'WAITING'
        }
      })
      const tasks = []
      for (let i = 0; i < bindDeviceList.value.length; i++) {
        const device = bindDeviceList.value[i]
        const bindFun = async (): Promise<void>=>{
          try {
            const actorInfo = await ueClient.sendAsync('getActorById', { id: device.deviceCode }) as ActorInfo
            if (!actorInfo?.transform?.location) {
              bindDeviceList.value[i].reason = '在三维模型中未查询到设备位置信息'
              throw new Error('设备未找到')
            }
            const payload = {
              code: device.deviceCode,
              spatialCoordinates: `${actorInfo.transform.location.x},${actorInfo.transform.location.y},${actorInfo.transform.location.z}`
            }
            if (props.type === 'QUERY_DATA'){
              emit('getSpatialCoordinateValue', payload.spatialCoordinates)
              closeModal()
              throw new Error('查询结束')
            }
            await cubeDeviceCenterService.updateDeviceSpatialCoordinates(payload)
            bindDeviceList.value[i].status = 'SUCCESS'
          } catch {
            if (!bindDeviceList.value[i].reason){
              bindDeviceList.value[i].reason = '绑定错误'
            }
            bindDeviceList.value[i].status = 'FAIL'
          }
        }
        tasks.push(bindFun)
      }
      await Promise.all(tasks.map(async e=>e()))
      binding.value = false

      if (props.type !== 'QUERY_DATA'){
        step.value = 'BIND_END'
      }
    }
    const handleBind = async (): Promise<void>=>{
      binding.value = true
      step.value = 'BINDING'
      if (bindDeviceList.value.length === 0){
        bind(props.selectedDevices)
      }
    }
    watch(() => props.visible, (val) => {
      if (val) {
        nextTick(()=>{
          const dom = document.querySelector(`.${styles['model-container']}`) as HTMLElement
          ueClient.loadUE5(dom, modelServerUrl)
        })
      }
    })
    return (): JSX.Element =>
      <Modal
        title="设备空间坐标绑定"
        visible={props.visible}
        onCancel={closeModal}
        onOk={handleBind}
        cancelText={step.value === 'BIND_END' ? '关闭' : '取消'}
        width="1200px"
        closable={!binding.value}
        footer={binding.value ? null : undefined}
        okButtonProps={{
          style: {
            display: step.value === 'CONNECT_SUCCESS' ? 'inline-block' : 'none'
          }
        }}
      >
        <div class={styles['model-container']}>{binding.value}</div>
        <Spin spinning={loading.value} tip={loadText.value}>
          <Table columns={columns} scrollY={200} dataSource={props.selectedDevices} size='small' pagination={false} v-show={step.value !== 'BIND_END'}>
          </Table>
          {
            step.value === 'BIND_END' && <>
              <div class={`${styles.progress} ${bindFailedList.value.length === 0 ? styles.allSuccess : ''}`}>
                成功 <span class={styles.success}>{bindDeviceList.value.filter(e=>e.status === 'SUCCESS').length}</span> 个
                失败 <span class={styles.fail}>{bindDeviceList.value.filter(e=>e.status === 'FAIL').length}</span> 个
              </div>
              <Table columns={[
                {
                  title: '设备编号',
                  dataIndex: 'deviceName'
                },
                {
                  title: '设备名称',
                  dataIndex: 'deviceCode'
                },
                {
                  title: '原因',
                  dataIndex: 'reason'
                }
              ]} scrollY={200} dataSource={bindFailedList.value} size='small' pagination={false} v-show={bindFailedList.value.length > 0} />
            </>
          }
        </Spin>
      </Modal>
  }
})