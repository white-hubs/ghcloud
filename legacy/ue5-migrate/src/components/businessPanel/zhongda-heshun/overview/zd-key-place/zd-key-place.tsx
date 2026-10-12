import { computed, defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './zd-key-place.module.less'
const IconKeyPlace = '/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg/key-place.svg'
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import { Skeleton } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { createKeyPlaceModal } from '../../utils/modal-helper'
import { findBestMatchingIcon } from '../../utils/icon-helper'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 重点场所 */
export const ZDKeyPlace = defineComponent({
  setup () {
    const loading = ref(true)
    const keyPlaceList = ref([
      {
        name: '重点场所',
        value: 0,
        icon: IconKeyPlace
      }
    ])
    const filteredData = computed(() => {
      if (keyPlaceList.value.length === 0) return []
      const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#67B9C1"];
      const data = keyPlaceList.value.filter((e, i)=>i > 0)
      return data.map((item, i) => {
        return {
          ...item,
          color: colors[i % colors.length],
        }
      })
    })
    const totalNumber = ref(0)
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getKeyPlaceDistribution()
        if (res) {
          keyPlaceList.value = []
          keyPlaceList.value = (res ?? []).map(item => {
            return {
              name: item.keyName,
              value: item.number,
              icon: findBestMatchingIcon(item.keyName)
            }
          })
          const total = keyPlaceList.value.reduce((acc, cur) => acc + cur.value, 0)
          keyPlaceList.value.unshift({
            name: '重点场所总数',
            value: total,
            icon: IconKeyPlace
          })
          totalNumber.value = total
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    onMounted(() => {
      getData()
    })
    const handleCurrent = async (item: { name: string; value: number; }): Promise<void> => {
      createKeyPlaceModal('重点场所', { dataTypeName: item.name })
    }
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton active loading={loading.value} paragraph={{ rows: 5 }}>
          {filteredData.value?.length === 0 && <NoData />}
          {
            filteredData.value?.length > 0 &&
            <div class={styles['charts']}>
              <ElevatorAnalysisPie style="width: 38%; height: 1.0416rem" radius={'75'} pieData={filteredData.value}>
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                  <CountTo startVal={0} endVal={totalNumber.value} duration={2000} separator="" style="color: #fff; text-align: center; font-size: 22px;"></CountTo>
                  <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale,1) * 16px)">重点场所</div>
                </div>
              </ElevatorAnalysisPie>
              <ElevatorAnalysisList showRatio={true} contentList={filteredData.value} warperClassName={styles['right-list']} onHandlecurrent={handleCurrent} />
            </div>
          }
        </Skeleton>
      </SubPanelTemplate>
    )
  },
})