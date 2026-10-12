import { defineComponent, onMounted, reactive, ref, computed } from 'vue'
import { PopOver, Page, Table, Form, FormItem, Input, Button } from '@ghcloud/cube-ui'
// 移除 useCubeForm 导入
import { cubeZhongdaHeshunService } from '@/api/service'
import type { ProjectGroupVO, UserVO } from '@ghcloud/cube-zhongda-heshun-service'
import styles from './tab-user.module.less'
import { useTableScroll } from '@/hook/use-table-scroll'

interface Props {
  projectId: string;
}
export const TabProjectPerson = defineComponent({
  name: 'TabProjectPerson',
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  setup: (props: Props) => {
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })
    const active = ref<string | number | null>(null);
    const groupList = ref<ProjectGroupVO[]>()
    const dataSource = ref<UserVO[]>()
    const allUsers = ref<UserVO[]>() // 存储所有用户数据用于搜索
    const loading = ref<boolean>(false)

    // 替换为Form组件的表单状态
    const formState = reactive({
      keyword: ''
    })

    // 移除 searchFormSchema 和 useCubeForm 相关代码
    const { scrollY } = useTableScroll()

    /**
     * @description: 处理搜索提交
     */
    const handleSearch = (): void => {
      const keyword = formState.keyword.trim()
      searchKeyword.value = keyword
      filterUsers()
      page.pageNumber = 1 // 重置到第一页
    }

    /**
     * @description: 处理搜索重置
     */
    const handleReset = (): void => {
      formState.keyword = ''
      searchKeyword.value = ''
      filterUsers()
      page.pageNumber = 1 // 重置到第一页
    }

    const searchKeyword = ref<string>('') // 搜索关键词

    /**
     * @description: 根据搜索关键词过滤用户数据
     */
    const filterUsers = (): void => {
      if (!allUsers.value) return

      if (!searchKeyword.value) {
        dataSource.value = allUsers.value
      } else {
        const keyword = searchKeyword.value.toLowerCase()
        dataSource.value = allUsers.value.filter(user => {
          // 搜索姓名
          const nameMatch = user.name?.toLowerCase().includes(keyword)
          // 搜索部门
          const orgMatch = user.organization?.name?.toLowerCase().includes(keyword)
          // 搜索岗位
          const positionMatch = user.positions?.some(pos =>
            pos.name?.toLowerCase().includes(keyword))
          // 搜索角色
          const roleMatch = user.roles?.some(role =>
            role.name?.toLowerCase().includes(keyword))
          // 搜索联系方式
          const mobileMatch = user.mobile?.includes(keyword)

          return nameMatch || orgMatch || positionMatch || roleMatch || mobileMatch
        })
      }

      page.total = dataSource.value.length
    }

    /**
     * @description: 计算当前页显示的数据
     */
    const currentPageData = computed(() => {
      const start = (page.pageNumber - 1) * page.pageSize
      const end = start + page.pageSize
      return dataSource.value?.slice(start, end) || []
    })

    const columns = [
      {
        title: '序号',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        width: 70,
        customRender: ({ index }: { index: number; }): JSX.Element=> {
          const actualIndex = (page.pageNumber - 1) * page.pageSize + index + 1
          return <PopOver content={actualIndex || '--'}>{actualIndex || '--'}</PopOver>
        }
      },
      {
        title: '员工姓名',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '部门',
        dataIndex: 'organization',
        key: 'organization',
        customRender: ({ record }: { record: UserVO; }): JSX.Element=> {
          const label = record?.organization
          return <PopOver content={label?.name || '--'}>{label?.name || '--'}</PopOver>
        }
      },
      {
        title: '岗位',
        dataIndex: 'positions',
        key: 'positions',
        customRender: ({ record }: { record: UserVO; }): JSX.Element=> {
          const label = record?.positions?.map(item => item.name).join('、')
          return <PopOver content={label || '--'}>{label || '--'}</PopOver>
        }
      },
      {
        title: '角色',
        dataIndex: 'roles',
        key: 'roles',
        customRender: ({ record }: { record: UserVO; }): JSX.Element=> {
          const label = record?.roles?.map(item => item.name).join('、')
          return <PopOver content={label || '--'}>{label.length > 10 ? label.substring(0, 10) + '...' : label || '--'}</PopOver>
        }
      },
      {
        title: '联系方式',
        dataIndex: 'mobile',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]

    // const [CubeTable, tableApi] = useCubeTable({
    //   columns,
    //   tableCode: 'tab-user-table',
    //   rowKey: 'id',
    //   fetchApi: () => {
    //     return currentPageData.value
    //   },
    //   fetchLoaded: (data) => {
    //     page.total = data.total
    //   },
    // })
    /**
     * @description: 处理分页变化
     */
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
    }

    /**
     * @description: 获取项目组数据
     */
    const getGroup = async (): Promise<void> =>{
      loading.value = true
      try {
        const data = await cubeZhongdaHeshunService.getProjectGroupAllPageList(props.projectId)
        groupList.value = data
        let allUser: UserVO[] = []
        data.forEach(item => {
          if (item.users)
            allUser = allUser.concat(item.users)
        })

        // 根据 id 去重
        const map = new Map()
        allUser.forEach(user => map.set(user.id, user))
        allUser = Array.from(map.values())

        const allGroup = {
          id: null,
          userIds: '',
          projectId: props.projectId,
          projectName: '',
          groupName: '全部',
          count: allUser.length.toString(),
          users: allUser
        }
        groupList.value.unshift(allGroup)
        handleClick(null)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      getGroup()
    })

    /**
     * @description: 处理分组点击事件
     */
    const handleClick = (id: string | number | null): void => {
      active.value = id;
      const selectedGroup = groupList.value?.find(item => item.id === id)
      allUsers.value = selectedGroup?.users ?? []

      // 应用当前搜索条件
      filterUsers()
      page.pageNumber = 1 // 重置到第一页
    };

    return (): JSX.Element => (
      <div class="layout-content-main">
        <div class={styles['layout-content-left']}>
          <div class={styles['place-list']}>
            {groupList.value?.map((place, key) => (
              <div key={key} class={styles['place-item']} style={{ background: active.value === place.id ? '#c8c7c7' : '' }} onClick={() => handleClick(place.id)} >
                <span class={styles['place-name']}> <div class={styles['place-title']}>{place.groupName}</div>  ({place.count})</span>
              </div>
            ))}
          </div>
        </div>
        <div class={styles['layout-content-right']}>
          {/* 替换CubeForm为Form组件 */}
          <div id='cube-query-form-container'>
            <Form layout='inline' style={{ margin: '16px 0' }} >
              <FormItem label="名称查询">
                <Input
                  v-model:value={formState.keyword}
                  placeholder="输入名称查询"
                  showCount={false}
                  style={{ width: '240px' }}
                />
              </FormItem>
              <FormItem>
                <Button type="primary" onClick={handleSearch}>搜索</Button>
                <Button style={{ marginLeft: '8px' }} onClick={handleReset}>重置</Button>
              </FormItem>
            </Form>
          </div>
          <Table columns={columns} dataSource={currentPageData.value} loading={loading.value} scrollY={scrollY.value - 180} pagination={false}></Table>
          <div class={styles['layout-content-right-footer']}>
            <Page
              current={page.pageNumber}
              pageSize={page.pageSize}
              total={page.total}
              onPageChange={handleChange}
            />
          </div>
        </div>
      </div>
    )
  }
})