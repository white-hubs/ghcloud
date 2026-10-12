import { defineComponent, ref, type VNode, watch } from 'vue'
import {
  Icon, Add, Button,
  useDialog,
  Modal, Input, Form, FormItem, List, ListItem, Trash, CreateOutline, Upload, type UploadFileInfo, useMessage
} from '@ghcloud/visual-view-ui'
import BatchSettings from '@/components/common/basic/batch-settings/batch-settings'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import type { CameraViewType, CreateComponentType, InteractiveForm } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { createUuid, getActiveMenu, getComponentByType } from '@/utils'
import styles from './dropdown.module.less'
import { getNowEnterprise, getToken } from '@/utils/auth'
interface NodeFormType {
  nodeName: string; icon: object | null;
}
export default defineComponent({
  name: 'dropdown',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const uploading = ref(false)
    const dialog = useDialog()
    const visibleNodeModal = ref(false)
    const fileList = ref<UploadFileInfo[]>()
    const message = useMessage()
    let selectId = ''
    const dropDownComp = ref<CreateComponentType | null >()
    const nodeForm = ref<NodeFormType>({ nodeName: '', icon: null })
    const getCompData = (): void => {
      dropDownComp.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.DROPDOWN)
    }
    watch(() => chartEditStore.active.pageId, () => {
      getCompData()
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      getCompData()
    }, { immediate: true, deep: true })
    // 操作节点=======================================================================================================
    let status = ''
    // 新增节点(打开弹窗)
    const handleAddComponent = (): void => {
      nodeForm.value = { nodeName: '', icon: null }
      visibleNodeModal.value = true
      status = 'add'
      fileList.value = []
    }
    // 编辑节点(打开弹窗)
    const handleEditNode = (option: CreateComponentType): void => {
      nodeForm.value.nodeName = option?.title
      nodeForm.value.icon = option?.config.icon ?? null
      selectId = option.id
      status = 'edit'
      visibleNodeModal.value = true
      const curComp = dropDownComp.value?.components?.find(item => item.id === selectId)
      if (curComp?.config.icon) {
        fileList.value = []
        fileList.value[0] = curComp.config.icon
        nodeForm.value.icon = curComp.config.icon
      } else {
        fileList.value = undefined
        nodeForm.value.icon = null
      }
    }
    // 删除节点
    const handleDeleteNode = (option: CreateComponentType): void => {
      selectId = option.id
      if (dropDownComp.value?.components?.length && dropDownComp.value?.components?.length <= 1) {
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
          dropDownComp.value?.components?.forEach((item, index) => {
            if (item.id === option.id) {
              dropDownComp.value?.components?.splice(index, 1)
            }
          })
        }
      })
      if (dropDownComp.value)chartEditStore.sycShareData(dropDownComp.value.components!)
    }
    // 保存节点
    const handleSaveNode = async (): Promise<boolean> => {
      const validate = await nodeFormRef.value.validate()
      if (validate) return false
      if (uploading.value) return false
      if (status === 'edit') {
        dropDownComp.value?.components?.forEach(item => {
          if (item.id === selectId) {
            item.title = nodeForm.value.nodeName
            item.config.icon = nodeForm.value.icon ?? null
          }
        })
      } else {
        dropDownComp.value?.components?.push({
          id: createUuid(),
          category: ComponentCategoryEnum.DROPDOWN,
          categoryName: '下拉菜单',
          key: 'nav-item',
          title: nodeForm.value.nodeName,
          config: {
            icon: nodeForm.value.icon
          },
          interactive: [],
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
      nodeForm.value = { nodeName: '', icon: null }
      if (dropDownComp.value)chartEditStore.sycShareData(dropDownComp.value.components!)
      return true
    }
    // 操作DOM
    const renderSuffix = (option: CreateComponentType): VNode => {
      return (
        <div>
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
    // 图片上传======================================================================================================
    // 验证图片
    const beforeUpload = (options: { file: UploadFileInfo; fileList: UploadFileInfo[]; }): boolean => {
      let isLt2M = true
      if (options.file.file?.size) {
        isLt2M = options.file.file?.size / 1024 / 1024 < 2
        if (!isLt2M) {
          message.error('上传图片不能超过2M')
        }
      }
      uploading.value = true
      return isLt2M
    }
    // 新增图片
    const onFinish = (options: { file: UploadFileInfo; event?: ProgressEvent; }): void => {
      const { data } = JSON.parse(options.event?.target?.response)
      nodeForm.value.icon = {
        batchId: options.file.batchId ?? null,
        file: options.file.file ?? null,
        fullPath: options.file.fullPath ?? null,
        percentage: options.file.percentage ?? null,
        thumbnailUrl: options.file.thumbnailUrl ?? null,
        type: options.file.type ?? null,
        id: options.file.id,
        name: options.file.name,
        url: data.path,
        status: options.file.status
      }
      if (dropDownComp.value?.config)dropDownComp.value.config.icon = nodeForm.value.icon
      uploading.value = false
    }
    // 删除图片
    const onRemove = (): boolean => {
      nodeForm.value.icon = null
      return true
    }
    // 节点操作表单=====================================================================================================
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
          <FormItem label='节点图标' label-placement='left'>
            <Upload
              v-model:file-list={fileList.value}
              listType='image-card'
              accept='.png,.jpg,.jpeg'
              action='/api/file/file'
              multiple={false}
              show-preview-button={false}
              max={1}
              on-before-upload={beforeUpload}
              on-finish={onFinish}
              on-remove={onRemove}
              data={{ tenant: getNowEnterprise().code, businessKey: 'maintain', applicationCode: 'VISUALCONFIG' }}
              headers={{
                Authorization: `Bearer ${getToken().accessToken}`,
                terminal: window.config?.terminal,
                tenant: getNowEnterprise().code,
              }}
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
      targetObject: CameraViewType | string | number;
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
        <div class={styles.dropdown}>
          <div class={styles['add-node']}><Button size='small' onClick={handleAddComponent}><Icon><Add /></Icon>新增节点</Button> <a onClick={batchSettingInterActive} style={{ marginRight: '5px' }}>批量设置</a></div>
          <List>
            {
            dropDownComp.value?.components?.map(item =>
              <ListItem key={item.id} suffix={renderSuffix(item)}>{item.title}</ListItem>)
          }
          </List>
          <Modal v-model:show={visibleNodeModal.value} positiveText='确认' preset='dialog' negativeText='取消' title='设置节点' showIcon={false} onPositiveClick={handleSaveNode}>
            {modalForm}
          </Modal>
          <Modal style={{ width: '700px' }} v-model:show={visibleBatchSetting.value} positiveText='确认' preset='dialog' negativeText='取消' title='批量设置交互' showIcon={false} onClose={handleClose} onNegativeClick={handleClose} onPositiveClick={handleSaveBatchSetting}>
            {visibleBatchSetting.value ? <BatchSettings itemTreeData={dropDownComp.value?.components ?? []} onBatchSettingFormList={handleBatchSettingFormList} onInteractiveList={handleInteractiveList} /> : null}
          </Modal>
        </div>
      )
    }
  },
})
