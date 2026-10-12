import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Cell, CellGroup, Empty, Icon, List, PullRefresh, Search } from 'vant'
import styles from './notification-list.module.less'
import { cubeAnnouncementService } from '@/api/server'
import type { InformationList } from '@ghcloud/cube-bulletin-service'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 公开公告列表 */
export const PublicNotificationList = defineComponent({
  setup () {
    const router = useRouter()
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const dataSource = ref<InformationList[]>([])
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
      keyword: ''
    })
    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeAnnouncementService.publicInformationList({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.keyword,
          status: 'DISPLAY',
          informationType: 'ANNOUNCEMENT'
        })
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (res.pages <= search.pageNumber) {
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

    const parseHtmlForText = (htmlString: string): string => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, 'text/html')
      return doc.body.textContent || ''
    }

    const toDetailPage = (id: string): void => {
      router.push({
        name: 'public-notification-details',
        query: {
          id
        }
      })
    }

    onMounted(() => {
      document.title = '通知公告'
    })

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='通知公告' />
        <div class={styles.page}>
          <div class={styles['search-bar']}>
            <Search
              v-model={search.keyword}
              placeholder='请输入公告标题'
              onSearch={onRefresh}
            />
          </div>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.content}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                dataSource.value.map(e => {
                  return (
                    <CellGroup inset key={e.id}>
                      <Cell
                        v-slots={{
                          title: () => <span class={styles['card-title']}>{e.title}</span>,
                          label: () => <span class={styles['card-content']}>{parseHtmlForText(e.content)}</span>,
                        }}
                      />
                      <Cell
                        onClick={() => {
                          toDetailPage(e.id)
                        }}
                        v-slots={{
                          title: () => <span class={styles['card-footer-time']}>{dayjs(e.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
                          value: () =>
                            <span class={styles['card-footer-detail-entry']}>
                              查看详情
                              <Icon name='arrow' />
                            </span>
                        }}
                      />
                    </CellGroup>
                  )
                })
              }
              {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
      </>
  }
})
