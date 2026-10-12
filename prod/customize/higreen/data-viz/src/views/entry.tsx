import { defineComponent, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { IncomingStatistics } from '@/components/business/incoming-statistics/incoming-statistics'
import { CarStatistics } from '@/components/business/car-statistics/car-statistics'
import { TransportationStatistics } from '@/components/business/transportation-statistics/transportation-statistics'
import { FoodSafety } from '@/components/business/food-safety/food-safety'
import { MerchantPortrait } from '@/components/business/merchant-portrait/merchant-portrait'
import { useKeyboardEsc } from '@/hooks/use-keyboard-esc'
import { useRouter } from 'vue-router'
import styles from './entry.module.less'
import { cubeFoodSafetyService } from "@/api/service";
import { message } from "@ghcloud/cube-ui";


export const Entry = defineComponent({
  setup: () => {

    const router = useRouter()
    useKeyboardEsc(() => {
      router.push('/')
    })
    const goBack = (): void => {
      router.push({ path: '/' })
    }
    
    const refreshKey = ref(0)
    const isLoading = ref(false)
    const handleRefresh = async (): Promise<void> => {
      if (isLoading.value) return
      isLoading.value = true
      message.loading('刷新中...', 0)

      try {
        await cubeFoodSafetyService.refreshThirdData()
        message.destroy()
        message.success('刷新成功')
        refreshKey.value++
        setTimeout(() => {
          isLoading.value = false
        }, 6 * 1000)
      } catch (error) {
        message.destroy()
        message.error((error as any)?.errorMessage ?? '操作失败')
        isLoading.value = false
      }
    }
    const baseDelay = 0.15
    return (): JSX.Element =>
      <Layout showRefresh onRefresh={handleRefresh} refreshLoading={isLoading.value} >
        <IncomingStatistics key={refreshKey.value} class='animate__animated animate__zoomIn' />
        <CarStatistics key={refreshKey.value} class='animate__animated animate__zoomIn' style={{ 'animation-delay': `${baseDelay * 1}s` }} />
        <TransportationStatistics key={refreshKey.value} class='animate__animated animate__zoomIn' style={{ 'animation-delay': `${baseDelay * 2}s` }} />
        <FoodSafety key={refreshKey.value} class='animate__animated animate__zoomIn' style={{ 'animation-delay': `${baseDelay * 3}s` }} />
        <MerchantPortrait key={refreshKey.value} class='animate__animated animate__zoomIn' style={{ 'animation-delay': `${baseDelay * 4}s`, 'margin-right': '0' }} />
        <div class={styles['back-btn']} onClick={goBack}></div>
      </Layout>
  }
})
