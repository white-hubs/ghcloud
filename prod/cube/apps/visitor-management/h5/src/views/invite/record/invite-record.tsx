import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { Cell, CellGroup, Empty, PullRefresh, List, Button, Tag, showNotify } from 'vant'
import styles from './invite-record.module.less'
import { useRoute, useRouter } from 'vue-router'
import { InviteStatus, InviteStatusOptions } from './type'
import { cubeAuthService, cubeVisitorManagementService } from '@/api/server'
import type { VisitorInviteRecordResult } from '@ghcloud/cube-visitor-management-service'

// 邀约记录
export const InviteRecord = defineComponent({
  setup () {
    useMetaTitle()
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      phone: ''
    })
    const router = useRouter()
    const dataSource = ref<VisitorInviteRecordResult[]>([])
    // 获取访问列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        finished.value = false
        search.pageNumber++
        const { records, total } = await cubeVisitorManagementService.getVisitorInviteRecordPage({ ...search })
        search.total = total
        if (total <= search.pageSize) {
          finished.value = true
        }
        if (records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...records]
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
    const lookQrcode = (event: Event, item: VisitorInviteRecordResult): void => {
      event.stopPropagation()
      router.push({
        path: '/invite-result',
        query: {
          processId: item.processInsId
        }
      })
    }
    const toFormDetail = async (item: VisitorInviteRecordResult): Promise<void> => {
      try {
        const secret = await cubeAuthService.getSecretByToken()
        const url = `${window.origin}/streamengineH5/tab-form?cube-secret=${secret}&processType=HANDLING&processId=${item.processInsId}`
        window.location.href = url
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '操作失败' })
      }
    }
    onMounted(async () => {
      const { phone } = useRoute().query as { phone: string; }
      search.phone = phone
      onSearch()
    })
    return (): JSX.Element =>
      <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '100vh', overflow: 'auto', background: '#F7F7F7' }}>
        <List
          v-model:loading={loading.value}
          finished={finished.value}
          finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
          onLoad={onLoad}
        >
          {
            dataSource.value && dataSource.value.length > 0 &&
                dataSource.value.map((item) => {
                  const curState = InviteStatusOptions.find(e => e.value === item.status)
                  return (
                    <CellGroup inset class={styles['cell-group']} key={item}>
                      <Cell is-link value='更多' onClick={() => {
                        toFormDetail(item)
                      }}>
                        <div class={styles['cell-title']}>
                          <div class={styles['name-status']}>
                            <Tag
                              style={{ height: '22px', borderRadius: '4px', marginRight: '4px' }}
                              color={curState?.bgColor}
                              text-color={curState?.color}
                            >{curState?.label}
                            </Tag>
                            <span class={styles.name}>{item.areaName}</span>
                          </div>
                        </div>
                      </Cell>
                      <Cell class={styles.cell}>
                        <div class={styles['cell-item']}>
                          <label>访问日期：</label>
                          <span>{item.accessDate || '--'}</span>
                        </div>
                        <div class={styles['cell-item']}>
                          <label>访问时段：</label>
                          <span>{item.timeStr || '--'}</span>
                        </div>
                        <div style={{ paddingTop: '10px' }}>
                          {
                            [InviteStatus.COMPLETE].includes(item?.status as InviteStatus) &&
                              <Button onClick={(event: Event) => {
                                lookQrcode(event, item)
                              }} type='primary' size='small' style={{ width: '70px' }}>访问码</Button>
                          }
                        </div>
                      </Cell>
                    </CellGroup>
                  )
                })
          }
          {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
        </List>
      </PullRefresh>
  }
})
