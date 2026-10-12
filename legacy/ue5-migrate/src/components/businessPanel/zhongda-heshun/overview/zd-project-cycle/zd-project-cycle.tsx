import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './zd-project-cycle.module.less'
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import { Skeleton } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import { openProjectModal } from '../../components/project-modal/project-modal'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 项目周期占比 */
export const ZDProjectCycle = defineComponent({
  setup () {
    const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
    const loading = ref(false)
    const projectNum = ref(0);
    const pieData = ref([
      {
        name: '1个月',
        value: 0,
        color: colors[0],
        code: 'ONE_MONTH',
      },
      {
        name: '1-3个月',
        value: 0,
        color: colors[1],
        code: 'ONE_TO_THREE_MONTH',
      },
      {
        name: '3-6个月',
        value: 0,
        color: colors[2],
        code: 'THREE_TO_SIX_MONTH',
      },
      {
        name: '半年以上',
        value: 0,
        color: colors[3],
        code: 'SIX_MONTH',
      },
    ])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getProjectCycle()
        if (res) {
          const { oneMonth, oneToThreeMonth, sixMonth, threeToSixMonth, total } = res
          pieData.value[0].value = oneMonth || 0
          pieData.value[1].value = oneToThreeMonth || 0
          pieData.value[2].value = threeToSixMonth || 0
          pieData.value[3].value = sixMonth || 0
          projectNum.value = total || 0
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    const handleCurrent = async (item: { code: string; value: number; }): Promise<void> => {
      await openProjectModal({
        title: '项目列表',
        data: {
          typeEnum: item.code
        },
      })
    }
    onMounted(()=>{
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton active loading={loading.value} paragraph={{ rows: 4 }}>
        </Skeleton>
        <div class={styles['zd-project-cycle']} style={{ opacity: loading.value ? '0' : '1' }}>
          <ElevatorAnalysisPie style="width: 38%; height: 1.0416rem" radius={'75'} pieData={pieData.value}>
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <CountTo startVal={0} endVal={projectNum.value} duration={2000} separator="" style="color: #fff; text-align: center; font-size: 22px;"></CountTo>
              <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale,1) * 16px)">项目数</div>
            </div>
          </ElevatorAnalysisPie>
          <ElevatorAnalysisList showRatio={true} showNumber={false} contentList={pieData.value} warperClassName={styles['right-list']} onHandlecurrent={handleCurrent} />
        </div>
      </SubPanelTemplate>
    )
  },
})