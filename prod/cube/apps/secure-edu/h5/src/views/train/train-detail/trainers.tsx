import { Card } from '@/components/card/card'
import { DropdownItem, DropdownMenu, Empty, List } from 'vant'
import { defineComponent, ref, type PropType, reactive, onMounted } from 'vue'
import { UserSignStatus, type CultivateUsersType } from '../type'
import styles from './trainers.module.less'
import { cubeOuaaService } from '@/api/server'

/** 培训签到页面 */
export const Trainers = defineComponent({
  props: {
    users: {
      type: Object as PropType<CultivateUsersType[] | undefined>,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    }
  },
  setup: (props) => {
    const finished = ref(false)
    const userList = ref<CultivateUsersType[] | undefined>(props.users)
    const search = reactive({
      deptId: '',
      signStatus: '',
    })
    const deptOptions = ref<{ value: string; text: string; }[]>([])
    const statusOptions = ref([
      { text: '所有状态', value: '' },
      { text: '已签', value: 'SIGNED' },
      { text: '未签', value: 'UNSIGNED' },
      { text: '迟到', value: 'LATE' }
    ])
    const menuState = ref('')
    const handleOpen = (): void => {
      menuState.value = 'open'
    }
    const handleClose = (): void => {
      menuState.value = 'close'
    }
    const getUserList = (): void => {
      userList.value = props.users ? [...props.users] : []
      if (search.deptId) {
        userList.value = userList.value.filter(c => c.userDepartmentId === search.deptId)
      }
      if (search.signStatus) {
        userList.value = userList.value?.filter(e => {
          if (search.signStatus === 'LATE') {
            return e.userSignStatus === 'SIGNED' && e.belated || e.userSignStatus === 'LATE'
          } else if (search.signStatus === 'SIGNED') {
            return e.userSignStatus === 'SIGNED' && !e.belated
          } else {
            return e.userSignStatus === search.signStatus
          }
        })
      }
    }
    const getDeptData = async (): Promise<void> => {
      const result = await cubeOuaaService.getDeptList({ enabled: true })
      deptOptions.value = result.map(item => {
        return {
          value: item.id,
          text: item.name
        }
      })
      deptOptions.value.unshift({ value: '', text: '所有部门' })
    }
    onMounted(() => {
      getDeptData()
    })
    return (): JSX.Element=>
      <>
        <div style={{
          fontWeight: 400,
          fontSize: '14px',
          color: '#999999',
          padding: '8px'
        }}
        >参与培训人员({userList.value?.length ?? 0}/{props.total ?? 0})
        </div>
        <div class={[styles.searchBar, styles[menuState.value]]}>
          <DropdownMenu>
            <DropdownItem teleport='#app' onOpen={handleOpen} onClose={handleClose} onChange={()=> getUserList()} v-model={search.deptId} options={deptOptions.value} />
            <DropdownItem teleport='#app' onOpen={handleOpen} onClose={handleClose} onChange={()=> getUserList()} v-model={search.signStatus} options={statusOptions.value} />
          </DropdownMenu>
        </div>
        <div style={{ overflowY: 'scroll', marginBottom: '80px' }}>
          <List
            finished={finished.value}
            finished-text={userList.value?.length === 0 ? '' : '暂无更多数据'}
          >
            {
              (userList.value && userList.value.length > 0) &&
                userList.value.map((item: CultivateUsersType, index: number) =>
                  <Card
                    url='contact-o'
                    key={index}
                    title={{ label: item.userName, text: item?.userSignStatus === 'SIGNED' && item?.belated ? UserSignStatus.get('LATE') ?? '' : UserSignStatus.get(item?.userSignStatus) ?? '', textColor: (item?.userSignStatus === 'SIGNED' && !item?.belated) ? '#3bc995' : '#dc362e' }}
                    content={[
                      { label: '部门：', text: item.userDepartmentName },
                      { label: '职位：', text: item.userPostName },
                      { label: '电话：', text: item.userPhone }]}
                  />)
            }
            {(userList.value?.length === 0) && <Empty description='暂无数据' />}
          </List>
        </div>
      </>
  }
})
