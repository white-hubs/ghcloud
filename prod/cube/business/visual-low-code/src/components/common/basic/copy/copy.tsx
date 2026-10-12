import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { Form, FormItem, Modal, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { defineComponent, ref, type VNode } from 'vue'
import { getActiveMenu, getComponentListByType } from '@/utils'
export const Copy = defineComponent({
  emits: ['update:showModel'],
  props: {
    showModel: {
      type: Boolean,
      default: true
    }
  },
  setup: (props, { emit }) => {
    const chartEditStore = useChartEditStore()
    const showModel = ref(true)
    showModel.value = props.showModel
    const shareDataOption = [{
      value: false,
      label: '关闭 , 单个变更不影响其他组件'
    }, {
      value: true,
      label: '开启 , 源组件变更其余组件都一起变更'
    }]
    const handleClose = (): void => {
      // showModel.value = false
      emit('update:showModel', false)
    }
    // 保存复制
    const copyFormRef = ref()
    const copyFormRules = {
      page: {
        required: true,
        trigger: ['blur'],
        validator () {
          if (!copyForm.value.page) {
            return new Error('请选择页面')
          }
          return true
        },
      },
      component: {
        required: true,
        trigger: ['blur'],
        validator () {
          if (!copyForm.value.component) {
            return new Error('请选择组件')
          }
          return true
        },
      }
    }
    const handleCopy = async (): Promise<void > => {
      // 源页面
      const checkedPage = chartEditStore.getPages.find(x => x.id === copyForm.value.page)
      // 源组件
      const checkedComponent = getActiveMenu(checkedPage?.components, copyForm.value.component)
      const validate = await copyFormRef.value.validate()
      if (validate) return
      chartEditStore.copyComponent(checkedComponent, copyForm.value.isShareData)
      emit('update:showModel', false)
    }
    const copyForm = ref({ page: '', component: '', isShareData: false })
    const pageOptions = ref<CreateComponentType[]>([])
    const componentsOptions = ref<CreateComponentType[] | null>([])
    pageOptions.value = chartEditStore.getPages
    // 选择页面
    const updatePage = (val: string): void => {
      copyForm.value.page = val
      const checkedPage = chartEditStore.getPages.find(x => x.id === val)
      if (checkedPage?.components && chartEditStore.getCurrentBlock) {
        const comps = getComponentListByType(checkedPage?.components, chartEditStore.getCurrentBlock, chartEditStore.getCurrentBlock?.key)
        componentsOptions.value = comps?.filter(x => x.id !== chartEditStore.getCurrentBlock?.id) ?? null
      }
    }
    // 选择组件
    const updateComponent = (val: string): void => {
      copyForm.value.component = val
    }
    // 选择是否同源
    const updateShareData = (val: boolean): void => {
      copyForm.value.isShareData = val
    }
    const copyFormDom = (): VNode =>
      <div>
        <div style={{ margin: '20px 0px' }}>请选择希望从哪个页面的，哪个组件复制相同设置？</div>
        <Form model={copyForm.value} ref={copyFormRef} rules={copyFormRules}>
          <FormItem label='选择页面' path='page' label-placement='left'>
            <Select label-field='title' value-field='id' options={pageOptions.value} onUpdateValue={updatePage} />
          </FormItem>
          <FormItem label='选择组件' path='component' label-placement='left'>
            <Select options={componentsOptions.value} label-field='title' value-field='id' onUpdateValue={updateComponent} />
          </FormItem>
          <FormItem label='同步变更' path='isShareData' label-placement='left'>
            <RadioGroup options={shareDataOption} value={false} onChange={updateShareData} />
          </FormItem>
        </Form>
      </div>
    return () => (
      <Modal v-model:show={showModel.value} mask-closable={false} positiveText='确认' preset='dialog' negativeText='取消' title='复制内容' showIcon={false} onClose={handleClose} onNegativeClick={handleClose} onPositiveClick={handleCopy}>
        {copyFormDom()}
      </Modal>
    )
  },
})
