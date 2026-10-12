import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, PopOver, Table } from '@ghcloud/cube-ui'
import { useRoute, useRouter } from 'vue-router'
import { aggregationGroupDetail } from '@/api/device'
import '../device-group/device-group.less'
export const DeviceGroupDetail = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const detailsData = reactive<{
      groupName: string;
      devNum: string;
    }>({
      groupName: '',
      devNum: ''
    })
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '变量名称',
        dataIndex: 'varName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '变量标识',
        align: 'center',
        dataIndex: 'varCode',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>
        }
      },
      {
        title: '关联控制器',
        align: 'center',
        dataIndex: 'refCtlName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>
        }
      },
      {
        title: '属性标识',
        align: 'center',
        dataIndex: 'virtualCode',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>
        }
      },
      {
        title: '变量值',
        dataIndex: 'val',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { val: string; rawVal: string; }; }): JSX.Element => {
          return (
            <PopOver
              v-slots={{
                content: () => (
                  <div>
                    <p>变量值：{record.val ?? '--'}</p>
                    <p>原始值：{record.rawVal ?? '--'}</p>
                  </div>
                )
              }} placement='right'
            >{record.val ?? '--'}
            </PopOver>
          )
        }
      },
      {
        title: '上报时间',
        align: 'center',
        dataIndex: 'lastUpdateTime',
        ellipsis: true,
        width: '200px',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text}>{text}</PopOver>
        }
      },
    ]
    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const goPage = (): void => {
      router.push({ path: '/deviceGroup', query: route.query })
    }
    const layoutSlots = {
      'layout-search': (): JSX.Element => {
        return (
          <div class='deviceInfo'>
            <div class='deviceInfo_contenr'>
              <div>
                设备名称：{detailsData.groupName}
              </div>
              <div style='margin-left:50px'>
                设备编码：{detailsData.devNum}
              </div>
            </div>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' />
          </>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <>
            <Button onClick={goPage}>返回</Button>
          </>
        )
      }

    }
    // 获取详情内容
    const getDetailsInfo = async (): Promise<void> => {
      if (router.currentRoute.value.query.groupId?.toString()) {
        const res = await aggregationGroupDetail({ groupId: router.currentRoute.value.query.groupId?.toString() })
        Object.assign(detailsData, res.data)
        dataSource.value = res.data.varList
      }
    }
    onMounted(() => {
      getDetailsInfo()
    })
    return (): JSX.Element =>
      <>
        <Layout title='设备详情' showFooter v-slots={layoutSlots} />
      </>
  }
})
