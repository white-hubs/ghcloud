import { cubeAnnouncementService } from '@/api/server'
import { closeToast, showLoadingToast, showToast } from 'vant'
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import styles from './news-detail.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 资讯详情 */
export const NewsDetail = defineComponent({
  setup () {
    const route = useRoute()
    const { id } = route.query
    const title = ref('')
    const time = ref('')
    const content = ref('')
    onMounted(async () => {
      document.title = '资讯详情'
      if (!id) {
        showToast({
          message: '缺少参数',
          duration: 3000
        })
      }
      try {
        showLoadingToast({
          message: '加载中',
          duration: 0
        })
        const res = await cubeAnnouncementService.getDetail(id as string)
        title.value = res.title
        time.value = res.noticeTime
        content.value = res.content
        closeToast()
      } catch {
        showToast({
          message: '加载失败',
          duration: 3000
        })
      }
    })
    return (): JSX.Element => (
      <div class={styles.page}>
        <CubeNavBar showBack title='资讯详情' />
        <div class={styles.title}>{title.value}</div>
        <div class={styles.time}>{time.value}</div>
        <div class={styles.content} v-html={content.value} />
      </div>
    )
  }
})
