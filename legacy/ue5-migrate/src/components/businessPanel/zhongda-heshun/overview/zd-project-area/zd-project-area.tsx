import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './zd-project-area.module.less'
import { ProgressBar } from '../../components/progress-bar/progress-bar'
import { Skeleton } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { openProjectModal } from '../../components/project-modal/project-modal'

/** 项目区域分布 */
export const ZDProjectArea = defineComponent({
  setup () {
    const loading = ref(false)
    const dataList = ref([])
    const total = ref(100)
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getProjectDistribution()
        if (res) {
          dataList.value = []
          dataList.value = res.map((item) => ({
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

    const handleCurrent = async (item: { label: string; name: string; value: number; }): Promise<void> => {
      await openProjectModal({
        title: '项目列表',
        data: {
          area: item.label
        },
      })
    }
    onMounted(()=>{
      getData()
    })
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