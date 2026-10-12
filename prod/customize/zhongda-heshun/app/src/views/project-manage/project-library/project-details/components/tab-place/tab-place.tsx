import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, PopOver, Page, Table, Form, FormItem, Input } from '@ghcloud/cube-ui'
// 移除 useCubeForm 导入
import { cubeZhongdaHeshunService } from '@/api/service'
import type { ProjectPlaceVO } from '@ghcloud/cube-zhongda-heshun-service'
import styles from './tab-place.module.less'
import PlaceSelect from '@/components/project-place/project-place'
import { useTableScroll } from '@/hook/use-table-scroll'
interface Props {
  projectId: string;
}
export const TabProjectPlace = defineComponent({
  name: 'TabProjectPlace',
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  setup: (props: Props) => {
    const { scrollY } = useTableScroll()

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })
    const tableData = ref<ProjectPlaceVO[]>([])
    const loading = ref(false)

    // 替换为Form组件的表单状态
    const formState = reactive({
      keyword: '',
      placeTypeId: '' as string | number | undefined
    })

    // 移除 searchFormSchema 和 useCubeForm 相关代码

    const columns = [
      {
        title: '序号',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        width: 70,
        customRender: ({ index }: { index: number; }): JSX.Element=> {
          return <PopOver content={index + 1 || '--'}>{index + 1 || '--'}</PopOver>
        }
      },
      {
        title: '重点场所名称',
        dataIndex: 'placeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '场所分类',
        dataIndex: 'placeTypeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '详细位置',
        dataIndex: 'placeDetail',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '经纬度',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: ProjectPlaceVO; }): JSX.Element=> {
          const text = `${record.longitude || '--'}，${record.latitude || '--'}`
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        slots: {
          customRender: 'action',
        },
        width: 250,
        align: 'center',
        customRender: ({ record }: { record: ProjectPlaceVO; }): JSX.Element => {
          return (
            <>

              <Button type='link' size='small' onClick={() => {
                toDetails(record)
              }}>详情</Button>

            </>
          )
        }
      },
    ]

    const getData = async (): Promise<void> => {
      loading.value = true
      try {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          projectId: props.projectId as string ?? '',
          placeTypeId: formState.placeTypeId as string ?? '',
          keyword: formState.keyword as string ?? '',
        }
        const data = await cubeZhongdaHeshunService.getProjectPlacePageList(params)
        page.total = data.total

        tableData.value = data.records
      } finally {
        loading.value = false
      }
    }

    // 搜索方法
    const handleSearch = (): void => {
      getData()
    }

    // 重置方法
    const handleReset = (): void => {
      formState.keyword = ''
      getData()
    }

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      getData()
    }

    const toDetails = async (record: ProjectPlaceVO): Promise<void> => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-place-details?id=${record.id}&action=details`)
    }

    const placeSelectMethods = (id: string | number | undefined): void => {
      page.pageNumber = 1
      page.pageSize = 10
      formState.placeTypeId = id
      getData()
    }

    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (
      <div class="layout-content-main">
        <div class={styles['layout-content-left']}>
          <PlaceSelect detail={true} projectId={props.projectId} upload={true} dataType='PLACE' onSelect={placeSelectMethods} />
        </div>
        <div class={styles['layout-content-right']}>
          {/* 替换CubeForm为Form组件 */}
          <div id='cube-query-form-container'>
            <Form layout='inline' style={{ margin: '16px 0' }} >
              <FormItem label="">
                <Input
                  v-model:value={formState.keyword}
                  placeholder="名称，详细位置"
                  showCount={false}
                  style={{ width: '240px' }}
                />
              </FormItem>
              <FormItem>
                <Button type="primary" onClick={handleSearch}>搜索</Button>
                <Button style={{ marginLeft: '8px' }} onClick={handleReset}>重置</Button>
              </FormItem>
            </Form>
          </div>
          <Table columns={columns} dataSource={tableData.value} loading={loading.value} scrollY={scrollY.value - 190} pagination={false}></Table>

          <div class={styles['layout-content-right-footer']}>
            <Page
              current={page.pageNumber}
              pageSize={page.pageSize}
              total={page.total}
              onPageChange={handleChange}
            />
          </div>
        </div>
      </div>
    )
  }
})