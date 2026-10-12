
import { Button, Form, FormItem, Input, Modal, PopConfirm, Table, message } from '@ghcloud/cube-ui'
import Textarea from '@ghcloud/cube-ui/src/components/textarea/textarea'
import styles from './roaming-route.module.less'
import _ from 'lodash'
import { defineComponent, nextTick, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { createUuid } from '@/utils/common'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import {
  addModel
} from '@/api/model'
interface RouteListType {
  id?: string | undefined;
  detail: string | undefined;
  routeName: string | undefined;
  route?: PointType[] | undefined;
  pointName?: string | undefined;
  perspective?: string | undefined;
}
interface PointType {
  id: string;
  pointName: string ;
  perspective: string ;
  speed: number ;
}
export default defineComponent({
  name: '',
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    }
  },
  setup (props) {
    const modelConfigData = ref<ModelConfigItf>()
    const routeName = ref<string | undefined>()
    watch(() => props.data, () => {
      modelConfigData.value = props.data
    }, { immediate: true, deep: true })
    const routeListColumns = [
      {
        title: '漫游路线名称',
        dataIndex: 'routeName',
        key: 'routeName',
        customRender: ({ record }: { record: RouteListType; }): JSX.Element =>
          <>
            <Button type='link' onClick={() => {
              openModal('edit', record)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除该路线?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      },
      {
        title: '详情',
        dataIndex: 'detail',
        key: 'detail'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: RouteListType; }): JSX.Element =>
          <>
            <Button type='link' onClick={() => {
              openModal('edit', record)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除该路线?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    // 获取漫游路线
    const getRoamingRouteList = async (): Promise<void> => {
      const routeList: RouteListType[] = []
      modelConfigData.value?.ue5.roamingRoute.forEach(item => {
        routeList.push({
          routeName: item.name,
          detail: item.route.map(x => x.pointName).join('->'),
          route: item.route,
          id: item.id
        })
      })
      if (searchFormData.routeName) {
        const list = routeList.filter(x =>
          x.routeName === searchFormData.routeName)
        routeListTableData.value = list ?? []
      } else {
        routeListTableData.value = routeList ?? []
      }
    }
    // const searchRoute = reactive({
    //   pageNumber: 1,
    //   pageSize: 10,
    //   total: 0
    // })
    // const changePage = (page: number, pageSize: number): void => {
    //   searchRoute.pageNumber = page
    //   searchRoute.pageSize = pageSize
    //   getRoamingRouteList()
    // }
    // const changeSize = (current: number, size: number): void => {
    //   searchRoute.pageNumber = 1
    //   searchRoute.pageSize = size
    //   getRoamingRouteList()
    // }
    // 查询
    const searchView = (): void => {
      // searchRoute.pageNumber = 1
      getRoamingRouteList()
    }
    const resetSearchView = (): void => {
      // searchRoute.pageNumber = 1
      searchFormData.routeName = undefined
      getRoamingRouteList()
    }
    const routeListTableData = ref<RouteListType[]>([])
    const scrollY = ref<number>(200)
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
      nextTick(() => {
        getscrollY()
        getRoamingRouteList()
      })
    })
    const routeListTableLoading = ref<boolean>(false)
    const searchFormData = reactive<RouteListType>({ detail: '', routeName: '' })
    // 弹窗===================================================================================================
    const pointFormData = reactive<PointType>({ perspective: '', pointName: '', id: '', speed: 0.3 })
    const modal = reactive({
      visible: false,
      title: '新增全局视角',
    })
    const operateType = ref('add')
    const currentItem = ref<RouteListType>()
    // 打开弹窗
    const openModal = async (type: string, item?: RouteListType): Promise<void> => {
      modal.visible = true
      if (type === 'edit') {
        modal.title = '编辑漫游线路'
        pointListData.value = item?.route ?? []
        routeName.value = item?.routeName
        operateType.value = 'edit'
        currentItem.value = item
      } else {
        modal.title = '新增漫游线路'
        operateType.value = 'add'
        routeName.value = undefined
        pointFormData.perspective = ''
        pointFormData.pointName = ''
      }
    }
    // const roamingSearch = reactive({
    //   pageNumber: 1,
    //   pageSize: 10,
    //   total: 0
    // })
    // const roamingChangePage = (page: number, pageSize: number): void => {
    //   roamingSearch.pageNumber = page
    //   roamingSearch.pageSize = pageSize
    // }
    // const roamingChangeSize = (current: number, size: number): void => {
    //   roamingSearch.pageNumber = 1
    //   roamingSearch.pageSize = size
    // }
    const pointListColumns = [
      {
        title: '点位名称',
        dataIndex: 'pointName',
        key: 'name',
        customRender: ({ record }: { record: RouteListType; }): JSX.Element =>
          <>
            <Input
              maxlength={8}
              placeholder='请输入漫游路线名称'
              v-model:value={record.pointName}
            />
          </>
      },
      {
        title: '视角参数',
        dataIndex: 'perspective',
        key: 'perspective',
        customRender: ({ record }: { record: RouteListType; }): JSX.Element =>
          <>
            <Input
              maxlength={500}
              placeholder='请输入漫游路线名称'
              v-model:value={record.perspective}
            />
          </>
      },
      {
        title: '速度',
        dataIndex: 'speed',
        key: 'speed',
        customRender: ({ record }: { record: PointType; }): JSX.Element =>
          <Input type='text' v-model:value={record.speed} />
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: PointType; }): JSX.Element=>
          <Button type='text' onClick={() => {
            deleteRoute(record)
          }} danger>移除</Button>
      }
    ]
    const pointListData = ref<PointType[]>([])
    // 添加点位
    const addPoint = (): void => {
      pointFormData.id = createUuid()
      const item = _.cloneDeep(pointFormData)
      pointListData.value.push(item)
      pointFormData.pointName = ''
      pointFormData.perspective = ''
      pointFormData.id = createUuid()
    }
    // 删除点位
    const deleteRoute = (item: PointType): void => {
      pointListData.value.splice(pointListData.value.findIndex(i => i.id === item.id), 1)
    }
    // 路线保存
    const handelSave = async (): Promise<void> => {
      const routes = { name: routeName.value ?? '', id: createUuid(), route: pointListData.value }
      if (operateType.value === 'add') {
        // @ts-ignore
        modelConfigData.value?.ue5.roamingRoute.push(routes)
        await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
      } else {
        const item = modelConfigData.value?.ue5.roamingRoute.find(x => x.id === currentItem.value?.id) ?? { name: '', id: '', route: [] }
        item.name = routeName.value ?? ''
        // @ts-ignore
        item.route = pointListData.value
        await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
      }
      // searchRoute.pageNumber = 1
      message.success('保存成功')
      getRoamingRouteList()
      pointListData.value = []
      modal.visible = false
    }
    // 删除路线
    const handelDelete = async (item: RouteListType): Promise<void> => {
      try {
        const index = modelConfigData.value?.ue5.roamingRoute.findIndex(x => x.id === item.id) ?? -1
        if (index >= 0) {
          modelConfigData.value?.ue5.roamingRoute.splice(index, 1)
          await addModel({ modelConfiguration: JSON.stringify(modelConfigData.value) })
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      } catch {
      }
      // searchRoute.pageNumber = 1
      getRoamingRouteList()
    }
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <div class={styles.header}>
          <Form model={searchFormData} layout='inline' label-align='left' label-col={{ style: { width: '100px' } }}>
            <FormItem label='漫游路线' name='route'>
              <Input
                maxlength={8}
                placeholder='请输入区域名称搜索'
                v-model:value={searchFormData.routeName}
              />
            </FormItem>
          </Form>
          <div class={styles.search}><Button onClick={resetSearchView}>重置</Button><Button type='primary' onClick={searchView}>查询</Button></div>
        </div>
        <Button type='primary' style={{ marginBottom: '10px' }} onClick={() => {
          openModal('add')
        }}>新增漫游线路</Button>
        <Table
          columns={routeListColumns}
          dataSource={routeListTableData.value}
          scrollY={scrollY.value}
          rowKey='id'
          loading={routeListTableLoading.value}
          pagination={false}
        />
        {/* <div style={{ float: 'right', marginTop: '20px' }}>
                <GPagination
                  current={searchRoute.pageNumber}
                  pageSize={searchRoute.pageSize}
                  total={searchRoute.total}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div> */}
        <Modal
          width='900px'
          visible={modal.visible}
          okText='提交'
          title={modal.title}
          onOk={handelSave}
          onCancel={() => {
            modal.visible = false
            pointListData.value = []
          }}
        >
          <Form model={pointFormData} label-col={{ style: { width: '120px' } }}>
            <FormItem label='漫游路线名称' style={{ width: '330px' }}>
              <Input
                maxlength={8}
                placeholder='请输入漫游路线名称'
                v-model:value={routeName.value}
              />
            </FormItem>

            <FormItem label='点位名称' name='pointName' style={{ width: '310px', padding: '0px', margin: '0px' }}>
              <Input
                maxlength={8}
                placeholder='请输入点位名称'
                v-model:value={pointFormData.pointName}
              />
            </FormItem>

            <FormItem label='速度(单位：米/秒)' name='pointName' style={{ width: '310px', padding: '0px', marginTop: '10px' }}>
              <Input
                placeholder='请输入速度'
                v-model:value={pointFormData.speed}
              />
            </FormItem>
            <div style={{ marginTop: '10px', display: 'flex' }}>
              <FormItem label='视角参数' name='perspective' style={{ width: '100%' }}>
                <Textarea v-model:value={pointFormData.perspective} showCount={false} />
              </FormItem>
              <Button type='primary' ghost onClick={addPoint}>添加</Button>
            </div>
          </Form>
          <Table
            style={{ marginTop: '10px' }}
            columns={pointListColumns}
            dataSource={pointListData.value}
            scrollY={500}
            rowKey='id'
            loading={routeListTableLoading.value}
            pagination={false}
          />
        </Modal>
      </div>
  }
})
