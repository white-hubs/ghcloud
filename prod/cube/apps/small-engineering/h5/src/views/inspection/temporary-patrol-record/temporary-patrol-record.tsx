import { Cell, CellGroup, Empty, List, PullRefresh, Search, Tag } from 'vant'
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cubeSmallEngineeringService } from '@/api/server'
import styles from './temporary-patrol-record.module.less'
import dayjs from 'dayjs'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import type { TemporaryPatrolRecordVO } from '@ghcloud/cube-small-engineering-service'

export const TemporaryPatrolRecord = defineComponent({
  setup: () => {
    const router = useRouter()
    const loadingSate = reactive({
      loading: false,
      finished: false
    })
    const pageData = reactive({
      pageNumber: 0,
      pageSize: 10,
    })
    const keyword = ref('')
    const data = ref<TemporaryPatrolRecordVO[]>([])

    const onRefresh = (): void => {
      pageData.pageNumber = 0
      data.value = []
      loadingSate.finished = false
      onLoad()
    }

    const onLoad = async (): Promise<void> => {
      loadingSate.loading = true
      pageData.pageNumber++
      const params = {
        keyword: keyword.value,
        pageNumber: pageData.pageNumber,
        pageSize: pageData.pageSize
      }
      try {
        const res = await cubeSmallEngineeringService.temporaryPatrolRecord(params)
        data.value = data.value.concat(res.records)
        if (pageData.pageNumber >= res.pages) {
          loadingSate.finished = true
        }
      } finally {
        loadingSate.loading = false
      }
    }

    const resultType = (result: string): string => {
      switch (result) {
        case 'NORMAL':
          return '正常'
        case 'ABNORMAL':
          return '异常'
        default:
          return '--'
      }
    }

    const resultTagColor = (result: string): string => {
      switch (result) {
        case 'NORMAL':
          return 'success'
        case 'ABNORMAL':
          return 'danger'
        default:
          return 'primary'
      }
    }

    const goDetails = (id: string): void => {
      router.push({ path: '/temporary-patrol-details', query: { id: id } })
    }

    return (): JSX.Element => {
      return (
        <div>
          <CubeNavBar title='临时巡查记录' showBack />
          <Search
            v-model={keyword.value}
            placeholder='根据名称进行搜索'
            showAction={true}
            onSearch={onRefresh}
            v-slots={{
              action: () =>
                <div onClick={onRefresh}>搜索</div>
            }}
          />
          <PullRefresh v-model={loadingSate.loading} onRefresh={onRefresh}>
            <div class={styles['list-page']}>
              <List
                finished={loadingSate.finished}
                finished-text={data.value.length === 0 ? '' : '暂无更多数据'}
                onLoad={onLoad}
              >
                {
                  data.value.map(e => {
                    return (
                      <CellGroup key={e.id} class={styles['card-item']} onClick={() => {
                        goDetails(e.id)
                      }}>
                        <Cell title={e.name} is-link />
                        <Cell>
                          <p>巡查结果：<Tag type={resultTagColor(e.result)}>{resultType(e.result)}</Tag></p>
                          <p>巡查人员：{e.userName}</p>
                          <p>巡检时间：{e.completeTime ? dayjs(e.completeTime).format('YYYY-MM-DD HH:mm') : '--'}</p>
                          <p>巡检对象：{e.projectName}</p>
                        </Cell>
                      </CellGroup>
                    )
                  })
                }
                {
                  (loadingSate.finished && data.value.length === 0) && <Empty description='暂无数据' />
                }
              </List>
            </div>
          </PullRefresh>
        </div>
      )
    }
  }
})