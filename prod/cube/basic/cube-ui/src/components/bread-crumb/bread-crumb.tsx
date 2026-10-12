import { defineComponent } from 'vue'
import { Breadcrumb as ABreadcrumb, BreadcrumbItem as ABreadcrumbItem, type BreadcrumbItemProps, type BreadcrumbProps } from 'ant-design-vue/es'

export const Breadcrumb = defineComponent({
  setup (props: BreadcrumbProps, { slots }) {
    return (): JSX.Element => <ABreadcrumb {...props}>{slots}</ABreadcrumb>
  },
})

/** 与 ant-design-vue 一致，否则 ABreadcrumb 运行时校验子节点会告警 */
const breadcrumbItemInner = defineComponent({
  name: 'BreadcrumbItem',
  setup (props: BreadcrumbItemProps, { slots }) {
    return (): JSX.Element => <ABreadcrumbItem {...props}>{slots}</ABreadcrumbItem>
  },
})

export const BreadcrumbItem = Object.assign(breadcrumbItemInner, {
  __ANT_BREADCRUMB_ITEM: true,
})
