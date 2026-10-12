import { computed, defineComponent, ref, onMounted } from 'vue'
import type { VNode } from 'vue'
import styles from './xsk-project-product-user-distribution.module.less'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import { Skeleton } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { closePersonModal, openPersonModal } from '../../components/person-modal/person-modal'
import type { UserInfo } from '@ghcloud/cube-ouaa-service/src/ouaa.service'
import { createUserMarker, restoreTheInitialStateOfTheMap } from '../../utils/gis-helper'
import { clearMap } from '@/pages/event/register/gis'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";


/** 产品用户数量分布 */
export const XSKProjectProductUserDistribution = defineComponent({
  setup () {
    const loading = ref(false)
    const dataList = ref([])
    const total = ref(0)
    const filteredData = computed(() => {
      if (dataList.value.length === 0) return []
      const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#67B9C1"];
      const data = [...dataList.value]
      return data.map((item, i) => {
        return {
          ...item,
          color: colors[i % colors.length],
        }
      })
    })
     const getListData = async (): Promise<void>=>{
      try {
        loading.value = true

        const res = await cubeZDDataVizService.getProjectProductTypeCount()
        if (res) {
          dataList.value = (res ?? [])?.map((item,key) => {
            return {
              id: key,
              name: item.productType,
              value: item.count,
            }
          })
          total.value = (res ?? [])?.reduce((acc, cur) => acc + cur.count, 0)
        }
      } catch {
      } finally {
          loading.value = false
      }
    }
    onMounted(() => {
      getListData()
    })

    return (): VNode => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton loading={loading.value} active>
          {filteredData.value?.length === 0 && <NoData />}
          {
            filteredData.value?.length > 0 &&
            <div class={styles['charts']}>
              <ElevatorAnalysisPie style="width: 38%; height: 1.0416rem" radius={'75'} pieData={filteredData.value}>
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                  <CountTo startVal={0} endVal={total.value} duration={2000} separator="" style="color: #fff; text-align: center; font-size: 22px;"></CountTo>
                  <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale,1) * 16px); white-space: nowrap;">用户数</div>
                </div>
              </ElevatorAnalysisPie>
              <ElevatorAnalysisList showNumber={false} showRatio={true} contentList={filteredData.value} warperClassName={styles['right-list']}  />
            </div>
          }
        </Skeleton>
      </SubPanelTemplate>
    )
  },
})