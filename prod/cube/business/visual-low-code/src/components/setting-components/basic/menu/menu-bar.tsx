import { defineComponent, ref, type VNode, watch } from 'vue'
import { Trash, Icon, Tree, CreateOutline, AddCircleOutline, Add, Button, useDialog, Modal, Input, Form, Select, FormItem } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { createUuid, getComponentByType } from '@/utils'
export default defineComponent({
  name: 'menu-bar',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const dialog = useDialog()
    const visibleNodeModal = ref(false)
    const selectKey = ref<string[] | number[]>([])
    const currentMenuList = ref<CreateComponentType | null >()
    const menuTreeData = ref<CreateComponentType[] >([])
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
    const getCompData = (): void => {
      currentMenuList.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.MENU_BAR)
      menuTreeData.value = currentMenuList.value?.components ? handleTreeChildren(currentMenuList.value?.components) : []
    }
    watch(() => chartEditStore.active.pageId, () => {
      getCompData()
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      getCompData()
    }, { immediate: true, deep: true })
    // 操作节点=======================================================================================================
    let selectId = ''
    let status = ''
    // 新增节点(打开弹窗)
    const isChildNode = ref(false)
    const hasChildComp = ref(false)
    const handleAddComponent = (option: CreateComponentType): void => {
      // 是否为子节点
      isChildNode.value = !!option
      // 是否有子节点
      hasChildComp.value = !!((isChildNode.value && option.components))
      nodeForm.value = { nodeName: '', page: '' }
      visibleNodeModal.value = true
      selectId = option?.id ?? ''
      status = 'add'
    }
    // 编辑节点(打开弹窗)
    const handleEditNode = (option: CreateComponentType): void => {
      // 是否为子节点
      isChildNode.value = !!option
      hasChildComp.value = !!((isChildNode.value && option.components))
      nodeForm.value.nodeName = option.title
      if (option.interactive?.[0]?.target) {
        nodeForm.value.page = option.interactive[0].target
      } else {
        nodeForm.value.page = ''
      }
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
    // 切换页面
    const handlePage = (val: string): void => {
      nodeForm.value.page = val
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
              if (item?.interactive)item.interactive[0].target = nodeForm.value.page
            } else {
              item.components.push({
                id: createUuid(),
                category: ComponentCategoryEnum.MENU_BAR,
                categoryName: '菜单项',
                key: 'menu-item',
                title: nodeForm.value.nodeName,
                interactive: [{ id: nodeForm.value.page, target: nodeForm.value.page }],
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
          } else {
            if (item.components)pushComp(item.components)
          }
        })
      }
      if (selectId && menuTreeData.value.length > 0) {
        pushComp(menuTreeData.value)
      } else {
        if (status === 'edit') {
          menuTreeData.value.forEach(x => {
            if (x.id === selectId) {
              x.title = nodeForm.value.nodeName
              if (x?.interactive)x.interactive[0].target = nodeForm.value.page
            }
          })
        } else {
          menuTreeData.value.push({
            id: createUuid(),
            category: ComponentCategoryEnum.MENU_BAR,
            categoryName: '菜单项',
            key: 'menu-item',
            title: nodeForm.value.nodeName,
            interactive: [{ id: nodeForm.value.page, target: nodeForm.value.page }],
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
      chartEditStore.sycShareData(menuTreeData.value)
      nodeForm.value = { nodeName: '', page: '' }
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
    const nodeForm = ref({ nodeName: '', page: '' })

    const switchPageOption = ref<{ label: string; value: string; }[]>([])
    watch(() => chartEditStore.getPages, (val) => {
      // 获取页面下拉
      switchPageOption.value = val.map((page) => {
        return { label: page.title, value: page.id }
      })
    }, { immediate: true, deep: true })
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
          {hasChildComp.value
            ? null
            : <FormItem label='切换页面' label-placement='left'><Select v-model:value={nodeForm.value.page} options={switchPageOption.value} onUpdateValue={handlePage} /></FormItem>}
        </Form>
      </div>
    return () => {
      return (
        <div class='nav-box'>
          <div style={{ margin: '0px 27px' }}><Button size='small' onClick={handleAddComponent}><Icon><Add /></Icon>新增节点</Button></div>
          <Tree data={menuTreeData.value} label-field='title' key-field='id' block-line children-field='components' selectable selectedKeys={selectKey.value} renderSuffix={renderSuffix} />
          <Modal v-model:show={visibleNodeModal.value} positiveText='确认' preset='dialog' negativeText='取消' title={isChildNode.value ? '设置子节点' : '设置节点'} showIcon={false} onPositiveClick={handleSaveNode}>
            {modalForm}
          </Modal>
        </div>
      )
    }
  },
})
