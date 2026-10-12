import { defineComponent, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './xsk-key-place-distribution.module.less'
import { ProgressBar } from '../../components/progress-bar/progress-bar'
import { Skeleton } from 'ant-design-vue'
import NoData from "@/components/businessPanel/public/noData.vue";
import { cubeZDDataVizService } from '@/api/service'
import { createKeyPlaceModal } from '../../utils/modal-helper'

/** 重点场所分布 */
export const XSKKeyPlaceDistribution = defineComponent({
  setup () {
    const dataList = ref([])
    const total = ref(100)
    const loading = ref(false)
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getFocusDistribution()
        if (res) {
          dataList.value = []
          dataList.value = res.map((item) => ({
            ...item,
            name: item.keyName,
            value: item.number,
          }))
          total.value = res.reduce((acc, cur) => acc + cur.number, 0)
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
    const handleCurrent = async (item: { label: string; value: number; }): Promise<void> => {
      createKeyPlaceModal('重点场所', { area: item.label },true)
    }
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton active loading={loading.value} paragraph={{ rows: 6 }}>
          <div class={styles.scroll}>
            {dataList.value?.length === 0 && <NoData />}
            {
              dataList.value.map((item) => (
                <div class={styles.item} key={item.name}>
                  <ProgressBar total={total.value} label={item.name} value={item.value} onClick={handleCurrent} />
                </div>
              ))
            }
          </div>
        </Skeleton>
      </SubPanelTemplate>
    )
  },
})