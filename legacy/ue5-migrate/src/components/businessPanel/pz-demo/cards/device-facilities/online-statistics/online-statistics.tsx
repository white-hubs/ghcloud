import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './online-statistics.module.less'
import { PZService } from '../../../card-service/service'
export const OnlineStatistics = defineComponent({
  setup () {
    // 设备在线状态数据
    const deviceStatus = ref({
      online: 156,
      offline: 23,
      total: 179
    })
    const getData = async (): Promise<void> =>{
      // TODO: 获取设备在线状态数据
      const result = await PZService.device.getDeviceOnlineStatistics({
        period: '',
        type: '',
      })
      deviceStatus.value.total = result.reduce((total, item) => total + item.number, 0)
      deviceStatus.value.online = result.find(item=>item.name === '在线')?.number ?? 0
      deviceStatus.value.offline = result.find(item=>item.name === '离线')?.number ?? 0
    }
    onMounted(()=>{
      getData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="设备在线统计">
        <div class={styles.container}>
          <div class={styles.statusItem}>
            <div class={styles.label}>在线设备</div>
            <div class={styles.value}>
              <span class={styles.number}>{deviceStatus.value.online}</span>
              <span class={styles.unit}>台</span>
            </div>
          </div>
          <div class={styles.divider}></div>
          <div class={styles.statusItem}>
            <div class={styles.label}>离线设备</div>
            <div class={styles.value}>
              <span class={styles.number}>{deviceStatus.value.offline}</span>
              <span class={styles.unit}>台</span>
            </div>
          </div>
          <div class={styles.divider}></div>
          <div class={styles.statusItem}>
            <div class={styles.label}>设备总数</div>
            <div class={styles.value}>
              <span class={styles.number}>{deviceStatus.value.total}</span>
              <span class={styles.unit}>台</span>
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})