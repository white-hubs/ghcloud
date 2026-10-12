import { defineComponent, onMounted, ref } from 'vue'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import styles from './result.module.less'
import { Button, Empty, Loading, showNotify } from 'vant'
import { getAssetsFile } from '@/utils'
import { useRoute, useRouter } from 'vue-router'
import { cubeVisitorManagementService } from '@/api/server'
import { getRouteParams } from '@ghcloud/cube-auth-utils'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { LiudengTerminal } from '@/api/auth-store'
export const Result = defineComponent({
  setup () {
    useMetaTitle()
    const router = useRouter()
    const route = useRoute()
    const detail = ref()
    const qrCode = ref()
    const loading = ref(false)
    const getDetail = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeVisitorManagementService.getReservationDetail({ id: detail.value?.id ?? route.query.id })
        detail.value = res ?? null
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        loading.value = false
      }
    }
    const goHome = async (): Promise<void> => {
      const params = getRouteParams()
      if (params.terminal === LiudengTerminal) {
        cubeWxService.backHome()
      }
      router.replace({ path: '/booking-list', query: { reloadPage: 'home' } }).then(() => {
        history.pushState({}, '', '/apps/@ghcloud/cube-visitor-management-h5/#/booking-list?reloadPage=home')
      })
    }
    onMounted(async () => {
      if (!route.query.detail) {
        await getDetail()
      } else {
        detail.value = JSON.parse(route.query.detail as string) ?? null
      }
      const data = await cubeVisitorManagementService.getReservationCode({ id: detail.value?.id ?? route.query.id })
      qrCode.value = data ?? ''
    })
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <div class={styles.container}>
          {loading.value && <Loading type='spinner' size='24px' vertical>加载中...</Loading>}
          <div class={styles.code}>
            <img src={getAssetsFile('result.png')} width='50' alt='' />
            <div class={styles.status}>预约成功</div>
            <div>进馆请出示二维码</div>
            <div class={styles['code-img']}>
              {
                qrCode.value
                  ? <img src={qrCode.value} alt='' width='200' height='200' />
                  : <Empty description='暂无图片' />
              }
            </div>
          </div>
          <div class={styles.msg}>
            <div class={styles.item}>
              <span>进入场馆</span>
              <span>{detail.value?.areaName}</span>
            </div>
            <div class={styles.item}>
              <span>预约日期</span>
              <span>{detail.value?.dayStr}</span>
            </div>
            <div class={styles.item}>
              <span>预约时段</span>
              <span>{detail.value?.timeStr}</span>
            </div>
            <div class={styles.item}>
              <span>预约人员</span>
              <span>{detail.value?.name}</span>
            </div>
          </div>
        </div>
        <div style={{ border: 'none', margin: '30px 15px' }}>
          <Button color='rgba(255,255,255,0.5)' block style={{ border: 'none' }} onClick={goHome}>返回首页</Button>
        </div>
      </div>
  }
})
