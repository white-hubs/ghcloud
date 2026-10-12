import { defineComponent, onMounted, reactive, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './data-overview.module.less'
import { cubeThirdConnectionService } from '@/api/service'

export const dataOverview = defineComponent({
  name: 'dataOverview',
  setup () {
    const statsData = ref([
      { title: '在校人数', value: 0 },
      { title: '教职工人数', value: 0 },
      { title: '累计培训人数', value: 0 },
      { title: '组织机构数量', value: 0 },
      { title: '委托办班数量', value: 0 },
      { title: '委托办班人数', value: 0 }
    ])
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeThirdConnectionService.getEducationalDataOverview()
        if (res) {
          const { zx_xy_num, jzg_num, lj_xy_num, jg_num, wtbb_num, wtbb_xy_num  } = res
          statsData.value = [
            { title: '在校人数', value: zx_xy_num ?? 0 },
            { title: '教职工人数', value: jzg_num ?? 0 },
            { title: '累计培训人数', value: lj_xy_num ?? 0 },
            { title: '组织机构数量', value: jg_num ?? 0 },
            { title: '委托办班数量', value: wtbb_num ?? 0 },
            { title: '委托办班人数', value: wtbb_xy_num ?? 0 }
          ]
        }
      } catch {
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate title="数据总览">
        <div class={[styles['card-container']]}>
          {statsData.value.map(item => (
            <div class={styles['stat-card']}>
              <div class={styles['stat-value']}>{item.value}</div>
              <div class={styles['stat-title']}>{item.title}</div>
            </div>
          ))}
        </div>
      </SubPanelTemplate>
    )
  }
})