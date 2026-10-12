import { List, Empty, PullRefresh, Cell, CellGroup } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import './inspection-detail.less'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { cubeDailyInspectionService } from '@/api/server'
import type { DetailRecordPage } from '@ghcloud/cube-daily-inspection-service'

/** 巡检档案详情列表页 */
export const InspectionList = defineComponent({
  props: {
    targetId: {
      type: String,
      default: ''
    },
    temporary: {
      type: String,
      default: ''
    },
  },
  setup: (props) => {
    const router = useRouter()
    const dataSource = ref<DetailRecordPage[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      targetId: props.targetId ?? '',
      temporary: props.temporary ?? '',
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    // 获取巡检详情列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyInspectionService.detailRecordPage({ ...search })
        search.total = res.total

        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    // 进入详情
    const toDetail = (id: string): void => {
      router.push({ path: '/inspection-record', query: { id } })
    }
    return (): VNode =>
      <div style={{ height: '67vh', background: '#f3f7fa' }}>
        <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '67vh', overflow: 'auto' }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              dataSource.value && dataSource.value.length > 0 &&
              dataSource.value.map((item) => {
                return (
                  <CellGroup inset class='detail-cell-group' key={item.id}>
                    <Cell>
                      <div class='detail-cell-title'>
                        <div class='name-status'>
                          <span class='name'>{dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                        </div>
                        <div class='status' style={{ color: `${item.result === 'NORMAL' ? '#6AB539' : '#FF4158'}` }}>{item.result === 'NORMAL' ? '正常' : '异常'}</div>
                      </div>
                    </Cell>
                    <Cell class='detail-cell' onClick={() => {
                      toDetail(item.id)
                    }}>
                      <div class='detail-cell-item'>
                        <label>执行人：</label>
                        <span>{item?.username || '--'}</span>
                      </div>
                      <div class='detail-cell-item'>
                        <label>异常项：</label>
                        <span>{item.errValueNum || '--'}</span>
                      </div>
                    </Cell>
                  </CellGroup>
                )
              })
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </div>
  }
})
