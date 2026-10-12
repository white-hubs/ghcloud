import { defineComponent, h, ref, onMounted } from 'vue'
import styles from './slider-bar.module.less'
import { SliderKey, useClientUIState } from '../../hook/use-client'
import { AIIcon } from '../svg-icon/ai-icon'
import { MessageIcon } from '../svg-icon/message-icon/message-icon'
import { ToDoIcon } from '../svg-icon/todo-icon'
import { AddressBookIcon } from '../svg-icon/address-book-icon'
import { WorkbenchIcon } from '../svg-icon/workbench-icon'
import { UserAvatar } from './components/user-avatar/user-avatar'
import { CubeMessageEvent } from '@ghcloud/cube-protocol'
import { getAgentList } from '@ghcloud/cube-ai-assistant-app/src/api/server'


export const SliderBar = defineComponent({
  emits: ['change'],
  setup (props, { emit }) {
    const clientUIState = useClientUIState()

    // 基础菜单项
    const sliderData = ref([
      {
        key: SliderKey.MESSAGE,
        icon: <MessageIcon />,
        label: '消息',
      },
      // {
      //   key: SliderKey.AI,
      //   icon: <AIIcon />,
      //   label: 'AI助手',
      // },
      {
        key: SliderKey.TODO,
        icon: <ToDoIcon />,
        label: '待办',

      },
      {
        key: SliderKey.ADDRESS_BOOK,
        icon: <AddressBookIcon />,
        label: '通讯录',
      }
    ])

    // 获取AI助手权限
    const getAIPermission = async (): Promise<void> => {
      const res = await getAgentList()
      if (res.length > 0) {
        sliderData.value.splice(1, 0, {
          key: SliderKey.AI,
          icon: <AIIcon />,
          label: 'AI助手',
        })
      }
    }

    onMounted(() => {
      getAIPermission()

      // desktop 客户端中使用
      window?.cubeElectronIpcRenderer?.on(CubeMessageEvent.DESKTOP_CHANGE_SIDEBAR, (event: unknown, data: SliderKey) => {
        clientUIState.activeSliderKey = data
      })
    })

    // 添加工作台（如果在桌面客户端中）
    if (clientUIState.inDeskTopClient) {
      sliderData.value.push({
        key: SliderKey.WORKBENCH,
        icon: <WorkbenchIcon />,
        label: '工作台',
      })
    }
    emit('change', clientUIState.activeSliderKey)

    return (): JSX.Element => (
      <div class={styles['slider-bar']}>
        {
          sliderData.value.map((item)=>{
            return (
              <div class={`${styles['item']} ${clientUIState.activeSliderKey === item.key ? styles['active'] : ''}`} key={item.key} onClick={()=>{
                clickItem(item.key)
              }}>
                {
                  h(item.icon, {
                    active: clientUIState.activeSliderKey === item.key,
                    showDot: item.key === SliderKey.MESSAGE && clientUIState.messageNum > 0
                  })
                }
                <span class={styles['label']}>{item.label}</span>
              </div>
            )
          })
        }
        {
          (clientUIState.inDeskTopClient && clientUIState.userInfo) &&
          <div class={styles['user-avatar']}>
            <UserAvatar userInfo={clientUIState.userInfo} />
          </div>
        }
      </div>
    )

    function clickItem (key: SliderKey): void{
      clientUIState.activeSliderKey = key
      emit('change', key)
    }
  },
})