import { cubeDeviceSuperviseService } from '@/api/service'
import { PopOver, Table } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
import { defineComponent, onMounted, ref } from 'vue'

interface Props {
  id: string;
  businessKey: string;
}
/** 设备通知详情-通知记录 */
export const TabPaneAlarmNotice = defineComponent({
  props: ['id', 'businessKey'],
  setup: (props: Props) => {
    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const getDetailData = async (): Promise<void> => {
      loading.value = true
      try {
        cubeDeviceSuperviseService.getAlarmHandleProcess(props.id).then(res => {
          dataSource.value = res
        })
      } catch {
      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      getDetailData()
    })
    const msgColumns = [
      {
        title: '时间',
        dataIndex: 'operatorTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '操作人',
        dataIndex: 'operatorByName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '处理内容',
        dataIndex: 'operatorContent',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    return (): JSX.Element =>
      <>
        <VerticalLine title='处理流程记录' />
        <Table
          columns={msgColumns}
          loading={loading.value}
          dataSource={dataSource.value}
          pagination={false}
          size='small'
          style='margin-top:10px;margin-bottom:20px'
        />
      </>
  }
})
