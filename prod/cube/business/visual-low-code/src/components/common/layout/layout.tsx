import { defineComponent, onMounted, ref } from 'vue'
import {
  Layout,
  LayoutSider,
  LayoutHeader,
  LayoutContent,
  ConfigProvider,
} from '@ghcloud/visual-view-ui'
export const EditLayout = defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
  },
  setup: (props, { slots }) => {
    const layoutStyle = { height: '100vh' }
    const contentStyle = ref({ height: '200px', overflow: 'hidden' })
    const headerHeight = ref(100)
    onMounted(() => {
      headerHeight.value = document.getElementsByClassName('n-layout-header')[0].clientHeight
      contentStyle.value.height = `calc(100vh - ${headerHeight.value}px`
    })
    return () => (
      <>
        <ConfigProvider>
          <Layout style={layoutStyle}>
            <LayoutHeader>
              {slots['layout-header']?.()}
            </LayoutHeader>
            <Layout hasSider>
              <LayoutSider style={contentStyle.value}>
                {slots['left-sider']?.()}
              </LayoutSider>
              <LayoutContent
                style={contentStyle}
                nativeScrollbar={false}
              >
                {slots['layout-content']?.()}
              </LayoutContent>
              <LayoutSider style={contentStyle.value}>
                {slots['right-sider']?.()}
              </LayoutSider>
            </Layout>
          </Layout>
        </ConfigProvider>
      </>

    )
  },
})
