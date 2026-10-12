import {
  defineComponent,
  h,
  resolveComponent,
} from 'vue'
import { requierTsxComponents } from '@/utils/index'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { useRouter } from 'vue-router'
import { useMessage } from '@ghcloud/visual-view-ui'
import { StorageEmun, getSessionStorage } from '@/utils/storage'
import { projectUpdate } from '@/apis'
import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
export default defineComponent({
  name: 'DynamicComponent',
  components: {
    ...requierTsxComponents(),
  },
  props: {
    component: {
      type: String,
      required: true,
    },
    style: {
      type: Object,
    },
    item: {
      type: Object,
    }
  },
  setup (props) {
    const chartEditStore = useChartEditStore()
    const router = useRouter()
    const message = useMessage()
    return () => h(resolveComponent(props.component), {
      ...props,
      onClick: async (e: MouseEvent) => {
        const currentRoute = router.currentRoute
        if (currentRoute.value.name === 'editor-config' && props.item?.id !== chartEditStore.getCurrentBlock?.id) {
          chartEditStore.setTargetComp([props.item?.id])
          e.stopPropagation()
          const titles = chartEditStore.pages.map(page => page.title)
          if (new Set(titles).size !== chartEditStore.pages.length) {
            message.warning('页面名称重复')
            return
          }
          const canvasJson = JSON.stringify({ pages: chartEditStore.getPages })
          const projectId = getSessionStorage(StorageEmun.PROJECTID) as string
          const modelIds = chartEditStore.getPages.map(item => {
            return item.model ? item.model.id : ''
          }).filter(item => item !== '').join(',')
          await projectUpdate({ canvasJson, projectId, modelIds })
          message.success('保存成功')
        }
      },
      onMousedown: (e: MouseEvent) => {
        if (props.item?.category !== ComponentCategoryEnum.VERTICALMENU && e.button !== 2) {
          chartEditStore.setTargetComp([props.item?.id])
        }
      },
    })
  },
})
