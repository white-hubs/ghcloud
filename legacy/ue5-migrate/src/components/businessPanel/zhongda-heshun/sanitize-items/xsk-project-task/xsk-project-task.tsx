import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { Button, Skeleton } from 'ant-design-vue'
import { ScrollTabs } from '../../components/scroll-tabs/scroll-tabs'
import styles from './xsk-project-task.module.less'
import { Tag } from '../../components/tag/tag'
import { openTaskModal } from '../../components/task-modal/task-modal'
import { cubeZDDataVizService } from '@/api/service'
import { TaskInfoVO, TaskStatus, type TaskPageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import NoData from "@/components/businessPanel/public/noData.vue";
import { taskDetailModal } from '../../components/task-detail-modal/task-detail-modal'
import { projectStore } from '../../store/project'
import { modalManager } from '@/pages/widget/modal/modal-manager'

/** 项目任务 */
export const XSKProjectTask = defineComponent({
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
    const activeKey = ref('all')
    const total = ref(0)

    // 预计算各状态的任务数量和过滤后的任务列表
    const tasksByStatus = computed(() => {
      const statusMap = new Map();
      const result = {
        all: tasks.value || [],
        [TaskStatus.WAIT_RECEIVE]: [],
        [TaskStatus.WAIT_EXECUTE]: [],
        [TaskStatus.EXECUTING]: [],
        [TaskStatus.FINISHED]: [],
        [TaskStatus.TERMINATED]: [],
        [TaskStatus.EXPIRED]: []
      };

      if (tasks.value) {
        tasks.value.forEach(task => {
          const status = task.status;
          if (!statusMap.has(status)) {
            statusMap.set(status, 0);
            result[status] = [];
          }
          statusMap.set(status, statusMap.get(status) + 1);
          result[status].push(task);
        });
      }
      return { counts: statusMap, filteredTasks: result };
    });

    const tabList = computed(() => {
      const { counts } = tasksByStatus.value;
      return [
        { text: `任务数(${total.value})`, key: 'all' },
        { text: `待接收(${counts.get(TaskStatus.WAIT_RECEIVE) || 0})`, key: TaskStatus.WAIT_RECEIVE },
        { text: `待执行(${counts.get(TaskStatus.WAIT_EXECUTE) || 0})`, key: TaskStatus.WAIT_EXECUTE },
        { text: `执行中(${counts.get(TaskStatus.EXECUTING) || 0})`, key: TaskStatus.EXECUTING },
        { text: `已结束(${counts.get(TaskStatus.FINISHED) || 0})`, key: TaskStatus.FINISHED },
        { text: `已终止(${counts.get(TaskStatus.TERMINATED) || 0})`, key: TaskStatus.TERMINATED },
        { text: `已过期(${counts.get(TaskStatus.EXPIRED) || 0})`, key: TaskStatus.EXPIRED }
      ];
    });

    const taskList = computed(() => {
      const { filteredTasks } = tasksByStatus.value;
      return filteredTasks[activeKey.value] || [];
    });
    const statusText = computed(()=>{
      const statusTextMap = {
        WAIT_RECEIVE: '待接收',
        WAIT_EXECUTE: '待执行',
        EXECUTING: '执行中',
        FINISHED: '已结束',
        TERMINATED: '已终止',
        EXPIRED: '已过期',
      }
      return function (status: string): string{
        return statusTextMap[status]
      }
    })
    const tasks = ref<TaskPageVO[]>([])
    const loading = ref(false)
    const getData = async (projectId?: string): Promise<void>=>{
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getProjectTaskList({ projectId })
        if (res) {
          tasks.value = res ?? []
          total.value = tasks.value?.length || 0
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    const store = projectStore()
    watch(() => store.currentProject, () => {
      if (store.currentProject) {
        getData(store.currentProject?.id as string)
      }
    })
    onMounted(()=>{
      getData()
    })
    const handleViewDetail = async (record: TaskPageVO): Promise<void> => {
      modalManager.clearStack()
      await taskDetailModal.open({
        title: record.taskName || '任务详情',
        taskData: {
          ...record
        }
      })
    }

    const handleMoreClick = async (): Promise<void> => {
      await openTaskModal({
        title: '项目任务',
        data: {
          status: activeKey.value === 'all' ? '' : activeKey.value
        }
      })
    }

    const getNotificationTypeText = (notificationType: string, task: TaskInfoVO): string => {
      const typeMap = {
        'GROUP': '小组',
        'DEPT': '部门',
        'POST': '岗位',
        'GROUP_ROLE': '小组+角色',
        'ROLE': '角色'
      }
      let name = ''
      if (notificationType === 'GROUP'){
        name = task.notificationGroupName ?? ''
      } else if (notificationType === 'DEPT'){
        name = task.notificationDeptName ?? ''
      } else if (notificationType === 'POST'){
        name = task.notificationPostName ?? ''
      } else if (notificationType === 'ROLE'){
        name = task.notificationRoleName ?? ''
      } else if (notificationType === 'GROUP_ROLE'){
        let roles = []
        if (task.notificationGroupName) roles.push(task.notificationGroupName)
        if (task.notificationRoleName) roles.push(task.notificationRoleName)
        name = roles.join(' - ')
      }
      return (typeMap[notificationType as keyof typeof typeMap] + ' : ' + name) || '--'
    }
    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{ extra: () => <Button type='link' size='small' style={{ color: '#b0c5ff', fontSize: '18px' }} onClick={handleMoreClick}>更多&gt;&gt;</Button> }}>
        <Skeleton active loading={loading.value} paragraph={{ rows: 1 }}>
          <ScrollTabs
            list={tabList.value}
            showPageBtn={false}
            onTabClick={(tab)=>{
              activeKey.value = tab.key
            }}
          ></ScrollTabs>
        </Skeleton>
        <div class={styles.content}>
          {taskList.value.length === 0 && <NoData />}
          {
            taskList.value.map((item) => (
              <Skeleton active loading={loading.value} paragraph={{ rows: 3 }} key={item.id}>
                <div class={styles.item}>
                  <div class={styles.title}>
                    <div class={styles.label}>
                      {Icon('#A6CCFF')}
                      <span>{item.taskName || '--'}</span>
                    </div>
                    <div class={styles['detail-btn']} onClick={async () => handleViewDetail(item)}>详情</div>
                  </div>
                  <div class={styles['row-text']}>
                    消杀人员：{getNotificationTypeText(item?.notificationType ?? '', item)}
                    <Tag type={item.status} class={styles.status}>{statusText.value(item.status)}</Tag>
                  </div>
                  <div class={styles['row-text']}>
                    所属项目：{item.projectName || '--'}
                  </div>
                  <div class={styles['row-text']}>
                    所属计划：{item.planName}
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