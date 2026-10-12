import { List, Empty, PullRefresh, Cell, CellGroup, CheckboxGroup, type CheckboxGroupInstance, Checkbox, Popup, Button } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import styles from './fault-list.module.less'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { Bar } from '../components/bar/bar'
import { cubeFileService, cubeMaintainService } from '@/api/server'
import { FaultColorStatus, FaultStatus } from './types'
import type { FaultListType } from '@ghcloud/cube-maintain-service'
import { FilterDom } from './filter/filter-dom'
import { CubeStreamSDK, type InterruptData, type TaskQueenType } from '@ghcloud/cube-stream-engine-core'
import { ApprovalResult, Signature } from '@ghcloud/cube-stream-engine-ui'
import { authStore } from '@/api/auth-store'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

/** 故障报修列表页 */
export const FaultList = defineComponent({
  setup: () => {
    const route = useRoute()
    const dataSource = ref<FaultListType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const checked = ref<string[]>([])
    const isCheckAll = ref(false)
    const checkedTask = ref<{ taskName: string; businessKey: string;businessType: string; }[]>([])
    const interruptDialog = ref(false)
    const isIndeterminate = ref(true)
    const checkboxGroupRef = ref<CheckboxGroupInstance>()
    const checkboxRefs = ref<{ toggle: () => void;Element: Element; }[]>([])
    const batchLoading = ref(false)
    const file = ref({ id: '', path: '' })
    const taskQueen = ref()
    const resultDialog = ref(false)
    const startTime = route.query.period ? ((route.query.period as string).split(',')[0]) : ''
    const endTime = route.query.period ? ((route.query.period as string).split(',')[1]) : ''
    const interruptData = ref<InterruptData>({ needApprovalText: false, needApprovalSign: false, imageSign: { path: '', id: '' } })
    const isApproval = ref(false)
    CubeStreamSDK.init({ authStore })
    const cubeStreamSDK = CubeStreamSDK.getInstance()
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      status: '',
      period: route.query.period as string,
      startTime,
      endTime
    })
    const title = new Map([
      ['SUBMIT', '我发起'],
      ['WAITING', '待处理'],
      ['HANDLED', '已处理'],
    ])

    // 获取故障列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const detailsId = route.query?.detailIds && (JSON.parse(route.query.detailIds as string)?.faultIds.join(',') ?? '')
        const res = route.query.type
          ? (
            await cubeMaintainService.getFaultBacklog({ ...search, applicationCode: 'FAULT', businessType: '', type: route.query.type as string })
          )
          : (
            await cubeMaintainService.getFlowProcessPage({ ...search, businessType: 'FAULT', processInstanceIds: detailsId })
          )
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
        dataSource.value = [...dataSource.value, ...res.records as FaultListType[]]
      } catch {
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
    const toDetail = async (item: FaultListType): Promise<void> => {
      sessionStorage.setItem('query', JSON.stringify(route.query))
      window.location.href = `/streamengineH5/initiating-work-order?businessType=FAULT&processId=${item.processInstanceId}&processType=HANDLING&isLogin=${route.query.isLogin}&tenant=${route.query.tenant}`
    }
    const showRight = ref(false)
    const reset = (): void => {
      search.status = ''
      search.period = ''
      search.startTime = ''
      search.endTime = ''
      showRight.value = false
    }
    // 查询
    const submit = (): void => {
      search.period = search.startTime && search.endTime ? (search.startTime + ',' + search.endTime) : ''
      onSearch()
      showRight.value = false
    }
    // 选择任务
    const handleCheck = (e: Event): void => {
      e.stopPropagation()
      isCheckAll.value = checked.value.length === dataSource.value.length
      isIndeterminate.value = checked.value.length > 0 && checked.value.length < dataSource.value.length
    }
    // 全选
    const checkAllChange = (val: boolean): void => {
      checkboxGroupRef.value?.toggleAll({
        checked: val,
        skipDisabled: true,
      })
      checked.value = val ? checked.value : []
      isIndeterminate.value = false
    }
    // 一键审批
    const batchApprovals = async (): Promise<void> => {
      checkedTask.value = []
      batchLoading.value = true
      dataSource.value.forEach(x => {
        if (checked.value.includes(x.processInstanceId)) {
          checkedTask.value.push({ taskName: x.instanceName, businessKey: x.processInstanceId, businessType: x.businessType })
        }
      })
      // 执行审批
      const { checkData, queen, isInterrupt } = await cubeStreamSDK.APPROVAL.batchApproval(checkedTask.value)
      if (isInterrupt) {
        // 需要签名
        interruptDialog.value = true
        interruptData.value = checkData
        file.value.path = checkData.imageSign.path
        file.value.id = checkData.imageSign.id
      } else {
        // 不需要签名
        resultDialog.value = true
      }
      taskQueen.value = queen as TaskQueenType
    }
    const resultConfirm = (): void => {
      onSearch()
      checked.value = []
      isIndeterminate.value = false
      batchLoading.value = false
    }
    const rightDom = (): VNode =>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#646566' }}>
        <span v-show={route.query.type === 'WAITING'} style={{ marginRight: '10px' }} onClick={() => {
          isApproval.value = !isApproval.value
        }}>{isApproval.value ? '取消批量' : '批量'}</span>
        <span onClick={() => {
          showRight.value = true
        }}>筛选</span>
      </div>
    return (): JSX.Element =>
      <div style={{ height: '100vh', background: '#f3f7fa', overflowY: 'hidden' }}>
        <Bar
          title={title.get(route.query.type as string) ?? '故障报修'}
          onReset={reset}
          showRight={showRight.value}
          onSubmit={submit}
          right={rightDom()}
        >
          <FilterDom v-model:searchForm={search} />
        </Bar>
        <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '94vh', overflow: 'auto' }}>
          <div>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              <CheckboxGroup v-model={checked.value} ref={(el: CheckboxGroupInstance) => {
                checkboxGroupRef.value = el
              }}>
                <CellGroup inset class={styles['fault-cell-group']}>
                  {dataSource.value && dataSource.value.length > 0 && dataSource.value.map((item, index) => {
                    return (
                      <div key={item.formInstanceId} style={{ margin: '10px 0' }}>
                        <Cell>
                          <div class={styles['fault-cell-title']}>
                            <div class={styles['name-status']}>
                              <span class={[styles['fault-status']]} style={{ background: FaultColorStatus.get(item.status) }}>{FaultStatus.get(item?.status)}</span>
                              <span class={styles.name}>{item.instanceName}</span>
                            </div>
                            <Checkbox
                              style={{ marginRight: '4px' }}
                              v-show={isApproval.value}
                              name={item.processInstanceId}
                              onClick={(e: Event) => {
                                handleCheck(e)
                              }}
                              ref={(el: { toggle: () => void;Element: Element; }) => {
                                checkboxRefs.value[index] = el
                              }}
                            />
                          </div>
                        </Cell>
                        <Cell class={styles['fault-cell']} onClick={() => {
                          toDetail(item)
                        }}>
                          <div>
                            <div class={styles['fault-cell-item']}>
                              <label>故障对象：</label>
                              <span>{item.objName || '--'}</span>
                            </div>
                            <div class={styles['fault-cell-item']}>
                              <label>解决结果：</label>
                              <span>{item.result || '--'}</span>
                            </div>
                            <div class={styles['fault-cell-item']}>
                              <label>发起时间：</label>
                              <span>{dayjs(item.submitedTime).format('YYYY-MM-DD HH:mm')}</span>
                            </div>
                            <div class={styles['fault-cell-item']}>
                              <label>发起部门：</label>
                              <span>{item?.startUserInfo.organizationName}</span>
                            </div>
                          </div>
                        </Cell>
                      </div>
                    )
                  })}
                </CellGroup>
              </CheckboxGroup>
              {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
            </List>
          </div>
        </PullRefresh>
        <Popup
          v-model:show={isApproval.value}
          overlay={false}
          position='bottom'
          style={{ height: '10%' }}
        >
          <div class={styles.bottom}>
            <div>
              <Checkbox
                indeterminate={isIndeterminate.value}
                v-model={isCheckAll.value}
                onChange={checkAllChange}
              >
                <span>全选</span>
              </Checkbox>
            </div>
            <span>已选择：{checked.value.length}条</span>
            <Button disabled={checked.value.length === 0} style={{ width: '140px' }} type='primary' size='small' onClick={batchApprovals} loading={batchLoading.value}>一键审批</Button>
          </div>
        </Popup>
        {
          interruptData.value.needApprovalText || interruptData.value.needApprovalSign
            ? <Signature
              needApprovalText={interruptData.value.needApprovalText}
              needApprovalSign={interruptData.value.needApprovalSign}
              file={file.value}
              onSignaturePadConfirm={async (payload: { businessKey: string; tenant?: string; tag?: string; file?: Blob | null; }) => {
                // 点击确认，获取并上传签名
                const res = await cubeFileService.uploadFile({ ...payload, sceneCode: GLOBAL_SCENE_CODE.faultOrderCase })
                file.value.id = res.id ?? ''
                file.value.path = res.path ?? ''
              }}
              onSignFormSubmit={async (payload: { sign: string; opinion: string; } | undefined) => {
                const { queen } = await cubeStreamSDK.APPROVAL.batchApproval(checkedTask.value, payload)
                interruptData.value.needApprovalText = false
                interruptData.value.needApprovalSign = false
                resultDialog.value = true
                taskQueen.value = queen as TaskQueenType
              }}
            />
            : null
        }
        <ApprovalResult taskQueen={taskQueen} v-model:show={resultDialog.value} onConfirm={resultConfirm} />
      </div>
  }
})
