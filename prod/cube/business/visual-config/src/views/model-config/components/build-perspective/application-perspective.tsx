import { Button, Form, FormItem, Modal, PopConfirm, Table, message, type FileType, Cascader } from '@ghcloud/cube-ui'
import Textarea from '@ghcloud/cube-ui/src/components/textarea/textarea'
import styles from './build-perspective.module.less'
import { defineComponent, nextTick, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { addModel } from '@/api/model'
import { getScenePage } from '@/api/mdata'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { createUuid } from '@/utils/common'
import type { GetSceneMenu } from '@/api/models/mdata'
import { FileUpload } from '@ghcloud/generic-component'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
type EntryType = 'views' | 'views-2d' | 'views-three' | 'views-old-area' | 'views-2d-old-area'

interface BuildPerspectiveFormType {
  id: string;
  application: string;
  camera: string;
  path: string;
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
    const tableData = ref<{
      id: string;
      application: string;
      camera: string;
    }[]>([])
    const scrollY = ref<number>(200)
    const tableLoading = ref<boolean>(false)
    const selectedArea = ref<string[]>([])
    const applicationList = ref<GetSceneMenu[]>([])
    const uploadRef = ref()
    const fileList = ref<FileType[]>([])
    const currentFile = ref<{ path: string; }[]>([{ path: '' }])
    // 获取业务菜单
    const getSceneList = async (): Promise<void> => {
      applicationList.value = await getScenePage()
    }
    // 获取视角列表
    const buildingPerspectiveList = (): void => {
      const perspective = modelConfigData.value?.ue5.applicationPerspective ?? []
      if (selectedArea.value?.length) {
        const list = perspective.filter(x =>
          x.application === selectedArea.value[selectedArea.value?.length - 1])
        tableData.value = list ?? []
      } else {
        tableData.value = perspective ?? []
      }
    }
    const uploadEnd = (data: FileType[]): void => {
      fileList.value = data
    }
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void => {
      getscrollY()
    }
    onMounted(() => {
      getSceneList()
      nextTick(() => {
        getscrollY()
        buildingPerspectiveList()
      })
    })
    const columns = [
      {
        title: '应用',
        dataIndex: 'application',
        key: 'application'
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
        customRender: ({ record }: { record: BuildPerspectiveFormType; }): JSX.Element=>
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

    // 查询视角
    const searchView = (): void => {

      buildingPerspectiveList()
    }
    const resetSearchView = (): void => {
      selectedArea.value = []
      buildingPerspectiveList()
    }
    // 单个设置视角================================================================================================
    const formData = ref<{
      id: string;
      application: string;
      camera: string;
      path: string;
    }>({ application: '', id: '', camera: '', path: '' })
    const changeArea = (value: string[]): void => {
      formData.value.application = value[value.length - 1]
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
        modal.title = '编辑应用视角'
        formData.value.application = item?.application ?? ''
        formData.value.camera = item?.camera ?? ''
        formData.value.id = item?.id ?? ''
        operateType.value = 'edit'
        currentFile.value = item?.path ? [{ path: item?.path }] : []
        currentItem.value = item
      } else {
        modal.title = '新增应用视角'
        formData.value.application = ''
        formData.value.camera = ''
        formData.value.id = ''
        currentFile.value = []
        operateType.value = 'add'
      }
    }
    // 保存视角
    const handelSave = async (): Promise<void> => {
      try {
        if (modelConfigData.value) {
          if (operateType.value === 'add') {
            const perspective = {
              application: formData.value.application ?? '',
              camera: formData.value.camera ?? '',
              id: createUuid(),
              // @ts-ignore
              path: fileList.value.length ? fileList.value[0].path : ''
            }
            if (!modelConfigData.value.ue5.applicationPerspective?.length) {
              modelConfigData.value.ue5.applicationPerspective = []
            }
            modelConfigData.value.ue5.applicationPerspective.push(perspective)
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          } else {
            const item = modelConfigData.value?.ue5.applicationPerspective.find(x => x.id === currentItem.value?.id) ?? { application: '', camera: '', path: '' }
            item.application = formData.value.application ?? ''
            item.camera = formData.value.camera ?? ''
            // @ts-ignore
            item.path = fileList.value.length ? fileList.value[0].path : ''
            await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
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
        const perspective = modelConfigData.value?.ue5.applicationPerspective ?? []
        const index = perspective.findIndex(x => x.id === id) ?? -1
        if (index >= 0) {
          modelConfigData.value?.ue5.applicationPerspective.splice(index, 1)
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      } catch {
      }
      buildingPerspectiveList()
    }

    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <div class={styles.header}>
          <div class={styles.area}>
            <div style={{ width: '90px' }}>应用:</div>
            <Cascader
              v-model:value={selectedArea.value} placeholder='请选择应用' field-names={{ label: 'name', value: 'name', children: 'children' }}
              options={applicationList.value} allow-clear show-search change-on-select
            />
          </div>
          <div class={styles.search}><Button onClick={resetSearchView}>重置</Button><Button type='primary' onClick={searchView}>查询</Button></div>
        </div>
        <Button type='primary' style={{ margin: '0 10px 10px 0px' }} onClick={() => {
          openModal('add')
        }}>新增</Button>
        <Table
          columns={columns}
          dataSource={tableData.value}
          scrollY={scrollY.value}
          rowKey='id'
          loading={tableLoading.value}
          pagination={false}
        />
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
            <FormItem label='选择应用' name='area'>
              <Cascader
                v-model:value={formData.value.application} placeholder='请选择应用' field-names={{ label: 'name', value: 'name', children: 'children' }}
                options={applicationList.value} allow-clear show-search change-on-select
                onChange={changeArea}
              />
            </FormItem>
            <FormItem label='视角参数' name='camera'>
              <Textarea maxlength={500} v-model:value={formData.value.camera} showCount={false} />
            </FormItem>
            <FormItem label='背景图片'>
              <FileUpload
                ref={uploadRef}
                type='picture-card'
                sceneCode={GLOBAL_SCENE_CODE.visualCenterMenu}
                onEnd={uploadEnd}
                value={currentFile.value}
                typelist={['.png', '.jpeg', '.jpg']}
                customText='支持上传图片（.png/.jpeg/.jpg）'
                size={6}
                maxNum={1}
                showtext
              />
            </FormItem>
          </Form>
        </Modal>
      </div>
  }
})
