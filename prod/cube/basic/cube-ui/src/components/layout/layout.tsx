import { defineComponent } from 'vue'
import { Layout as ALayout, type LayoutProps, LayoutSider as ALayoutSider, type SiderProps, LayoutHeader as ALayoutHeader, LayoutContent as ALayoutContent } from 'ant-design-vue/es'
export const Layout = defineComponent({
  props: {
    class: {
      type: String,
      default: '',
    }
  },
  setup (props: LayoutProps, { slots }) {
    return (): JSX.Element => <ALayout {...props}>{slots}</ALayout>
  }
})

export const LayoutSider = defineComponent({
  props: {
    reverseArrow: {
      type: Boolean,
      default: false
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    trigger: {
      type: String,
      default: ''
    }
  },
  setup (props: SiderProps, { slots }) {
    return (): JSX.Element => <ALayoutSider {...props}>{slots}</ALayoutSider>
  }
})

export const LayoutHeader = defineComponent({
  setup (props: LayoutProps, { slots }) {
    return (): JSX.Element => <ALayoutHeader {...props}>{slots}</ALayoutHeader>
  }
})
export const LayoutContent = defineComponent({
  props: {
    class: {
      type: String,
      default: '',
    }
  },
  setup (props: LayoutProps, { slots }) {
    return (): JSX.Element=> <ALayoutContent {...props}>{slots}</ALayoutContent>
  }
})
