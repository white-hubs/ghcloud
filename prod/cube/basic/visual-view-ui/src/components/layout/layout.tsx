import { defineComponent ,type PropType,type CSSProperties} from 'vue'
import { NLayout,NLayoutSider,NLayoutHeader,NLayoutContent,NLayoutFooter,type LayoutSiderProps} from 'naive-ui'
// import { Layout as ALayout, type LayoutProps, LayoutSider as ALayoutSider, type SiderProps, LayoutHeader as ALayoutHeader, LayoutContent as ALayoutContent } from 'ant-design-vue/es'
// import 'ant-design-vue/es/layout/style'

export const Layout = defineComponent({
  props: {
    contentStyle: {
      type: String as PropType<string | CSSProperties>,
      default: undefined,
    },
    position:{
      type:String as PropType<"static" | "absolute">,
      default:'static'
    },
    siderPlacement:{
      type:String as PropType<"left" | "right">,
      default:'left'
    },
    hasSider:{
      type:Boolean as BooleanConstructor,
      default:false
    },
  },
  setup (props, { slots }) {
    return () => <NLayout {...props}>{slots}</NLayout>
  }
})

export const LayoutSider = defineComponent({
  props: {
    bordered: {
      type: Boolean as BooleanConstructor,
      default: false,
    },
  },
  setup (props: LayoutSiderProps, { slots }) {
    return () => <NLayoutSider {...props}>{slots}</NLayoutSider>
  }
})

export const LayoutHeader = defineComponent({
  props: {
    bordered: {
      type: Boolean as BooleanConstructor,
      default: false,
    },
    inverted: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String as PropType<"static" | "absolute">,
      default: 'static',
    }
  },
  setup (props, { slots }) {
    return () => <NLayoutHeader {...props}>{slots}</NLayoutHeader>
  }
})
export const LayoutContent = defineComponent({
  props: {
    contentStyle: {
      type: String as  PropType<string | CSSProperties>,
      default: '',
    },
    nativeScrollbar:{
      type: Boolean as BooleanConstructor,
      default: '',
    }
  },
  setup (props, { slots }) {
    return () => <NLayoutContent {...props}>{slots}</NLayoutContent>
  }
})
export const LayoutFooter = defineComponent({
  props: {
    bordered: {
      type: Boolean as BooleanConstructor,
      default: false,
    },
    position: {
      type: String as PropType<"static" | "absolute">,
      default: 'static',
    }
  },
  setup (props, { slots }) {
    return () => <NLayoutFooter {...props}>{slots}</NLayoutFooter>
  }
})