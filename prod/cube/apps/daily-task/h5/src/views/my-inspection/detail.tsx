import { List, Empty, PullRefresh, Cell, CellGroup } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import './inspection-detail.less'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { cubeDailyInspectionService } from '@/api/server'
import type { DetailRecordPage } from '@ghcloud/cube-daily-inspection-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 巡检档案详情列表页 */
export const InspectionList = defineComponent({
  setup: () => {
    const route = useRoute()
    const dataSource = ref<DetailRecordPage[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const statisticsNum = reactive({
      totalNum: 0,
      abnormalNum: 0
    })
    const search = reactive({
      targetId: route.query.entityId as string,
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      temporary: '0'
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
    const getStatistics = async (): Promise<void> => {
      try {
        const { totalNum, abnormalNum } = await cubeDailyInspectionService.detailStatistics({ targetId: route.query.entityId as string })
        statisticsNum.totalNum = totalNum
        statisticsNum.abnormalNum = abnormalNum
      } catch (error) {
      }
    }
    getStatistics()
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    return (): VNode =>
      <div style={{ height: '100vh', background: '#f3f7fa' }}>
        <CubeNavBar showBack title={route.meta.title} />
        <div class='inspection-detail-header'>
          <div style={{ color: '#323233' }}>{route.query.entityName}</div>
          <div><label>巡检次数：</label> <span style={{ color: '#6AB539', fontWeight: 600 }}> {statisticsNum.totalNum}</span></div>
          <div><label>巡检结果异常次数：</label> <span style={{ color: '#FF4158' }}> {statisticsNum.abnormalNum}</span></div>
        </div>
        <PullRefresh v-model={refreshing.value} onRefresh={onSearch} class='inspection-detail-content'>
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
                    <Cell class='detail-cell'>
                      <div class='detail-cell-item'>
                        <label>巡检结果：</label>
                        <span style={{ color: `${item.result === 'NORMAL' ? '#6AB539' : '#FF4158'}` }}>{item.result === 'NORMAL' ? '正常' : '异常'}</span>
                      </div>
                      <div class='detail-cell-item'>
                        <label>巡检人员：</label>
                        <span>{item?.username || '--'}</span>
                      </div>
                      <div class='detail-cell-item'>
                        <label>巡检时间：</label>
                        <span>{dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                      </div>
                      <div class='detail-cell-item'>
                        <label>所属任务：</label>
                        <span>{item.taskName || '--'}</span>
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
