import { defineComponent, reactive, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './hidden-danger-statistics.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import HiddenDangerTable from "@/components/businessPanel/safety-management/components/hidden-danger-table.vue"
import { hiddenNumStatistics, hiddenTypeStatistics } from '@/api/maintain'
import moment from 'moment'

export const HiddenDangerStatistics = defineComponent({
  name: 'HiddenDangerStatistics',
  props: {
    title: {
      type: String,
      default: '隐患统计'
    },
  },
  setup(props) {
    const eventTime = ref({
      timeType: 'THIS_YEAR',
      dateRange: []
    })

    const equipmentStatisticsData = reactive({
      title: "隐患总数",
      total: 48,
      itemize: [
        {
          name: "已完成隐患数",
          label: "处理中隐患数",
          value: 23,
          offline: 15,
          key: "OFFLINE1",
        }
      ],
    });

    const detectionData = ref([])
    
    // 添加弹窗控制状态和参数
    const showModal = ref(false)
    const parameter = reactive({
      type: '',
      status: '',
      submitTime: ''
    })

    const alarmEventTop = async () => {
      const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
      const res = await hiddenNumStatistics({ period: eventTime.value.dateRange.join(",") })
      const data = await hiddenTypeStatistics({ period: eventTime.value.dateRange.join(",") })
      equipmentStatisticsData.total = res.total
      equipmentStatisticsData.itemize[0].offline = res.finished
      equipmentStatisticsData.itemize[0].value = res.inHand
      detectionData.value = data.typeStatisticsList.map((item, index) => {
        return {
          name: item.name,
          value: item.num,
          color: colors[index]
        }
      })
    }

    // 修改点击处理函数，直接控制弹窗显示
    const handelClickItemize = (value) => {
      parameter.type = 'ALL'
      if (value === "已完成隐患数") {
        parameter.status = 'FINISHED'
      } else if (value === "处理中隐患数") {
        parameter.status = 'ACTIVE'
      } else {
        parameter.status = ''
      }
      parameter.submitTime = eventTime.value.dateRange.join(",")
      showModal.value = true
    }

    onMounted(() => {
      alarmEventTop()
    })

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title={props.title} class="alarm-event" v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={eventTime.value}
              onSearch={alarmEventTop}
            />
          )
        }}>
          <div class={styles.container}>
            <DeviceStatistics 
              onHandelClickItemize={handelClickItemize} 
              imgPath="overView90.png" 
              statistic={equipmentStatisticsData}
            />
            <div class={styles.elevatorAnalysis}>
              <div class={styles.chart}>
                <ElevatorAnalysisPie pieData={detectionData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;">{equipmentStatisticsData.total}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;">隐患总数</div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.pieList}>
                <ElevatorAnalysisList contentList={detectionData.value} />
              </div>
            </div>
          </div>
        </SubPanelTemplate>
        {/* 添加隐患表格弹窗组件 */}
        <HiddenDangerTable 
          showModal={showModal.value} 
          onClose={() => showModal.value = false} 
          parameter={parameter}
        />
      </>
    )
  }
})