
import { defineComponent, reactive, ref, watch } from 'vue'
import { Button, Cell, CellGroup, Empty, List, Progress, PullRefresh, Tag } from 'vant'
import { cubeSmallEngineeringService } from '@/api/server'
import styles from './engineering-all-list.module.less'
import type { ProjectScheduleListRecord } from '@ghcloud/cube-small-engineering-service'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

interface Props {
  status: string;
  period: string;
  activeStatus: string;
  keyword: string;
}
export const EngineeringItem = defineComponent({
  name: 'EngineeringItem',
  props: ['status', 'period', 'activeStatus', 'keyword'],
  setup: (props: Props) => {
    const loading = ref(false)
    const listLoading = reactive({
      loading: false,
      finished: false
    })
    const router = useRouter()
    const projectList = ref<ProjectScheduleListRecord[]>([])
    const pageData = reactive({
      pageNumber: 0,
      pageSize: 10,
    })
    const onRefresh = (): void => {
      if (props.activeStatus !== props.status) {
        return
      }
      pageData.pageNumber = 0
      projectList.value = []
      listLoading.finished = false
      onLoad()
    }
    watch(() => [props.period, props.keyword], () => {
      onRefresh()
    })
    const onLoad = async (): Promise<void> => {
      loading.value = true
      pageData.pageNumber++
      const params = {
        status: props.status,
        period: props.period || undefined,
        keyword: props.keyword || undefined,
        pageNumber: pageData.pageNumber,
        pageSize: pageData.pageSize
      }
      try {
        const res = await cubeSmallEngineeringService.projectScheduleList(params)
        projectList.value = projectList.value.concat(res.records)
        if (pageData.pageNumber >= res.pages) {
          listLoading.finished = true
        }
        listLoading.loading = false
        loading.value = false
      } catch {
        listLoading.loading = false
        loading.value = false
      }
    }
    const getProjectFeedback = (data: ProjectScheduleListRecord, event: Event): void => {
      event.stopPropagation()
      router.push({
        name: 'feedback',
        query: {
          id: data.id,
          schedule: data.schedule
        }
      })
    }
    const getProjectCheckAndAccept = (id: string, event: Event): void => {
      event.stopPropagation()
      router.push({
        name: 'checkAndAccept',
        query: {
          id
        }
      })
    }
    const goDetails = (e: ProjectScheduleListRecord): void => {
      router.push({ path: '/project-supervise-detail', query: { id: e.id } })
    }
    const statusType = (status: string): string => {
      switch (status) {
        case '进行中':
          return 'primary'
        case '待验收':
          return 'warning'
        default:
          return 'success'
      }
    }
    const editProject = (e: ProjectScheduleListRecord, event: Event): void => {
      event.stopPropagation()
      router.push({
        name: 'project-supervise-add',
        query: {
          id: e.id,
          edit: '1'
        }
      })
    }
    return (): JSX.Element =>
      <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
        <div class={styles['list-page']}>
          <List
            finished={listLoading.finished}
            finished-text={projectList.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              projectList.value.map(e => {
                return (
                  <CellGroup key={e.id} class={styles['card-item']} onClick={() => {
                    goDetails(e)
                  }}>
                    <Cell title={e.projectName} is-link />
                    <Cell>
                      <p>工程状态：<Tag type={statusType(e.status)}>{e.status}</Tag></p>
                      <p>工程时间：{e.completionTime ? dayjs(e.completionTime).format('YYYY-MM-DD') : '--'}</p>
                      <p>施工方：{e.partyB}</p>
                      <p style='display:flex;align-items:center'>工程进度：<Progress percentage={e.schedule || 0} style='width:50vw' /></p>
                      <div style='text-align:right'>
                        {
                          e.statusCode !== 'COMPLETED' && <Button style={{ marginRight: '6px' }} type='primary' size='small' onClick={(event: Event) => {
                            editProject(e, event)
                          }} class={styles['list-page-item-button']}>编辑</Button>
                        }
                        {
                          e.statusCode === 'UNDERWAY' && <Button type='primary' size='small' onClick={(event: Event) => {
                            getProjectFeedback(e, event)
                          }} class={styles['list-page-item-button']}>反馈</Button>
                        }
                        {
                          e.statusCode === 'WAIT_ACCEPT' && <Button type='primary' size='small' onClick={(event: Event) => {
                            getProjectCheckAndAccept(e.id, event)
                          }} class={styles['list-page-item-button']}>验收</Button>
                        }
                      </div>
                    </Cell>
                  </CellGroup>
                )
              })
            }
            {
              (listLoading.finished && projectList.value.length === 0) && <Empty description='暂无数据' />
            }
          </List>
        </div>
      </PullRefresh>
  }
})
