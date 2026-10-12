import { computed, defineComponent, ref, onMounted } from 'vue'
import type { VNode } from 'vue'
import styles from './xsk-person-post-distribution.module.less'
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

/** 项目岗位分布 */
export const XSKPersonPostDistribution = defineComponent({
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
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getPersonnelPost()
        if (res) {
          dataList.value = (res ?? [])?.map((item) => {
            return {
              id: item.keyId,
              name: item.keyName,
              value: item.number,
            }
          })
          total.value = (res ?? [])?.reduce((acc, cur) => acc + cur.number, 0)
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
    const handleCurrent = async (item: { name: string; value: number; id: string; }): Promise<void> => {
      let doCloseCallBack = true
      await openPersonModal({
        title: '人员统计',
        data: { ...item, postId: item.id },
        onClose: ()=>{
          // doCloseCallBack && restoreTheInitialStateOfTheMap()
        },
        onLocate: (data)=>{
          doCloseCallBack = false
          clearMap()
          createUserMarker(data as unknown as UserInfo, undefined, true)

          closePersonModal()
        }
      })
    }
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
                  <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale,1) * 16px); white-space: nowrap;">人员总数</div>
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