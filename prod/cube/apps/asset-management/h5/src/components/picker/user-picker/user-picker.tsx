import { List, Empty, PullRefresh, Cell, CellGroup, Search, Popup, Image, Radio, RadioGroup, Button } from 'vant'
import { defineComponent, reactive, ref } from 'vue'
import styles from './user-picker.module.less'
import { cubeOuaaService } from '@/api/server'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import { FilterDom } from './filter/filter-dom'
interface SearchType {
  pageNumber: number;
  total: number;
  pageSize: number;
  enable: boolean;
  keyword: string;
  organizationId: string;
  positionId: string;
  roleId: string;
}
/** 人员列表页 */
export const UserPicker = defineComponent({
  emits: ['submit'],
  setup: (props, { emit }) => {
    const roleList = ref<PersonItem[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const checked = reactive({ id: '', name: '' })
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      enable: true,
      keyword: '',
      organizationId: '',
      positionId: '',
      roleId: ''
    })
    // 获取人员列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const data = await cubeOuaaService.getStaffPage({ ...search })
        search.total = data.total

        if (data.total <= search.pageSize) {
          finished.value = true
        }
        if (data.total < search.pageSize) {
          finished.value = true
        }
        if (!roleList.value) {
          roleList.value = []
        }
        if (search.pageNumber === 1) {
          roleList.value = []
        }
        roleList.value = [...roleList.value, ...data.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const showFilter = ref(false)
    const handleFilter = (filter: SearchType): void => {
      search.organizationId = filter.organizationId
      search.positionId = filter.positionId
      search.roleId = filter.roleId
      showFilter.value = false
      onSearch()
    }
    return (): JSX.Element =>
      <div>
        <div class={styles.search}>
          <Search style='flex:1 1 auto' v-model={search.keyword} placeholder='根据人员姓名进行搜索' onSearch={onSearch} />
          <div style='color:#646566;width:50px' onClick={() => {
            showFilter.value = true
          }}>筛选</div>
        </div>
        <div style={{ height: '89vh', background: '#f3f7fa' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '88vh', overflow: 'auto' }}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={roleList.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                roleList.value && roleList.value.length > 0 &&
                roleList.value.map((item) => {
                  return (
                    <RadioGroup key={item.id} v-model={checked.id}>
                      <CellGroup inset class={styles['cell-group']}>
                        <Cell clickable onClick={() => {
                          checked.id = item.id; checked.name = item.name
                        }}>
                          <div class={styles.cell}>
                            {item?.fileVO?.path
                              ? <Image
                                round
                                fit='cover'
                                src={item?.fileVO?.path}
                                width='70' height='70' alt=''
                              />
                              : <div class={styles.img}>{item.name.slice(-2)}</div>}
                            <div class={styles.item}>
                              <div>{item.name}</div>
                              <div>部门：{item.organization?.name || '--'}</div>
                              <div>电话：{item.mobile || '--'}</div>
                            </div>
                            <Radio name={item.id} />
                          </div>
                        </Cell>
                      </CellGroup>
                    </RadioGroup>

                  )
                })
              }
              {(roleList.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
        <Popup v-model:show={showFilter.value} position='right' style={{ width: '100%', height: '100%' }}>
          <FilterDom v-model:searchForm={search} onSubmit={(filter: SearchType) => {
            handleFilter(filter)
          }} />
        </Popup>
        <Button type='primary' block size='small' onClick={() => {
          emit('submit', checked)
        }}>确定</Button>
      </div>
  }
})
