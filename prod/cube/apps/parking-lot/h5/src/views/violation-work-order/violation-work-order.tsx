import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, Cell, showNotify } from 'vant'
import styles from './violation-work-order.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeParkingLotService } from '@/api/server'
import type { IllegalParkingRecordVO } from '@ghcloud/cube-parking-lot-service/src/type'
import dayjs from 'dayjs'
import { SearchBar } from "./search-bar/search-bar";

export const ViolationWorkOrder = defineComponent({
  name: 'ViolationWorkOrder',
  setup () {
    document.title = '违停工单'
    const searchRef = ref<{ getFormState: () => Record<string, string>; }>()
    const dataSource = ref<IllegalParkingRecordVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 0,
      pageSize: 10
    })

    const statusMap = new Map([
      ['SUBMIT', '提交'],
      ['UNDO', '撤销'],
      ['REPEAT', '重新提交'],
      ['APPROVAL', '审批'],
      ['BACK', '撤回'],
      ['COPY', '抄送'],
      ['REJECT', '驳回'],
      ['FINISHED', '完成']
    ])

    const statusColorMap = new Map([
      ['SUBMIT', '#FE8704'], // Orange
      ['APPROVAL', '#FE8704'],
      ['FINISHED', '#00C853'], // Green
      ['REJECT', '#FF3D00'], // Red
      ['BACK', '#FF3D00'],
      ['UNDO', '#9E9E9E'], // Grey
    ])

    const getStatusText = (status?: string) => {
      return statusMap.get(status || '') || '处理中'
    }

    const getStatusColor = (status?: string) => {
      return statusColorMap.get(status || '') || '#FE8704'
    }

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const formState = searchRef.value?.getFormState() ?? {}
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          businessType: 'ILLEGAL_PARKING',
          ...formState,
          submitTime: formState.period as string ?? '',
        }
        const res = await cubeParkingLotService.getIllegalParkingList(params)
        search.total = res.total
        
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        
        dataSource.value = [...dataSource.value, ...res.records]
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
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

    // 进入详情
    const toDetail = (item: IllegalParkingRecordVO): void => {
      const path = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=ILLEGAL_PARKING&processId=${item?.processInstanceId}`
      window.location.href = path
    }

    onMounted(() => {
      onRefresh()
    })
    const handleAdd = (): void => {
      window.location.href = '/streamengineH5/initiating-work-order?processType=ADD&businessType=ILLEGAL_PARKING'
    }

    const handleConfirmFilter = (): void => {
      onRefresh()
    }

    return (): JSX.Element => (
      <div class={styles['violation-list']}>
        <CubeNavBar showBack title={'违停工单'} rightSlot={() => <span style={{ color: '#1989fa'}} onClick={() => handleAdd()}>发起违停工单</span>} />
        <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['pull-refresh']}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <div class={styles['violation-cell-group']}>
              {dataSource.value.map((item, index) => (
                <div key={item.processInstanceId ?? index} class={styles['violation-card']} onClick={() => toDetail(item)}>
                  <Cell>
                    <div class={styles['violation-cell-title']}>
                      <div class={styles['name-status']}>
                        <span 
                          class={styles['status-tag']} 
                          style={{ background: getStatusColor(item.status) }}
                        >
                          {getStatusText(item.status)}
                        </span>
                        <span class={styles.name}>{item.instanceName || '--'}</span>
                      </div>
                    </div>
                  </Cell>
                  <div class={styles['violation-cell-content']}>
                    <div class={styles['info-item']}>
                      <label>违停对象：</label>
                      <span>{item.plateNumber || '--'}</span>
                    </div>
                    <div class={styles['info-item']}>
                      <label>发起时间：</label>
                      <span>{item.submitedTime ? dayjs(item.submitedTime).format('YYYY-MM-DD HH:mm') : '--'}</span>
                    </div>
                    <div class={styles['info-item']}>
                      <label>处理进度</label>
                      <span>{item.activeNodeName || '--'}</span>
                    </div>
                    <div class={styles['info-item']}>
                      <label>发起部门：</label>
                      <span>{item.startUserInfo?.organizationName || '--'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(dataSource.value.length === 0 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </div>
    )
  }
})
