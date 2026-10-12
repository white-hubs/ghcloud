
import { defineComponent, onMounted, reactive, ref } from 'vue'
import './detail.less'
import { PullRefresh, List, Empty } from 'vant'
import { cubeAnnouncementService } from '@/api/server'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { getAssetsFile } from '@/utils'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const NotificationList = defineComponent({
  setup () {
    const router = useRouter()
    const loading = ref(false)
    const pageData = reactive({
      pageNumber: 0,
      pageSize: 10,
      status: 'DISPLAY'
    })
    const noticeArr = ref<Record<string, unknown>[]>([])
    const listLoading = reactive({
      loading: false,
      finished: false
    })
    const getData = async (): Promise<void> => {
      loading.value = true
      listLoading.loading = true
      const res = await cubeAnnouncementService.listAnnouncement(pageData)
      if (pageData.pageNumber === res.pages) {
        listLoading.finished = true
      }
      noticeArr.value = res.records.map(e => {

        return {
          ...e,
          noticeTime: formatTime(e.noticeTime as string)
        }
      })
      listLoading.loading = false
      loading.value = false
    }
    const onLoad = async (): Promise<void> => {
      listLoading.loading = true
      pageData.pageNumber++
      const res = await cubeAnnouncementService.listAnnouncement(pageData)
      if (pageData.pageNumber >= res.pages) {
        listLoading.finished = true
      }
      res.records = res.records.map(e => {

        return {
          ...e,
          noticeTime: formatTime(e.noticeTime as string)
        }
      })
      noticeArr.value.push(...res.records)
      listLoading.loading = false
    }
    const onRefresh = (): void => {
      pageData.pageNumber = 1
      listLoading.finished = false
      getData()
    }
    const parseHtmlForText = (htmlString: string): string => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, 'text/html')
      return doc.body.textContent || ''
    }
    const formatTime = (dateString: string): string => {
      const date = new Date(dateString)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return dayjs(date).format('HH:mm')
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天'
      } else {
        return dayjs(date).format('YYYY-MM-DD')
      }
    }
    const jumpDetails = (id: string): void => {
      router.push({
        path: '/notification-details',
        query: {
          id
        }
      })
    }
    onMounted(() => {
      document.title = '通知公告'
      // getData()
    })
    return (): JSX.Element =>
      <div>
        <CubeNavBar title='通知公告' showBack />
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <div class='list-page'>
            <List
              finished={listLoading.finished}
              finished-text={noticeArr.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                noticeArr.value.map(e => {
                  return (
                    <div class='list-item' key={e.id as string} onClick={() => {
                      jumpDetails(e.id as string)
                    }}>
                      <img class='list-item-left' src={getAssetsFile('list-img.png')} alt='' />
                      <div class='list-item-right'>
                        <div class='list-item-label'>
                          <span class='list-item-name'>{e.title}</span>
                          <div>
                            <span class='list-item-time'>{e.noticeTime}</span>
                            {e.isTopping === '1' && <span class='top-up'>已置顶</span>}
                          </div>
                        </div>
                        <div class='list-item-value'>
                          <div class='list-item-text'>
                            {parseHtmlForText(e.content as string)}
                          </div>
                          <div class='list-item-unread' v-show={!e.viewed} />
                        </div>
                      </div>
                    </div>
                  )
                })
              }
              {
                (noticeArr.value.length === 0 && listLoading.finished) && <Empty description='暂无数据' />
              }
            </List>
          </div>
        </PullRefresh>
      </div>
  }
})
