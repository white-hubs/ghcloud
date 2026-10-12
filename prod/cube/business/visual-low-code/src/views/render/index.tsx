import { defineComponent, computed, onMounted, ref, watchEffect } from 'vue'
import styles from './index.module.less'
import { previewScaleType } from '@/setting/design-setting'
import { useScale } from '@/hooks/use-scale.hook'
import { useChartEditStore, type EditStoreState } from '@/store/modules/chart-edit-store/chart-edit-store'
import { getComponentStyle, getEditCanvasConfigStyle, getSizeStyle } from '@/utils/style'
import { getSessionStorage, StorageEmun } from '@/utils/storage'
import { getUrlParams } from '@/utils'
import { getCanvasConfigInfo } from '@/apis'
import DynamicComponent from '@/components/common/dynamic-component'
const Image_404 = "/resource/v1/visual-low-code/images/exception/image-404.png"
import UeClient from '@/static/model/ue-client'
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
const chartEditStore = useChartEditStore()
export const RenderIndex = defineComponent({
  setup: () => {
    const { previewRef } = useScale()
    const urlParams = getUrlParams()
    const disabled = ref<boolean>(false)
    const player = ref<HTMLElement>()
    let ueClient: any = UeClient.getInstance()
    onMounted(async () => {
      if (urlParams.type === 'preview') {
        const storeStorage = getSessionStorage(StorageEmun.CHART_CONFIG) as EditStoreState
        chartEditStore.setActivePage(storeStorage.pages[0].id)
        chartEditStore.setPages(storeStorage.pages)
        chartEditStore.setShareData(storeStorage.shareData)
        return
      }
      const projectId = getSessionStorage(StorageEmun.PROJECTID) as string
      const instanceId = getSessionStorage(StorageEmun.INSTANCEID) as string
      try {
        const result = await getCanvasConfigInfo({ projectId, instanceId })
        const renderSource = result.data
        chartEditStore.setProjectName(renderSource.projectData.projectName)
        const canvasJson = JSON.parse(renderSource.canvasJson)
        if (!Object.keys(canvasJson).length) return
        chartEditStore.setActivePage(canvasJson.pages[0].id)
        chartEditStore.setPages(canvasJson.pages)
      } catch (error) {
        disabled.value = true
      }
    })
    const currentModel = computed(() => {
      return chartEditStore.getCurrentPage?.model
    })
    watchEffect(() => {
      if (!player.value) return
      if (!currentModel.value) {
        if (!ueClient) return
        ueClient.closeUE5()
        ueClient = null
        return
      } else {
        ueClient = UeClient.getInstance()
      }
      ueClient.loadUE5(player.value, currentModel.value.config.address)
    })
    const previewRefStyle = computed(() => {
      return {
        ...getEditCanvasConfigStyle(chartEditStore.getCanvasScaleRect),
      }
    })
    return () => (
      <>
        {!disabled.value &&
          <div class={[styles.go_preview, previewScaleType]}>
            {/* 缩放层 */}
            <div ref={previewRef} class='go-preview-scale'>
              <div style={{ ...previewRefStyle.value as CSSStyleValue }}>
                <div id='player' ref={player}>
                  <div id='renderView' />
                  {
                     chartEditStore.getCurrentPageComponents.map((item: CreateComponentType) => {
                       return (
                         <div
                           style={{
                             ...getComponentStyle(item.styles),
                             zIndex: `${item.category === ComponentCategoryEnum.NOTIFICATIONTOOL ? 1100 : item.styles.zIndex} `
                           }} class={styles.tools} key={item.id}
                         >
                           <DynamicComponent item={item} component={item.key} style={{ ...getSizeStyle(item.styles) }} />
                         </div>
                       )
                     })
                  }
                </div>
              </div>
            </div>
          </div>}
        {disabled.value &&
          <div class={styles.empty}>
            <div>
              <img src={Image_404} alt='' srcset='' />
              <p>地址不可用,无法访问</p>
              <p>请联系管理员，启用实例</p>
            </div>

          </div>}
      </>
    )
  },
})
