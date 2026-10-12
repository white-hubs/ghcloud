import { defineComponent, nextTick, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './zd-sanitize-items.module.less'
import { Skeleton } from 'ant-design-vue'
import { openProjectModal } from '../../components/project-modal/project-modal'
import { cubeZDDataVizService } from '@/api/service'
import { drawGeoJsonLayer} from '../../utils/gis-helper'
import { ProjectStatus } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { showPersonMarker, showProjectMarker } from '../../utils/common'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 消杀项目 */
export const ZDSanitizeItems = defineComponent({
  setup () {
    const Icon = (color?: string): JSX.Element=>{
      return <svg width="20px" height="20px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>形状</title>
        <defs>
          <path d="M5.42884063,8 L18.5711594,8 C19.3602863,8 20,8.6106319 20,9.36388451 L20,18.6361155 C20,19.3893681 19.3602863,20 18.5711594,20 L5.42884063,20 C4.63971374,20 4,19.3893681 4,18.6361155 L4,9.36390391 C4,8.61065129 4.63971374,8 5.42884063,8 L5.42884063,8 Z M7.5,6 L16.5,6 C16.7761424,6 17,6.22385763 17,6.5 C17,6.77614237 16.7761424,7 16.5,7 L7.5,7 C7.22385763,7 7,6.77614237 7,6.5 C7,6.22385763 7.22385763,6 7.5,6 Z M8.5,4 L15.5,4 C15.7761424,4 16,4.22385763 16,4.5 C16,4.77614237 15.7761424,5 15.5,5 L8.5,5 C8.22385763,5 8,4.77614237 8,4.5 C8,4.22385763 8.22385763,4 8.5,4 Z" id="path-1"></path>
          <filter x="-37.5%" y="-37.5%" width="175.0%" height="175.0%" filterUnits="objectBoundingBox" id="filter-2">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.397714299   0 0 0 0 0.497410569   0 0 0 0 0.887341486  0 0 0 0.766034747 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
          </filter>
        </defs>
        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="中大合顺-总览" transform="translate(-217, -188)" fill-rule="nonzero">
            <g id="消杀项目" transform="translate(20, 100)">
              <g id="编组-2备份" transform="translate(185, 76)">
                <g id="形状" transform="translate(12, 12)">
                  <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlinkHref="#path-1"></use>
                  <use fill={color ?? '#A0C9FF'} xlinkHref="#path-1"></use>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    }
    const list = ref({
      // 项目数
      projectNum: {
        text: '项目数',
        value: 0,
        unit: '个',
        iconColor: '#E3E9F4',
        status: ''
      },
      // 待开始
      projectWait: {
        text: '待开始',
        value: 0,
        unit: '个',
        iconColor: '#A0C9FF',
        status: ProjectStatus.WAITING
      },
      // 进行中
      projectDoing: {
        text: '进行中',
        value: 0,
        unit: '个',
        iconColor: '#FFC7A6',
        status: ProjectStatus.PROCESSING
      },
      // 已完成
      projectCompleted: {
        text: '已完成',
        value: 0,
        unit: '个',
        iconColor: '#C0FFAC',
        status: ProjectStatus.COMPLETED
      }
    })
    const loading = ref(false)
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getDisinfectionProjectStatistics()
        if (res) {
          const { completed, inProgress, toStart, total } = res
          list.value.projectNum.value = total || 0
          list.value.projectWait.value = toStart || 0
          list.value.projectDoing.value = inProgress || 0
          list.value.projectCompleted.value = completed || 0
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
      setTimeout(()=>{
        drawGeoJsonLayer()
        showPersonMarker()
        showProjectMarker()
      }, 500)
      
     

      
    })
    const handleClick = async (status: string): Promise<void> => {
      await openProjectModal({
        title: '项目列表',
        data: {
          status
        }
      })
    }

    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <div class={styles.box}>
          {
            Object.keys(list.value).map((key) => (
              <Skeleton active loading={loading.value} paragraph={{ rows: 1 }} key={key}>
                <div class={styles.item} onClick={async () => handleClick(list.value[key].status)}>
                  <div class={styles.label}>
                    {Icon(list.value[key].iconColor)}
                    <div class={styles.title}>{list.value[key].text}</div>
                  </div>
                  <div class={styles.value}>
                    <div class={styles.value}>
                      <CountTo startVal={0} endVal={list.value[key].value} duration={2000} separator=""></CountTo>
                      <span class={styles.unit}>{list.value[key].unit}</span>
                    </div>
                  </div>
                </div>
              </Skeleton>
            ))
          }
        </div>
      </SubPanelTemplate>
    )
  }
})