import { defineComponent, ref, onUpdated, watch, nextTick, type VNode } from 'vue'
import { Form, FormItem, Select, useDialog, TreeSelect, Input, type SelectBaseOption, type UploadFileInfo } from '@ghcloud/visual-view-ui'
import { type InteractiveForm, type CreateComponentType, type ModelNavType, type CameraViewType, ComponentCategoryEnum, type TdModelNavType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { createUuid, getComponentListByType } from '@/utils'
import styles from './menu.module.less'
import UeClient from '@/static/model/ue-client'
import { iconTagOption, weatherOption } from '@/components/common/basic/batch-settings/option-list'
import _ from 'lodash'
interface NavMenuType {
  id: string; name: string; type: string; isActor: boolean;
}
export default defineComponent({
  name: 'action-item',
  props: {
    interactive: {
      type: Object,
      default: () => { }
    },
    index: {
      type: Number,
      default: 1
    }
  },
  setup: (props) => {
    const dialog = useDialog()
    const chartEditStore = useChartEditStore()
    const formValue = ref<InteractiveForm>({
      type: '',
      objectType: '',
      action: '',
      weather: [],
      imgUrl: '',
      target: '',
      labelType: '',
      id: createUuid(),
      menuId: createUuid(),
      actorName: '',
      directory: '',
      imgComp: [],
      cameraView: {}
    })
    const ueClient = UeClient.getInstance()
    formValue.value = props.interactive as InteractiveForm
    const typeOptions = [{ label: '点击', value: 'click' }]
    const tdConfigOption = chartEditStore.getCurrentPage?.components?.find(x => x.category === ComponentCategoryEnum.TDCONFIGURATION)?.config.nav
    const objectTypeOptions = [
      { label: 'UE5模型', value: 'UE5' },
      { label: '组件', value: 'component' },
      { label: '二维组态模型', value: 'tdModel' }
    ]
    const labelTypeOption = ref<{ label: string; value: string; }[]>([])
    const actionOptions = ref<{ label: string; action: string; }[]>([
      { label: '聚焦模型', action: 'switchModel' },
      { label: '切换视角', action: 'changeCamera' },
      { label: '添加标签', action: 'addTag' },
      { label: '隐藏标签', action: 'hiddenTag' },
      { label: '模型透视', action: 'ModelPerspective' },
      { label: '切换天气', action: 'switchWeather' }])
    const switchModelOption = ref<ModelNavType[] | null>()
    const firstModelOption = ref<ModelNavType[] | null>()
    const switchComponentOption = ref<CreateComponentType[]>([])
    const switchImgComponentOption = ref<CreateComponentType[] | null>([])
    const switchImageOption = ref<UploadFileInfo[]>([])
    const getImgList = (): void => {
      const comp = chartEditStore.getCurrentPageComponents.find(x => x.category === ComponentCategoryEnum.IMAGE) ?? null
      const imgComponent = getComponentListByType(chartEditStore.getCurrentPageComponents, comp, comp?.key ?? '')
      switchImgComponentOption.value = imgComponent
      if (imgComponent && imgComponent?.length > 0) {
        let imgList: UploadFileInfo[] = []
        imgComponent.forEach(img => {
          imgList = imgList.concat(img.config.imgList)
        })
      }
    }
    getImgList()
    const switchModeLoading = ref(true)
    // 删除交互
    const deleteInterActive = (): void => {
      dialog.warning({
        title: '提示',
        content: '你是否确定删除交互？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          chartEditStore.deleteInteractive(props.interactive as InteractiveForm)
        }
      })
    }
    onUpdated(() => {
      formValue.value = props.interactive as InteractiveForm
    })
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        // 执行动作回显
        switch (formValue.value.objectType!) {
          case 'UE5':
            actionOptions.value = [
              { label: '聚焦模型', action: 'switchModel' },
              { label: '切换视角', action: 'changeCamera' },
              { label: '添加标签', action: 'addTag' },
              { label: '隐藏标签', action: 'hiddenTag' },
              { label: '模型透视', action: 'ModelPerspective' },
              { label: '切换天气', action: 'switchWeather' }]
            break
          case 'component':
            actionOptions.value = [
              { label: '显示组件', action: 'showComponent' },
              { label: '隐藏组件', action: 'hiddenComponent' },
              { label: '切换图片', action: 'switchImage' }
            ]
            break
          case 'tdModel':
            actionOptions.value = [{ label: '切换展示', action: 'switchTdModel' }]
            break
        }
        // 图片下拉回显
        const curImg = switchImgComponentOption.value?.find(x => x.id === formValue.value.imgComp)
        switchImageOption.value = curImg?.config.imgList
      })
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getCurrentPage, () => {
      // 获取组件下拉
      switchComponentOption.value = chartEditStore.getCurrentPageComponents
      // 获取聚焦模型下拉
      switchModelOption.value = chartEditStore.getCurrentPage?.modelNav
      // 获取透视模型下拉
      firstModelOption.value = _.cloneDeep(chartEditStore.getCurrentPage?.modelNav)?.map(item => {
        delete item.children
        return item
      }) ?? null
      if ((switchModelOption.value && switchModelOption.value?.length > 0) ?? (!switchModelOption.value))switchModeLoading.value = false
      if (switchModelOption.value && switchModelOption.value?.length > 0) {
        labelTypeOption.value = [{ label: '文字标签', value: 'textTag' }, { label: '设备图标', value: 'iconTag' }]
      }
    }, { immediate: true, deep: true })
    // 选择对象
    const updateObjectType = (val: string): void => {
      formValue.value.objectType = val
      switch (val) {
        case 'UE5':
          actionOptions.value = [
            { label: '聚焦模型', action: 'switchModel' },
            { label: '切换视角', action: 'changeCamera' },
            { label: '添加标签', action: 'addTag' },
            { label: '隐藏标签', action: 'hiddenTag' },
            { label: '模型透视', action: 'ModelPerspective' },
            { label: '切换天气', action: 'switchWeather' }]
          formValue.value.action = 'switchModel'
          break
        case 'component':
          actionOptions.value = [
            { label: '显示组件', action: 'showComponent' },
            { label: '隐藏组件', action: 'hiddenComponent' },
            { label: '切换图片', action: 'switchImage' }
          ]
          formValue.value.action = 'showComponent'
          formValue.value.target = ''
          break
        case 'tdModel':
          actionOptions.value = [{ label: '切换展示', action: 'switchTdModel' }]
          formValue.value.action = 'switchTdModel'
          break
      }
    }
    // 执行动作
    const updateAction = (val: string): void => {
      formValue.value.action = val
      formValue.value.target = null
    }
    // 触发事件
    const updateType = (val: string): void => {
      formValue.value.type = val
    }
    // 选择模型
    const updateModelTarget = (val: { value: string; option: ModelNavType; }): void => {
      formValue.value.target = val.value
      if (val.option.parentId === '') {
        formValue.value.actorName = val.option.name
      } else {
        const parentName = switchModelOption?.value?.find(x => x.id === val.option.parentId)?.name ?? ''
        formValue.value.actorName = parentName + '_' + val.option.name
      }
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
      formValue.value.actorName = []
      formValue.value.actorIds = []
      formValue.value.target = val
      option.forEach(item => {
        (formValue.value.actorName as string[])?.push(item.name)
      })
      // 获取actorId
      const list: string | string[] = []
      formValue.value.actorName.forEach(async item => {
        const actor = await getActorId(item as string)
        list.push(actor)
        formValue.value.actorIds = list
      })
    }
    // 选择切换二维组态目录
    const updateTdModelTarget = (val: { value: string;option: TdModelNavType; }): void => {
      formValue.value.target = val.value
      formValue.value.directory = val.option.directory
    }
    // 获取视角参数
    const handleCameraParams = (): void => {
      ueClient.send('getCameraView', function (cameraView: CameraViewType) {
        formValue.value.cameraView = cameraView
      })
    }
    // 选择组件目标
    const updateComponentTarget = (val: string): void => {
      formValue.value.target = val
    }
    // 选择图片组件
    const updateImgComponentTarget = (val: string, option: CreateComponentType): void => {
      switchImageOption.value = option.config.imgList
      formValue.value.imgComp = val
    }
    // 选择切换图片
    const updateImageTarget = (val: string, option: UploadFileInfo): void => {
      formValue.value.target = option.id ?? null
      formValue.value.imgUrl = option.url ?? null
    }
    // 选择天气
    const updateWeather = (val: string, option: SelectBaseOption | null | SelectBaseOption[]): void => {
      formValue.value.target = option.value
      formValue.value.weather = option.weatherCode
    }
    // 选择透明度
    const changeOpacity = (val: boolean): void => {
      formValue.value.opacity = val
    }
    const cameraDom = (): VNode =>
      <div>
        <a v-model:value={formValue.value.cameraView} onClick={handleCameraParams}>{formValue.value.cameraView ? '重新获取当前视角' : '获取当前视角'}</a>
        <div v-show={formValue.value.cameraView}>
          <p>{`相机位置: x:${formValue.value.cameraView?.location?.x} y:${formValue.value.cameraView?.location?.y} z:${formValue.value.cameraView?.location?.z} `}</p>
          <p>{`相机角度: pitch:${formValue.value.cameraView?.rotation?.pitch} roll:${formValue.value.cameraView?.rotation?.roll}`}</p>
        </div>
      </div>
    const targetAction = (): VNode => {
      switch (formValue.value.action ?? '') {
        // 切换视角
        case 'changeCamera':
          node = (
            <FormItem
              label={formValue.value.cameraView ? '默认视角' : '视角参数'}
              path='action' label-placement='left'
            >{cameraDom}
            </FormItem>
          )
          break
          // 聚焦模型
        case 'switchModel' :
          node = (
            <FormItem label='选择目标' path='target' label-placement='left'>
              <TreeSelect
                loading={switchModeLoading.value}
                options={switchModelOption.value}
                value={formValue.value.target}
                virtual-scroll
                label-field='name'
                key-field='id'
                onUpdateValue={updateModelTarget}
              />
            </FormItem>
          )
          break
          // 模型透视
        case 'ModelPerspective':
          node = (
            <div>
              <FormItem label='目标模型' path='target' label-placement='left'>
                <Select
                  options={firstModelOption.value}
                  value={formValue.value.target}
                  virtual-scroll
                  label-field='name'
                  value-field='id'
                  multiple
                  onChange={changeModelPerspective}
                />
              </FormItem>
              <FormItem label='透明度' path='opacity' label-placement='left'>
                <Select
                  options={[{ label: '半透明', value: true }, { label: '不透明', value: false }]}
                  v-model:value={formValue.value.opacity}
                  onChange={changeOpacity}
                />
              </FormItem>
            </div>
          )
          break
          // 添加标签
        case 'addTag':
          node = tagNode()
          break
          // 隐藏标签
        case 'hiddenTag':
          node = tagNode()
          break
        // 切换天气
        case 'switchWeather':
          node = (
            <FormItem label='切换天气' path='target' label-placement='left'>
              <Select
                placeholder='请选择天气'
                value={formValue.value.target}
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
            <FormItem label='模型目录' label-placement='left'>
              <TreeSelect
                options={tdConfigOption}
                value={formValue.value.target}
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
            <div>
              <FormItem label='选择组件' path='target' label-placement='left'>
                <Select
                  v-model:value={formValue.value.imgComp}
                  placeholder='请选择组件'
                  label-field='title'
                  value-field='id'
                  options={switchImgComponentOption.value}
                  onUpdateValue={updateImgComponentTarget}
                />
              </FormItem>
              <FormItem label='选择图片' path='imgUrl' label-placement='left'>
                <Select
                  v-model:value={formValue.value.target}
                  label-field='name'
                  value-field='id'
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
            <FormItem label='选择目标' path='target' label-placement='left'>
              <Select
                v-model:value={formValue.value.target}
                multiple
                label-field='title'
                value-field='id'
                options={switchComponentOption.value}
                onUpdateValue={updateComponentTarget}
              />
            </FormItem>
          )
          break
      }
      return node
    }
    const tagNode = (): VNode =>
      (
        <div>
          <FormItem label='目标模型' path='target' label-placement='left'>
            <TreeSelect
              options={switchModelOption.value}
              value={formValue.value.target}
              virtual-scroll label-field='name'
              key-field='id'
              onUpdateValue={updateModelTarget}
            />
          </FormItem>
          <FormItem label='选择标签' path='labelType' label-placement='left'>
            <Select
              placeholder='请选择标签'
              options={labelTypeOption.value}
              value={formValue.value.labelType}
              onUpdateValue={(val): void => { formValue.value.labelType = val; formValue.value.tag = '' }}
              virtual-scroll
            />
          </FormItem>
          <FormItem label='选择图标' path='tag' label-placement='left'>
            {formValue.value.labelType === 'textTag'
              ? <Input placeholder='请输入标签' value={formValue.value.tag ?? ''} onUpdate:value={(val): void => { formValue.value.tag = val }} />
              : <Select
                  placeholder='请选择标签'
                  options={iconTagOption}
                  value={formValue.value.tag}
                  onUpdateValue={(val): void => { formValue.value.tag = val }}
                />}
          </FormItem>
        </div>
      )
    // 交互表单
    const actionForm = (): VNode =>
      <div>
        <Form model={formValue.value}>
          <FormItem label='触发事件' path='type' label-placement='left'>
            <Select v-model:value={formValue.value.type} options={typeOptions} onUpdateValue={updateType} />
          </FormItem>
          <FormItem label='选择对象' path='type' label-placement='left'>
            <Select v-model:value={formValue.value.objectType} options={objectTypeOptions} onUpdateValue={updateObjectType} />
          </FormItem>
          <FormItem label='执行动作' path='action' label-placement='left'>
            <Select v-model:value={formValue.value.action} value-field='action' options={actionOptions.value} onUpdateValue={updateAction} />
          </FormItem>
          {targetAction()}
        </Form>
      </div>
    let node: VNode
    return () => (
      <div style={{ margin: '10px' }}>
        <div class={styles['menu-action-title']}>
          <span>交互{props.index}</span>
          <div>
            <a onClick={deleteInterActive}>删除</a>
          </div>
        </div>
        {actionForm()}
      </div>
    )
  },
})
