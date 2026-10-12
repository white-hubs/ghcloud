import { defineComponent, reactive, ref, type PropType, watch, onMounted } from 'vue'
import styles from '../../model-config.module.less'
import { Button, Cascader, Form, FormItem, Input, Modal, PopConfirm, Table, message } from '@ghcloud/cube-ui'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { addModel } from '@/api/model'
import { getAreaList, getScenePage, type GetAreaList } from '@/api/mdata'
import type { GetSceneMenu } from '@ghcloud/cube-mdata-service'
import { createUuid } from '@/utils/common'

export const Views2d = defineComponent({
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
    const modal = reactive({
      visible: false,
      title: '新增模型',
      index: 0,
      textValue: ''
    })
    const menuOptions = ref<GetSceneMenu[]>([])
    const ue5Columns = [
      {
        title: '模型名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '模型文件',
        dataIndex: 'url',
        key: 'url'
      },
      {
        title: '关联菜单',
        dataIndex: 'menu',
        key: 'menu'
      },
      {
        title: '关联区域',
        dataIndex: 'area',
        key: 'area'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record, index }: { record: { name: string; url: string; }; index: number; }): JSX.Element =>
          <>
            <Button type='link' onClick={() => {
              editUe5Model(record, index)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                deleteUe5Model(index)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const scrollY = ref<number>(800)
    const modelServer = ref(props.data.scada.url)
    const areaOptions = ref<GetAreaList[]>([])
    const formData = reactive({
      name: '',
      url: '',
      menu: [''],
      area: [''],
      id: createUuid()
    })

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
    watch(() => props.data, () => {
      modelServer.value = props.data.scada.url
    })
    const queryModel = (): void => {

      modelServer.value = props.data.scada.url.filter(e => {
        if (e.name.includes(modal.textValue)) {
          return e
        }
      })
    }
    const resetting = (): void => {
      modal.textValue = ''
      queryModel()
    }
    // 获取区域数据
    const areaList = async (): Promise<void> => {
      const data = await getAreaList()
      areaOptions.value = data
    }
    // 获取业务菜单
    const getSceneList = async (): Promise<void> => {
      const res = await getScenePage()
      menuOptions.value = res
    }
    const handelSave = async (): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      if (modal.title === '编辑模型') {
        ueModel.scada.url[modal.index] = {
          ...formData,
          area: typeof formData.area === 'object' ? formData?.area.join('-') ?? '' : formData.area ?? '',
          menu: typeof formData.menu === 'object' ? formData?.menu.join('-') ?? '' : formData.menu ?? '',
        }
      } else {
        ueModel.scada.url.push({
          ...formData,
          area: typeof formData.area === 'object' ? formData?.area.join('-') ?? '' : formData.area ?? '',
          menu: typeof formData.menu === 'object' ? formData?.menu.join('-') ?? '' : formData.menu ?? '',
        })
      }
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      modal.visible = false
      message.success(modal.title === '编辑模型' ? '编辑成功' : '新增成功')
    }
    const addUe5Model = (): void => {
      formData.name = ''
      formData.url = ''
      formData.menu = ['']
      formData.area = ['']
      formData.id = createUuid()
      modal.title = '新增模型'
      modal.index = 0
      modal.visible = true
    }
    const editUe5Model = (record: { name: string; url: string; }, index: number): void => {
      Object.assign(formData, record)
      modal.title = '编辑模型'
      modal.index = index
      modal.visible = true
    }
    const deleteUe5Model = async (index: number): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      ueModel.scada.url.splice(index, 1)
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      message.success('删除成功')
    }
    onMounted(() => {
      getScrollY()
      areaList()
      getSceneList()
    })
    return (): JSX.Element =>
      <>
        <div class={styles['model-head']}>
          <div>
            <span> 模型名称：</span>
            <Input
              style={{ width: '300px' }}
              maxlength={50}
              placeholder='请输入模型名称'
              v-model:value={modal.textValue}
            />
          </div>
          <div>
            <Button type='primary' style={{ marginLeft: '10px' }} onClick={queryModel}>查询</Button>
            <Button style={{ marginLeft: '10px' }} onClick={resetting}>重置</Button>
          </div>
        </div>
        <Button type='primary' style={{ marginTop: '10px' }} onClick={addUe5Model}>新增</Button>
        <Table
          style={{ marginTop: '10px' }}
          columns={ue5Columns}
          dataSource={modelServer.value}
          scrollY={scrollY.value}
          rowKey='id'
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
          <Form model={formData} label-col={{ style: { width: '100px' } }}>
            <FormItem label='模型名称' name='name'>
              <Input
                maxlength={20}
                placeholder='请输入模型名称'
                v-model:value={formData.name}
              />
            </FormItem>
            <FormItem label='业务菜单' name='menu'>
              <Cascader
                v-model:value={formData.menu} placeholder='请选择业务菜单' field-names={{ label: 'name', value: 'name', children: 'children' }}
                options={menuOptions.value} allow-clear show-search change-on-select
              />
            </FormItem>
            <FormItem label='选择区域' name='area'>
              <Cascader
                v-model:value={formData.area} placeholder='请选择区域' field-names={{ label: 'name', value: 'name', children: 'children' }}
                options={areaOptions.value} allow-clear show-search change-on-select
              />
            </FormItem>
            <FormItem label='组态链接' name='url'>
              <Input
                v-model:value={formData.url}
                maxlength={200}
                placeholder='请输入'
              />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
