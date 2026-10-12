import { defineComponent, onMounted, reactive, watch, ref, type PropType } from 'vue'
import styles from './perspective.module.less'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import { Button, PopConfirm, Table, Tree, message } from '@ghcloud/cube-ui'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { EventDataNode, TreeDataItem } from 'ant-design-vue/es/tree'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { ConfigModal } from './web-gl-perspective-config-modal'
import { addModel } from '@/api/model'
import { createUuid, topRegionId } from '@/utils/common'
interface EventDataNodeData extends EventDataNode {
  aliasName: string;
  parent: {
    nodes?: { name: string;children?: EventDataNodeData[]; }[];
    node: { name: string;id: string; };
    key: string;
  };
}
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
export const PerspectiveWebGl = defineComponent({
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    },
  },
  emits: ['getModelData'],
  setup: (props, { emit }) => {
    const areaOptions = ref<GetAreaList[]>([])
    const modelServer = ref<{
      label?: string;
      value?: string;
      area: string;
      camera?: string;
    }[]>([])
    const scrollY = ref<number>(800)
    const state = reactive({
      configModalVisible: false,
      modalArea: '',
      areaId: ''
    })
    const modal = reactive<{
      visible: boolean;
      title: string;
      modelServerUrl: string;
      index: number;
      aliasName: string[];
      currentPerspectiveConfig: PerspectiveConfig;
    }>({
      visible: false,
      title: '新增视角',
      modelServerUrl: '',
      index: 0,
      aliasName: [],
      currentPerspectiveConfig: {
        area: '',
        label: '',
        value: '',
        isDefault: 'default'
      }
    })
    const threeColumns = [
      {
        title: '区域',
        dataIndex: 'area',
        key: 'area',
        align: 'center',
        width: 100
      },
      {
        title: '视角名称',
        dataIndex: 'label',
        key: 'label',
        align: 'center',
        width: 100
      },
      {
        title: '视角参数',
        dataIndex: 'value',
        align: 'center',
        key: 'value'
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 200,
        key: 'action',
        customRender: ({ record, index }: { record: PerspectiveConfig;index: number; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleEdit(record, index)
              }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={() => {
                  handleDelete(record, index)
                }}
              >
                <Button type='text' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    const handleEdit = (record: PerspectiveConfig, index: number): void => {
      const serverUrl = getModelUrl(state.areaId)
      if (!serverUrl) {
        message.warn('请配置当前选中区域的模型')
        return
      }
      modal.modelServerUrl = serverUrl
      modal.currentPerspectiveConfig = {
        area: record.area,
        label: record.label,
        value: record.value ?? record.camera ?? '',
        isDefault: record.isDefault ?? 'default',
      }
      modal.index = index
      modal.visible = true
      modal.title = '编辑视角'
    }

    const findIndex = (record: PerspectiveConfig, index: number): number=>{
      const modelConfig: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      let delIndex = index
      if (state.modalArea !== '园区'){
        delIndex = -1
        const indices: number[] = [];
        modelConfig.three.perspective.forEach((val, idx) => {
          if (val.area === record.area) indices.push(idx);
        });
        if (indices.length) {
          delIndex = indices[index]
        }
      }
      return delIndex
    }

    const handleDelete = async (record: PerspectiveConfig, index: number): Promise< void> => {
      const modelConfig: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      let delIndex = findIndex(record, index)
      const key = state.modalArea === '园区' ? 'modelPerspective' : 'perspective'
      if (delIndex === -1){
        message.warn('视角不存在')
        return
      }
      modelConfig.three[key].splice(delIndex, 1)
      await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
      emit('getModelData')
    }
    // 获取区域数据
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
    }
    // 计算table-y的高度
    const getScrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void => {
      getScrollY()
    }
    const onSelect = (checkedKeys: Key[], e: { checked: boolean; checkedNodes: TreeDataItem[]; node: EventDataNodeData; event: string; }): void => {
      if (checkedKeys?.length) {
        if (e.node.parent?.nodes) {
          const arr = e.node.parent.nodes.map((e: { name: string; }): string | null => {
            if (e.name !== '园区') {
              return e.name
            } else {
              return null
            }
          }).filter(e => e)
          state.areaId = e.node.id
          state.modalArea = arr.length ? arr.join('/') + '/' + e.node.name : e.node.name
          modal.aliasName = []
          if (e.node.level >= 2) {
            const nodes = e.node.parent.nodes
            const children = nodes[1]?.children
            const nodeModelPath = getModelUrl(e.node.parent.node.id)
            const parentNodeModelPath = getModelUrl(e.node.parent.node.id)

            if (nodeModelPath === parentNodeModelPath && children) {
              const currentFloorIndex = children.findIndex(item => item.name === e.node.name || item.name === e.node.parent.node.name)
              const showSiblingArea = children.slice(0, currentFloorIndex + 1).map(item => item.aliasName)
              modal.aliasName = showSiblingArea
            }
          }
        } else {
          state.areaId = topRegionId
          state.modalArea = '园区'
        }
      } else {
        state.modalArea = ''
      }
      getTableData()
    }
    const handleSaveConfig = async (config: {
      area: string;
      isDefault: string;
      label: string;
      value: string;
      camera: string;
      id?: string;
    }): Promise<void> => {
      const modelConfig: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      config.label = config.isDefault === 'default' ? '默认' : config.label
      const key = state.modalArea === '园区' ? 'modelPerspective' : 'perspective'
      if (modal.title === '新增视角') {
        modelConfig.three[key].push({
          ...config,
          areaId: state.areaId,
        })
      } else {
        const index = findIndex(config as PerspectiveConfig, modal.index)
        modelConfig.three[key][index] = {
          ...config,
          areaId: state.areaId,
        }
      }
      await addModel({ modelConfiguration: JSON.stringify(modelConfig) })
      emit('getModelData')
      modal.visible = false
    }
    const getTableData = (): void => {
      if (state.modalArea === '园区') {
        modelServer.value = props.data.three.modelPerspective.map(item => {
          return {
            ...item,
            area: item.area ?? state.modalArea,
            id: item.id ?? createUuid()
          }
        })
      } else if (state.modalArea) {
        modelServer.value = props.data.three.perspective.filter(e => {
          return e.area === state.modalArea
        }).map(e => {
          return {
            ...e,
            value: e.camera ?? e.value,
            label: e.label ?? '默认',
            id: e.id ?? createUuid()
          }
        })
      } else if (!state.modalArea) {
        modelServer.value = []
      }
    }
    const addModelPerspective = (): void => {
      if (!state.modalArea) {
        message.warning('请先选择区域！')
        return
      }
      const modelUrl = getModelUrl(state.areaId)
      if (!modelUrl) {
        message.warning(`请先引入${state.modalArea}区域模型！`)
        modal.modelServerUrl = ''
        return
      }
      modal.currentPerspectiveConfig = {
        area: state.modalArea,
        label: '',
        isDefault: 'default',
        value: '',
        camera: '',
        id: createUuid()
      }
      modal.title = '新增视角'
      modal.modelServerUrl = modelUrl
      modal.visible = true
    }
    const getModelUrl = (id: string): string => {
      if (props.data.three.modelServer.length === 1) {
        return props.data.three.modelServer[0].url
      }
      const findModelServer = props.data.three.modelServer.find(item => {
        const areaIds = item.areaList.map(item => item.id)
        return areaIds.includes(id)
      })
      return findModelServer ? findModelServer.url : ''
    }
    watch(() => props.data, () => {
      getTableData()
    })
    onMounted(() => {
      getScrollY()
      areaList()
    })
    return (): JSX.Element =>
      <>
        <div class={styles['page-box']}>
          <div class={styles['left-box']}>
            <Tree
              tree-data={areaOptions.value} field-names={{
                children: 'children',
                title: 'name',
              }}
              onSelect={onSelect}
            />
          </div>
          <div class={styles['right-box']}>
            <div class={styles['model-head']}>
              <Button type='primary' onClick={addModelPerspective}>新增</Button>
            </div>
            <Table
              columns={threeColumns}
              dataSource={modelServer.value}
              scrollY={scrollY.value}
              rowKey='id'
              pagination={false}
            />
          </div>
        </div>
        {modal.visible && <ConfigModal onSave={handleSaveConfig} v-model:visible={modal.visible} showSiblingArea={modal.aliasName} config={modal.currentPerspectiveConfig} title={modal.title} modelUrl={modal.modelServerUrl} />}
      </>
  }
})
