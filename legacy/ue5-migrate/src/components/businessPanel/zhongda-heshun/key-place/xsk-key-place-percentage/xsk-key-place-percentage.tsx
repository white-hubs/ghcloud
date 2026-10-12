import { computed, defineComponent, onMounted, ref } from 'vue'
import styles from './xsk-key-place-percentage.module.less'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import { Skeleton } from 'ant-design-vue'
import NoData from "@/components/businessPanel/public/noData.vue";
import { cubeZDDataVizService } from '@/api/service'
import { createKeyPlaceModal } from '../../utils/modal-helper'
import { showKeyPlaceMarker } from '../../utils/common'
import { clearMap } from '@/pages/event/register/gis'
import { debounce } from '@/utils/common'
import { drawGeoJsonLayer } from '../../utils/gis-helper'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 重点场所占比 */
export const XSKKeyPlacePercentage = defineComponent({
  setup () { 
    const keyPlaceList = ref([])
    const filteredData = computed(() => {
      const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#67B9C1"];
      const data = keyPlaceList.value
      return data.map((item, i) => {
        return {
          ...item,
          color: colors[i % colors.length],
        }
      })
    })
    const total = computed(() => keyPlaceList.value.reduce((pre, cur) => pre + cur.value, 0))
    const loading = ref(false)
    const getData = async (): Promise<void>=>{
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getKeyPlaceDistribution()
        if (res) {
          keyPlaceList.value = []
          const list = (res ?? []).map(item => {
            return {
              name: item.keyName,
              value: item.number,
              id: item.keyId
            }
          })
          keyPlaceList.value = list
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    onMounted(()=>{
      getData()
    })
    const handleValueCurrent = async (item: { name: string; value: number; }): Promise<void> => {
      createKeyPlaceModal(item.name, { dataTypeName: item.name })
    }
     const handleTitleCurrent = debounce(async (item: { name: string; value: number; }): Promise<void> => {
    clearMap()
    const cur = keyPlaceList.value.find(e => e.name === item.name)
    await showKeyPlaceMarker({ dataTypeId: cur?.id || '' })
    drawGeoJsonLayer()
  },300)
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton loading={loading.value} active>
          {filteredData.value?.length === 0 && <NoData />}
          {
            filteredData.value?.length > 0 &&
            <div class={styles['charts']}>
              <ElevatorAnalysisPie
                onClickbar={handleTitleCurrent}
                style="width: 38%; height: 1.0416rem" radius={'75'} pieData={filteredData.value}>
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <CountTo startVal={0} endVal={total.value || 0 } duration={2000} separator="" style="color: #fff; text-align: center; font-size: 22px;"></CountTo>
                <div style="color: #fff; text-align: center; font-size: 16px;white-space: nowrap;">场所总数</div>
              </div>
              </ElevatorAnalysisPie>
              <ElevatorAnalysisList showRatio={true} contentList={filteredData.value} warperClassName={styles['right-list']} onClickName={handleTitleCurrent} onClickValue={handleValueCurrent} />
            </div>
          }
        </Skeleton>
      </SubPanelTemplate>
    )
  },
})