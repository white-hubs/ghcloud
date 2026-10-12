
import { defineComponent, onMounted, ref } from 'vue'
import { Tab, Tabs } from 'vant'
import { cubeSmallEngineeringService } from '@/api/server'
import type { ProjectHomeStatistics } from '@ghcloud/cube-small-engineering-service'
import { EngineeringItem } from './engineering-item'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { SearchBar } from '../engineering-manage/search-bar/search-bar'
import styles from './engineering-all-list.module.less'
import { useRouter, useRoute } from 'vue-router'
const addIcon = '/resource/v1/small-engineering/images/add-icon.png'

export const EngineeringAllList = defineComponent({
  name: 'EngineeringAllList',
  setup: () => {
    const smallStatistics = ref<ProjectHomeStatistics>({
      total: 0,
      ringRatio: 0,
      apply: 0,
      signing: 0,
      underway: 0,
      waitAccept: 0,
      completed: 0,
      abnormal: 0,
      normal: 0
    })
    const showSearch = ref(false)
    const tabActive = ref(0)
    const period = ref('')
    const keyword = ref('')
    const router = useRouter()
    const route = useRoute()

    const getData = async (): Promise<void> => {
      smallStatistics.value = await cubeSmallEngineeringService.projectHomeStatistics({ keyword: keyword.value || undefined, period: period.value || undefined })
      tabOptions.value[0].label = '进行中' + (smallStatistics.value.underway || '')
      tabOptions.value[1].label = '待验收' + (smallStatistics.value.waitAccept || '')
      tabOptions.value[2].label = '已完成' + (smallStatistics.value.completed || '')
    }

    const tabOptions = ref([
      {
        label: '进行中',
        value: 'UNDERWAY'
      },
      {
        label: '待验收',
        value: 'WAIT_ACCEPT'
      },
      {
        label: '已完成',
        value: 'COMPLETED'
      },
    ])
    const addProject = (): void => {
      router.push({
        name: 'project-supervise-add',
      })
    }
    onMounted(async () => {
      sessionStorage.removeItem('projectSuperviseAdd')
      sessionStorage.removeItem('checkPersonListCache')
      const type = (route.query as { type: string; }).type
      if (period) {
        period.value = (route.query as { period: string; }).period
      }
      if (type) {
        tabActive.value = tabOptions.value.findIndex(e => e.value === type)
      }
      getData()
    })
    return (): JSX.Element =>
      <div class={styles.page}>
        <CubeNavBar title='工程监管' showBack rightText='筛选' onClickRight={() => {
          showSearch.value = true
        }} />
        <Tabs v-model:active={tabActive.value} style='background-color: #f7f8fa;'>
          {
            tabOptions.value.map(item =>
              <Tab
                value={item.value}
                key={item.value}
                v-slots={{
                  title: () =>
                    <>
                      {item.label}
                    </>
                }}
              >
                <EngineeringItem status={item.value} period={period.value} keyword={keyword.value} activeStatus={tabOptions.value[tabActive.value].value} />
              </Tab>)
          }
        </Tabs>
        <SearchBar
          v-model:visible={showSearch.value}
          onConfirm={(data) => {
            period.value = data.period
            keyword.value = data.keyword
            getData()
          }}
        />
        <div class={styles['add-icon']} onClick={addProject}>
          <img src={addIcon} alt='' />
        </div>
      </div>
  }
})
