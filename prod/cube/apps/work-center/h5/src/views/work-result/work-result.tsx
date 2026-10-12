import { defineComponent, onMounted, reactive } from 'vue'
import { NavBar, Button } from 'vant'
import { getAssetsFile } from '@/utils/index'
import styles from './work-result.module.less'
import { useGlobalRouter } from '@/hook/use-global-router'

export const WorkResult = defineComponent({
  name: 'WorkResult',
  setup() {
    const { router, route } = useGlobalRouter()

    const state = reactive({
      status: 'success',
      message: '已成功移交给张三',
    })

    onMounted(() => {
      if (route.query.status) {
        state.status = route.query.status as string
        state.message = route.query.message as string
      }
    })

    const goBack = () => {
      router.replace({ path: '/work-handover'})
    }

    return () => (
      <div class={styles.handoverResult}>
        <NavBar title="交接结果" left-arrow onClick-left={goBack} />
        <div class={styles.content}>
          <div class={styles.resultIcon}>
            <img src={getAssetsFile(state.status === 'success' ? 'over-sucess.png' : 'over-error.png')} alt="" />
          </div>
          <div class={styles.resultText}>{state.message}</div>
        </div>
        <div class={styles.footer}>
          <Button type="primary" block onClick={goBack}>
            返回
          </Button>
        </div>
      </div>
    )
  },
})