import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Cell, Empty, List, PullRefresh, Image } from 'vant'
import styles from './news-list.module.less'
import { cubeAnnouncementService } from '@/api/server'
import type { InformationList } from '@ghcloud/cube-bulletin-service'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 公开 资讯列表 */
export const PublicNewsList = defineComponent({
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
          informationType: 'NEW_INFORMATION'
        })
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

    const toDetailPage = (id: string): void => {
      router.push({
        name: 'news-detail',
        query: {
          id
        }
      })
    }

    onMounted(() => {
      document.title = '资讯列表'
    })

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='资讯列表' />
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
                  <Cell
                    key={e.id}
                    v-slots={{
                      title: () => <span class={styles['card-title']}>{e.title}</span>,
                      label: () =>
                        <div class={styles['card-content']}>
                          <span>{e.publishAgency}</span>
                          <span>{dayjs(e.createTime).format('YYYY-MM-DD')}</span>
                        </div>,
                      value: e.fileVOS && e.fileVOS?.length > 0
                        ? (): JSX.Element | null => e.fileVOS && <Image
                          width='20vw'
                          height='20vw'
                          fit='cover'
                          class={styles['img-content']}
                          src={e.fileVOS[0].path}
                        />
                        : undefined
                    }}
                    onClick={() => {
                      toDetailPage(e.id)
                    }}
                  />
                )
              })
            }
            {(dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
      </>
  }
})
