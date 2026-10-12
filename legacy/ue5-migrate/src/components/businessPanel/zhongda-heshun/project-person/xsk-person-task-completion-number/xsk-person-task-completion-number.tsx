import { type VNode, defineComponent, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './xsk-person-task-completion-number.module.less'
import { ProgressBar } from '../../components/progress-bar/progress-bar'
const IconUser = '/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg/user.svg'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { Skeleton } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import type { ProjectStatisticsBaseVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import NoData from "@/components/businessPanel/public/noData.vue";
import { closePersonModal, openPersonModal } from '../../components/person-modal/person-modal'
import type { UserInfo } from '@ghcloud/cube-ouaa-service/src/ouaa.service'
import { createUserMarker, restoreTheInitialStateOfTheMap } from '../../utils/gis-helper'
import { clearMap } from '@/pages/event/register/gis'
import { openTaskModal } from '../../components/task-modal/task-modal'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 项目人员任务完成数 */
export const XSKPersonTaskCompletionNumber = defineComponent({
  setup () {
    const dataList = ref<ProjectStatisticsBaseVO[]>([])
    const total = ref(0)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.TODAY,
      dateRange: []
    })
    const loading = ref(false)
    const getData = async (): Promise<void>=>{
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getPersonnelTaskComplete({
          period: timeRange.value.dateRange.join(','),
        })
        if (res) {
          dataList.value = res ?? []
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
    const handleCurrent = async (item: ProjectStatisticsBaseVO): Promise<void> => {
      let doCloseCallBack = true
      await openPersonModal({
        title: '人员统计',
        data: { ...item },
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
    const handleTotalClick = async (): Promise<void> => {
      await openTaskModal({
        title: '项目任务',
        data: {
          period: timeRange.value.dateRange.join(','),
        }
      })
    }
    return (): VNode => (
      <SubPanelTemplate
        v-slots={{
          extra: () => (
            <DateInlineForm v-model:modelValue={timeRange.value} onSearch={async () => getData()} />
          )
        }}
      >
        <Skeleton loading={loading.value} active>
          <div class={styles['user-static']} onClick={handleTotalClick}>
            <div class={styles['label']}>
              <img src={IconUser} />
              完成任务数
            </div>
            <div class={styles['value']}>
              <CountTo startVal={0} endVal={total.value} duration={2000} separator=""></CountTo>
              <span class={styles['unit']}>个</span>
            </div>
          </div>
          <div class={styles.scroll}>
            {dataList.value?.length === 0 && <NoData />}
            {
              dataList.value.map((item) => (
                <div class={styles.item} key={item.keyName}>
                  <ProgressBar total={total.value} label={item.keyName} value={item.number} onClick={handleCurrent} />
                </div>
              ))
            }
          </div>
        </Skeleton>
      </SubPanelTemplate>
    )
  },
})