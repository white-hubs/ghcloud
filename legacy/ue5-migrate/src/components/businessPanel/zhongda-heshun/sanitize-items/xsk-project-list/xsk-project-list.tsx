import { type VNode, computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './xsk-project-list.module.less'
import { Tag } from '../../components/tag/tag'
import { closeProjectDetailModal, projectDetailModal } from '../../components/project-detail-modal/project-detail-modal'
import { Skeleton, Image, Input, Button } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import dayjs from 'dayjs'
import type { ProjectPageVO, ProjectStatus } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import NoData from "@/components/businessPanel/public/noData.vue";
import { closeProjectModal, projectModal } from '../../components/project-modal/project-modal'
import { projectStore } from '../../store/project'
import { createKeyPlaceMarker, drawAllProjectRange, drawProjectRange } from '../../utils/gis-helper'
import { getAssetsImage } from '@/utils/getImage'
import { modalManager } from '@/pages/widget/modal/modal-manager'
import { showPersonMarker, showProjectMarker } from '../../utils/common'
import { EyeOutlined } from '@ant-design/icons-vue'
import { clearMap } from '@/pages/event/register/gis'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 项目列表 */
export const XSKProjectList = defineComponent({
  setup () {
    const store = projectStore()
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
    const status = ref('')
    const searchText = ref('')
    const list = ref([
      {
        text: '全部',
        value: 0,
        unit: '个',
        iconColor: '#E3E9F4',
        enum: ''
      },
      {
        text: '待开始',
        value: 0,
        unit: '个',
        iconColor: '#A0C9FF',
        enum: 'WAITING'
      },
      {
        text: '进行中',
        value: 0,
        unit: '个',
        iconColor: '#FFC7A6',
        enum: 'DOING'
      },
      {
        text: '已完成',
        value: 0,
        unit: '个',
        iconColor: '#C0FFAC',
        enum: 'COMPLETED'
      }
    ])
    const activeId = ref<string | number>('')
    const projectList = ref<(ProjectPageVO & { dateRange: string; pic: string; })[]>([])

    const statusText = computed(()=>{
      const statusTextMap = {
        WAITING: '待开始',
        PROCESSING: '进行中',
        COMPLETED: '已完成'
      }
      return function (status: string): string{
        return statusTextMap[status]
      }
    })
    const getListData = async (): Promise<void>=>{
      // projectList.value.slice(1).map((item) =>{
        
      //   handleClickProjectItem(item,true)
      // })
      store.updateAllProjects(projectList.value)
      if (projectList.value.length > 0) {
        handleClickProjectItem(projectList.value[0])
      }
      list.value[0].value = projectList.value?.length ?? 0
      list.value[1].value = projectList.value?.filter(item=>item.status === 'WAITING').length ?? 0
      list.value[2].value = projectList.value?.filter(item=>item.status === 'PROCESSING').length ?? 0
      list.value[3].value = projectList.value?.filter(item=>item.status === 'COMPLETED').length ?? 0
    }
    const handleStatusClick = async (status: string): Promise<void>=>{
      await projectModal.open({
        title: '项目列表',
        data: {
          status
        },
        onClose: ()=>{
          // drawProjectRange()
        }
      })
    }
    const loading = ref(false)
    const getData = async (status?: ProjectStatus): Promise<void> => {
      clearMap()
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getProjectsListAll({ status,keyword: searchText.value })
        if (res) {
          projectList.value = []
          projectList.value = res.map((item) => {
            const url = item.projectImage ? (item.projectImage.path?.startsWith('http') ? item.projectImage.path : `${location.origin}${item.projectImage.path}`) : ''
            return {
              ...item,
              dateRange: item.beginTime && item.endTime ? `${dayjs(item.beginTime).format('YYYY-MM-DD')} ~ ${dayjs(item.endTime).format('YYYY-MM-DD')}` : '',
              pic: url || getAssetsImage('noData.png')
            }
          })
          getListData()
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    onMounted(()=>{
      getListData()
      getData()
    })
    onBeforeUnmount(()=>{
      store.updateCurrentProject(null)
      store.clearCurrentProject()
    })

    const showDetail = async (item: ProjectPageVO): Promise<void>=>{
      modalManager.clearStack()
      await projectDetailModal.open({
        title: item.projectName,
        data: {
          ...item
        },
        onClose: ()=>{
          // drawProjectRange()
          // showProjectMarker()
          // showPersonMarker()
        },
        onLocate: (data)=>{
          createKeyPlaceMarker(data, { lat: data.latitude, lng: data.longitude }, true)
          // 关闭详情弹窗
          closeProjectDetailModal()
          // 关闭列表弹窗
          closeProjectModal()
        }
      })
    }
    const handleClickProjectItem = (item: ProjectPageVO): void=>{
      activeId.value = item.id
      store.updateCurrentProject(item)
      drawProjectRange()
      showProjectMarker()
      showPersonMarker()
      
    }
    onMounted(()=>{
      store.clearCurrentProject()
      
      // showProjectMarker()
      // showPersonMarker()
    })
    const search = () =>{
      getData()
    }
    return (): VNode => (
      <SubPanelTemplate titleFontSize="22px">
        <div class={styles.search}>
            <Input   v-model:value={searchText.value} placeholder={'项目支持按名称搜索'}></Input>
            <Button type='primary' onClick={search}>查询</Button>
        </div>
        <div class={styles.box}>
          {
            list.value.map((item) => (
              <Skeleton active loading={loading.value} paragraph={{ rows: 1 }} key={item.text}>
                <div class={`${styles.item} ${status.value === item.enum ? styles.active : ""}`} onClick={()=>{
                  status.value = item.enum
                  handleStatusClick(item.enum)
                }}>
                  <div class={styles.label}>
                    {Icon(item.iconColor)}
                    <div class={styles.title}>{item.text}</div>
                  </div>
                  <div class={styles.value}>
                    <CountTo startVal={0} endVal={item.value} duration={2000} ></CountTo>
                    <span class={styles.unit}>{item.unit}</span>
                  </div>
                </div>
              </Skeleton>
            ))
          }
        </div>
        <div class={styles.scroll}>
          {projectList.value.length === 0 && <NoData />}
          {
            projectList.value.map((item) => (
              <Skeleton active loading={loading.value} paragraph={{ rows: 2 }} key={item.id}>
                <div class={`${styles['project-item']} ${item.id === activeId.value ? styles.active : ""}`} onClick={()=>handleClickProjectItem(item)}>
                  <Image src={item.pic} previewMask={() => <><EyeOutlined />预览</>} />
                  <div class={styles.content}>
                    <div class={styles.title}>
                      <span class={styles['single-line']} title={item.projectName}>{item.projectName}</span>
                      <span class={styles['detail-btn']} onClick={(e)=>{
                        e.stopPropagation()
                        showDetail(item)
                      }}>详情</span>
                    </div>
                    <div class={styles.status}>
                      <span class={styles.text}>负责人：{item.leaderName || '--'}</span>
                      {/* @ts-ignore */}
                      <Tag type={item.status || 'WAITING'}>{statusText.value(item.status || 'WAITING')}</Tag>
                    </div>
                    <div class={styles.date}>项目周期：{item.dateRange || '--'}</div>
                    <div class={styles.date} title={item.disinfectionLocationName}>项目所在地：{item.disinfectionLocationName || '--'}</div>
                  </div>
                </div>
              </Skeleton>
            ))
          }
        </div>
      </SubPanelTemplate>
    )
  },
})