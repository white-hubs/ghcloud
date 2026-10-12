import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { Table } from '@ghcloud/cube-ui'
import moment from 'moment'
import { getAlarmHandleProcessLog } from '@/api/alarm'
import { useRoute } from 'vue-router'

interface Props {
  marketInfo: Record<string, string>;
}

export const HandleLog = defineComponent({
  props: {
    marketInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup: (props: Props) => {
    const state = reactive<{ loading: boolean;logList: Record<string, unknown>[]; }>({
      logList: [],
      loading: false,
    })
    const route = useRoute()
    const columns = [
      {
        title: '时间',
        dataIndex: 'operatorTime',
        slots: {
          customRender: 'operatorTime'
        },
        customRender: ({ text }: { text: string; }): string=> {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
      },
      {
        title: '操作人',
        dataIndex: 'operatorByName',
      },
      {
        title: '处理内容',
        dataIndex: 'operatorContent',
      },
    ]
    const getLogList = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getAlarmHandleProcessLog({
          id: route.query.id as string,
          url: props.marketInfo.url,
          tenant: props.marketInfo.tenant,
          token: props.marketInfo.token
        })
        state.logList = data
      
      } catch {
      } finally {
        state.loading = false
      }
    }
    onMounted(async () => {
      getLogList()
    })
    return (): JSX.Element => (
      <>
        <div class={styles['operate-log']}>
          <div class={styles.title}>处理流程记录</div>
          <Table
            dataSource={state.logList}
            columns={columns}
            pagination={false}
            size='small'
            loading={state.loading}
            scrollY={500}
          />
        </div>

      </>
    )
  }
})
