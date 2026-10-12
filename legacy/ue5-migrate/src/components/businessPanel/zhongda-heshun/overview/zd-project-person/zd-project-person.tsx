import { computed, defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './zd-project-person.module.less'
const IconUser = '/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg/user.svg'
import { Person } from '../../components/person/person'
import { Skeleton, Image } from 'ant-design-vue'
import { cubeZDDataVizService } from '@/api/service'
import type { DisinfectionUserInfoVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import NoData from "@/components/businessPanel/public/noData.vue";
import { useOuaaUserList } from '../../components/person/use-ouaa-user-list'
import { createPersonModal } from '../../utils/modal-helper'
import { clearMap } from '@/pages/event/register/gis'
import { createUserMarker } from '../../utils/gis-helper'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { EyeOutlined } from '@ant-design/icons-vue'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

/** 项目人员 */
export const ZDProjectPerson = defineComponent({
  setup () {
    const { userList } = useOuaaUserList()
    const handleTotalClick = async (): Promise<void> => {
      createPersonModal('人员情况')
    }
    const personList = computed(() => {
      const ids = persons.value.map(e => e.userId)
      const users = userList.value.filter(e => ids.includes(e.id))
      const result = persons.value.map(item => {
        item.online = users.find(e => e.id === item.userId)?.online
        return item
      })
      return result
    })
    // 人员情况分布
    const loading = ref(false)
    const total = ref(0)
    const persons = ref<DisinfectionUserInfoVO[]>([])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getPersonnelDistribution()
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
    onMounted(() => {
      getData()
    })
    const handlePersonClick = async (userInfo: DisinfectionUserInfoVO): Promise<void> => {
      // clearMap()
      // createUserMarker(userInfo as unknown as UserInfo, undefined, true,true)
      createUserMarker(userInfo as unknown as UserInfo, undefined, true,false)
    }
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton loading={loading.value} active paragraph={{ rows: 1 }}>
          { total.value > 0 &&
            <div class={styles['user-static']} onClick={handleTotalClick}>
              <div class={styles['label']}>
                <Image src={IconUser} previewMask={() => <><EyeOutlined />预览</>} />
                项目人员
              </div>
              <div class={styles['value']}>
                {/* {total.value} */}
                <CountTo startVal={0} endVal={total.value} duration={2000} separator="" ></CountTo>
                <span class={styles['unit']}>人</span>
              </div>
            </div>
          }
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