import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './drafts.module.less'
import { Cell, CellGroup, showNotify, Icon, Skeleton, Search, Popup, Button, DatePicker, Field, Tabs, Tab, PullRefresh, List, Divider, Empty, Tag, Picker, type PickerConfirmEventParams } from 'vant'
import { EntryMenu, CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRoute, useRouter } from 'vue-router'
import { cubeDailyTaskService, cubeOuaaService } from '@/api/server'
import { storeInspect } from '@/store/inspect'
import { status } from '../task/type'

import dayjs from 'dayjs'
import type { TaskListItem, TaskUrgencyItem } from '@ghcloud/cube-daily-task-service'

export const DraftsList = defineComponent({
  name: 'DraftsList',
  setup: () => {
    useMetaTitle()
    const store = storeInspect()
    const route = useRoute()
    const router = useRouter()
    const showPopUp = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const dataSource = ref<TaskListItem[]>([])
    const refreshing = ref(false)
    const activeTab = ref((route.query.status as string) ?? '')

    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
      keyword: '',
      status: 'DRAFT',
      taskCategoryId:'',
      taskName:'',
      dailyType:'DAILY_TASK'
    })
    const projectLevelColumns = ref<TaskUrgencyItem[]>([])
    const tagType = ['danger','warning','primary','success','default']

    const showEndPicker = ref(false)
    const tagList = ref<{text: string, value: string}[]>([])
    const tabs = ref([
      { title: '全部', status: 'ALL' },
      { title: '处理中', status: 'ACCEPT' },
      { title: '已完成', status: 'OVER' },
    ])
    const handleAdd = (): void => {
      router.push({
        path: '/task-add'
      })
    }
    // 切换标签
    const onClickTab = (): void => {
      search.taskCategoryId = ''
      search.status = activeTab.value
      if (activeTab.value === 'ALL')search.status = ''
      onRefresh()
    }
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const onSearch = (): void => {
      search.pageNumber = 0
      onLoad()
    }

    const handleScreen = (): void => {
      search.pageNumber = 0
      showPopUp.value = false

      onLoad()
    }
    onMounted(() => {
      onLoad()
      getType()
      getDailyUrgencyPage()
    })
        // 获取数据
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyTaskService.getDailyTaskPage(search)
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch (error) {
        finished.value = true
      } finally {
        //  finished.value = true
        loading.value = false
        refreshing.value = false
      }
    }
    const searchDom = {
      action: (): VNode => 
        <Icon name="filter-o" onClick={() => {
         showPopUp.value = true
       }} size="20" />
    }
    const toDetail = (id: string): void => {
      store.resetCache()
      router.push({
        path: '/task-add',
        query: {
          id
        }
      })
    }
    const getType  = async (): Promise<void> => {
      const param = {
        pageNumber: '1',
        pageSize: '1000',
        dailyType:'DAILY_TASK'
      }
      const data =  await cubeDailyTaskService.getDailyTaskCategoryPage(param)
      tagList.value = data.records.map((item:{id:string, name:string}) =>{
        return {
          text: item.name,
          value: item.id,
        }
      })
    }
    // getDailyTaskCategoryPage
       const onConfirm = (value: string | PickerConfirmEventParams): void => {
        const v = (value as PickerConfirmEventParams).selectedOptions
          if(v){
          search.taskCategoryId= String(v[0]?.value ?? v[0]?.value ?? '')
          search.taskName= String(v[0]?.text ?? v[0]?.text ?? '')
        }
      showEndPicker.value = false
    }   
    const getDailyUrgencyPage = async (): Promise<void> => {
      const data = await cubeDailyTaskService.getDailyUrgencyPage({
        pageNumber: '1',
        pageSize: '1000',
        dailyType:'DAILY_TASK'
      })
      projectLevelColumns.value = data.records
    }   
    const getTagType = (urgency:string): string => {
      const item = projectLevelColumns.value?.filter((i) => i.name === urgency)[0]
      let index  = item?.level
      if(index > 5){
        index = 5
      }
     return tagType[index - 1]
    }
    return (): VNode =>
      <>
        <CubeNavBar showBack title='草稿箱'/>
        <div class={styles.container}>
        <Search v-model={search.keyword} placeholder='根据任务名称进行搜索' show-action v-slots={searchDom} onSearch={onSearch} onClear={onSearch} />
        {/* <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
          {tabs.value.map(item =>
            <Tab title={item.title} name={item.status} key={item.title}>
             
            </Tab>)}
        </Tabs> */}
        <PullRefresh class={styles.pull} v-model={refreshing.value} onRefresh={onRefresh} style={{ height: '77vh', marginTop: '5px', overflow: 'auto' }}>
                <List
                  v-model:loading={loading.value}
                  finished={finished.value}
                  finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
                  onLoad={onLoad}
                >
                  {
                    (dataSource.value && dataSource.value.length > 0) &&
                    dataSource.value.map((item:TaskListItem) =>
                      <div class={styles['cell-group']} key={item.id} onClick={() => {
                          toDetail(item.id)
                      }}>
                        <div class={styles.title}>
                            <span class={styles['title-name']}>{item.taskName}
                            </span>
                            <div class={styles.tagsList}>
                            <div class={styles.tags} style={{ backgroundColor: item.master?'#00CC001A':'#f6d4a233',color:item.master?'#00CC00':'#f19307ff'}}>{item.master?'主':'子'}</div>
                            <div class={styles.tags} style={{ backgroundColor: status[item.status as keyof typeof status]?.background,color:status[item.status as keyof typeof status]?.color }}> {status[item.status as keyof typeof status]?.name ?? ''} </div>
                             <Tag type={getTagType(item.urgencyName)}>{item.urgencyName}</Tag>
                             </div>
                        </div>
                        <div class={styles.content}>
                          <div><span style={{ color: '#8f8f8f' }}>任务时限：</span><span>{dayjs (new Date(item.deadline)).format('YYYY-MM-DD HH:mm:ss')}</span></div>
                          <div><span style={{ color: '#8f8f8f' }}>负责人：</span><span>{item.taskUserName}</span></div>
                          {/* <div><span style={{ color: '#8f8f8f' }}>开始时间：</span><span>{timeFormat(item.validBeginTime, true)}</span></div>
                          <div><span style={{ color: '#8f8f8f' }}>截至时间：</span><span>{timeFormat(item.validEndTime, true)}</span></div> */}
                        </div>
                        <Divider style={{ margin: '5px' }} />
                      </div>)
                  }
                  {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
                </List>
              </PullRefresh>
        <Popup
          v-model:show={showPopUp.value}
          position='right'
          style={{ width: '90vw', height: '100vh' }}
        >
          <div style={{ margin: '10px' }}>任务类型</div>
          <div class={styles.screen}>
            <Field
              v-model={search.taskName}
              is-link
              readonly
              name='startTime'
              placeholder='任务类型'
              onClick={() => {
                showEndPicker.value = true
              }}
            />
          </div>
          <Popup v-model:show={showEndPicker.value} position='bottom'>
            <Picker
              columns={tagList.value}
              onConfirm={onConfirm}
              onCancel={() => (showEndPicker.value = false)}
            />
          </Popup>
          <div class={styles.footer_button_group} >
            <Button size='small'  block onClick={() => {
              search.taskName = ''
              search.taskCategoryId = ''
            }}>
              重置
            </Button>
            <Button size='small' block type='primary' onClick={handleScreen}>
              确定
            </Button>
          </div>
        </Popup>
        </div>
      </>
  }
})
