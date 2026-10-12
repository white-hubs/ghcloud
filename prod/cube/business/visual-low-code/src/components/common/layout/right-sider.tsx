import { computed, defineComponent, ref, watch, type VNode } from 'vue'
import SettingComponent from '@/components/common/setting-component'
import styles from './right-sider.module.less'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { Tabs, TabPane, Form, Input, InputNumber, FormItem, Switch, LockClosed, Icon, LockOpenOutline } from '@ghcloud/visual-view-ui'
import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getActiveMenu } from '@/utils'
import { Copy } from '../basic/copy/copy.tsx'

interface BasicForm { componentName: string; position: { x: number; y: number; w: number; h: number; };isFullScreen: boolean; }
export const RightSider = defineComponent({
  setup: () => {
    const chartEditStore = useChartEditStore()
    const categoryName = computed(() => chartEditStore.getCurrentBlock?.categoryName ?? '')
    const basicForm = ref<BasicForm>({ componentName: '', position: { x: 0, y: 0, w: 0, h: 0 }, isFullScreen: false })
    const isMenuItem = ref(false)
    const isVerticalMenuItem = ref(false)
    const isFullScreen = ref(false)
    const scaleSize = ref(1)
    const isLock = ref(false)
    watch(() => chartEditStore.getCurrentBlock, (val) => {
      const id = val?.id ?? ''
      // 获取模型的基础设置
      if (chartEditStore.getCurrentPage?.model && chartEditStore.getCurrentPage.model.id === id) {
        basicForm.value.componentName = chartEditStore.getCurrentPage?.model?.title
        basicForm.value.isFullScreen = chartEditStore.getCurrentPage?.model?.styles.isFullScreen ?? true
      }
      // 获取当前组件
      const activeComp = getActiveMenu(chartEditStore.getCurrentPageComponents, id)
      if (activeComp) {
        basicForm.value.componentName = activeComp.title
        basicForm.value.position.x = activeComp.styles.x ?? 0
        basicForm.value.position.y = activeComp.styles.y ?? 0
        basicForm.value.position.w = activeComp.styles.width
        basicForm.value.position.h = activeComp.styles.height
        basicForm.value.isFullScreen = activeComp.styles.isFullScreen ?? false
      }
      // 是否为菜单的子组件
      isMenuItem.value = (val?.key === 'menu-item' && val.category === ComponentCategoryEnum.MENU_BAR) ?? false
      isVerticalMenuItem.value = (val?.key === 'nav-item' && val.category === ComponentCategoryEnum.VERTICALMENU) ?? false
      // 可以设置全屏的组件: 图片,二维组态
      isFullScreen.value = val?.category === ComponentCategoryEnum.IMAGE || val?.category === ComponentCategoryEnum.TDCONFIGURATION || val?.category === ComponentCategoryEnum.MODEL
    }, { immediate: true, deep: true })
    watch(() => basicForm.value, (val) => {
      const id = chartEditStore.getCurrentBlock?.id ?? ''
      if (chartEditStore.getCurrentPage?.model && chartEditStore.getCurrentPage.model.id === id) {
        chartEditStore.getCurrentPage.model.title = val.componentName
      }
      if (!isLock.value)scaleSize.value = val.position.w / val.position.h
      const activeComp = getActiveMenu(chartEditStore.getCurrentPageComponents, id)
      if (activeComp) {
        activeComp.title = val.componentName
        activeComp.styles.isFullScreen = val.isFullScreen
        activeComp.styles.x = val.position.x
        activeComp.styles.y = val.position.y
        activeComp.styles.width = val.position.w
        activeComp.styles.height = val.position.h
      }
    }, { immediate: true, deep: true })
    const handleScreen = (): void => {
      if (!basicForm.value.isFullScreen) {
        basicForm.value.position.x = 0
        basicForm.value.position.y = 0
        basicForm.value.position.w = 1920
        basicForm.value.position.h = 1080
      } else {
        basicForm.value.position.w = 200
        basicForm.value.position.h = 200
      }
    }
    const showModel = ref(false)
    const handleCopy = (): void => {
      showModel.value = true
    }
    const isCopy = (): boolean => {
      return chartEditStore.getCurrentBlock?.category !== ComponentCategoryEnum.MODEL &&
       chartEditStore.getCurrentBlock?.category !== ComponentCategoryEnum.TDCONFIGURATION &&
       chartEditStore.getCurrentBlock?.category !== ComponentCategoryEnum.COMBINATION
    }
    const handleLock = (): void => {
      isLock.value = !isLock.value
    }
    const updateSize = (param: string, val: number): void => {
      if (isLock.value) {
        if (param === 'w') {
          basicForm.value.position.h = Math.round(val / scaleSize.value)
        } else {
          basicForm.value.position.w = Math.round(val * scaleSize.value)
        }
      }
    }
    const basicFormDom = (): VNode =>
      <Form model={basicForm.value}>
        <FormItem label='组件名称' label-placement='left'>
          <Input
            v-model:value={basicForm.value.componentName}
            maxlength={20}
            placeholder='输入组件名称'
          />
        </FormItem>
        {isFullScreen.value
          ? <FormItem label='全屏' label-placement='left'>
            <Switch
              disabled={chartEditStore.getCurrentBlock?.category === ComponentCategoryEnum.MODEL}
              onChange={handleScreen}
              v-model:value={basicForm.value.isFullScreen}
            />
          </FormItem>
          : null}
        {isFullScreen.value && basicForm.value.isFullScreen
          ? null
          : <FormItem label='位置尺寸' label-placement='left'>
            <div>
              <InputNumber
                v-model:value={basicForm.value.position.x}
                show-button={false}
                v-slots={{ suffix: () => <span>X</span> }}
              />
              <InputNumber
                style={{ margin: '4px 0px' }}
                onChange={(val: number) => { updateSize('w', val) }}
                v-model:value={basicForm.value.position.w}
                show-button={false}
                v-slots={{ suffix: () => <span>W</span> }}
              />
            </div>
            <div class={styles.lockDom} onClick={handleLock}>
              <p><Icon>
                {isLock.value ? <LockClosed /> : <LockOpenOutline />}
              </Icon></p>
            </div>
            <div>
              <InputNumber
                show-button={false}
                v-model:value={basicForm.value.position.y}
                v-slots={{ suffix: () => <span>Y</span> }}
              />
              <InputNumber
                style={{ margin: '4px 0px' }}
                onChange={(val: number) => { updateSize('h', val) }}
                v-model:value={basicForm.value.position.h}
                show-button={false}
                v-slots={{ suffix: () => <span>H</span> }}
              />
            </div>
          </FormItem>}
      </Form>
    return () => (
      <div class={styles.wrapper}>
        <Tabs type='segment'>
          <TabPane name='style' tab='基本设置'>
            {
              (chartEditStore.getCurrentBlock && !isMenuItem.value && !isVerticalMenuItem.value)
                ? <div>
                  {isCopy() ? <p>不想重复配置？点击<a onClick={handleCopy}>复制</a>试一下</p> : null}
                  {basicFormDom()}
                </div>
                : <div style={{ textAlign: 'center', margin: '20px 0px' }}>暂无配置</div>
}
          </TabPane>
          <TabPane name='interactive' tab={`${categoryName.value}设置`}>
            {
                (chartEditStore.getCurrentBlock && !isMenuItem.value)
                  ? <SettingComponent component={chartEditStore.getCurrentBlock?.key ?? ''} />
                  : <div style={{ textAlign: 'center', margin: '20px 0px' }}>暂无配置</div>
              }
          </TabPane>
        </Tabs>
        {
          showModel.value ? <Copy v-model:showModel={showModel.value} /> : null
        }
      </div>
    )
  },
})
