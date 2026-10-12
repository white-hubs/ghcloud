import { defineComponent, onMounted, reactive, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './safety-education-statistics.module.less'
import DeviceStatistics from "@/components/businessPanel/security-overview/components/device-statistics.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import SafetyEducationTable from "@/components/businessPanel/safety-management/components/safety-education-table.vue";
import { getSafetyEdu, getSafetyEduTheme } from '@/api/safety-education';
import { getallNumber } from "@/utils/common";
import { ModelValueItf } from '@/components/businessPanel/public/types';

export const SafetyEducationStatistics = defineComponent({
  name: 'SafetyEducationStatistics',
  props: {
    title: {
      type: String,
      default: '安全教育统计'
    },
  },
  setup(props) {
    // 时间选择器数据
    const eduTime = ref<ModelValueItf>({
      timeType: 'THIS_YEAR',
      dateRange: []
    });

    // 安全教育统计数据
    const eduStatisticsData = reactive({
      title: "教育任务总数",
      total: 0,
      qoq: 0
    });

    // 饼图数据
    const detectionData = ref([]);

    // 弹窗相关
    const secureModalShow = ref(false);
    const secureParameter = reactive({
      period: '',
      themeId: ''
    });

    // 获取安全教育统计数据
    const getEduCount = async () => {
      const params = {
        period: eduTime.value.dateRange.join(','),
        type: eduTime.value.timeType
      }
      const data = await getSafetyEdu(params);
      eduStatisticsData.qoq = data.chainRatio;
      eduStatisticsData.total = data.totalNum;
    }

    // 获取安全教育主题统计数据
    const getEduStat = async () => {
      const params = {
        period: eduTime.value.dateRange.join(','),
        type: eduTime.value.timeType
      }
      const data = await getSafetyEduTheme(params);
      detectionData.value = data.map(item => {
        return {
          id: item.id,
          name: item.name,
          value: item.totalNum
        }
      })
    }

    // 统计数据更新
    const educateStat = () => {
      getEduCount();
      getEduStat();
    }

    // 点击统计项处理函数
    const handelClickItemize = () => {
      secureParameter.themeId = '';
      secureParameter.period = eduTime.value.dateRange.join(",");
      secureModalShow.value = true;
    }

    // 点击饼图项处理函数
    const openSecure = (data) => {
      secureParameter.themeId = detectionData.value.find(e => e.name === data.name).id;
      secureParameter.period = eduTime.value.dateRange.join(",");
      secureModalShow.value = true;
    }

    onMounted(() => {
      educateStat();
    })

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title={props.title} class="alarm-event"
        v-slots={{
            extra: () => (
              <DateInlineForm 
                v-model:modelValue={eduTime.value} 
                onSearch={educateStat}
              />
            )
          }}>
          <div class={styles.container}>
            <DeviceStatistics 
              imgPath="88-icon.png" 
              statistic={eduStatisticsData}
              onHandelClickItemize={handelClickItemize}
            />
            <div class={styles.elevatorAnalysis}>
              <div class={styles.chart}>
                <ElevatorAnalysisPie 
                  pieData={detectionData.value}
                  onClickbar={openSecure}
                >
                  <div style="color: #fff;text-align: center;font-size: 14px;">
                    {getallNumber(detectionData.value, 'value')}
                  </div>
                  <div style="color: #fff;text-align: center;font-size: 12px;">
                    教育任务数
                  </div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.pieList}>
                <ElevatorAnalysisList 
                  contentList={detectionData.value} 
                  class={styles.pieList}
                  onHandlecurrent={openSecure}
                />
              </div>
            </div>
          </div>
        </SubPanelTemplate>
        <SafetyEducationTable 
          showModal={secureModalShow.value} 
          onClose={() => secureModalShow.value = false} 
          parameter={secureParameter}
        />
      </>
    )
  }
})