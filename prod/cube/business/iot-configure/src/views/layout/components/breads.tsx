import { defineComponent } from 'vue'
import { onMounted, ref, watch, type Ref } from 'vue'
import { type RouteLocationMatched, useRoute } from 'vue-router'
import { Breadcrumb, BreadcrumbItem } from '@ghcloud/cube-ui'

export const CBreads = defineComponent({
  setup: (props, { slots }) => {
    const tabs: Ref<RouteLocationMatched[]> = ref([])
    const route = useRoute()
    const getBreadCom = () => {
      const mached = route.matched.filter(item => item.meta.title)
      // 设置面包屑的数据
      tabs.value = mached
    }
    onMounted(() => {
      getBreadCom()
    })

    watch(() => route.path, () => {
      getBreadCom()
    })

    return (): JSX.Element =>
      <div>
        <Breadcrumb>
          {
            tabs.value.map(item => {
              return <BreadcrumbItem>{item.meta.title}</BreadcrumbItem>
            })
          }
        </Breadcrumb>
        {slots.default?.()}
      </div>
  }
})
