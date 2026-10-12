import { computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import { Modal, Space } from 'ant-design-vue'
import styles from './base-modal.module.less'
const BASE_CLOSE_ICON = '/resource/v1/ue5-migrate/pages/widget/modal/base-modal/assets/close.webp'
import { CloseOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import { removeModalMap, setModalMap } from './modal-state'

interface Props {
  size?: 'small' | 'middle' | 'large';
  title: string;
  visible: boolean;
  mask?: boolean;
  wrapClassName?: string;
  skin?: 'BUSINESS' | 'BASE';
  showFullScreen?: boolean;
  width?: number | string;
  modalId?: string; // 新增：支持外部传入modalId
}

export function generateUUID (): string {
  return 'base-modal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
}

/** 公共弹窗基础 */
export const BaseModal = defineComponent({
  props: ['size', 'title', 'visible', 'wrapClassName', 'skin', 'showFullScreen', 'mask', 'modalId'],
  emits: ['close', 'update:visible'],
  setup: (props: Props, { slots, emit, expose }) => {
    const uuid = props.modalId || generateUUID()
    const modelRef = ref()
    const modalWidth = computed(() => {
      switch (props.size) {
        case 'small':
          return '40%'
        case 'middle':
          return '60%'
        case 'large':
          return '80%'
        default:
          return '60%'
      }
    })

    const skin = computed(() => {
      switch (props.skin) {
        case 'BUSINESS':
          return styles['global-business-modal-wrapper']
        default:
          return styles['global-base-modal-wrapper']
      }
    })

    const fullScreen = ref(false)

    const customSlots = computed(() => {
      const skinValue = props.skin ?? 'BASE'
      return {
        ...slots,
        closeIcon: (): JSX.Element => {
          if (skinValue === 'BASE') {
            return <img src={BASE_CLOSE_ICON} class={styles['global-base-modal-close-icon']} />
          } else if (skinValue === 'BUSINESS') {
            return (
              <Space size={15}>
                {
                  props.showFullScreen &&
                    <span onClick={handleFullScreen}>
                      {fullScreen.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    </span>
                }
                <CloseOutlined />
              </Space>
            )
          }
          return undefined
        }
      }
    })

    onMounted(() => {
      setModalMap(uuid, getCurrentInstance())
    })

    onUnmounted(() => {
      removeModalMap(uuid)
    })

    expose({
      close: () => {
        handleClose()
      },
      getModalId: () => uuid // 新增：暴露获取modalId的方法
    })

    return (): JSX.Element => (
      <Modal
        ref={modelRef}
        v-slots={customSlots.value}
        {...props}
        width={modalWidth.value}
        visible={props.visible}
        centered
        wrapClassName={`base-modal ${uuid} ${skin.value} ${props.wrapClassName ?? ''} `}
        footer={null}
        onCancel={handleClose}
      />
    )

    function handleFullScreen (e: MouseEvent): void {
      const element = document.querySelector(`.${uuid} .ant-modal`)
      e.stopPropagation()
      fullScreen.value = !fullScreen.value
      if (fullScreen.value) {
        element.requestFullscreen() // 标准方法
      } else {
        document.exitFullscreen()
      }
    }

    function handleClose (): void {
      emit('close')
      emit('update:visible', false)
    }
  }
})
