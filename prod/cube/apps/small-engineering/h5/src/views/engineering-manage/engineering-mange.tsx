import { defineComponent, onMounted, ref } from 'vue'
import { Tab, Tabs } from 'vant'
import { cubeSmallEngineeringService } from '@/api/server'
import type { ProjectHomeStatistics } from '@ghcloud/cube-small-engineering-service'
import { EngineeringItem } from './engineering-item'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { SearchBar } from './search-bar/search-bar'
import styles from './engineering-manage.module.less'

export const EngineeringManage = defineComponent({
  name: 'EngineeringAllList',
  setup: () => {
    const showSearch = ref(false)
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

    const tabActive = ref(0)
    const period = ref('')
    const keyword = ref('')

    const getData = async (): Promise<void> => {
      smallStatistics.value = await cubeSmallEngineeringService.projectStatistics({
        period: period.value || undefined,
        keyword: keyword.value || undefined
      })
      tabOptions.value[0].num = smallStatistics.value.apply || 0
      tabOptions.value[1].num = smallStatistics.value.signing || 0
      tabOptions.value[2].num = smallStatistics.value.underway || 0
      tabOptions.value[3].num = smallStatistics.value.waitAccept || 0
      tabOptions.value[4].num = smallStatistics.value.completed || 0
    }
    const tabOptions = ref([
      {
        label: '请示中',
        value: 'APPLYING',
        num: 0
      },
      {
        label: '签约中',
        value: 'SIGNING',
        num: 0
      },
      {
        label: '进行中',
        value: 'UNDERWAY',
        num: 0
      },
      {
        label: '待验收',
        value: 'WAIT_ACCEPT',
        num: 0
      },
      {
        label: '已完成',
        value: 'COMPLETED',
        num: 0
      },
    ])
    onMounted(async () => {
      getData()
    })
    return (): JSX.Element =>
      <div class={styles.page}>
        <CubeNavBar title='工程管理' showBack rightText='筛选' onClickRight={() => {
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
                      {item.label + item.num}
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
      </div>
  }
})
