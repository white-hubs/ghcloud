
import { defineComponent, onMounted, reactive, ref } from 'vue'
import './tab-correction.less'
import { PullRefresh, showNotify, List, CellGroup, Empty, Cell } from 'vant'
import dayjs from 'dayjs'
import { cubeSmallEngineeringService } from '@/api/server'
import { useRoute } from 'vue-router'
import type { ProjectReformVO } from '@ghcloud/cube-small-engineering-service'

export const TabCorrection = defineComponent({
  setup () {
    const { id } = useRoute().query as { id: string; }
    const dataSource = ref<ProjectReformVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })
    const getDataSource = async (): Promise<{ total: number; records: ProjectReformVO[]; }> => {
      try {
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          projectScheduleId: id,
          businessType: 'PROJECT_REFORM'
        }
        const { total, records } = await cubeSmallEngineeringService.getProjectReformList(params)
        return { total, records }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        return { total: 0, records: [] }
      }
    }

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getDataSource()
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }
    const getData = async (): Promise<void> => {
      dataSource.value.length = 0
      onRefresh()
    }
    const toDetail = (value: ProjectReformVO): void => {
      window.location.href = `/streamengineH5/initiating-work-order?businessType=${value.businessType}&processId=${value.processInstanceId}&processType=HANDLING`
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class='correction-list'>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
              dataSource.value.map((e) => {
                return (
                  <CellGroup inset key={e.processInstanceId} class='list-item'>
                    <div class='van-cell card-body' onClick={() => {
                      toDetail(e)
                    }}>
                      <div class='right'>
                        <Cell is-link title={e.instanceName || '--'} value='' border style={{ width: '100%', padding: '0px' }} />
                        <div class='item'>发起人：{e?.startUserName || e?.startUserInfo?.startUserName || '--'}</div>
                        <div class='item'>发起部门：{e?.startUserInfo?.organizationName || '--'}</div>
                        <div class='item'>发起时间：{dayjs(e.submitedTime).format('YYYY-MM-DD HH:mm')}</div>
                      </div>
                    </div>
                  </CellGroup>
                )
              })
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </>
  }
})
