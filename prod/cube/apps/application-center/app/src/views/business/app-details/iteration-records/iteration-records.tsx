import { defineComponent, ref, watch } from 'vue'
import styles from './iteration-records.module.less'
import { Timeline, type TimelineItemData } from '@/components/timeline/timeline'
import type { ApplicationIterationEntity } from '@ghcloud/cube-application-center-service'
import { cubeApplicationCenterService } from '@/api/service'
import dayjs from 'dayjs'
import { getIterationTypeLabel } from '@/constants/iteration'

interface IterationRecordsProps {
  applicationId: string;
}

export const IterationRecords = defineComponent({
  props: {
    applicationId: {
      type: String,
      required: true
    }
  },
  setup (props: IterationRecordsProps, { expose }) {
    const records = ref<ApplicationIterationEntity[]>([])
    const loading = ref(false)
    const hasData = ref(false)
    const pageSize = 20

    // 暴露状态给父组件
    expose({
      hasData
    })

    // 循环加载所有迭代记录数据
    const loadAllIterationRecords = async (): Promise<void> => {
      if (loading.value || !props.applicationId) return

      loading.value = true
      const allRecords: ApplicationIterationEntity[] = []
      let currentPage = 1
      let hasMoreData = true

      try {
        while (hasMoreData) {
          const response = await cubeApplicationCenterService.getApplicationIterationPage({
            pageNumber: currentPage,
            pageSize,
            applicationId: props.applicationId
          })

          if (response.records && response.records.length > 0) {
            allRecords.push(...response.records)

            // 判断是否还有更多数据
            hasMoreData = response.records.length === pageSize &&
                         allRecords.length < (response.total || 0)

            currentPage++
          } else {
            hasMoreData = false
          }
        }

        records.value = allRecords
        hasData.value = allRecords.length > 0
      } catch (error) {
        records.value = []
        hasData.value = false
      } finally {
        loading.value = false
      }
    }

    // 监听applicationId变化，重新加载数据
    watch(
      () => props.applicationId,
      async (newId) => {
        if (newId) {
          records.value = []
          hasData.value = false
          await loadAllIterationRecords()
        }
      },
      { immediate: true }
    )

    // 转换数据为时间线格式
    const timelineItems = (): TimelineItemData[] => {
      return records.value.map((record, index) => ({
        key: `${record.id || index}`,
        left: (
          <div class={styles['version-content']}>
            <div class={styles['version-number']}>{record.version}</div>
            <div class={styles['version-type']}>版本号</div>
          </div>
        ),
        right: (
          <div class={styles['iteration-card']}>
            <div class={styles['iteration-time']}>{dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div class={styles['iteration-content']}>
              {record.content.map((feature, featureIndex) => {
                const type = getIterationTypeLabel(feature.category)
                const content = `${type}:${feature.content}`
                return (
                  <div key={`feature-${featureIndex}`} class={styles['content-item']}>
                    <span class={styles['content-number']}>{featureIndex + 1}.</span>
                    <span class={styles['content-text']}>{content}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }))
    }

    return (): JSX.Element | null => {
      // 如果没有数据且不在加载中，返回 null
      if (!loading.value && records.value.length === 0) {
        return null
      }

      return (
        <div class={styles['iteration-records']}>
          <h2 class={styles['section-title']}>迭代记录</h2>

          {/* 加载状态 */}
          {loading.value && (
            <div class={styles['loading-container']}>
              <div class={styles['loading-spinner']}></div>
              <span class={styles['loading-text']}>加载中...</span>
            </div>
          )}

          {/* 有数据时显示滚动容器 */}
          {!loading.value && records.value.length > 0 && (
            <div class={styles['scroll-container']}>
              <div class={styles['timeline-container']}>
                <Timeline
                  items={timelineItems()}
                  lineColor="#E4E2E2"
                  dotColor="#E4E2E2"
                />
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})