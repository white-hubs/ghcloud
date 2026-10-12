import { defineComponent, onMounted, reactive, watch, ref, type PropType, onBeforeUnmount, computed } from 'vue'
import styles from './perspective.module.less'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import { Button, Form, FormItem, Modal, PopConfirm, Table, Tree, message, Textarea, Input, type FormExpose, PopOver, Cascader } from '@ghcloud/cube-ui'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { EventDataNode, TreeDataItem } from 'ant-design-vue/es/tree'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { UeClient } from '@ghcloud/cube-visual-sdk'
import { addModel } from '@/api/model'
import { createUuid } from '@/utils/common'
interface EventDataNodeData extends EventDataNode {
  parent: {
    nodes?: { name: string; }[];
    key: string;
  };
}

export const PerspectiveUe5 = defineComponent({
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    }
  },
  emits: ['getModelData'],
  setup: (props, { emit }) => {
    const ueClient = UeClient.getInstance()
    const areaOptions = ref<GetAreaList[]>([])
    const businessAreaOptions = ref<GetAreaList[]>([])
    const modelServer = ref<{
      label?: string;
      value?: string;
      area?: string;
      camera?: string;
      buildTagLocation?: string;
    }[]>([])
    const scrollY = ref<number>(800)
    const formData = reactive({
      label: '',
      value: '',
      buildTagLocation: '',
      id: '',
      area: '',
      areaName: '',
      isDefault: 'default',
      hideActors: []
    })
    const formRenderRef = ref<FormExpose>()
    const modalRules = computed(() => {
      if (formData.area === '园区') {
        return {
          label: [{ required: true, message: '请输入视角名称', trigger: 'change' }],
          value: [{ required: true, message: '请输入视角参数', trigger: 'change' }],
        }
      } else {
        return {
          value: [{ required: true, message: '请输入视角参数', trigger: 'change' }],
        }
      }
    })
    const modal = reactive({
      visible: false,
      title: '新增视角',
      index: 0,
      textValue: ''
    })
    const ue5Columns = [
      {
        title: '区域',
        dataIndex: 'area',
        key: 'area',
        ellipsis: true,
        align: 'center',
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const textVal = text ?? formData.area
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '视角名称',
        dataIndex: 'label',
        key: 'label',
        ellipsis: true,
        align: 'center',
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '视角参数',
        dataIndex: 'value',
        align: 'center',
        ellipsis: true,
        key: 'value',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 180,
        key: 'action',
        customRender: ({ record, index }: { record: {
          label: string;
          value: string;
          area?: string;
          id: string;
          camera?: string;
          isDefault: string;
          buildTagLocation: string;
          hideActors: string[];
        }; index: number; }): JSX.Element=>
          <>
            <Button type='link' onClick={() => {
              editUe5Model(record, index)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                deleteUe5Model(index, record)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const selectedKeys = ref<Key[]>([])
    const expandedKeys = ref<Key[]>([])

    // 获取区域数据
    const areaList = async (): Promise<void> => {
      const data = await getAreaList()
      businessAreaOptions.value = data
      areaOptions.value = [{
        name: '园区',
        children: data,
        id: '1111111',
        level: 0,
        code: '',
        sequence: '',
        aliasName: '',
        areaManagerId: '',
        areaDepartmentId: '',
        areaManagerIds: [],
        areaManagerName: [],
        visualizationAreaType: ''
      }]
      // 设置默认选中第一个节点和展开节点
      if (areaOptions.value.length > 0) {
        selectedKeys.value = [areaOptions.value[0].id]
        expandedKeys.value = [areaOptions.value[0].id] // 设置展开的节点
        formData.area = areaOptions.value[0].name
        getTableData()
      }
    }
    // 计算table-y的高度
    const getScrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void=> {
      getScrollY()
    }
    const deleteUe5Model = async (index: number, record: { label: string; value: string;isDefault: string;id: string; }): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      if (formData.area === '园区') {
        ueModel.ue5.modelPerspective.splice(index, 1)
      } else {

        ueModel.ue5.perspective = ueModel.ue5.perspective.filter((e) => {
          if (e.id !== record.id) {
            return e
          }
        })
      }
      ueModel.ue5.correct = true
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      message.success('删除成功')
    }
    const editUe5Model = (record: { area: string; label: string; buildTagLocation: string; value: string;isDefault: string;id: string;hideActors: string[]; }, index: number): void => {
      formData.areaName = record.area
      formData.label = record.label
      formData.isDefault = record.isDefault
      formData.buildTagLocation = record.buildTagLocation
      // @ts-ignore
      formData.hideActors = record.hideActors ? record.hideActors : []
      formData.value = record.value
      formData.id = record.id
      modal.index = index
      modal.title = '编辑视角'
      modal.visible = true
    }
    const onSelect = (checkedKeys: Key[], e: { checked: boolean; checkedNodes: TreeDataItem[]; node: EventDataNodeData; event: string; }): void => {
      selectedKeys.value = checkedKeys
      if (checkedKeys?.length) {
        if (e.node.parent?.nodes) {
          const arr = e.node.parent.nodes.map((e: { name: string; }): string | null => {
            if (e.name !== '园区') {
              return e.name
            } else {
              return null
            }
          }).filter(e => e)
          formData.area = arr.length ? arr.join('-') + '-' + e.node.name : e.node.name
        } else {
          formData.area = '园区'
        }
      } else {
        formData.area = ''
      }
      getTableData()
    }
    const getTableData = (): void => {
      if (formData.area === '园区') {
        modelServer.value = ue5Data.value.modelPerspective
      } else if (formData.area) {
        modelServer.value = ue5Data.value.perspective.filter(e => {
          return e.area.includes(formData.area) || e.id === selectedKeys.value[0]
        }).map(e => {
          return {
            ...e,
            value: e.camera,
            label: e.label ?? '默认'
          }
        })
      } else if (!formData.area) {
        modelServer.value = []
      }
    }
    const handelSave = async (): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      await formRenderRef.value?.validate()
      if (formData.area === '园区' && modal.title === '新增视角') {
        formData.isDefault = 'custom'
        ueModel.ue5.modelPerspective.push(formData)
      } else if (formData.area === '园区' && modal.title === '编辑视角') {
        formData.isDefault = 'custom'
        ueModel.ue5.modelPerspective[modal.index] = formData
      } else if (modal.title === '新增视角') {
        ueModel.ue5.perspective.push({
          ...formData,
          label: formData.isDefault === 'default' ? '默认' : formData.label,
          camera: formData.value,
          id: selectedKeys.value[0] as string
        })
      } else if (modal.title === '编辑视角') {
        formData.label = formData.isDefault === 'default' ? '默认' : formData.label
        ueModel.ue5.perspective = ueModel.ue5.perspective.map((e) => {
          if (e.area === formData.area && formData.id === e.id) {
            e = {
              ...e,
              ...formData,
              label: formData.isDefault === 'default' ? '默认' : formData.label,
              camera: formData.value,
            }
          }
          return e
        })
      }
      ueModel.ue5.correct = true
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      message.success('操作成功')
      emit('getModelData')
      modal.visible = false
      handelCancel()
    }
    const handelCancel = (): void => {
      try {
        ueClient.send('disableEditing')
        ueClient.ue5Close()
      } catch {

      }
      modal.visible = false
    }
    const addModelPerspective = (): void => {
      modal.title = '新增视角'
      if (formData.area) {
        Object.assign(formData, {
          label: '',
          value: '',
          buildTagLocation: '',
          isDefault: 'default'
        })
      } else {
        message.warning('请先选择区域！')
        return
      }
      modal.visible = true
    }

    // 修正区域视角配置数据
    const ue5Data = ref(props.data.ue5)
    const ue5PerspectiveCorrect = (): void => {
      const config = ue5Data.value

      if (config.correct) return
      // 递归查找匹配的区域，需要完整匹配层级路径
      // 计算两个字符串的相似度
      const calculateSimilarity = (str1: string, str2: string): number => {
      // 移除所有空格和特殊字符，转换为小写进行比较
        const normalize = (s: string): string =>
          s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')

        const s1 = normalize(str1)
        const s2 = normalize(str2)

        let matches = 0
        const maxLen = Math.max(s1.length, s2.length)

        // 计算匹配字符数
        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
          if (s1[i] === s2[i]) matches++
        }

        return matches / maxLen
      }

      const findAreaByPath = (areas: GetAreaList[], pathNames: string[]): GetAreaList | undefined => {
        if (pathNames.length === 0) return undefined

        let bestMatch: GetAreaList | undefined
        let bestSimilarity = 0

        // 递归搜索函数
        const findBestMatch = (area: GetAreaList, depth: number): void => {
          // 首先尝试匹配父级
          const parentName = pathNames[0]
          const parentSimilarity = calculateSimilarity(area.name, parentName)

          // 如果找到匹配的父级
          if (parentSimilarity > 0.7) {
          // 如果只需要匹配父级，直接返回
            if (pathNames.length === 1) {
              if (parentSimilarity > bestSimilarity) {
                bestMatch = area
                bestSimilarity = parentSimilarity
              }
              return
            }

            // 如果需要匹配子级，在子级中查找
            if (area.children?.length) {
              const childName = pathNames[pathNames.length - 1]
              area.children.forEach(child => {
                const childSimilarity = calculateSimilarity(child.name, childName)
                // 如果找到匹配度高的子级
                if (childSimilarity > 0.5) {
                  if (childSimilarity > bestSimilarity) {
                    bestMatch = child
                    bestSimilarity = childSimilarity
                  }
                }
              })
            }
          }

          // 递归搜索子区域
          if (area.children?.length) {
            area.children.forEach(child => {
              findBestMatch(child, depth + 1)
            })
          }
        }

        // 对每个顶层区域进行搜索
        areas.forEach(area => {
          findBestMatch(area, 1)
        })

        // 调试日志

        return bestMatch
      }

      // 在使用时的代码
      if (config.perspective?.length) {
        config.perspective = config.perspective.map(item => {
          const areaNames = item.area.split('-')
          const matchedArea = findAreaByPath(areaOptions.value, areaNames)

          // 调试日志

          return {
            ...item,
            id: matchedArea?.id || createUuid()
          }
        })
      }
    }
    watch(() => props.data, () => {
      ue5Data.value = props.data.ue5
      getTableData()
    })
    onMounted(async () => {
      await areaList()
      ue5PerspectiveCorrect()
      getScrollY()

    })
    onBeforeUnmount(() => {
      handelCancel()
    })
    const onExpand = (expandedKeysValue: Key[]): void => {
      expandedKeys.value = expandedKeysValue
    }

    return (): JSX.Element =>
      <>
        <div class={styles['page-box']}>
          <div class={styles['left-box']}>
            <Tree
              tree-data={areaOptions.value}
              field-names={{
                children: 'children',
                title: 'name',
                key: 'id'
              }}
              expandedKeys={expandedKeys.value}
              selectedKeys={selectedKeys.value}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          </div>
          <div class={styles['right-box']}>
            <div class={styles['model-head']}>
              <Button type='primary' onClick={addModelPerspective}>新增</Button>
            </div>
            <Table
              columns={ue5Columns}
              dataSource={modelServer.value}
              scrollY={scrollY.value}
              rowKey='id'
              pagination={false}
            />
          </div>
        </div>
        <Modal
          forceRender
          visible={modal.visible}
          okText='保存'
          title={modal.title}
          width='1200px'
          onOk={handelSave}
          onCancel={handelCancel}
        >
          <Form model={formData} ref={formRenderRef} rules={modalRules.value} labelCol={{ style: { width: '150px' } }}>
            <FormItem label='区域' name='area'>
              <span>{formData?.areaName || formData?.area}</span>
            </FormItem>
            {
              formData.area === '园区' &&
              <FormItem label='视角名称' name='label'>
                <Input v-model:value={formData.label} placeholder='请输入视角名称' maxlength={100} />
              </FormItem>
            }
            {
              formData.area !== '园区' &&
              <FormItem label='中心点位置' name='buildTagLocation'>
                <Textarea style={{ width: '100%' }} placeholder='请输入中心点位置' autosize={{ minRows: 2, maxRows: 2 }} v-model:value={formData.buildTagLocation} showCount={false} />
              </FormItem>
            }

            <FormItem label='视角参数' name='value'>
              <Textarea style={{ width: '100%' }} placeholder='请输入视角参数' autosize={{ minRows: 2, maxRows: 2 }} v-model:value={formData.value} showCount={false} />
            </FormItem>
            {
              formData.area !== '园区' &&
              <FormItem label='隐藏楼栋' name='hideActors' >
                <Cascader
                  v-model:value={formData.hideActors}
                  placeholder='请选择楼栋'
                  field-names={{ label: 'name', value: 'aliasName', children: 'children' }}
                  multiple
                  options={businessAreaOptions.value} allow-clear show-search change-on-select
                />
              </FormItem>
            }
          </Form>
        </Modal>
      </>
  }
})
