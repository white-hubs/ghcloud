import { defineComponent, ref, type VNode, watch } from 'vue'
import {
  Trash, Icon, Tree, CreateOutline, AddCircleOutline, Add, Button, useDialog, Modal, Input, Form, FormItem,
} from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import type { CameraViewType, CreateComponentType, InteractiveForm, ModelNavType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { createUuid, getActiveMenu, getComponentByType } from '@/utils'
import BatchSettings from '@/components/common/basic/batch-settings/batch-settings'
import styles from './vettical-menu.module.less'
export default defineComponent({
  name: 'vertical-menu',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const dialog = useDialog()
    const visibleNodeModal = ref(false)
    const selectKey = ref<string[] | number[]>([])
    const currentMenuList = ref<CreateComponentType | null >()
    const menuTreeData = ref<CreateComponentType[] >([])
    const switchModelOption = ref<ModelNavType[] | null>()
    const switchComponentOption = ref<CreateComponentType[]>([])
    const actionTitle = ref('')
    const actionOptions = ref<{ label: string; action: string; }[]>([{ label: '聚焦模型', action: 'switchModel' }, { label: '切换视角', action: 'changeCamera' }])
    const batchSettingForm = ref<InteractiveForm>({ type: 'click', objectType: 'component', action: 'showComponent', navItem: '', target: [], id: createUuid(), menuId: createUuid(), actorName: '', cameraView: {} })
    const handleTreeChildren = (arr: CreateComponentType[]): CreateComponentType[] => {
      if (arr.length) {
        for (const item of arr) {
          if (item.components) {
            if (item.components.length) {
              handleTreeChildren(item.components)
            } else {
              item.components = []
            }
          }
        }
      }
      return arr
    }
    watch(() => chartEditStore.active.pageId, () => {
      // 获取当前的垂直菜单
      currentMenuList.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.VERTICALMENU)
      // 转化垂直菜单
      menuTreeData.value = currentMenuList.value?.components ? handleTreeChildren(currentMenuList.value?.components) : []
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      // // 获取组件下拉
      switchComponentOption.value = chartEditStore.getCurrentPageComponents
      // // 获取聚焦模型下拉
      switchModelOption.value = chartEditStore.getCurrentPage?.modelNav
      // // 获取动作下拉
      if (batchSettingForm.value.objectType === 'UE5') {
        actionOptions.value = [{ label: '聚焦模型', action: 'switchModel' }, { label: '切换视角', action: 'changeCamera' }]
      } else {
        actionTitle.value = '显示组件'
        actionOptions.value = [{ label: '显示组件', action: 'showComponent' }, { label: '隐藏组件', action: 'hiddenComponent' }]
      }
      // 获取当前的垂直菜单
      currentMenuList.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.VERTICALMENU)
      // 转化垂直菜单
      menuTreeData.value = currentMenuList.value?.components ? handleTreeChildren(currentMenuList.value?.components) : []
    }, { immediate: true, deep: true })
    // 操作节点=======================================================================================================
    let selectId = ''
    let status = ''
    const isChildNode = ref(false)
    // 新增节点(打开弹窗)
    const handleAddComponent = (option: CreateComponentType): void => {
      // 是否为子节点
      isChildNode.value = !!option
      nodeForm.value = { nodeName: '' }
      visibleNodeModal.value = true
      selectId = option?.id ?? ''
      status = 'add'
    }
    // 编辑节点(打开弹窗)
    const handleEditNode = (option: CreateComponentType): void => {
      // 是否为子节点
      isChildNode.value = !!option
      nodeForm.value.nodeName = option.title
      selectId = option.id
      status = 'edit'
      visibleNodeModal.value = true
    }
    // 删除节点
    const handleDeleteNode = (option: CreateComponentType): void => {
      selectId = option.id
      const deleteComp = (list: CreateComponentType[] | null): void => {
        list?.forEach((item, index) => {
          if (item.id === selectId) {
            list.splice(index, 1)
          } else {
            if (item.components)deleteComp(item.components)
          }
        })
      }
      if (!!menuTreeData.value.find(x => x.id === selectId) && menuTreeData.value.length <= 1) {
        dialog.warning({
          title: '提示',
          content: '至少保留一个节点',
          positiveText: '确定',
        })
        return
      }
      dialog.warning({
        title: '提示',
        content: '你是否确定删除节点？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          deleteComp(menuTreeData.value)
        }
      })
      chartEditStore.sycShareData(menuTreeData.value)
    }
    // 保存节点
    const handleSaveNode = async (): Promise<boolean> => {
      const validate = await nodeFormRef.value.validate()
      if (validate) return false
      const pushComp = (list: CreateComponentType[] | null): void => {
        list?.forEach(item => {
          if (item.id === selectId) {
            item.components = item.components ?? []
            if (status === 'edit') {
              item.title = nodeForm.value.nodeName
            } else {
              item.components.push({
                id: createUuid(),
                category: ComponentCategoryEnum.VERTICALMENU,
                categoryName: '垂直菜单',
                key: 'nav-item',
                title: nodeForm.value.nodeName,
                interactive: [],
                components: [],
                parentId: item.id,
                styles: {
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0,
                  show: true,
                  zIndex: 100
                }
              })
            }
          } else {
            if (item.components)pushComp(item.components)
          }
        })
      }
      // 操作子节点
      if (selectId && menuTreeData.value.length > 0) {
        pushComp(menuTreeData.value)
      } else {
        // 操作根节点
        if (status === 'edit') {
          // 编辑
          menuTreeData.value.forEach(x => {
            if (x.id === selectId) {
              x.title = nodeForm.value.nodeName
            }
          })
        } else {
          // 新增
          menuTreeData.value.push({
            id: createUuid(),
            category: ComponentCategoryEnum.VERTICALMENU,
            categoryName: '垂直菜单',
            key: 'nav-item',
            title: nodeForm.value.nodeName,
            interactive: [],
            components: [],
            styles: {
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              show: true,
              zIndex: 100
            }
          })
        }
      }
      nodeForm.value = { nodeName: '' }
      chartEditStore.sycShareData(menuTreeData.value)
      return true
    }
    // 操作DOM
    const renderSuffix = ({ option }: { option: CreateComponentType; }): unknown => {
      return (
        <div style={{ width: '102px' }}>
          <span onClick={() => { handleAddComponent(option) }}>
            <Button quaternary circle>
              <Icon><AddCircleOutline /></Icon>
            </Button>
          </span>
          <span onClick={() => { handleEditNode(option) }}>
            <Button quaternary circle>
              <Icon>
                <CreateOutline />
              </Icon>
            </Button>
          </span>
          <span onClick={() => { handleDeleteNode(option) }}>
            <Button quaternary circle>
              <Icon>
                <Trash />
              </Icon>
            </Button>
          </span>
        </div>
      )
    }
    const nodeForm = ref({ nodeName: '' })
    const nodeFormRef = ref()
    const nodeFormRules = {
      nodeName: {
        required: true,
        trigger: ['blur'],
        validator () {
          if (!nodeForm.value.nodeName) {
            return new Error('请输入节点名称')
          }
          return true
        },
      }
    }
    const modalForm = (): VNode =>
      <div>
        <Form model={nodeForm} ref={nodeFormRef} rules={nodeFormRules}>
          <FormItem
            label='节点名称'
            label-placement='left'
            path='nodeName'
          >
            <Input
              maxlength={20}
              v-model:value={nodeForm.value.nodeName}
              placeholder='请输入节点名称'
            />
          </FormItem>
        </Form>
      </div>
    // 批量设置=========================================================================================================
    const visibleBatchSetting = ref(false)
    const batchSettingInterActive = (): void => {
      visibleBatchSetting.value = true
    }
    const batchSettingFormList = ref<InteractiveForm[]>([])
    interface InteractiveItemType {
      navItem: string;
      targetObject: CameraViewType | string;
    }
    const interactiveList = ref<InteractiveItemType[]>([])
    const handleInteractiveList = (val: InteractiveItemType[]): void => {
      interactiveList.value = val
    }
    const handleBatchSettingFormList = (val: InteractiveForm[]): void => {
      batchSettingFormList.value = val
    }
    // 批量设置保存
    const handleSaveBatchSetting = (): void => {
      const navList = chartEditStore.getCurrentBlock?.components
      batchSettingFormList.value.forEach(interactiveItem => {
        if (interactiveItem.navItem) {
          const current = getActiveMenu(navList, interactiveItem.navItem)
          current?.interactive?.push(interactiveItem)
        }
      })
      interactiveList.value = []
    }
    // 关闭批量弹窗
    const handleClose = (): void => {
      interactiveList.value = []
    }
    return () => {
      return (
        <div class={styles['nav-box']}>
          <div class={styles['add-node']}><Button size='small' onClick={handleAddComponent}><Icon><Add /></Icon>新增节点</Button> <a onClick={batchSettingInterActive} style={{ marginRight: '5px' }}>批量设置</a></div>
          <Tree data={menuTreeData.value} label-field='title' key-field='id' block-line children-field='components' selectable selectedKeys={selectKey.value} renderSuffix={renderSuffix} />
          <Modal v-model:show={visibleNodeModal.value} positiveText='确认' preset='dialog' negativeText='取消' title={isChildNode.value ? '设置子节点' : '设置节点'} showIcon={false} onPositiveClick={handleSaveNode}>
            {modalForm}
          </Modal>
          <Modal style={{ width: '700px' }} v-model:show={visibleBatchSetting.value} positiveText='确认' preset='dialog' negativeText='取消' title='批量设置交互' showIcon={false} onClose={handleClose} onNegativeClick={handleClose} onPositiveClick={handleSaveBatchSetting}>
            {visibleBatchSetting.value ? <BatchSettings itemTreeData={menuTreeData.value} onBatchSettingFormList={handleBatchSettingFormList} onInteractiveList={handleInteractiveList} /> : null}
          </Modal>
        </div>
      )
    }
  },
})
