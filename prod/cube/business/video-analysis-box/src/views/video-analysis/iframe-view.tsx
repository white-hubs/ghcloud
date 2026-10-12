import { defineComponent, onMounted, ref } from 'vue'
import styles from './index.module.less'
import { useRoute } from 'vue-router'
import { logger } from '@/logger'

export const VideoView = defineComponent({
  setup: () => {
    const route = useRoute()
    const videoPath = ref(route.query.url as string)
    onMounted(async () => {
      logger.info('VideoView mounted', videoPath.value)
    })
    return () =>
      <>
        <iframe
          id={styles.configuration}
          src={videoPath.value}
        />
      </>
  }
})
