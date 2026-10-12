import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { Button, Skeleton } from 'ant-design-vue'
import { ScrollTabs } from '../../components/scroll-tabs/scroll-tabs'
import { useOuaaUserList } from '../../components/person/use-ouaa-user-list'
import styles from './xsk-project-person.module.less'
import { Person } from '../../components/person/person'
import NoData from "@/components/businessPanel/public/noData.vue";
import { cubeZDDataVizService } from '@/api/service'
import type { DisinfectionUserInfoVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { createPersonModal } from '../../utils/modal-helper'
import { projectStore } from '../../store/project'
import { clearMap } from '@/pages/event/register/gis'
import { createUserMarker, drawProjectRange } from '../../utils/gis-helper'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'

/** 项目人员 */
export const XSKProjectPerson = defineComponent({
  setup () {
    const { userList } = useOuaaUserList()
    const activeKey = ref('all')
    const tabList = computed(()=>{
      const onlineNum = personList.value.filter(e=>e.online).length
      const offlineNum = total.value - onlineNum
      return [
        { text: `人员总数(${total.value})`, key: 'all' },
        { text: `在线数(${onlineNum})`, key: 'online' },
        { text: `离线数(${offlineNum})`, key: 'offline' },
      ]
    })
    const personList = computed(() => {
      const ids = persons.value.map(e => e.userId)
      const users = userList.value.filter(e => ids.includes(e.id))
      const result = persons.value.map(item => {
        item.online = users.find(e => e.id === item.userId)?.online
        return item
      })
      if (activeKey.value === 'online') return result?.filter(e => e.online)
      if (activeKey.value === 'offline') return result?.filter(e => !e.online)
      return result
    })
    // 人员情况分布
    const loading = ref(false)
    const total = ref(0)
    const persons = ref<DisinfectionUserInfoVO[]>([])
    const getData = async (projectId?: string): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getPersonnelDistribution({ projectId })
        if (res) {
          total.value = res.total ?? 0
          persons.value = (res.disinfectionUserList ?? [])?.map(e => {
            return {
              ...e,
              id: e.userId,
              fileVO: e.photo?.[0]
            }
          })
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
    onMounted(() => {
      getData()
    })

    const handleMoreClick = async (): Promise<void> => {
      createPersonModal('项目人员情况')
    }
    const handlePersonClick = async (userInfo: DisinfectionUserInfoVO): Promise<void> => {
      // clearMap()
      createUserMarker(userInfo as unknown as UserInfo, undefined, true,false)
      // drawProjectRange({ hideZoom: true })
    }

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{ extra: () => <Button type='link' size='small' style={{ color: '#b0c5ff', fontSize: '18px' }} onClick={handleMoreClick}>更多&gt;&gt;</Button> }}>
        <Skeleton loading={loading.value} active paragraph={{ rows: 1 }}>
          <ScrollTabs
            list={tabList.value}
            showPageBtn={false}
            onTabClick={(tab)=>{
              activeKey.value = tab.key
            }}
          ></ScrollTabs>
        </Skeleton>
        <Skeleton loading={loading.value} active avatar paragraph={{ rows: 1 }}>
        </Skeleton>
        <Skeleton loading={loading.value} active avatar paragraph={{ rows: 1 }}>
        </Skeleton>
        <Skeleton loading={loading.value} active avatar paragraph={{ rows: 1 }}>
        </Skeleton>
        <div class={styles['user-list']} v-show={!loading.value}>
          {personList.value.length === 0 && <NoData />}
          {
            personList.value.map(user=>{
              return <div key={user.userId} class={styles['item']}>
                <Person
                  userInfo={user}
                  v-slots={{
                    'post': (): string => {
                      return user.position || '--'
                    }
                  }}
                  canBeClick
                  onClick={handlePersonClick}
                />
              </div>
            })
          }
        </div>
      </SubPanelTemplate>
    )
  },
})