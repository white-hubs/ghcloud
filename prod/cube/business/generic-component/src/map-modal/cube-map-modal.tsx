import { createApp, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, type App } from 'vue'
import { Button, Input, message, Modal, Spin } from 'ant-design-vue'
import { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'
import { authStore } from '../api/auth-store'

const CubeMapModal = defineComponent({
  props: {
    title: {
      type: String,
      default: '选择地图'
    },
    width: {
      type: String,
      default: '1000px'
    },
    animate: {
      type: Boolean,
      default: false
    }
  },
  emits: ['confirm'],
  setup (props, { expose, emit }) {
    const modalVisible = ref(false)
    const btnLoading = ref(false)
    const state = reactive({
      address: '',
      lng: 0,
      lat: 0
    })
    const mapLoading = ref(true)
    let cubeMap: CubeMapLeaflet | null = null

    function handleOk (): void {
      modalVisible.value = false
      emit('confirm', { ...state })
    }
    function handleCancel (): void {
      modalVisible.value = false
    }
    
    function setMapPosition(lng: number, lat: number, _animate: boolean): void {
      if (!cubeMap) {
        return
      }
      if (!lng || !lat) {
        return
      }

      // 无论是否动画，都应先把视角中心移动到目标点；
      // 否则初始化(openModal)传 animate=false 时只会打点不居中。
      cubeMap.setCenter(lng, lat)
      cubeMap.clearMap()
      cubeMap.addMarker({
        iconSize: [19, 31.5],
        position: {
          lng: lng,
          lat: lat
        },
      })
    }
    
    async function handleLocation (): Promise<void> {
      if (!state.address) {
        message.warn('请输入位置信息')
        return
      }
      if (cubeMap) {
        try {
          btnLoading.value = true
          const res = await cubeMap.getLntLatByAddress(state.address)
          state.lng = res.lng
          state.lat = res.lat

          setMapPosition(res.lng, res.lat, true)
          const resAddress = await cubeMap.getAddressByLntLat(res.lng, res.lat)
          state.address = resAddress?.address ?? ''
        } catch (_ignore) {
          message.error('定位失败')
        } finally {
          btnLoading.value = false
        }
      }
    }
    
    expose({
      openModal: (params?: {
        address?: string;
        center?: { lng: number; lat: number; };
        animate?: boolean;
      }) => {
        modalVisible.value = true
        nextTick(async () => {
          if (!cubeMap) {
            cubeMap = new CubeMapLeaflet(authStore)
            await cubeMap.renderMap('cubeMapContainer')
            
            if (params?.center) {
              setMapPosition(params.center.lng, params.center.lat, false)
              state.lng = params.center.lng
              state.lat = params.center.lat
            }
            
            cubeMap.registerMapClickEvent()
            cubeMap.onMapClick = async (event) => {
              state.lng = event.lng
              state.lat = event.lat
              setMapPosition(event.lng, event.lat, false)
              const res = await cubeMap?.getAddressByLntLat(event.lng, event.lat)
              state.address = res?.address ?? ''
            }
            setTimeout(() => {
              mapLoading.value = false
            }, 1500)
          } else if (params?.center) {
            setMapPosition(params.center.lng, params.center.lat, false)
            state.lng = params.center.lng
            state.lat = params.center.lat
          }
          params?.address && (state.address = params.address)
        })
      }
    })
    return () =>
      <Modal
        visible={modalVisible.value}
        title={props.title}
        width={props.width}
        wrapClassName='cube-map-modal'
        onOk={handleOk}
        onCancel={handleCancel}
        okText='确认'
        cancelText='取消'
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Input v-model:value={state.address} maxlength={999} placeholder='请输入位置信息' style={{ width: '400px' }} />
          <Button type='primary' onClick={handleLocation} loading={btnLoading.value}>定位</Button>
        </div>

        <Spin size='large' tip='地图渲染中' spinning={mapLoading.value}>
          <div id='cubeMapContainer' style={{ width: '100%', height: '500px', cursor: 'unset !important' }} />
        </Spin>
      </Modal>
  }
})

interface UseMapModal {
  showMapModal: (options: {
    title?: string;
    width?: string;
    address?: string;
    center?: {
      lng: number;
      lat: number;
    };
    animate?: boolean;
    modalConfirm?: (confirmData: { address: string; lng: number; lat: number; }) => void;
  }) => void;
}

export const useMapModal = (): UseMapModal => {
  let modalApp: App<Element> | null = null
  const mapContainerNode = ref<HTMLElement>()
  const modalInstance = ref()

  onBeforeUnmount(() => {
    modalApp && modalApp.unmount()
    mapContainerNode.value && document.body.removeChild(mapContainerNode.value)
  })
  function showMapModal (options?: {
    title?: string;
    width?: string;
    address?: string;
    center?: {
      lng: number;
      lat: number;
    };
    animate?: boolean;
    modalConfirm?: (confirmData: { address: string; lng: number; lat: number; }) => void;
  }): void {
    if (!mapContainerNode.value) {
      mapContainerNode.value = document.createElement('div')
      mapContainerNode.value.className = 'cube-map-modal'
      document.body.appendChild(mapContainerNode.value)
    }
    if (modalApp) {
      modalApp.unmount()
      modalApp = null
    }

    modalApp = createApp({
      setup () {
        const modalRef = ref()
        onMounted(() => {
          modalInstance.value = modalRef.value
          modalInstance.value.openModal({
            address: options?.address,
            center: options?.center,
            animate: options?.animate
          })
        })
        return () =>
          <CubeMapModal
            title={options?.title ?? '地图选点'}
            width={options?.width ?? '1000px'}
            animate={options?.animate ?? false}
            ref={modalRef}
            onConfirm={options?.modalConfirm ? options.modalConfirm : () => {}}
          />
      },
    })
    modalApp.mount(mapContainerNode.value)
  }
  return {
    showMapModal,
  }
}
