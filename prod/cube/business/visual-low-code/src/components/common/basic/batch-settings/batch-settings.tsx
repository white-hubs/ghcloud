import { defineComponent, ref, type PropType, watch, type VNode } from 'vue'
import { Form, FormItem, Icon, NTd, NTh, NTr, Reload, Select, Table, TreeSelect, type SelectBaseOption, type UploadFileInfo } from '@ghcloud/visual-view-ui'
import styles from './batch-settings.module.less'
import { ComponentCategoryEnum, type CameraViewType, type CreateComponentType, type InteractiveForm, type ModelNavType, type TdModelNavType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import UeClient from '@/static/model/ue-client'
import _ from 'lodash'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import InputNumber from '@ghcloud/visual-view-ui/src/components/input-number/input-number'
import Input from '@ghcloud/visual-view-ui/src/components/input/input'
import { iconTagOption, weatherOption } from './option-list'
import { createUuid, getComponentListByType, parentArray } from '@/utils'
interface InteractiveItemType {
  id: string | number;
  navItem: string;
  targetType: string;
  targetObject: CameraViewType | string | number | string[] | number[];
}
interface NavMenuType {
  id: string; name: string; type: string; isActor: boolean;
}
export default defineComponent({
  name: '',
  props: {
    itemTreeData: {
      type: Array as PropType<CreateComponentType[]>,
      default: () => []
    }
  },
  emits: ['batchSettingFormList', 'interactiveList'],
  setup (props, { emit }) {
    const chartEditStore = useChartEditStore()
    const ueClient = UeClient.getInstance()
    const batchSettingForm = ref<InteractiveForm>({
      type: 'click',
      objectType: 'component',
      action: 'showComponent',
      weather: [],
      imgComp: [],
      imgUrl: '',
      navItem: '',
      labelType: '',
      target: [],
      id: '',
      directory: '',
      menuId: '',
      actorName: '',
      opacity: false,
      cameraView: {}
    })
    const actionOptions = ref<{ label: string; action: string; }[]>([
      { label: '显示组件', action: 'showComponent' },
      { label: '隐藏组件', action: 'hiddenComponent' },
      { label: '切换图片', action: 'switchImage' }
    ])
    const typeOptions = [{ label: '点击', value: 'click' }]
    const switchModelOption = ref<ModelNavType[] | null>()
    const firstModelOption = ref<ModelNavType[] | null>()
    const switchImageOption = ref<UploadFileInfo[]>([])
    const objectTypeOptions = [
      { label: 'UE5模型', value: 'UE5' },
      { label: '组件', value: 'component' },
      { label: '二维组态模型', value: 'tdModel' },
    ]
    const labelTypeOption = ref<{ label: string; value: string; }[]>([])
    const tdConfigOption = chartEditStore.getCurrentPage?.components?.find(x => x.category === ComponentCategoryEnum.TDCONFIGURATION)?.config.nav
    const interactiveItem = ref<InteractiveItemType>({ navItem: '', targetType: '', targetObject: '', id: '' })
    const interactiveList = ref<InteractiveItemType[]>([])
    const menuTreeData = ref<CreateComponentType[] >([])
    const actionTitle = ref('')
    const switchComponentOption = ref<CreateComponentType[]>([])
    const switchImgComponentOption = ref<CreateComponentType[] | null>([])
    // 获取图片组件
    const getImgList = (): void => {
      const comp = chartEditStore.getCurrentPageComponents.find(x => x.category === ComponentCategoryEnum.IMAGE) ?? null
      const imgComponent = getComponentListByType(chartEditStore.getCurrentPageComponents, comp, comp?.key ?? '')?.filter(x => !x.config.rotationSettings)
      switchImgComponentOption.value = imgComponent ?? null
      if (imgComponent && imgComponent?.length > 0) {
        let imgList: UploadFileInfo[] = []
        imgComponent.forEach(img => {
          imgList = imgList.concat(img.config.imgList)
        })
      }
    }
    getImgList()
    watch(() => chartEditStore.active.targetId, () => {
      // menuTreeData.value = props.itemTreeData
    })
    // 获取菜单项下拉
    menuTreeData.value = props.itemTreeData
    // 获取组件下拉
    switchComponentOption.value = chartEditStore.getCurrentPageComponents
    // 获取聚焦模型下拉
    switchModelOption.value = chartEditStore.getCurrentPage?.modelNav
    firstModelOption.value = _.cloneDeep(chartEditStore.getCurrentPage?.modelNav)?.map(item => {
      delete item.children
      return item
    }) ?? null
    // 触发事件
    const updateType = (val: string): void => {
      batchSettingForm.value.type = val
    }
    // 选择对象
    const updateObjectType = (val: string): void => {
      batchSettingForm.value.objectType = val
      switch (val) {
        case 'UE5':
          actionOptions.value = [
            { label: '聚焦模型', action: 'switchModel' },
            { label: '切换视角', action: 'changeCamera' },
            { label: '添加标签', action: 'addTag' },
            { label: '隐藏标签', action: 'hiddenTag' },
            { label: '模型透视', action: 'ModelPerspective' },
            { label: '切换天气', action: 'switchWeather' },
          ]
          if (switchModelOption.value && switchModelOption.value?.length > 0) {
            labelTypeOption.value = [{ label: '文字标签', value: 'textTag' }, { label: '设备图标', value: 'iconTag' }]
            batchSettingForm.value.labelType = 'iconTag'
          }
          batchSettingForm.value.action = 'switchModel'
          actionTitle.value = '聚焦模型'
          batchSettingForm.value.target = ''
          break
        case 'tdModel':
          actionOptions.value = [{ label: '切换展示', action: 'switchTdModel' }]
          batchSettingForm.value.action = 'switchTdModel'
          actionTitle.value = '切换展示'
          batchSettingForm.value.target = []
          break
        default :
          actionOptions.value = [{ label: '显示组件', action: 'showComponent' }, { label: '隐藏组件', action: 'hiddenComponent' }, { label: '切换图片', action: 'switchImage' }]
          batchSettingForm.value.action = 'showComponent'
          actionTitle.value = '显示组件'
          batchSettingForm.value.target = ''
          break
      }
      interactiveItem.value.targetObject = ''
    }
    // 执行动作
    const updateAction = (value: string, option: { label: string; }): void => {
      actionTitle.value = option.label
      batchSettingForm.value.action = value
      if (batchSettingForm.value.objectType === 'UE5') {
        interactiveItem.value.targetObject = ''
        batchSettingForm.value.target = ''
      }
    }
    // 选择菜单项
    const updateNavItem = (val: { value: string; option: { id: string; title: string; }; }): void => {
      batchSettingForm.value.navItem = val.option.id
      interactiveItem.value.navItem = val.option.title ?? ''
    }

    const handleFloorHeight = (val: number): void => {
      batchSettingForm.value.floorHeight = val
    }
    // 获取视角参数
    const handleCameraParams = (): void => {
      ueClient.send('getCameraView', function (cameraView: CameraViewType) {
        batchSettingForm.value.cameraView = cameraView
        if (cameraView) {
          interactiveItem.value.targetObject = `相机位置: x:${cameraView.location?.x} y:${cameraView.location?.y} z:${cameraView.location?.z} 相机角度: pitch:${cameraView.rotation?.pitch} roll:${cameraView.rotation?.roll}`
        }
      })
    }
    // 选择聚焦模型
    const updateModelTarget = (val: { value: string; option: ModelNavType; }): void => {
      batchSettingForm.value.target = val.value
      if (val.option.parentId === '') {
        batchSettingForm.value.actorName = val.option.name
      } else {
        const parentName = switchModelOption?.value?.find(x => x.id === val.option.parentId)?.name ?? ''
        batchSettingForm.value.actorName = parentName + '_' + val.option.name
      }
      interactiveItem.value.targetObject = batchSettingForm.value.actorName
    }
    // 获取actorId
    const getActorId = async (actorName: string): Promise<string> => {
      const menuNameList = actorName.split('_')
      return new Promise((resolve, reject) => {
        if (menuNameList.length === 1) {
          // 一级聚焦
          ueClient.send('getBuildingByName', { name: menuNameList[0] }, function (data: { actorId: string; }) {
            resolve(data.actorId)
            reject(data.actorId)
          })
        } else {
          // 二级聚焦
          ueClient.send('getBimtree', { id: '' }, function (children: NavMenuType[]) {
            // 获取对应的父层
            const fatherNav = children.find((x: { name: string; }) => x.name === menuNameList[0])
            // 根据父层的id获取子层
            ueClient.send('getBimtree', { id: fatherNav?.id }, function (child: NavMenuType[]) {
              // 当前子层
              const currentNav = child.find((x: { name: string; }) => x.name === menuNameList[1])
              resolve(currentNav?.id ?? '')
              reject(currentNav?.id ?? '')
            })
          })
        }
      })
    }
    // 选择透视模型
    const changeModelPerspective = (val: string[], option: ModelNavType[]): void => {
      batchSettingForm.value.actorName = []
      batchSettingForm.value.actorIds = []
      batchSettingForm.value.target = val
      option.forEach(item => {
        (batchSettingForm.value.actorName as string[])?.push(item.name)
      })
      interactiveItem.value.targetObject = batchSettingForm.value.actorName
      // 获取actorId
      const list: string | string[] = []
      batchSettingForm.value.actorName.forEach(async item => {
        const actor = await getActorId(item as string)
        list.push(actor)
        batchSettingForm.value.actorIds = list
      })
    }
    // 选择切换二维组态目录
    const updateTdModelTarget = (val: { value: string;option: TdModelNavType; }): void => {
      batchSettingForm.value.target = val.value
      batchSettingForm.value.directory = val.option.directory
      interactiveItem.value.targetObject = val.option.name
    }
    // 选择组件目标
    const updateComponentTarget = (val: string, option: CreateComponentType[]): void => {
      const name: string[] = []
      option.forEach(item => {
        name.push(item.title)
      })
      interactiveItem.value.targetObject = name.join(',')
      batchSettingForm.value.target = val
    }
    // 选择图片组件
    const updateImgComponentTarget = (val: string, option: CreateComponentType): void => {
      batchSettingForm.value.imgComp = val
      batchSettingForm.value.target = null
      switchImageOption.value = option.config.imgList
    }
    // 选择切换图片
    const updateImageTarget = (val: string, option: UploadFileInfo): void => {
      interactiveItem.value.targetObject = option.name
      batchSettingForm.value.target = option.id ?? null
      batchSettingForm.value.imgUrl = option.url ?? null
    }
    // 选择天气
    const updateWeather = (val: string, option: SelectBaseOption | null | SelectBaseOption[]): void => {
      interactiveItem.value.targetObject = option.label
      batchSettingForm.value.target = option.value
      batchSettingForm.value.weather = option.weatherCode
    }
    // 选择透明度
    const changeOpacity = (val: boolean): void => {
      batchSettingForm.value.opacity = val
    }
    // 增加交互项
    const batchSettingFormList = ref<InteractiveForm[]>([])
    const addInteractive = (): void => {
      batchSettingForm.value.id = createUuid()
      batchSettingForm.value.menuId = createUuid()
      const targetType = actionOptions.value.find(x => x.action === batchSettingForm.value.action)?.label ?? ''
      interactiveItem.value.targetType = _.cloneDeep(targetType)
      const targetObject = _.cloneDeep(interactiveItem.value.targetObject)
      const item = _.cloneDeep(interactiveItem.value)
      item.id = batchSettingForm.value.id
      if (item.targetObject && (batchSettingForm.value.action === 'addTag' || batchSettingForm.value.action === 'hiddenTag')) {
        if (batchSettingForm.value.labelType === 'textTag') {
          item.targetObject = `${targetObject}-文字标签-${batchSettingForm.value.tag}`
        } else {
          const label = iconTagOption.find(x => x.value === Number(batchSettingForm.value.tag))?.label ?? ''
          item.targetObject = `${targetObject}-设备图标-${label}`
        }
      }
      const batchItem = _.cloneDeep(batchSettingForm.value)
      if (interactiveItem.value.navItem && interactiveItem.value.targetObject) {
        interactiveList.value.push(item)
        batchSettingFormList.value.push(batchItem)
        emit('interactiveList', interactiveList.value)
        emit('batchSettingFormList', batchSettingFormList.value)
      }
    }
    // 增加切换视角的交互项
    const addCameraInterActive = (): void => {
      const location: { x: number; y: number; z: number; } | undefined = batchSettingForm.value?.cameraView?.location
      const rotation = batchSettingForm.value?.cameraView?.rotation
      const brotherList = parentArray(props.itemTreeData, batchSettingForm.value.navItem!)
      const itemTreeData = brotherList?.filter(x => !x.components || x.components.length === 0) ?? []
      const curI = itemTreeData.findIndex((x) => x.id === batchSettingForm.value.navItem)
      const curList = itemTreeData.slice(curI, itemTreeData.length)
      if (location && interactiveItem.value.navItem && interactiveItem.value.targetObject && batchSettingForm.value.floorHeight) {
        curList.forEach((item, index) => {
          const step = index * (batchSettingForm.value.floorHeight ?? 0)
          const zPosition = location.z - step
          const targetObject = `相机位置: x:${location?.x} y:${location?.y} z:${zPosition} 相机角度: pitch:${rotation?.pitch} roll:${rotation?.roll}`
          const targetType = actionOptions.value.find(x => x.action === batchSettingForm.value.action)?.label ?? ''
          batchSettingForm.value.id = createUuid()
          batchSettingForm.value.menuId = createUuid()
          interactiveList.value.push({ navItem: item.title, targetObject, targetType, id: batchSettingForm.value.id })
          const batchItem = _.cloneDeep(batchSettingForm.value)
          if (batchItem.cameraView?.location) {
            batchItem.cameraView.location.z = zPosition
            batchItem.navItem = item.id
          }
          batchSettingFormList.value.push(batchItem)
        })
        emit('interactiveList', interactiveList.value)
        emit('batchSettingFormList', batchSettingFormList.value)
      }
    }
    // 删除交互
    const handleDelete = (val: InteractiveItemType): void => {
      const delIndex = interactiveList.value.findIndex(x => x.id === val.id)
      interactiveList.value.splice(delIndex, 1)
      batchSettingFormList.value.splice(delIndex, 1)
    }
    // 表格form=================================================================================================
    const tableSlots = {
      thead: () => {
        return (
          <NTr>
            <NTh>菜单项名称</NTh>
            <NTh>操作类型</NTh>
            <NTh>目标对象</NTh>
            <NTh>操作</NTh>
          </NTr>
        )
      },
      tbody: () => {
        return (
          <>
            {
          interactiveList.value.map(item => {
            return (
              <NTr key={item.navItem}>
                <NTd>{item.navItem}</NTd>
                <NTd>{item.targetType}</NTd>
                <NTd><p style={{ margin: '0' }}>{item.targetObject}</p></NTd>
                <NTd><a onClick={() => { handleDelete(item) }}>删除</a></NTd>
              </NTr>
            )
          })
        }
          </>
        )
      },
    }
    let node: VNode
    // 目标操作
    const targetAction = (): VNode => {
      switch (batchSettingForm.value.action ?? '') {
        // 切换视角
        case 'changeCamera':
          node = (
            <FormItem class={styles.item} path='action' label-placement='left'>
              <a v-model:value={batchSettingForm.value.cameraView} onClick={handleCameraParams}>获取当前视角</a>
            </FormItem>
          )
          break
        // 聚焦模型
        case 'switchModel':
          node = (
            <FormItem class={styles.item} path='target' label-placement='left'>
              <TreeSelect
                options={switchModelOption.value}
                value={batchSettingForm.value.target}
                virtual-scroll label-field='name'
                key-field='id'
                onUpdateValue={updateModelTarget}
              />
            </FormItem>
          )
          break
          // 模型透视
        case 'ModelPerspective':
          node = (
            <div style={{ display: 'flex', width: '50%' }}>
              <FormItem class={styles.item} path='target' label-placement='left'>
                <Select
                  options={firstModelOption.value}
                  value={batchSettingForm.value.target}
                  virtual-scroll
                  label-field='name'
                  value-field='id'
                  multiple
                  onChange={changeModelPerspective}
                />
              </FormItem>
              <FormItem class={styles.item} path='opacity' label-placement='left'>
                <Select
                  options={[{ label: '半透明', value: true }, { label: '不透明', value: false }]}
                  v-model:value={batchSettingForm.value.opacity}
                  onChange={changeOpacity}
                />
              </FormItem>
            </div>
          )
          break
          // 添加标签
        case 'addTag':
          node = tagDom()
          break
          // 隐藏标签
        case 'hiddenTag':
          node = tagDom()
          break
        // 切换天气
        case 'switchWeather':
          node = (
            <FormItem style={{ flex: 1 }} path='target' label-placement='left'>
              <Select
                placeholder='请选择天气'
                options={weatherOption}
                onUpdateValue={updateWeather}
                virtual-scroll
              />
            </FormItem>
          )
          break
        // 切换二维组态
        case 'switchTdModel':
          node = (
            <FormItem class={styles.item} label-placement='left'>
              <TreeSelect
                options={tdConfigOption}
                value={batchSettingForm.value.target}
                virtual-scroll
                label-field='name'
                key-field='id'
                onUpdateValue={updateTdModelTarget}
              />
            </FormItem>
          )
          break
        // 切换图片
        case 'switchImage' :
          node = (
            <div style={{ display: 'flex', width: '50%' }}>
              <FormItem style={{ flex: 1 }} path='target' label-placement='left'>
                <Select
                  placeholder='请选择组件'
                  label-field='title'
                  value-field='id'
                  options={switchImgComponentOption.value}
                  onUpdateValue={updateImgComponentTarget}
                />
              </FormItem>
              <FormItem style={{ flex: 1 }} path='imgUrl' label-placement='left'>
                <Select
                  placeholder='请选择图片'
                  label-field='name'
                  value-field='id'
                  v-model:value={batchSettingForm.value.target}
                  options={switchImageOption.value}
                  onUpdateValue={updateImageTarget}
                />
              </FormItem>
            </div>
          )
          break
          // 显示/隐藏组件
        default:
          node = (
            <FormItem class={styles.item} path='target' label-placement='left'>
              <Select
                label-field='title'
                multiple value-field='id'
                options={switchComponentOption.value}
                onUpdateValue={updateComponentTarget}
              />
            </FormItem>
          )
          break
      }
      return node
    }
    const tagDom = (): VNode =>
      (
        <div style={{ display: 'flex', width: '70%' }}>
          <FormItem style={{ flex: 1 }} path='target' label-placement='left'>
            <TreeSelect
              options={switchModelOption.value}
              value={batchSettingForm.value.target}
              virtual-scroll label-field='name'
              key-field='id'
              onUpdateValue={updateModelTarget}
            />
          </FormItem>
          <FormItem style={{ flex: 1 }} path='labelType' label-placement='left'>
            <Select
              placeholder='请选择标签'
              options={labelTypeOption.value}
              value={batchSettingForm.value.labelType}
              onUpdateValue={(val): void => { batchSettingForm.value.labelType = val; batchSettingForm.value.tag = '' }}
              virtual-scroll
            />
          </FormItem>
          <FormItem style={{ flex: 1 }} path='tag' label-placement='left'>
            {batchSettingForm.value.labelType === 'textTag'
              ? <Input placeholder='请输入标签' onUpdate:value={(val): void => { batchSettingForm.value.tag = val }} />
              : <Select
                  placeholder='请选择标签'
                  options={iconTagOption}
                  value={batchSettingForm.value.tag}
                  onUpdateValue={(val): void => { batchSettingForm.value.tag = val }}
                />}
          </FormItem>
        </div>
      )
    return () =>
      <div class={styles['batch-form']}>
        <Form model={batchSettingForm.value}>
          <div class={styles['batch-item']}>
            <FormItem label='触发事件' path='type' label-placement='left' class={styles.item}>
              <Select v-model:value={batchSettingForm.value.type} options={typeOptions} onUpdateValue={updateType} />
            </FormItem>
            <FormItem label='选择对象' path='type' label-placement='left' class={styles.item}>
              <Select v-model:value={batchSettingForm.value.objectType} options={objectTypeOptions} onUpdateValue={updateObjectType} />
            </FormItem>
          </div>
          <div class={styles['batch-item']}>
            <FormItem label='执行动作' path='action' label-placement='left' class={styles.item}>
              <Select v-model:value={batchSettingForm.value.action} value-field='action' options={actionOptions.value} onUpdateValue={updateAction} />
            </FormItem>
            <div class={styles.item} />
          </div>
          <div class={styles['batch-item']}>
            <FormItem label={batchSettingForm.value.action === 'changeCamera' ? '基础视角' : ''} path='navItem' label-placement='left' class={styles.item}>
              <TreeSelect check-strategy='child' placeholder='请选择菜单项' children-field='components' options={menuTreeData.value} value={batchSettingForm.value.navItem} virtual-scroll label-field='title' key-field='id' onUpdateValue={updateNavItem} />
            </FormItem>
            <div class={styles['middle-item']} v-show={batchSettingForm.value.action !== 'addTag' && batchSettingForm.value.action !== 'hiddenTag'}>{actionTitle.value}</div>
            {/* 目标操作  */}
            {targetAction()}
            {/* 添加交互 */}
            <div v-show={batchSettingForm.value.action !== 'changeCamera'} style={{ lineHeight: '34px' }}><a onClick={addInteractive}>添加</a></div>
          </div>
          <div v-show={batchSettingForm.value.action === 'changeCamera'} class={styles['batch-item']}>
            <FormItem label='增量视角' class={styles.item} path='action' label-placement='left'>
              <InputNumber min={0} v-model:value={batchSettingForm.value.floorHeight} onChange={handleFloorHeight} />
            </FormItem><div class={styles.item} />
          </div>
        </Form>
        <a v-show={batchSettingForm.value.action === 'changeCamera'} onClick={addCameraInterActive}><Icon color='#40a9ff'><Reload /></Icon> 更新当前楼栋 每层楼视角</a>
        <Table v-slots={tableSlots} />
      </div>
  }
})
