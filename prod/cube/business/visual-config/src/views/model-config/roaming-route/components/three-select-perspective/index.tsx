
import { defineComponent, reactive, onBeforeUnmount, type PropType, ref, onMounted, watch, markRaw } from 'vue'
import { Form, FormItem, Modal, Textarea, TreeSelect, Select, Input, SelectOption, Button, type FormInstance, message } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { GhyThree } from '@ghcloud/cube-visual-sdk'
import type { ModelConfig as ModelConfigItf } from '../../../model-config-init'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import { treeFindItemById, topRegionId } from '@/utils/common'
interface RecordState {
  name: string;area: string;pointName: string; perspective: string;id: string;
}
export const ThreeSelectPerspective = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    },
    initData: {
      type: Object as PropType<RecordState>,
      default: () => {
        return {}
      }
    },
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    let threePluginInstance: GhyThree | null = null
    const formRef = ref<FormInstance>()
    const areaOptions = ref<GetAreaList[]>([])
    const state = reactive<{
      formData: {
        area: string;
        perspective: string;
        name: string;
        pointName: string;
      };
      modelUrl: string;
    }>({
      formData: {
        area: '',
        perspective: '',
        name: '',
        pointName: ''
      },
      modelUrl: ''
    })
    const getModelUrl = (id: string): string => {
      const findModelServer = props.data.three.modelServer.find(item => {
        const areaIds = item.areaList.map(item => item.id)
        return areaIds.includes(id)
      })
      return findModelServer ? findModelServer.url : ''
    }
    const handelSave = async (): Promise<void> => {
      await formRef.value?.validate()
      emit('save', state.formData)
    }
    const handelCancel = (): void => {
      emit('update:visible', false)
    }
    onBeforeUnmount(() => {
      threePluginInstance?.destroyScene()
    })
    const areaValue = ref('')
    watch(() => props.initData, () => {
      state.formData = props.initData
      areaValue.value = props.initData.area ? JSON.parse(props.initData.area).id : ''
      // state.formData = props.initData
    }, { immediate: true })
    const initThree = async (): Promise< void> => {
      threePluginInstance = new GhyThree({
        elementId: 'three-container',
        enabledMouseControl: true,
        enabledKeyBoardControl: true,
        enabledControlRange: false,
        enabledRoamEdit: true,
      })
      if (!state.modelUrl) {
        message.warn('当前区域未配置模型')
        return
      }
      await threePluginInstance?.initModel(state.modelUrl)
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
      if (!state.formData.area) {
        state.formData.area = JSON.stringify({
          id: areaOptions.value[0].id,
          name: areaOptions.value[0].name,
          aliasName: areaOptions.value[0].aliasName
        })
      }
      const area = JSON.parse(state.formData.area)
      state.modelUrl = getModelUrl(area.id)
      areaValue.value = area.id
      initThree()
    }
    let areaName = ''
    let parentNode: GetAreaList | null = null
    const changeThreeModel = async (): Promise<void> => {
      if (!state.modelUrl) {
        message.warn('当前区域未配置模型')
        return
      }
      await threePluginInstance?.changeModel(state.modelUrl)
      if (!parentNode) return
      const showSiblingIndex = parentNode?.children?.findIndex(node => node.aliasName === areaName)
      const showSiblingArea = parentNode?.children?.slice(0, showSiblingIndex + 1)?.map(e => e.aliasName)
      threePluginInstance?.setShowBuilding(showSiblingArea)
    }
    onMounted(() => {
      areaList()
    })
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
      state.formData.area = JSON.stringify(node.triggerNode.props)
      changeThreeModel()
    }
    const getPerspective = (): void => {
      state.formData.perspective = JSON.stringify(threePluginInstance?.getCameraParams())
    }
    const getSuitableArea = (id: string): GetAreaList | undefined => {
      const area = treeFindItemById(markRaw(areaOptions.value), id) as unknown as GetAreaList
      if (area.level !== 2) {
        return getSuitableArea(area.parentId as unknown as string)
      } else {
        return area
      }
    }
    const rules = {
      pointName: [{ required: true, message: '请输入点位名称' }],
      name: [{ required: true, message: '请选择漫游路线' }],
      perspective: [{ required: true, message: '请选择漫游路线' }],
    }
    return (): JSX.Element=> (
      <Modal
        forceRender
        visible={props.visible}
        okText='保存'
        title={props.title || ''}
        width='1000px'
        onOk={handelSave}
        onCancel={handelCancel}
      >
        <Form
          ref={formRef} rules={rules} model={state.formData} label-col={{ style: { width: '70px' } }} layout='inline'
        >
          <FormItem label='区域' name='area'>
            <TreeSelect v-model:value={areaValue.value} onChange={handleSelectArea} tree-data={areaOptions.value} style='width: 180px' field-names={{ label: 'name', value: 'id', children: 'children' }} />
          </FormItem>
          <FormItem label='点位名称' name='pointName'>
            <Input v-model:value={state.formData.pointName} />
          </FormItem>
          <FormItem label='漫游路线' name='name'>
            <Select onChange={(value) => {
              state.formData.name = value
            }} style={{ width: '180px', marginBottom: '10px' }} value={state.formData.name} disabled={props.title === '编辑点位'}>
              {
                props.data.three.roamingRoute.map(e => {
                  return <SelectOption key={e.id} value={e.name}>{e.name}</SelectOption>
                })
              }
            </Select>
          </FormItem>
          <FormItem label='视角参数' name='perspective'>
            <Textarea
              v-model:value={state.formData.perspective}
              placeholder='请获取坐标参数'
              showCount={false}
              readonly
              rows={3}
            />
          </FormItem>
          <Button type='primary' onClick={getPerspective}>获取视角</Button>
        </Form>
        <div class={styles['three-container']} style={{ width: '100%', height: '500px' }} id='three-container' />
      </Modal>
    )
  }
})
