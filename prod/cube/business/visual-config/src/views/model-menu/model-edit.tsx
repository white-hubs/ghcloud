import { defineComponent, reactive, ref, onMounted, watch } from 'vue'
import './model-menu.less'
import { GLayout } from '@/components/common/layout'
import { Button, Form, FormItem, Input, InputNumber, PopConfirm, TabPane, Table, Tabs, message } from '@ghcloud/cube-ui'
import type { Rule } from 'ant-design-vue/lib/form'
import { Modal } from 'ant-design-vue'
import { FileUpload, GlobalSelect } from '@ghcloud/generic-component'
import { addModelPage, getSysDictionaryByItem, getModelPageById, getRoutePage, addRoutePage, deleteRoutePageById, putRoutePage, insertAreaAll, putModelPage } from '@/api/model'
import { useRoute, type LocationQueryValue } from 'vue-router'
import type { RouteList } from '@/api/models/mdata'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export const ModelEdit = defineComponent({
  setup: () => {
    const route = useRoute()
    const showselect = ref(true)
    //  const {id}=route.query.id
    const activeKey = ref(0)
    const routeref = ref()
    const visible = ref(false)
    const modelId = ref<string | null>('')
    const routeData = reactive<{
      serial: string;
      name: string;

      directory: string;
      modelId: string | LocationQueryValue[] | null;
      parentId: string;
      id: string;
    }>({
      serial: '',
      name: '',
      directory: '',
      modelId: '',
      parentId: '',
      id: ''
    })
    const formref = ref()
    const routerules: Record<string, Rule[]> = {
      serial: [{ required: true, message: '请输入序号', trigger: 'change' }],
      name: [{ required: true, message: '请输入模型导航名称', trigger: 'change' }],
      directory: [{ required: true, message: '请输入模型目录', trigger: 'change' }],
    }
    const rules: Record<string, Rule[]> = {
      name: [{ required: true, message: '请输入模型名称', trigger: 'change' }],
      modelType: [{ required: true, message: '请选择模型类型' }],
      file: [{ required: true, message: '请上传封面', trigger: 'change' }],
      address: [{
        required: true,
        message: '请输入地址',
        trigger: 'change'
      }],
    }
    const dataSource = ref<RouteList[]>([])
    const columns = ref([
      {
        title: '序号',
        dataIndex: 'serial',
        key: 'serial',
      },
      {
        title: '模型导航名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '模型导航编号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '模型目录',
        dataIndex: 'directory',
        key: 'directory',
      },
      {
        title: '操作',
        dataIndex: 'atcion',
        key: 'atcion',
        customRender: ({ record }: { record: RouteList; }): JSX.Element=>
          <>
            <Button type='link' onClick={() => {
              addnext(record.id)
            }}>新增下级</Button>
            <Button
              type='link' onClick={() => {
                editRoute(record)
              }}
            >编辑
            </Button>
            <PopConfirm
              title='是否确认删除该菜单?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record.id)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      },
    ])
    const columnstow = ref([
      {
        title: '序号',
        dataIndex: 'serial',
        key: 'serial',
      },
      {
        title: '模型导航名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '模型导航编号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '模型地址',
        dataIndex: 'directory',
        key: 'directory',
      },
      {
        title: '操作',
        dataIndex: 'atcion',
        key: 'atcion',
        customRender: ({ record }: { record: RouteList; }): JSX.Element=>
          <>
            <Button type='link' onClick={() => {
              addnext(record.id)
            }}>新增下级</Button>
            <Button
              type='link' onClick={() => {
                editRoute(record)
              }}
            >编辑
            </Button>
            <PopConfirm
              title='是否确认删除该菜单?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record.id)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      },
    ])
    const modelData = reactive({
      name: '',
      address: '',
      file: '',
      id: null,
      modelType: '',
      modelRoute: [],
      path: ''
    })
    const back = (): void => {
      history.back()
    }
    watch(() => modelData.modelType, (val) => {
      if (val !== 'unreal-engine-five') {
        modelData.address = ''
      }
    })
    const save = (): void => {

      formref.value.validate().then(async () => {
        if (modelData.id) {
          Modal.confirm({
            title: '是否保存已填写内容',
            cancelText: '取消',
            okText: '确定',
            async onOk () {
              const data = await putModelPage(modelData)
              message.success('保存成功')
              modelId.value = data.id
              if (activeKey.value === 1) {
                back()
                return
              }
              if (modelData.modelType === 'unreal-engine-five') {
                back()
                return
              }
              if (activeKey.value === 0) {
                activeKey.value = 1
                getRoute()
              }
            },
          })
        } else {
          Modal.confirm({
            title: '是否保存已填写内容',
            cancelText: '取消',
            okText: '确定',
            async onOk () {
              const data = await addModelPage(modelData)
              message.success('保存成功')
              modelId.value = data.id
              modelData.id = data.id
              if (modelData.modelType === 'unreal-engine-five') {
                back()
                return
              }
              if (activeKey.value === 0) {
                getRoute()
                activeKey.value = 1
              }
            },
          })
        }
      })
    }
    const insertArea = async (): Promise<void> => {
      const id = route.query.id === undefined ? modelId.value : route.query.id
      await insertAreaAll(id)
      message.success('导入成功')
      getRoute()
    }
    const tabchange = (): void => {
      if (activeKey.value === 1) {
        getRoute()
      }

      formref.value.validate().then(() => {
        if (route.query.id ?? modelId.value) return
        activeKey.value = 0
        message.error('请先保存模型')
      }).catch(() => {
        activeKey.value = 0
      })
    }
    const routeName = ref('')
    const getRoute = async (): Promise<void> => {
      const data = await getRoutePage({
        modelId: route.query.id === undefined ? modelId.value : route.query.id,
        name: routeName.value
      })
      dataSource.value = data
    }

    const addroute = (): void => {
      if (route.query.id) {
        routeData.modelId = route.query.id
      } else {
        routeData.modelId = modelId.value
      }


      routeref.value.validate().then(async () => {
        if (routeData.id) {
          await putRoutePage(routeData)
          getRoute()
          visible.value = false
        } else {
          await addRoutePage(routeData)
          getRoute()
          visible.value = false
        }
      })
    }
    const uploadEnd = (data: { id: string;path: string; }[]): void => {
      Object.assign(modelData, { ...modelData, file: data[0].id, path: data[0].path })

      formref.value.validate()
    }
    const handelDelete = async (id: string): Promise<void> => {
      await deleteRoutePageById(id)
      getRoute()
    }
    const editRoute = (record: RouteList): void => {
      Object.assign(routeData, record)
      visible.value = true
    }
    const addnext = (id: string): void => {
      visible.value = true
      Object.assign(routeData, {
        serial: '',
        name: '',
        directory: '',
        modelId: '',
        parentId: '',
        id: ''
      })
      routeData.parentId = id
    }

    onMounted(async () => {
      if (route.query.id) {
        getModelPageById(route.query.id).then((res) => {
          Object.assign(modelData, res)
          modelData.file = res.file.id
          modelData.path = res?.file?.path
          showselect.value = true
        })
      }
    })
    const gLayoutSlots = {

      'content-search': (): JSX.Element=> {
        return (
          <>
            <div class='flexBetween' />
          </>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <Tabs v-model:activeKey={activeKey} onTabChange={tabchange}>
              <TabPane key={0} tab='导入模型'>
                <Form model={modelData} rules={rules} ref={formref}>
                  <FormItem label='模型名称' name='name'>
                    <Input v-model:value={modelData.name} />
                  </FormItem>
                  <FormItem label='模型类型' name='modelType'>
                    <GlobalSelect
                      placeholder='请选择模型类型' fieldNames={{
                        label: 'name',
                        value: 'code'
                      }} v-model:value={modelData.modelType} apiFunction={getSysDictionaryByItem}
                    />
                  </FormItem>
                  {
                    modelData.modelType === 'unreal-engine-five'
                      ? <FormItem label='模型地址' name='address'>
                        <Input showCount={false} v-model:value={modelData.address} maxlength={999} />

                      </FormItem>
                      : ''
                  }

                  <FormItem label='模型封面' name='file'>

                    <FileUpload sceneCode={GLOBAL_SCENE_CODE.visualConfig} onEnd={uploadEnd} typelist={['.png', '.jpeg', '.jpg']} size={1} multiple={false} showtext />
                    <span>请上传PNG、JPG、JEPG的图片；大小不超1M</span>
                    {modelData.path === ''
                      ? ''
                      : <div>
                        <img style='width:100px;height:100px' src={modelData.path} alt='' />
                      </div>}

                  </FormItem>

                </Form>

              </TabPane>
              {
                modelData.modelType !== 'unreal-engine-five' &&
      <TabPane key={1} tab='模型导航'>

        <div><Button
          type='primary' onClick={() => {
            Object.assign(routeData, {
              serial: '',
              name: '',
              directory: '',
              modelId: '',
              parentId: '',
              id: ''
            })
            visible.value = true
          }}
        >新增
        </Button> <Button onClick={insertArea}>导入业务区域</Button>
        </div>
        <div>
          <div style='margin-top:10px;margin-bottom:10px'>
            <span>模型导航名称：</span><Input
              v-model:value={routeName.value} showCount={false} style='width:200px
        '
            />
            <Button
              style='margin-left:10px' onClick={() => {
                routeName.value = ''
                getRoute()
              }}
            >重置
            </Button> <Button type='primary' onClick={getRoute}>查询</Button>
          </div>
          <Table dataSource={dataSource.value} columns={modelData.modelType === 'unreal-engine-five' ? columns.value : columnstow.value} pagination={false} rowKey='id' scrollY={320} />

        </div>
      </TabPane>
                // activeKey.value===
              }

            </Tabs>
          </>
        )
      },
      'footer-page': (): JSX.Element=> {
        return (
          <>
            <Button style='float:right;margin-bottom:20px' onClick={back}>返回</Button>
            <Button style='float:right;margin-bottom:20px;margin-right:10px' type='primary' onClick={save}>{!activeKey.value && modelData.modelType !== 'unreal-engine-five' ? '下一步' : '完成'}</Button>
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <GLayout title='模型管理' showFooter v-slots={gLayoutSlots} />
        <Modal
          visible={visible.value}
          title='添加导航'
          onOk={addroute}
          destroyOnClose
          onCancel={() => {
            Object.assign(routeData, {
              serial: '',
              name: '',
              directory: '',
            })
            visible.value = false
          }}
        >
          <Form model={routeData} ref={routeref} rules={routerules} labelCol={{ span: 5, offset: 1 }}>
            <FormItem label='序号' name='serial'>
              <InputNumber v-model:value={routeData.serial} max={20000} />
            </FormItem>
            <FormItem label='模型导航名称' name='name'>
              <Input showCount={false} v-model:value={routeData.name} />
            </FormItem>

            <FormItem label={modelData.modelType === 'unreal-engine-five' ? '模型目录' : '模型地址'} name='directory'>
              <Input showCount={false} v-model:value={routeData.directory} maxlength={999} />
            </FormItem>

          </Form>

        </Modal>
      </>
  }
})
