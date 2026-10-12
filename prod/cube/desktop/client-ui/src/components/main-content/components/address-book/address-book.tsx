

import { computed, defineComponent, inject, onMounted, ref, onActivated } from 'vue'
import styles from './address-book.module.less'
import { Button, Input, SearchOutlined, Skeleton, Space } from '@ghcloud/cube-ui'
// @ts-ignore
import { RecycleScroller } from 'vue3-virtual-scroller'
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css'
import { CubeOuaaService, type UserInfo, GENDER } from '@ghcloud/cube-ouaa-service'
import type { CubeAuth } from '@ghcloud/cube-protocol'
import { pinyin } from 'pinyin-pro';
import { UserAvatar } from './components/user-avatar/user-avatar'
import { VoiceIcon } from '../../../svg-icon/voice-icon'
import { VideoIcon } from '../../../svg-icon/video-icon'
import { useClientUIState } from '../../../../hook/use-client'
import { CallMediaType } from '@ghcloud/cube-rtc/src/data/call-define'
import { apiProxy as CommunicateService } from '@ghcloud/cube-rtc/src/api/server';

type CustomUserInfo = UserInfo & { index: string; searchMatchString: string; }

export const AddressBook = defineComponent({
  setup () {
    const authInfo = inject('CUBE_AUTH_INFO') as CubeAuth
    const clientUIState = useClientUIState()
    const userList = ref<(CustomUserInfo)[]>([])
    const onlineUser = ref<{ id: string; name: string; }[]>([])
    const currentUser = ref<UserInfo>()
    const userSelected = ref<CustomUserInfo>()
    const indexBarList = ref<string[]>([])
    const listLoading = ref<boolean>(false)
    const scrollerRef = ref()
    const audioCallRef = ref()
    const videoCallRef = ref()
    const searchValue = ref<string>('')

    const filteredUserList = computed(()=>{
      let list = userList.value.filter(item=>item.id !== currentUser.value?.id)
      const onlineList: CustomUserInfo[] = []
      onlineUser.value.forEach(item=>{
        // 把在线用户排在前面
        const findIndex = list.findIndex(e=>e.id === item.id)
        if (findIndex !== -1){
          onlineList.push(list[findIndex]);
          list.splice(findIndex, 1); // 删除原位置的元素
        }
      })
      list.unshift(...onlineList)
      if (!searchValue.value){
        return list
      }
      return list.filter(item=>{
        return item.searchMatchString.includes(searchValue.value)
      })
    })

    onActivated(()=>{
      CommunicateService.cubeCommunicateService.queryOnlineList().then(res=>{
        onlineUser.value = res
      })
    })

    onMounted(()=>{
      listLoading.value = true
      const cubeOuaaService = new CubeOuaaService(authInfo)
      cubeOuaaService.getUserList({ enabled: true }).then(res=>{
        userList.value = res.map(item=>{
          const firstCode = pinyin(item.name.charAt(0), { pattern: 'first' }).toUpperCase()
          return {
            ...item,
            index: firstCode.match(/[A-Z]/) ? firstCode : '#',
            searchMatchString: `${item.name} ${pinyin(item.name, { toneType: 'none' }).replace(/\s+/g, '')}`
          }
        }).sort((a, b)=>{
          return a.index.localeCompare(b.index)
        });
        cubeOuaaService.getUserInfo().then(res=>{
          currentUser.value = res
        })
        if (!userSelected.value){
          userSelected.value = userList.value[0]
        }
        indexBarList.value = [...new Set(userList.value.map(item=>item.index))]
        listLoading.value = false
      })
    })


    const handleCall = (type: CallMediaType): void => {
      clientUIState.clickCommunicationButton({
        type: type,
        userInfo: userSelected.value as UserInfo
      })
      audioCallRef.value?.blur()
      videoCallRef.value?.blur()
    }

    return (): JSX.Element => (
      <>
        <div class={styles['left']}>
          <Input
            v-model:value={searchValue.value}
            class={styles['name-search']}
            showCount={false}
            placeholder="搜索"
            v-slots={{
              'suffix': () => <SearchOutlined />,
            }}
          />
          <Skeleton active loading={listLoading.value}>
            <RecycleScroller
              ref={scrollerRef}
              class={styles['user-list']}
              items={filteredUserList.value}
              item-size={60}
              key-field="id"
              v-slot="{ item }"
            >
              {
                {
                  default: ({ item }: { item: CustomUserInfo; }) => (
                    <div class={`${styles['user-item']} ${(userSelected.value?.id === item.id) ? styles['active'] : ''}`} key={item.id} onClick={()=>{
                      userSelected.value = item
                    }}>
                      <div class={styles['user-avatar']}>
                        <UserAvatar user={item} />
                      </div>
                      <div class={styles['user-info']}>
                        <div class={`${styles['user-name']}`}>
                          {item.name}
                          {onlineUser.value.find(e=>e.id === item.id) ? <span class={styles['online-dot']}></span> : ''}
                        </div>
                        <div class={styles['user-department']}>{item.organization?.name || '未知部门'}</div>
                      </div>
                    </div>
                  )
                }
              }
            </RecycleScroller>
          </Skeleton>
          <div class={styles['index-bar']}>
            {
              indexBarList.value.map(item=>{
                return <span class={styles['index-item']} key={item} onClick={()=>{
                  scrollTo(item)
                }}>{item}</span>
              })
            }
          </div>
        </div>
        <div class={styles['right']}>
          {
            userSelected.value && (
              <>
                <div class={styles['user-info-top']}>
                  <div class={styles['user-avatar']}>
                    <UserAvatar user={userSelected.value} />
                  </div>
                  <div class={styles['user-info']}>
                    <div class={styles['user-name']}>{userSelected.value?.name}</div>
                    <div class={styles['user-department']}>{userSelected.value?.organization?.name || '未知'}</div>
                  </div>
                </div>
                <div class={styles['user-info-bottom']}>
                  <div class={styles['user-info']}>
                    <div class={styles['user-info-item']}>
                      <div class={styles['user-info-item-title']}>性别</div>
                      <div class={styles['user-info-item-content']}>{GENDER[userSelected.value.gender]}</div>
                    </div>
                    <div class={styles['user-info-item']}>
                      <div class={styles['user-info-item-title']}>联系电话</div>
                      <div class={styles['user-info-item-content']}>{userSelected.value.mobile}</div>
                    </div>
                    <div class={styles['user-info-item']}>
                      <div class={styles['user-info-item-title']}>部门</div>
                      <div class={styles['user-info-item-content']}>{userSelected.value.organization?.name || '未知'}</div>
                    </div>
                    <div class={styles['user-info-item']}>
                      <div class={styles['user-info-item-title']}>职位</div>
                      <div class={styles['user-info-item-content']}>{userSelected.value.positions && userSelected.value.positions.length ? userSelected.value.positions[0].name : '未知'}</div>
                    </div>
                  </div>


                  <div class={styles['communication']}>
                    <Space>
                      <Button
                        ref={audioCallRef}
                        class={styles['item']}
                        onClick={()=>{
                          handleCall(CallMediaType.audio)
                        }}
                        v-slots={{
                          'icon': () => <VoiceIcon />,
                        }}
                      >语音</Button>
                      <Button
                        ref={videoCallRef}
                        class={styles['item']}
                        onClick={()=>{
                          handleCall(CallMediaType.video)
                        }}
                        v-slots={{
                          'icon': () => <VideoIcon />,
                        }}
                      >视频</Button>
                    </Space>
                  </div>
                </div>
              </>
            )
          }
        </div>
      </>
    )

    function scrollTo (indexString: string): void{
      const index = userList.value.findIndex(item=>item.index === indexString)
      // eg：https://github.com/Akryum/vue-virtual-scroller/issues/307
      if (index !== -1){
        scrollerRef.value?.scrollToItem(index)
      }
    }
  },
})