import { defineComponent } from 'vue'
import styles from './inspection-record.module.less'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import { InspectionRecordDetail } from '@ghcloud/cube-h5-design'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
/** 巡检记录详情 */
export const InspectionDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const businessType = route.query.businessType as string ?? 'SMALL_ENGINEERING'
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <CubeNavBar title='巡检记录详情' />
        <InspectionRecordDetail
          options={{
            // 查询参数
            searchParams: {
              id: route.query.id as string,
            },
            // 详情数据
            getDetailApi: async (val: unknown) => {
              return cubeDailyInspectionService.InspectRecord({ id: (val as { id: string; }).id, businessType })
            },
          }}
        />
      </div>
  }
})
