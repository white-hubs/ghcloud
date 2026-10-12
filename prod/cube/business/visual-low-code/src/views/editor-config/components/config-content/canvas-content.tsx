import { defineComponent, toRefs, computed, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType, ModelNavType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getSizeStyle } from '@/utils/style'
import { handleMouseDown } from '@/hooks/use-drag.hook'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
import { dragoverHandle, drop } from '@/packages/use-target-dragger'
import styles from './canvas-content.module.less'
import DynamicComponent from '@/components/common/dynamic-component'
import EditSelect from '../../components/edit-select/edit-select'
import { useMessage } from '@ghcloud/visual-view-ui'
import UeClient from '@/static/model/ue-client'
import { ComponentShape } from '../shape/component-shape'
import _ from 'lodash'
import { toTree } from '@/utils'
import { RightFunction } from '../right-function/right-function'
export const CanvasContent = defineComponent({
  setup: () => {
    const chartEditStore = useChartEditStore()
    const player = ref<HTMLElement>()
    const { getEditCanvas } = toRefs(chartEditStore)
    let ueClient: any = UeClient.getInstance()
    const message = useMessage()
    const rangeStyle = computed(() => {
      // 获取当前比例下的画布宽高
      const { width, height } = chartEditStore.getCanvasScaleRect
      // 缩放
      const scale = {
        transform: `scale(${getEditCanvas.value.scale})`,
      }
      return {
        ...getSizeStyle({
          width,
          height
        }),
        ...scale,
      }
    })
    const currentModel = computed(() => {
      return chartEditStore.getCurrentPage?.model
    })

    watch(() => [player.value, currentModel.value], (val, oldVal) => {
      const modelValue = (val as CreateComponentType[])[1]
      const oldModelValue = (oldVal as CreateComponentType[])[1]
      if (!modelValue) {
        if (!ueClient) return
        ueClient.closeUE5()
        ueClient = null
        return
      }
      if (oldModelValue && modelValue.config.address === oldModelValue.config.address) return
      ueClient = UeClient.getInstance()
      ueClient.loadUE5(player.value, modelValue.config.address)
      ueClient.onConnected(async () => {
        message.success('模型连接成功')
        // 设置视角
        ueClient.send('setCameraView', chartEditStore.getCurrentPage?.model?.config.cameraView)
        const navModelList: ModelNavType[] = []
        // 获取模型导航目录
        const getCatalog = async (actorId: string): Promise<void> => {
          return new Promise(resolve => {
            ueClient.send('getBimtree', { id: actorId }, (children: ModelNavType[]) => {
              const promise: Promise<void>[] = []
              children.forEach(child => {
                const x = { id: child.id, name: child.name, type: child.type, parentId: actorId }
                navModelList.push(x)
                promise.push(getCatalog(child.id))
              })
              Promise.all(promise).then(() => { resolve() })
            })
          })
        }
        const getListData = async (): Promise<void> => {
          await getCatalog('')
          chartEditStore.setModelNav(toTree(navModelList, ''))
        }
        getListData()
      })
      document.addEventListener('keydown', function (event) {
        if (window.$KeyboardActive && event.key === 'Control') {
          window.$KeyboardActive.ctrl = true
          event.preventDefault()
        }
      })
      ueClient.onDisconnected(() => {
        message.error('模型加载失败')
      })
    })
    const active = ref(false)
    watch(() => active.value, () => {
      chartEditStore.setDragging(active.value)
    }, { immediate: true, deep: true })

    const componentList = computed(() => {
      // 过滤删除数据
      function filterTree (data: CreateComponentType[]): CreateComponentType[] {
        const newTree = data.filter(x => x.styles.show)
        newTree.forEach(x => x.components && (x.components = filterTree(x.components)))
        return newTree
      }
      return filterTree(_.cloneDeep(chartEditStore.getCurrentPageComponents))
    })
    const handleMouseUp = (): void => {
      componentList.value.forEach(comp => {
        if (comp.id === chartEditStore.getCurrentBlock?.id) {
          chartEditStore.getCurrentBlock.styles.x = comp.styles.x
          chartEditStore.getCurrentBlock.styles.y = comp.styles.y
          chartEditStore.getCurrentBlock.styles.width = comp.styles.width
          chartEditStore.getCurrentBlock.styles.height = comp.styles.height
        }
      })
    }
    const handleDrop = async (e: DragEvent): Promise<void> => {
      const isLoadModule = await drop(e)
      if (isLoadModule) {
        message.error('已存在模型，不可再添加')
      }
    }
    const changePosition = (x: string, y: string): void => {
      const xP = Number(x.replace('px', ''))
      const yP = Number(y.replace('px', ''))
      const { width, height } = chartEditStore.getCanvasScaleRect
      if (xP === 0 || yP === 0 || xP >= width - 20 || yP >= height - 20) {
        componentList.value.forEach(comp => {
          if (comp.id === chartEditStore.getCurrentBlock?.id) {
            chartEditStore.getCurrentBlock.styles.x = comp.styles.x
            chartEditStore.getCurrentBlock.styles.y = comp.styles.y
            chartEditStore.getCurrentBlock.styles.width = comp.styles.width
            chartEditStore.getCurrentBlock.styles.height = comp.styles.height
          }
        })
      }
    }
    return () => (
      <>
        {/* 画布主体 */}
        <div
          id='go-chart-edit-content'
          class={styles['canvas-content']}
          onMouseup={handleMouseUp}
          onMousedown={($event) => { handleMouseDown($event) }}
          onMousemove={handleMouseUp}
        >
          <div
            id='canvas-content'
            class='go-edit-range go-transition'
            style={{ ...rangeStyle.value }}
          >
            <div
              onDrop={(e) => { handleDrop(e) }}
              onDragover={dragoverHandle}
              onDragenter={dragoverHandle}
              id='player' ref={player}
            >
              <div id='drawer' />
              {/* 框选 */}
              <EditSelect />
              {
                    componentList.value.map((item: CreateComponentType) => {
                      return (
                        <Vue3DraggableResizable
                          parent-scale-x={chartEditStore.getEditCanvas.scale}
                          parent-scale-y={chartEditStore.getEditCanvas.scale}
                          style={{ zIndex: item.styles.zIndex }}
                          parent resizable={false} key={item.id}
                          v-model:x={item.styles.x}
                          v-model:y={item.styles.y}
                          v-model:active={active.value}
                          onVnodeUpdated={(val) => { changePosition(val?.el?.style.left, val?.el?.style.top) }}
                        >
                          <ComponentShape item={item}><DynamicComponent
                            component={item.key} item={item} style={{
                              ...getSizeStyle(item.styles)
                            }}
                                                      />
                          </ComponentShape>
                        </Vue3DraggableResizable>
                      )
                    })
                  }
              <RightFunction />
            </div>
          </div>
        </div>
      </>
    )
  },
})
