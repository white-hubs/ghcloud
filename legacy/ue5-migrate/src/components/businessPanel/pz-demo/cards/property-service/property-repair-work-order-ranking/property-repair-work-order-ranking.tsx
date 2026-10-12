import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './property-repair-work-order-ranking.module.less'
import { PZService } from '../../../card-service/service'

export const PropertyRepairWorkOrderRanking = defineComponent({
  name: 'PropertyRepairWorkOrderRanking',
  setup () {
    // 模拟数据 - 工单处理排名前5
    const rankingList = ref([
      { name: '张三', count: 0 },
      { name: '李四', count: 0 },
      { name: '王五', count: 0 },
      { name: '赵六', count: 0 },
      { name: '孙七', count: 0 }
    ])
    const getData = async (): Promise<void>=>{
      const res = await PZService.property.getPropertyComplaintRepairWorkOrderRank(5, 1)
      if (res.total){
        rankingList.value.length = 0
        res.records.forEach((item)=>{
          rankingList.value.push({
            name: item.name,
            count: item.count
          })
        })
      }
    }

    // 获取排名样式类名
    const getRankClass = (index: number): string => {
      if (index + 1 <= 3) {
        return styles[`rank${index + 1}`]
      }
      return styles.rankOther
    }
    getData()

    return (): JSX.Element => (
      <SubPanelTemplate title='物业报修工单排名'>
        <div class={['', styles.propertyRepairRanking]}>
          <div class={styles.rankingList}>
            {rankingList.value.map((item, index) => (
              <div class={styles.rankingItem} key={index}>
                <div class={[styles.rank, getRankClass(index)]}>
                  {index + 1}
                </div>
                <div class={styles.info}>
                  <div class={styles.name}>{item.name}</div>
                  <div class={styles.count}>
                    <span>{item.count}</span>工单
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})