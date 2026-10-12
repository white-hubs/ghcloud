import { defineComponent, reactive, ref, watch } from 'vue'
// import { CloseOutlined } from "@ant-design/icons-vue";
import H5Video from '../public/h5-video.tsx'
import { DeviceTypeIcon } from '@/utils/enumeratie'
import DeviceBaseInfo from './info.tsx'
import DeviceControl from './control.tsx'
import DeviceErrorRecord from './record.tsx'
import { getDeviceInfo, getiotconfig, associatedVideos } from '@/apis/business/device.ts'
import type { CameraType, DeviceAttributesType } from '@/apis/business/device.i.ts'
import { mediaConfig } from '@/apis/business/mdata.ts'
import NoData from '../public/no-data.tsx'
import styles from './styles/index.module.less'
import { Close } from '@ghcloud/visual-view-ui'
export default defineComponent({
  emits: ['close', 'update:itemShow'],
  name: 'Equ',
  props: {
    itemShow: Boolean,
    id: {
      type: String,
      default: '',
    },
    isequ: {
      type: Boolean,
      default: false,
    },
    PanelName: {
      type: Object,
      default: {},
    },
  },
  setup (props, { emit }) {
    const tabsList = ref(['基本信息', '实时数据', '监控画面', '异常记录'])
    const activeTabs = ref('基本信息')
    const modalData = reactive(props)
    const infodata = ref()
    const readData = ref<DeviceAttributesType[]>([])
    const readAndWritData = ref<DeviceAttributesType[]>([])
    const cameraList = ref<CameraType[]>([])
    const deviceType = ref(0)
    // const closeModal = (): void => {
    //  let panelNameArr = Object.values(props.PanelName)
    //  if (panelNameArr.includes('floorEquipment')) {
    //   emit("close", false);
    //  }else{
    //   emit("close", true);
    //  }
    // }

    const getData = (): void => {
      getDeviceInfo(modalData.id).then((res) => {
        infodata.value = res.data?.detail
        readData.value = res.data?.deviceAttributes.filter((item) => item.permission === 'READ') ?? []
        if (readData.value.length > 0) {
          tabsList.value = ['基本信息', '实时数据', '监控画面', '异常记录']
        } else {
          tabsList.value = ['基本信息', '监控画面', '异常记录']
        }
        readAndWritData.value = res.data?.deviceAttributes.filter(
          (item) => item.permission === 'READ_WRITE'
        ) ?? []
        if (readAndWritData.value.length === 0) {
          tabsList.value = ['基本信息', '监控画面', '异常记录']
        }
        deviceType.value = DeviceTypeIcon[infodata.value.genreName as keyof typeof DeviceTypeIcon]
        if (deviceType.value <= 3) {
          mediaConfig().then((item) => {
            getiotconfig(modalData.id).then((res) => {
              cameraList.value = [
                {
                  steamMediaIpAddress: item.data?.ipAddress ?? '',
                  steamMediaIntranetAddress: item.data?.intranetAddress ?? '',
                  token: res.data?.identify ?? '',
                },
              ]
            })
          })
        } else {
          associatedVideos(modalData.id).then((res) => {
            if (res.data && res.data.length === 0) {
              tabsList.value = ['基本信息', '实时数据', '异常记录']
            }
            cameraList.value = res.data ?? []
          })
        }
      }).catch(() => {
        infodata.value.name = ''
        readData.value = []
      })
    }
    watch(() => props.id, () => {
      getData()
    })
    return () =>
      <div class={styles['alarmDetail-wrap']}>
        <div class={styles['alarmDetail-modal']}>
          <div class={styles['alarmDetail-modal-header']}>
            <div class={styles['header-title']}>{infodata.value?.name}</div>
            <div class={styles['header-close']} onClick={() => { emit('update:itemShow', false) }}>
              <Close />
            </div>
          </div>
          <div class={`${styles['alarmDetail-modal-content']} ${styles['flex-column']}`}>
            <div class={styles['content-tabs']}>
              {tabsList.value.map(item =>
                <div key={item} class={item === activeTabs.value ? styles.active : ''} onClick={() => { activeTabs.value = item }}>
                  <div>{item}</div>
                </div>
              )}
            </div>
            <div class={styles['conent-body']}>
              <div v-show={activeTabs.value === '基本信息'}>
                <DeviceBaseInfo id={modalData.id} />
              </div>
              <div v-show={activeTabs.value === '实时数据'}>
                <DeviceControl
                  readAndWritData={readAndWritData.value} read-data={readData.value} id={modalData.id}
                />
              </div>
              <div v-show={activeTabs.value === '监控画面'}>
                {
                cameraList.value.length > 0
                  ? <div class={styles.group}>{cameraList.value.map((item, index) => <div class={styles.camera} key={index}><H5Video cameraItem={item} idStr={`${item.token}${index}`} /> </div>)}</div>
                  : <NoData />
    }
              </div>
              <div v-show={activeTabs.value === '异常记录'}>
                <DeviceErrorRecord code={infodata.value?.code} id={modalData.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
  }
})
