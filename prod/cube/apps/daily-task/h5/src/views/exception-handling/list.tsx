import { Button, Divider, Empty, List, PullRefresh, Search, Tab, Tabs, Tag, Checkbox } from 'vant'
import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './list.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRouter } from 'vue-router'
import { cubeDailyInspectionService, cubeOuaaService } from '@/api/server'
import { Bar } from '../../components/bar/bar'

interface ExceptionItem {
  id: string;
  targetName: string; // 异常通检对象名称
  address: string; // 具体地址
  errNames: string; // 异常明细
  repairStatus: 'WAIT_REPAIR' | 'CANCEL_REPAIR' | 'REPAIRED'; // 处理状态：待修复、修复中、取消修复、已完成
  codeNum?: string; // 编号
  areaName?: string; // 区域名称
  checked?: boolean; // 是否选中
  result: string;
  username: string;
  state: string;
  targetCategory: string;
  targetId: string;
  time: number;
  cancelReason: string;
}


/** 异常处理列表 */
export const ExceptionHandlingList = defineComponent({
  setup: () => {
    useMetaTitle()
    // const route = useRoute()
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      targetName: '',
      repairStatus: '',
    })
    const activeTab = ref('ALL')
    const dataSource = ref<ExceptionItem[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const router = useRouter()
    const userId = ref('')
    const isBatchMode = ref(false) // 是否处于批量处理模式
    const selectedItems = ref<string[]>([]) // 已选中的项目ID


    const tabs = ref([
      { title: '全部', repairStatus: 'ALL' },
      { title: '待修复', repairStatus: 'WAIT_REPAIR' },
      { title: '取消修复', repairStatus: 'CANCEL_REPAIR' },
      { title: '已修复', repairStatus: 'REPAIRED' },
    ])


    // 获取数据
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyInspectionService.getRepairPage(search)
        if (res.total as number <= search.pageSize) {
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
        // 为每个项目添加checked属性
        const records = res.records.map((item: ExceptionItem) => ({
          ...item,
          checked: false
        }))
        dataSource.value = [...dataSource.value, ...records]

      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch {
      }
    }

    const onClickTab = (): void => {
      if (activeTab.value === 'ALL'){
        search.repairStatus = ''
      } else {
        search.repairStatus = activeTab.value
      }
      // 切换标签时退出批量处理模式
      isBatchMode.value = false
      selectedItems.value = []
      onRefresh()
    }

    // 跳转详情
    const toDetail = (id: string): void => {
      // 批量处理模式下点击不跳转详情
      if (isBatchMode.value) return
      router.push({ path: '/abnormal-inspection/detail', query: { id } })
    }

    // 处理异常
    const handleException = (id: string, event: Event): void => {
      event.stopPropagation()
      router.push({ path: '/abnormal-inspection/handle', query: { id } })
    }

    // 取消修复
    const cancelFix = (id: string, event: Event): void => {
      event.stopPropagation()
      router.push({
        path: '/abnormal-inspection/handle',
        query: {
          ids: id,
          batch: 'cancel',
          type: 'only'
        }
      })
    }

    onMounted(() => {
      onLoad()
      getUser()
    })

    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }

    // 查询
    const onSearch = (): void => {
      search.pageNumber = 0
      onLoad()
    }

    // 获取状态标签样式
    const getStatusTag = (repairStatus: string): { text: string; type: string; } => {
      const statusMap = {
        'WAIT_REPAIR': { text: '待修复', type: 'primary' },
        'CANCEL_REPAIR': { text: '取消修复', type: 'gray' },
        'REPAIRED': { text: '已修复', type: 'success' }
      }
      return statusMap[repairStatus as keyof typeof statusMap] || { text: '未知状态', type: 'default' }
    }

    /**
     * 切换批量处理模式
     */
    const toggleBatchMode = (): void => {
      isBatchMode.value = !isBatchMode.value
      // 退出批量处理模式时清空选中项
      if (!isBatchMode.value) {
        selectedItems.value = []
      }
    }

    /**
     * 选择/取消选择项目
     */
    const toggleSelectItem = (id: string, event: Event): void => {
      event.stopPropagation()
      const index = selectedItems.value.indexOf(id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push(id)
      }
    }

    /**
     * 批量处理选中的项目
     */
    const batchProcess = (): void => {
      if (selectedItems.value.length === 0) return
      // 这里可以实现批量处理的逻辑，例如跳转到批量处理页面
      router.push({
        path: '/abnormal-inspection/handle',
        query: {
          ids: selectedItems.value.join(','),
          batch: ''
        }
      })
    }

    /**
     * 取消批量处理
     */
    const cancelBatchProcess = (): void => {

      if (selectedItems.value.length === 0) return
      // 这里可以实现批量处理的逻辑，例如跳转到批量处理页面
      router.push({
        path: '/abnormal-inspection/handle',
        query: {
          ids: selectedItems.value.join(','),
          batch: 'cancel',
          type: 'all'
        }
      })
    }
    const handleHiddenDanger = (item: {
      id: string;
      result: string;
      username: string;
      state: string;
      targetCategory: string;
      targetId: string;
      targetName: string;
      time: number; }, e: Event): void => {
      e.stopPropagation()
      entityObject.value = {
        entityId: item.targetId,
        entityName: item.targetName,
        entityType: item.targetCategory
      }
      const newItem = {
        ...item,
        inspectionId: item.id,
        staff: item.username
      }
      sessionStorage.setItem('cube-app-maintenance-object-data', JSON.stringify(newItem))
      sessionStorage.setItem('inspection-object-data', JSON.stringify({ ...newItem, taskName: '隐患单', businessType: 'HIDDENDANGER' }))
      window.location.href = '/streamengineH5/initiating-work-order?processType=ADD&businessType=HIDDENDANGER'
    }
    const entityObject = ref()

    // 故障报修
    const handleFault = (item: {
      id: string;
      result: string;
      username: string;
      state: string;
      targetCategory: string;
      targetId: string;
      targetName: string;
      time: number; },e:Event): void => {
      e.stopPropagation()
      entityObject.value = {
        entityId: item.targetId,
        entityName: item.targetName,
        entityType: item.targetCategory
      }
      const newItem = {
        ...item,
        inspectionId: item.id,
        staff: item.username
      }
      sessionStorage.setItem('cube-app-maintenance-object-data', JSON.stringify(newItem))
      sessionStorage.setItem('inspection-object-data', JSON.stringify({ ...newItem, taskName: '故障单', businessType: 'FAULT' }))
      window.location.href = '/streamengineH5/initiating-work-order?processType=ADD&businessType=FAULT'
    }
    return (): VNode=>
      <div class={styles.wrapper}>
        <Bar rightName={isBatchMode.value ? '取消' : '批量处理'} onlyText={true} onRight={() => {
          toggleBatchMode()
        } } />
        <Search v-model={search.targetName} placeholder='根据对象名称进行搜索' show-action onSearch={onSearch} onClear={onSearch} onCancel={onSearch} />
        <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
          {tabs.value.map(item =>
            <Tab title={item.title} name={item.repairStatus} key={item.title}>
              <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: '77vh', marginTop: '5px', overflow: 'auto' }}>
                <List
                  v-model:loading={loading.value}
                  finished={finished.value}
                  finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
                  onLoad={onLoad}
                >
                  {
                    (dataSource.value && dataSource.value.length > 0) &&
                    dataSource.value.map((item: ExceptionItem, index: number) =>
                      <div class={styles['cell-group']} key={index} onClick={() => toDetail(item.id)}>
                        <div class={styles.title}>
                          <div class={styles.titleandbox}>
                            {isBatchMode.value && item.repairStatus === 'WAIT_REPAIR' && (
                              <Checkbox
                                class={styles.checkbox}
                                checked={selectedItems.value.includes(item.id)}
                                onClick={(e: Event) => toggleSelectItem(item.id, e)}
                              />
                            )}
                            <span class={styles['title-name']}>
                              {item.targetName}
                            </span>
                          </div>

                          {
                            <Tag size='medium' class={[styles.tag, styles[getStatusTag(item.repairStatus).type]]}>
                              {getStatusTag(item.repairStatus).text}
                            </Tag>
                          }
                        </div>
                        <Divider style={{ margin: '10px' }} />
                        <div class={styles.main}>
                          <div class={styles.content}>
                            <div>异常明细：{item.errNames ?? '--'}</div>
                            <div>具体地址：{item.address ?? '--'} </div>
                            {(item.repairStatus === 'CANCEL_REPAIR' || item.repairStatus === 'REPAIRED') ? <div>{
                              item.repairStatus === 'CANCEL_REPAIR' ? '取消原因' : '异常处理'
                            }：{item.repairStatus === 'CANCEL_REPAIR' ? item.cancelReason : getStatusTag(item.repairStatus).text}</div> : ''}
                          </div>

                        </div>

                        {!isBatchMode.value && item.repairStatus === 'WAIT_REPAIR' && (
                          <div class={styles.footer}>
                            <Button size="small" onClick={(e: Event) => cancelFix(item.id, e)}>取消修复</Button>
                            <Button size="small" type="primary" onClick={(e: Event) => handleHiddenDanger(item, e)}>隐患排查</Button>
                            <Button size="small" type="primary" onClick={(e: Event) => handleFault(item, e)}>故障报修</Button>
                            <Button size="small" onClick={(e: Event) => handleException(item.id, e)}>线下处理</Button>
                          </div>
                        )}
                      </div>)
                  }
                  {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
                </List>
              </PullRefresh>
            </Tab>)}
        </Tabs>

        {/* 批量处理底部工具栏 */}
        {isBatchMode.value && (
          <div class={styles.batchToolbar}>
            <div class={styles.batchInfo}>已选 {selectedItems.value.length} 个</div>
            <div class={styles.batchButtons}>
              <Button size="small" onClick={cancelBatchProcess}>取消修复</Button>
              <Button size="small" type="primary" onClick={batchProcess}>批量处理</Button>
            </div>
          </div>
        )}
      </div>
  }
})