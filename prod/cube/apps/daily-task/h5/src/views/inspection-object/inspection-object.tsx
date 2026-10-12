import { defineComponent, ref, reactive, onMounted, type VNode } from 'vue'
import styles from './inspection-object.module.less'
import { Button, Divider, Empty, List, PullRefresh, Tag, showNotify } from 'vant'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { cubeDailyInspectionService, cubeOuaaService } from '@/api/server'
import { StatusColor, StatusColorBg, StatusType } from './type'
import { timeFormat } from '@/utils'
interface MyInspectionType {
  id: string;
  planName: string;
  name: string;
  status: string;
  isCheck: boolean;
  level: string;
  targetNum: number;
  validBeginTime: number;
  validEndTime: number;
  receiveNames: string;
  receiveIds?: string;
}

export const InspectionObject = defineComponent({
  setup () {
    const router = useRouter()
    const route = useRoute()
    const targetId = (route.query?.targetId as string) ?? ''
    const targetCategory = (route.query?.targetCategory as string) ?? ''
    const isShowTemporaryButton = (targetId.length > 0) && (targetCategory.length > 0)
    const dataSource = ref<MyInspectionType[]>([])
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const userId = ref('')
    const search = reactive({
      pageNumber: 0,
      pageSize: 20,
      status: 'EXECUTING',
      recordStatus: 'EXECUTING',
    })

    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch (err) {
      }
    }

    // 获取数据
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyInspectionService.ObjectInspectionPage(targetId, targetCategory, search)
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
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }

    // 临时任务
    const onTemporaryClick = (): void => {
      router.push({
        path: '/inspection-execute',
        query: {
          isTemporary: 'true',
          targetId,
          targetCategory,
          returnPagePath: '/entry'
        }
      })
    }
    // 跳转详情
    const toDetail = (item: MyInspectionType): void => {
      if (item.status === 'EXECUTING') {
        router.push({
          path: '/inspection-execute',
          query: { taskId: item.id, targetId }
        })
      } else {
        router.push({ path: '/inspection-detail', query: { id: item.id, userId: userId.value } })
      }
    }

    onBeforeRouteUpdate((to, from) => {
      // 检查是否从操作页面返回
      if (['/inspection-execute', '/choice-staff'].includes(from.path)) {
        onRefresh(); // 执行刷新逻辑
      }
    });

    onMounted(() => {
      getUser()
    })
    // 接收
    const handleResolve = async (e: Event, item: MyInspectionType): Promise<void> => {
      try {
        e.stopPropagation()
        await cubeDailyInspectionService.AcceptTask({ id: item.id })
        onRefresh()
      } catch (err) {
        const { errorMessage } = (err as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    // 移交
    const handleTransfer = async (e: Event, item: MyInspectionType): Promise<void> => {
      e.stopPropagation()
      router.push({ path: '/choice-staff', query: { action: 'transfer', id: item.id } })
    }
    // 添加协同人
    const handleAddPartner = async (e: Event, item: MyInspectionType): Promise<void> => {
      e.stopPropagation()
      router.push({ path: '/choice-staff', query: { action: 'add-partner', id: item.id } })
    }
    return (): VNode =>
      <div class={styles.wrapper}>
        <CubeNavBar showBack title='选择巡检任务' />
        <div class={styles.notify}>该巡检对象存在以下任务中，请选择具体任务执行：</div>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: '83vh', marginTop: '5px', overflow: 'auto' }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
              dataSource.value.map((item: MyInspectionType) =>
                <div class={styles['cell-group']} key={item.id} onClick={() => {
                  if (item.status !== 'ACCEPT') {
                    toDetail(item)
                  }
                }}>
                  <div class={styles.title}>
                    <div>
                      <Tag size='medium' text-color={StatusColor.get(item.status)} color={StatusColorBg.get(item.status)}>{StatusType.get(item.status)}</Tag>
                      {
                        item.isCheck
                          ? <Tag text-color='#1989fa' color='rgb(25,137,250,.1)' style={{ marginLeft: '5px' }} size='medium'>稽查</Tag>
                          : null
                      }
                      <span class={styles['title-name']}>{item.name}
                      </span>
                    </div>
                    <div style={{ color: '#ff4158' }}>{item.level === 'URGENT' ? '紧急' : ''}</div>
                  </div>
                  <Divider style={{ margin: '10px' }} />
                  <div class={styles.content}>
                    <div><span style={{ color: '#8f8f8f' }}>责任人：</span><span>{item.receiveNames}</span></div>
                    <div><span style={{ color: '#8f8f8f' }}>巡检对象数：</span><span>{item.targetNum}</span></div>
                    <div><span style={{ color: '#8f8f8f' }}>开始时间：</span><span>{timeFormat(item.validBeginTime, true)}</span></div>
                    <div><span style={{ color: '#8f8f8f' }}>截至时间：</span><span>{timeFormat(item.validEndTime, true)}</span></div>
                  </div>
                  <Divider style={{ margin: '5px' }} />
                  <div class={styles.footer}>
                    <Button v-show={item.status === 'ACCEPT'} type='primary' size='small' onClick={(e: Event) => {
                      handleResolve(e, item)
                    }}>接收</Button>
                    <Button v-show={item.status === 'EXECUTING' && item.receiveIds === userId.value} plain type='primary' size='small' onClick={(e: Event) => {
                      handleTransfer(e, item)
                    }}>移交</Button>
                    <Button v-show={item.status === 'EXECUTING' && item.receiveIds === userId.value} type='primary' size='small' onClick={(e: Event) => {
                      handleAddPartner(e, item)
                    }}>添加协同</Button>
                  </div>
                </div>)
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
        {isShowTemporaryButton && <Button type='primary' block onClick={onTemporaryClick}>临时任务</Button>}
      </div>
  }
})
