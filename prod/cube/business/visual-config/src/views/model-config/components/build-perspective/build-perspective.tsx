
import { Button, Form, FormItem, Input, Modal, PopConfirm, Table, Cascader, message } from '@ghcloud/cube-ui'
import Textarea from '@ghcloud/cube-ui/src/components/textarea/textarea'
import styles from './build-perspective.module.less'
import { defineComponent, nextTick, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { addModel } from '@/api/model'
import { getAreaList, type GetAreaList } from '@/api/mdata'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { createUuid } from '@/utils/common'
type EntryType = 'views' | 'views-2d' | 'views-three' | 'views-old-area' | 'views-2d-old-area'

interface BuildPerspectiveFormType {
  area: string | undefined;
  hideActors?: string[] | undefined;
  buildTagLocation?: string | undefined;
  camera: string | undefined;
  areaName?: string[] | undefined;
  incrementalPerspective?: number;
  id: string | undefined;
  shellCode: string | undefined;
}
interface BuildType {
  id: string;
  name: string;
  children?: [];
}

export default defineComponent({
  name: '',
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    },
    modelType: {
      type: String as PropType<EntryType>,
      default: () => 'views-three'
    },
  },
  setup (props) {
    const modelConfigData = ref<ModelConfigItf>()
    watch(() => props.data, () => {
      modelConfigData.value = props.data
    }, { immediate: true, deep: true })
    const tableData = ref<BuildPerspectiveFormType[]>([])
    const scrollY = ref<number>(200)
    const tableLoading = ref<boolean>(false)
    const areaOptions = ref<GetAreaList[]>([])
    const buildOptions = ref<BuildType[]>([])
    const selectedArea = ref<string[] | undefined>()
    // 获取区域数据
    const areaList = async (): Promise<void> => {
      const data = await getAreaList()

      if (props.modelType === 'views' || ['views-three', 'views-3d'].includes(props.modelType)) {
        areaOptions.value = data
      } else {
        areaOptions.value = data[0].children
      }
      // @ts-ignore
      buildOptions.value = areaOptions.value.filter((x: BuildType) => x.children && x.children.length > 0)
    }
    watch(() => props.modelType, () => {
      areaList()
    }, { immediate: true })
    // 获取视角列表
    const buildingPerspectiveList = (): void => {
      // tableLoading.value = true
      const params = selectedArea.value?.join('-')
      const perspective = ['views-three', 'views-3d'].includes(props.modelType) ? modelConfigData.value?.three.perspective ?? [] : modelConfigData.value?.ue5.perspective ?? []
      if (params) {
        const list = perspective.filter(x =>x.area === params)
        // @ts-ignore
        tableData.value = list ?? []
      } else {
        // @ts-ignore
        tableData.value = perspective ?? []
      }
      // tableData.value = records
      // search.total = total
      // tableLoading.value = false
    }
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void=> {
      getscrollY()
    }
    onMounted(() => {
      areaList()
      nextTick(() => {
        getscrollY()
        buildingPerspectiveList()
      })
    })
    const columns = [
      {
        title: '区域',
        dataIndex: 'area',
        key: 'area'
      },
      {
        title: '视角参数',
        dataIndex: 'camera',
        key: 'camera'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: BuildPerspectiveFormType; }): JSX.Element =>
          <>
            <Button type='link' onClick={() => {
              openModal('edit', record)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除该视角?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record.id)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    // const search = reactive({
    //   pageNumber: 1,
    //   pageSize: 10,
    //   total: 0
    // })
    // const changePage = (page: number, pageSize: number): void => {
    //   search.pageNumber = page
    //   search.pageSize = pageSize
    //   buildingPerspectiveList()
    // }
    // const changeSize = (current: number, size: number): void => {
    //   search.pageNumber = 1
    //   search.pageSize = size
    //   buildingPerspectiveList()
    // }
    // 查询视角
    const searchView = (): void => {
      // search.pageNumber = 1
      buildingPerspectiveList()
    }
    const resetSearchView = (): void => {
      // search.pageNumber = 1
      selectedArea.value = undefined
      buildingPerspectiveList()
    }
    // 单个设置视角================================================================================================
    const formData = ref<BuildPerspectiveFormType>({ shellCode: '', areaName: [], area: '', hideActors: [], camera: '', id: '', buildTagLocation: '' })
    const changeArea = (item: string[]): void => {
      formData.value.area = item.join('-')
    }
    const modal = reactive({
      visible: false,
      title: '新增建筑视角',
    })
    const operateType = ref('add')
    const currentItem = ref<BuildPerspectiveFormType>()
    // 打开弹窗
    const openModal = (type: string, item?: BuildPerspectiveFormType): void => {
      modal.visible = true
      if (type === 'edit') {
        modal.title = '编辑建筑视角'
        formData.value.area = item?.area ?? undefined
        formData.value.buildTagLocation = item?.buildTagLocation ?? undefined
        formData.value.camera = item?.camera ?? undefined
        formData.value.hideActors = item?.hideActors ?? undefined
        formData.value.id = item?.id ?? undefined
        formData.value.shellCode = item?.shellCode ?? undefined
        operateType.value = 'edit'
        currentItem.value = item
      } else {
        modal.title = '新增建筑视角'
        formData.value.area = undefined
        formData.value.hideActors = undefined
        formData.value.camera = undefined
        formData.value.shellCode = undefined
        formData.value.buildTagLocation = undefined
        operateType.value = 'add'
      }
    }
    // 保存视角
    const handelSave = async (): Promise<void> => {
      try {
        if (modelConfigData.value) {
          if (operateType.value === 'add') {
            const perspective = {
              area: formData.value.area ?? '',
              camera: formData.value.camera ?? '',
              hideActors: formData.value.hideActors ?? [],
              buildTagLocation: formData.value.buildTagLocation ?? '',
              shellCode: formData.value.shellCode ?? '',
              id: createUuid()
            }
            if (['views-three', 'views-3d'].includes(props.modelType)) {
              modelConfigData.value.ue5.perspective.push(perspective)
            } else {
              modelConfigData.value.three.perspective.push(perspective)
            }
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          } else {
            if (['views-three', 'views-3d'].includes(props.modelType)) {
              const item = modelConfigData.value?.three.perspective.find(x => x.id === currentItem.value?.id) ?? { area: '', camera: '', hideActors: [], buildTagLocation: '' }
              item.area = formData.value.area ?? ''
              item.camera = formData.value.camera ?? ''
              item.buildTagLocation = formData.value.buildTagLocation ?? ''
              item.hideActors = formData.value.hideActors ?? []
              await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
            } else {
              const item = modelConfigData.value?.ue5.perspective.find(x => x.id === currentItem.value?.id) ?? { area: '', camera: '', hideActors: [], buildTagLocation: '', shellCode: '' }
              item.area = formData.value.area ?? ''
              item.camera = formData.value.camera ?? ''
              item.buildTagLocation = formData.value.buildTagLocation ?? ''
              item.hideActors = formData.value.hideActors?.flat() ?? []
              item.shellCode = formData.value.shellCode ?? ''
              await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
            }
          }
        }
        message.success('保存成功')
        buildingPerspectiveList()
        // search.pageNumber = 1
        modal.visible = false
      } catch {
      }
    }
    // 删除视角
    const handelDelete = async (id?: string): Promise<void> => {
      try {
        const perspective = ['views-three', 'views-3d'].includes(props.modelType) ? modelConfigData.value?.three.perspective ?? [] : modelConfigData.value?.ue5.perspective ?? []
        const index = perspective.findIndex(x => x.id === id) ?? -1
        if (index >= 0) {
          if (['views-three', 'views-3d'].includes(props.modelType)) {
            modelConfigData.value?.three.perspective.splice(index, 1)
          } else {
            modelConfigData.value?.ue5.perspective.splice(index, 1)
          }
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      } catch {
      }
      // search.pageNumber = 1
      buildingPerspectiveList()
    }
    // 批量设置视角===============================================================================================
    const batchModal = reactive({
      visible: false,
      title: '新增建筑视角',
    })
    // 获取同级的所有元素
    const parentArray = (treeData: BuildType[], nodeId: string): BuildType[] | null => {
      const siblings: BuildType[] = []
      const findSiblingsRecursive = (data: BuildType[], targetId: string, parent: BuildType | null): void => {
        for (const item of data) {
          if (item.id === targetId) {
            siblings.push(...(parent ? parent.children ?? [] : treeData))
          } else if (item.children) {
            findSiblingsRecursive(item.children, targetId, item)
          }
        }
      }
      findSiblingsRecursive(treeData, nodeId, null)
      return siblings
    }
    const curList = ref<BuildType[]>([])
    const curAreaList = ref<string[]>([])
    const batchFormData = reactive<BuildPerspectiveFormType>({ camera: '', id: '', incrementalPerspective: 0, areaName: [], area: '', shellCode: '' })
    const changeBatchArea = (item: string[], options: BuildType[]): void => {
      const list: string[] = []
      options.forEach(item => {
        list.push(item.name)
      })
      const brotherList = parentArray(buildOptions.value, item[item.length - 1]) ?? []
      const curI = brotherList.findIndex((x) => x.id === item[item.length - 1])
      curList.value = brotherList.slice(curI, brotherList.length)
      batchFormData.area = list.join('-')
      const areaList: string[] = []
      curList.value.forEach(item => {
        areaList.push(`${options[0].name}-${item.name}`)
      })
      curAreaList.value = areaList
    }
    const openBatchModal = (): void => {
      batchModal.visible = true
      batchModal.title = '批量新增楼层视角'
      batchFormData.camera = undefined
      batchFormData.area = undefined
      batchFormData.hideActors = undefined
      batchFormData.buildTagLocation = undefined
      batchFormData.incrementalPerspective = 0
    }

    // 批量保存
    const handelBatchSave = async (): Promise<void> => {
      const camera = batchFormData.camera ? JSON.parse(batchFormData.camera) : null
      curList.value.forEach((item, index) => {
        const step = index * (batchFormData.incrementalPerspective ?? 0)
        const zPosition = camera?.location?.z ? Number(camera.location.z) + step : 0
        const targetObject = camera ? `{location:{x:${camera?.location?.x ?? 0}, y:${camera?.location?.y ?? 0}, z:${zPosition}},rotation:{pitch:${camera?.rotation?.pitch ?? 0}, yaw:${camera?.rotation?.yaw ?? 0},roll:${camera?.rotation?.roll ?? 0}}}` : ''
        if (['views-three', 'views-3d'].includes(props.modelType)) {
          modelConfigData.value?.three.perspective.push({
            area: curAreaList.value[index],
            camera: targetObject,
            id: createUuid()
          })
        } else {
          modelConfigData.value?.ue5.perspective.push(
            {
              area: curAreaList.value[index],
              camera: targetObject,
              id: createUuid()
            }
          )
        }
      })
      try {
        await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
        buildingPerspectiveList()
        // search.pageNumber = 1
        batchModal.visible = false
      } catch {
      }
    }
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <div class={styles.header}>
          <div class={styles.area}>
            <div style={{ width: '90px' }}>区域:</div>
            <Cascader
              v-model:value={selectedArea.value} placeholder='请选择区域' field-names={{ label: 'name', value: 'name', children: 'children' }}
              options={areaOptions.value} allow-clear show-search change-on-select
            />
          </div>
          <div class={styles.search}><Button onClick={resetSearchView}>重置</Button><Button type='primary' onClick={searchView}>查询</Button></div>
        </div>
        <Button type='primary' style={{ margin: '0 10px 10px 0px' }} onClick={() => {
          openModal('add')
        }}>新增</Button>
        <Button type='primary' onClick={openBatchModal}>批量新增楼层视角</Button>
        <Table
          columns={columns}
          dataSource={tableData.value}
          scrollY={scrollY.value}
          rowKey='id'
          loading={tableLoading.value}
          pagination={false}
        />
        {/* <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={search.total}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div> */}
        <Modal
          visible={modal.visible}
          okText='保存'
          title={modal.title}
          width='900px'
          onOk={handelSave}
          onCancel={() => {
            modal.visible = false
          }}
        >
          <Form model={formData.value} label-col={{ style: { width: '90px' } }}>
            <FormItem label='选择区域' name='area'>
              <Cascader
                v-model:value={formData.value.area} placeholder='请选择区域' field-names={{ label: 'name', value: 'name', children: 'children' }}
                options={areaOptions.value} allow-clear show-search change-on-select
                onChange={changeArea}
              />
            </FormItem>
            <FormItem label='隐藏楼栋' name='hideActors'>
              <Cascader
                v-model:value={formData.value.hideActors}
                placeholder='请选择楼栋'
                field-names={{ label: 'name', value: 'aliasName', children: 'children' }}
                multiple
                options={areaOptions.value} allow-clear show-search change-on-select
              />
            </FormItem>
            <FormItem label='视角参数' name='camera'>
              <Textarea maxlength={500} v-model:value={formData.value.camera} showCount={false} />
            </FormItem>
            <FormItem label='标签位置' name='buildTagLocation'>
              <Textarea v-model:value={formData.value.buildTagLocation} showCount={false} />
            </FormItem>
            <FormItem label='模型外壳编码' name='buildTagLocation'>
              <Input
                maxlength={20}
                placeholder='模型外壳编码'
                v-model:value={formData.value.shellCode}
              />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          visible={batchModal.visible}
          okText='批量保存'
          width='900px'
          title={batchModal.title}
          onOk={handelBatchSave}
          onCancel={() => {
            batchModal.visible = false
          }}
        >
          <div class={styles['batch-tips']}>
            <div>系统是按照区域排序从上到下，用视角参数+增量视角来自动计算每层视角。</div>
            <div>选择区域：请选择排序最上面的楼层</div>
            <div>增量视角：根据区域排序不同填写不同，比如最上面是底层1F 增量视角就填正数 例如100，区域排序最上面是顶层12F 增量视角就填负数，例如-100</div>
            <div>视角参数：请在模型编辑状态获取最上面楼层的视角参数</div>
          </div>
          <Form model={batchFormData} label-col={{ style: { width: '70px' } }}>
            <FormItem label='选择区域' name='areaId'>
              <Cascader
                v-model:value={batchFormData.area} placeholder='请选择区域' field-names={{ label: 'name', value: 'id', children: 'children' }}
                options={buildOptions.value} allow-clear show-search change-on-select
                onChange={changeBatchArea}
              />
            </FormItem>
            <FormItem label='增量视角' name='incrementalPerspective'>
              <Input
                maxlength={8}
                placeholder='请输入层高'
                v-model:value={batchFormData.incrementalPerspective}
              />
            </FormItem>
            <FormItem label='视角参数' name='camera'>
              <Textarea v-model:value={batchFormData.camera} showCount={false} />
            </FormItem>
          </Form>
        </Modal>
      </div>
  }
})
