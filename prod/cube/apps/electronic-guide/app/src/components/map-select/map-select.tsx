import { computed, defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Button } from '@ghcloud/cube-ui'

import { type LayerInfo, Map } from '@/components/map'
import styles from './index.module.less'
type MapSelectType = 'layer' | 'point' | 'region'
export interface LayerSelectVo {
  center: string;
  southwest: string;
  northeast: string;
}
export interface PointSelectVo {
  point: string;
}
interface MapSelectVo {
  pointList: string[];
  layerState: LayerSelectVo;
  pointState: PointSelectVo;
  regionSelect: RegionSelectVo;
  regionPointType: string;
  checkLayerStateKey: 'center' | 'northeast' | 'southwest' | '';
}
interface RegionSelectVo {
  center: string;
  zoom: string;
}

export const MapSelect = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    selectType: {
      type: String as PropType<MapSelectType>,
      default: () => 'layer'
    },
    layerInfo: {
      type: Object as PropType<LayerInfo>,
      default: () => {
        return {
          southwest: '',
          northeast: '',
          center: '',
          layerFile: ''
        }
      }
    },
    value: {
      type: Object as PropType<LayerSelectVo | PointSelectVo | RegionSelectVo>,
      default: () => ''
    },
    center: {
      type: String,
      default: () => ''
    },
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit }) => {
    const state = reactive<MapSelectVo>({
      pointList: [],
      layerState: {
        center: '',
        southwest: '',
        northeast: '',
      },
      pointState: {
        point: '',
      },
      checkLayerStateKey: '',
      regionSelect: {
        center: '',
        zoom: '',
      },
      regionPointType: ''
    })
    watch(() => props.value, () => {
      if (props.selectType === 'layer') {
        state.layerState = props.value as LayerSelectVo
      }
      if (props.selectType === 'point') {
        state.pointState = props.value as PointSelectVo
      }
      if (props.selectType === 'region') {
        state.regionSelect = props.value as RegionSelectVo
      }
    }, {
      deep: true
    })

    const mapRef = ref<{ getPoint: () => string; getZoom: () => string;addMark: (key: string, point: string) => void; }>()
    const handleOk = (): void => {
      if (props.selectType === 'layer') {
        emit('ok', state.layerState)
      }
      if (props.selectType === 'point') {
        emit('ok', state.pointState)
      }
      if (props.selectType === 'region') {
        emit('ok', state.regionSelect)
      }
      emit('update:visible', false)
    }
    const modalSlots = {
      title: (): string => {
        return '选择点位'
      },
      footer: (): JSX.Element => {
        return (
          <div class={styles.footer}>
            <div
              class={styles.cancel} onClick={() => {
                emit('update:visible', false)
              }}
            >取消
            </div>
            <div class={styles.ok} onClick={handleOk}>确定</div>
          </div>
        )
      }
    }
    const handleClickMap = (point: string): void => {
      if (props.selectType === 'layer') {
        if (!state.checkLayerStateKey) return
        state.layerState[state.checkLayerStateKey] = point
        mapRef.value?.addMark(state.checkLayerStateKey, point)
      }
      if (props.selectType === 'point') {
        state.pointState.point = point
        mapRef.value?.addMark('point', point)
      }
      if (props.selectType === 'region') {
        if (!state.regionPointType) return
        state.regionSelect.center = point
        mapRef.value?.addMark(state.regionPointType, point)
      }
    }
    const getLayerPoint = (key: keyof typeof state.layerState): void => {
      state.checkLayerStateKey = key
    }
    const center = computed(() => {
      if (props.selectType === 'region') {
        return state.regionSelect.center
      }
      return props.center
    })
    const currentTypeRender = (): JSX.Element => {
      if (props.selectType === 'layer') {
        return (
          <>
            <div class={styles['map-handle']}>
              <div class={styles['map-handle-item']}>
                <div class={styles['handle-content']}>
                  <div class={styles.label}>图层中心点:</div>
                  <div class={styles.value}>{state.layerState.center || '暂未获取'}</div>
                </div>

                <Button type='primary' disabled={state.checkLayerStateKey === 'center'} onClick={() => {
                  getLayerPoint('center')
                }}>获取</Button>
              </div>
              <div class={styles['map-handle-item']}>
                <div class={styles['handle-content']}>
                  <div class={styles.label}>图层西南点:</div>
                  <div class={styles.value}>{state.layerState.northeast || '暂未获取'}</div>
                </div>

                <Button type='primary' disabled={state.checkLayerStateKey === 'northeast'} onClick={() => {
                  getLayerPoint('northeast')
                }}>获取</Button>
              </div>
              <div class={styles['map-handle-item']}>
                <div class={styles['handle-content']}>
                  <div class={styles.label}>图层东北点:</div>
                  <div class={styles.value}>{state.layerState.southwest || '暂未获取'}</div>
                </div>
                <Button type='primary' disabled={state.checkLayerStateKey === 'southwest'} onClick={() => {
                  getLayerPoint('southwest')
                }}>获取</Button>
              </div>
            </div>
          </>
        )
      }
      if (props.selectType === 'point') {
        return (
          <div class={styles['map-handle-item']}>
            <div class={styles['handle-content']}>
              <div class={styles.label}>点位:</div>
              <div class={styles.value}>{state.pointState.point || '暂未获取'}</div>
            </div>
          </div>
        )
      }
      return (
        <>
          <div class={styles['map-handle-item']}>
            <div class={styles['handle-content']}>
              <div class={styles.label}>区域中心点:</div>
              <div class={styles.value}>{state.regionSelect.center || '暂未获取'}</div>
            </div>
            <Button
              type='primary' onClick={() => {
                state.regionPointType = 'center'
              }} disabled={state.regionPointType === 'center'}
            >获取
            </Button>
          </div>
          <div class={styles['map-handle-item']}>
            <div class={styles['handle-content']}>
              <div class={styles.label}>区域缩放层级:</div>
              <div class={styles.value}>{state.regionSelect.zoom || '暂未获取'}</div>
            </div>
            <Button
              type='primary' onClick={() => {
                state.regionSelect.zoom = mapRef.value?.getZoom() as unknown as string
              }}
            >获取
            </Button>
          </div>
        </>
      )
    }
    return (): JSX.Element => (
      <Modal
        v-slots={modalSlots}
        destroyOnClose
        width='100%'
        v-model:visible={props.visible}
        wrap-class-name={styles['full-modal']}
        onCancel={() => {
          emit('update:visible', false)
        }}
        footer={null}
        onOk={handleOk}
      >

        <Map ref={mapRef} center={center.value} layerInfo={props.layerInfo} zoom={state.regionSelect.zoom} pointMap={props.value as unknown as Record<string, string>} onClickMap={handleClickMap} id='select-map' />
        <div class={styles.operate}>
          {currentTypeRender()}
          <div class={styles.footer}>
            <Button
              type='primary'
              danger
              class={styles.cancel} onClick={() => {
                emit('update:visible', false)
              }}
            >取消
            </Button>
            <Button type='primary' class={styles.ok} onClick={handleOk}>确定</Button>
          </div>
        </div>

      </Modal>
    )
  }
})
