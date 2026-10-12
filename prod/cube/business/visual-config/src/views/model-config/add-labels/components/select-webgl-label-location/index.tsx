
import { defineComponent, reactive, onBeforeUnmount, type PropType, ref, onMounted, markRaw } from 'vue'
import { Form, FormItem, Modal, Textarea, message, TreeSelect } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { GhyThree } from '@ghcloud/cube-visual-sdk'
import type { ModelConfig as ModelConfigItf } from '../../../model-config-init'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import { treeFindItemById, topRegionId } from '@/utils/common'
interface PerspectiveConfig {
  area: string;
  label: string;
  value?: string;
  camera?: string;
  isDefault?: 'default' | 'custom';
  id?: string;
  buildTagLocation?: string;
  hideActors?: unknown[];
}
export const SelectWebGlLabelConfig = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    showSiblingArea: {
      type: Array as PropType<string[]>,
      default: []
    },
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    },
    config: {
      type: Object as PropType<PerspectiveConfig>,
      default: () => {
        return {
          area: '',
          isDefault: 'default',
          label: '',
          value: '',
          camera: '',
        }
      }
    },
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    let threePluginInstance: GhyThree | null = null
    const areaOptions = ref<GetAreaList[]>([])
    const state = reactive<{
      formData: {
        area: string[];
        value: string;
      };
      modelUrl: string;
      loading: boolean;
    }>({
      formData: {
        area: [],
        value: '',
      },
      modelUrl: '',
      loading: false
    })
    const getModelUrl = (id: string): string => {
      const findModelServer = props.data.three.modelServer.find(item => {
        const areaIds = item.areaList.map(item => item.id)
        return areaIds.includes(id)
      })
      return findModelServer ? findModelServer.url : ''
    }
    const handelSave = (): void => {
      if (!state.formData.value) {
        message.warn('请点击获取标签位置')
        return
      }
      if (!state.formData.area) {
        message.warn('请选择区域')
        return
      }
      emit('save', state.formData)
    }
    const handelCancel = (): void => {
      emit('update:visible', false)
    }
    onBeforeUnmount(() => {
      threePluginInstance?.destroyScene()
    })
    const initThree = async (): Promise< void> => {
      threePluginInstance = new GhyThree({
        elementId: 'three-container',
        enabledMouseControl: true,
        enabledKeyBoardControl: true
      })
      if (!state.modelUrl) {
        message.warn('未获取到区域模型配置')
        return
      }
      state.loading = true
      await threePluginInstance?.initModel(state.modelUrl)
      threePluginInstance.addListenClick((location: THREE.Vector3) => {
        const label = document.createElement('div')
        label.innerHTML = '卡片'
        label.style.padding = '12px'
        threePluginInstance?.clearAllLabel()
        threePluginInstance?.addLabelByLocation(label, location)
        state.formData.value = JSON.stringify({
          x: location.x,
          y: location.y,
          z: location.z
        })
      })
      state.loading = false
    }
    const areaList = async (): Promise<void> => {
      const data = await getAreaList()
      areaOptions.value = [{
        name: '园区',
        children: data,
        id: topRegionId,
        level: 0,
        code: '',
        sequence: '',
        aliasName: data.length === 1 ? data[0].aliasName : '',
        areaManagerId: '',
        areaDepartmentId: '',
        areaManagerIds: [],
        areaManagerName: [],
        visualizationAreaType: ''
      }
      ]
      state.modelUrl = getModelUrl(areaOptions.value[0].id)
      state.formData.area = [JSON.stringify({
        id: areaOptions.value[0].id,
        name: areaOptions.value[0].name,
        aliasName: areaOptions.value[0].aliasName
      })]
      areaValue.value = areaOptions.value[0].id
      initThree()
    }
    let areaName = ''
    let parentNode: GetAreaList | null = null
    const changeThreeModel = async (): Promise<void> => {
      state.loading = true
      await threePluginInstance?.changeModel(state.modelUrl)
      state.loading = false
      if (!parentNode) return
      const showSiblingIndex = parentNode?.children?.findIndex(node => node.aliasName === areaName)
      const showSiblingArea = parentNode?.children?.slice(0, showSiblingIndex + 1)?.map(e => e.aliasName)
      threePluginInstance?.setShowBuilding(showSiblingArea)
    }
    onMounted(() => {
      areaList()
    })
    const areaValue = ref('')
    const handleSelectArea = (value: string, label: string[], node: { triggerNode: { props: { level: number; id: string;name: string;aliasName: string;parentId: string; }; }; }): void => {
      state.modelUrl = getModelUrl(value)
      areaName = node.triggerNode.props.aliasName
      if (node.triggerNode.props.level > 2) {
        const parent = getSuitableArea(node.triggerNode.props.parentId)
        if (!parent) return
        parentNode = parent
        if (node.triggerNode.props.level > 3) {
          const thirdLevel = treeFindItemById(markRaw(areaOptions.value), node.triggerNode.props.parentId)
          areaName = thirdLevel.aliasName
        }
      }
      areaValue.value = value
      state.formData.area = [JSON.stringify({ id: node.triggerNode.props.id, name: node.triggerNode.props.name, aliasName: node.triggerNode.props.aliasName })]
      changeThreeModel()
    }
    const getSuitableArea = (id: string): GetAreaList | undefined => {
      const area = treeFindItemById(markRaw(areaOptions.value), id) as unknown as GetAreaList
      if (area.level !== 2) {
        return getSuitableArea(area.parentId as unknown as string)
      } else {
        return area
      }
    }
    return (): JSX.Element => (
      <Modal
        forceRender
        visible={props.visible}
        okText='保存'
        title={props.title || ''}
        width='1000px'
        onOk={handelSave}
        onCancel={handelCancel}
      >
        <Form model={state.formData} label-col={{ style: { width: '70px' } }} layout='inline'>
          <FormItem label='区域' name='area'>
            <TreeSelect disabled={state.loading} v-model:value={areaValue.value} onChange={handleSelectArea} tree-data={areaOptions.value} style='width: 210px' field-names={{ label: 'name', value: 'id', children: 'children' }} />
          </FormItem>
          <FormItem label='标签坐标' name='value'>
            <Textarea
              v-model:value={state.formData.value}
              placeholder='请点击模型坐标参数'
              showCount={false}
              readonly
              rows={3}
            />
          </FormItem>
        </Form>
        <div class={styles['three-container']} style={{ width: '100%', height: '500px' }} id='three-container' />
      </Modal>
    )
  }
})
