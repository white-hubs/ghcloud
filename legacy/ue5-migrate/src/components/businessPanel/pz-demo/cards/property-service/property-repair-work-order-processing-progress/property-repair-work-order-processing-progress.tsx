import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './property-repair-work-order-processing-progress.module.less'
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'
import NoData from '@/components/businessPanel/public/noData.vue'

export const PropertyRepairWorkOrderProcessingProgress = defineComponent({
  name: 'PropertyRepairWorkOrderProcessingProgress',
  setup () {
    // 模拟最新的5个工单数据
    const latestOrders = ref([])
    const getData = async (): Promise<void>=>{
      const res = await PZService.property.getPropertyComplaintRepairWorkOrderProcessingProgress(5, 1)
      if (res.total){
        latestOrders.value.length = 0
        res.records.forEach(item=>{
          latestOrders.value.push({
            id: item.id,
            title: item.name,
            status: item.status,
            progress: 50,
            handler: item.repairUserName,
            createTime: dayjs(item.recordTime).format('YYYY-MM-DD HH:mm:ss'),
            description: ''
          })
        })
      }
    }
    getData()
    // 获取状态对应的样式类名
    const getStatusClass = (status: string): string => {
      const statusMap = {
        pending: styles.statusPending,
        processing: styles.statusProcessing,
        completed: styles.statusCompleted
      }
      return statusMap[status] || ''
    }

    // 获取状态对应的文本
    const getStatusText = (status: string): string => {
      const statusMap = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成'
      }
      return statusMap[status] || ''
    }

    return (): JSX.Element => (
      <SubPanelTemplate title='物业报修工单处理进度'>
        <div class={['card-container-3', styles.progressContainer]}>
          {latestOrders.value.map(order => (
            <div class={styles.orderItem} key={order.id}>
              <div class={styles.orderHeader}>
                <div class={styles.orderTitle}>{order.title}</div>
                <div class={[styles.orderStatus, getStatusClass(order.status)]}>
                  {getStatusText(order.status)}
                </div>
              </div>
              <div class={styles.orderInfo}>
                <div class={styles.description}>{order.description}</div>
                <div class={styles.progressBar}>
                  <div
                    class={styles.progressInner}
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
                <div class={styles.orderFooter}>
                  <div class={styles.handler}>处理人：{order.handler}</div>
                  <div class={styles.time}>{order.createTime}</div>
                </div>
              </div>
            </div>
          ))}
          {
            latestOrders.value.length === 0 && <NoData />
          }
        </div>
      </SubPanelTemplate>
    )
  }
})