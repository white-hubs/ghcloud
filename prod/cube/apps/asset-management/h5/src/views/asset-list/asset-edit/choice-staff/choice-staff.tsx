import { Button, Cell, CellGroup, Empty, Field, Icon, List, Picker, Popup, PullRefresh, Radio, RadioGroup, Search } from 'vant'
import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './choice-staff.module.less'
import { cubeOuaaService } from '@/api/server'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'

export const ChoiceStaff = defineComponent({
  emits: ['submit'],
  setup (props, { emit }) {
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: '',
      positionId: '',
      roleId: '',
      organizationName: '',
      organizationId: ''
    })
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const showFilterPopUp = ref(false)
    const showDepartmentPicker = ref(false)
    const concatList = ref<PersonItem[]>([])
    const depColumns = ref()
    const positionList = ref()
    const roleList = ref()
    const user = reactive({
      id: '',
      label: ''
    })
    onMounted(() => {
      onLoad()
      getDeptData()
      getPositionData()
      getRoleData()
    })
    // 获取部门
    const getDeptData = async (): Promise<void> => {
      const list = await cubeOuaaService.getDeptList({ enabled: true })
      depColumns.value = list.map(x => {
        return { text: x.name, value: x.id }
      })
    }
    // 获取职位
    const getPositionData = async (): Promise<void> => {
      const list = await cubeOuaaService.getPositionList({ enabled: true })
      positionList.value = list.map(x => {
        return { text: x.name, value: x.id }
      })
    }
    // 职位
    const positionDom = (): VNode =>
      <RadioGroup
        v-model={search.positionId}
        direction='horizontal'
        icon-size='14px'
        style='justify-content: space-around;'
        onChange={(value: string) => {
          search.positionId = value
        }}
      >
        {
          positionList.value.map((item: { text: string ; value: string; }) =>
            <Radio
              key={item.text}
              class={styles.checkbox}
              name={item.value}
              style={{
                color: `${search.positionId === item.value ? '#1D66FF' : '#1F3140'}`,
                backgroundColor: `${search.positionId === item.value ? '#E6EFFF' : '#F8F9F9'}`
              }}
              v-slots={{
                icon: () => <div class={styles.icon}>{item.text}</div>
              }}
            />)
        }
      </RadioGroup>
    // 获取角色
    const getRoleData = async (): Promise<void> => {
      const list = await cubeOuaaService.getRole({ enabled: true })
      roleList.value = list.map((x) => {
        return { text: x.name, value: x.id }
      })
    }
    const roleDom = (): VNode =>
      <RadioGroup
        v-model={search.roleId}
        direction='horizontal'
        icon-size='14px'
        style='justify-content: space-around;'
        onChange={(value: string) => {
          search.roleId = value
        }}
      >
        {
          roleList.value?.map((item: { text: string ; value: string; }) =>
            <Radio
              key={item.text}
              class={styles.checkbox}
              name={item.value}
              style={{
                color: `${search.roleId === item.value ? '#1D66FF' : '#1F3140'}`,
                backgroundColor: `${search.roleId === item.value ? '#E6EFFF' : '#F8F9F9'}`
              }}
              v-slots={{
                icon: () => <div class={styles.icon}>{item.text}</div>
              }}
            />)
        }
      </RadioGroup>
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeOuaaService.getStaffPage(search)
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!concatList.value) {
          concatList.value = []
        }
        if (search.pageNumber === 1) {
          concatList.value = []
        }
        concatList.value = [...concatList.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const cellDom = (item: PersonItem): object => {
      return {
        title: () =>
          <div class={styles.card}>
            {item.fileVO?.path
              ? <div style={{ borderRadius: '50%' }}><img src={item.fileVO?.path} alt='' width={44} height={44} /></div>
              : <div class={styles.icon}><Icon name='contact-o' size='40' /></div>}
            <div class={styles.title}>
              <div>
                <span>{item.name}</span>
              </div>
              <div class={styles.detail}>
                <span>部门：</span>
                <span>{item.organizations.map(x => x.name).join('-')}</span>
              </div>
              <div class={styles.detail}>
                <span>电话：</span>
                <span>{item.mobile}</span>
              </div>
            </div>
          </div>,
        'right-icon': () => <Radio name={item.id} />
      }
    }
    const searchDom = {
      action: (): JSX.Element => <div onClick={() => {
        showFilterPopUp.value = true
      }}>筛选</div>
    }
    // 查询
    const onSearch = (): void => {
      search.pageNumber = 0
      search.organizationId = ''
      onLoad()
    }
    // 提交筛选
    const submitFilter = (): void => {
      search.pageNumber = 0
      onLoad()
      showFilterPopUp.value = false
    }
    return (): JSX.Element =>
      <div style={{ height: '100vh' }}>
        <Search v-model={search.keyword} placeholder='根据人员姓名进行搜索' show-action v-slots={searchDom} onSearch={onSearch} onClear={onSearch} />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: '87vh', marginBottom: '10px', overflow: 'auto' }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={concatList.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <RadioGroup v-model={user.id}>
              <CellGroup inset>
                {
                  concatList.value.map(item =>
                    <Cell clickable key={item.id} onClick={() => {
                      user.id = item.id; user.label = item.name
                    }} v-slots={cellDom(item)} />)
                }
              </CellGroup>
            </RadioGroup>
            {(concatList.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
        <div style='display:flex;box-shadow: #8080801f 4px -4px 5px;padding:10px 0'>
          <Button size='small' block onClick={() => {
            user.id = ''; user.label = ''; emit('submit', '')
          }} style='margin:0 10px'>取消</Button>
          <Button size='small' type='primary' block onClick={() => {
            emit('submit', user)
          }} style='margin:0 10px'>提交</Button>
        </div>
        {/* 筛选 */}
        <Popup
          v-model:show={showFilterPopUp.value}
          position='right'
          style={{ width: '100vw', height: '100vh' }}
        >
          <div class={styles['filter-content']}>
            <div style={{ margin: '10px' }}>人员部门</div>
            <Field
              v-model={search.organizationName}
              is-link
              readonly
              name='organizationName'
              placeholder='选择部门'
              onClick={() => {
                showDepartmentPicker.value = true
              }}
            />
            <Popup
              v-model:show={showDepartmentPicker.value}
              position='bottom'
            >
              <Picker
                columns={depColumns.value}
                onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
                  search.organizationId = selectedOptions[0]?.value ?? ''
                  search.organizationName = selectedOptions[0]?.text ?? ''
                  showDepartmentPicker.value = false
                }}
                onCancel={() => {
                  showDepartmentPicker.value = false
                }}
              />
            </Popup>
            <div style={{ margin: '10px' }}>职位</div>
            <Field style={{ padding: '0px' }} name='type' v-slots={{ input: positionDom() }} />
            <div style={{ margin: '10px' }}>角色</div>
            <Field style={{ padding: '0px' }} name='type' v-slots={{ input: roleDom() }} />
          </div>
          <div class={styles['filter-button']}>
            <div
              style={{ margin: '0 14px', width: '50px', fontSize: '14px' }}
              onClick={() => {
                search.positionId = ''
                search.roleId = ''
                search.organizationName = ''
                search.organizationId = ''
              }}
            >
              重置
            </div>
            <Button block size='small' type='primary' onClick={() => {
              submitFilter()
            }}>
              确定
            </Button>
          </div>
        </Popup>
      </div>
  }
})
