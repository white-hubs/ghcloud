import { defineComponent, onMounted, reactive, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './project-number-statistics.module.less'
import { cubeThirdConnectionService } from '@/api/service'

export const projectNumberStatistics = defineComponent({
  name: 'projectNumberStatistics',
  setup () {
    const statsData = ref([
      { title: '立项数量', value: 0 },
      { title: '未立项数量', value: 0 },
      { title: '结项数量', value: 0 },
      { title: '未结项数量', value: 0 }
    ])
    
    const getData = async (): Promise<void>=>{
      const res = await cubeThirdConnectionService.getEducationalDataOverview()
      if (res) {
        const { lx, wlx, jx, wjx } = res
        statsData.value = [
          { title: '立项数量', value: lx ?? 0 },
          { title: '未立项数量', value: wlx ?? 0 },
          { title: '结项数量', value: jx ?? 0 },
          { title: '未结项数量', value: wjx ?? 0 }
        ]
      }
    }
    onMounted(()=>{
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate title="项目数量统计">
        <div class={[styles['card-container']]}>
          {statsData.value.map(item => (
            <div class={styles['stat-card']}>
              <div class={styles['stat-title']}>{item.title}</div>
              <div class={styles['stat-value']}>
                {item.value} <span class={styles['unit']}>项</span>
              </div>
            </div>
          ))}
        </div>
      </SubPanelTemplate>
    )
  }
})