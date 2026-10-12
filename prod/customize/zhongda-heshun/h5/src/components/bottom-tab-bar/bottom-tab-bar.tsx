import { defineComponent, onMounted, reactive, ref, watch, type PropType } from 'vue'
import { Tabbar, TabbarItem } from 'vant'
import styles from './bottom-tab-bar.module.less'
import { getAssetsFile } from '../../utils/index'
import { useRouter } from 'vue-router'
import { cubeWxServiceInstance } from '@ghcloud/cube-app-js-sdk/src/wx/cube-wx-service'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'


export interface Tab {
  name: string;
  url: string;
  code: string;
  icon: string;
  iconActive: string;
}
export const BottomTabBar = defineComponent({
  props: {
    tabList: {
      type: Array as PropType<Tab[]>,
      default: () => []
    },
    active: {
      type: String,
      default: 'device'
    }
  },
  emits: ['change'],
  setup: (props, { emit }) => {
    const router = useRouter()
    const state = reactive<{
      tabList: Tab[];
      active: string;
    }>({
      tabList: [
        {
          name: '设备',
          code: 'device',
          url: '/device',
          icon: 'iot.png',
          iconActive: 'iot-active.png',
        },
        {
          name: '自动化',
          code: 'command',
          url: '/command',
          icon: 'command.png',
          iconActive: 'command-active.png',
        },
        {
          name: '我的',
          code: 'mine',
          url: '/mine',
          icon: 'person.png',
          iconActive: 'person-active.png',
        },
      ],
      active: props.active ?? 'device',
    })

    watch(() => props.tabList, () => {
      if (props.tabList) {
        state.tabList = props.tabList
      }
    }, {
      deep: true
    })

    const handleChange = (index: string): void => {
      const activeItem = state.tabList.find(item => item.code === index)
      if (activeItem?.code === 'mine') {
        cubeWxServiceInstance.backHome('/pages/mine/mine')
      }
      router.push(activeItem?.url??'/')
      emit('change', activeItem)
    }
    const isWxEnv = ref(false)

  onMounted(async (): Promise<void> => {
    isWxEnv.value = await cubeWxService.getWxEnv()
  })

    return (): JSX.Element => (
      <>
        { !isWxEnv.value &&
          state.tabList.length > 0 &&
          <Tabbar
            v-model={state.active}
            onChange={handleChange}
            active-color='#1578FF'
            inactive-color='#888888'
            fixed
            border
            zIndex={10}
            style={{ paddingBottom: '20px' }}
          >
            {
              state.tabList.map((item) => {
                return (
                  <TabbarItem
                    key={item.name}
                    name={item.code}
                    v-slots={{
                      icon: (props: { active: boolean; }) => {
                        return (
                          <img src={props.active ? getAssetsFile(item.iconActive) : getAssetsFile(item.icon)} />
                        )
                      }
                    }}
                  >
                    <span>{item.name}</span>
                  </TabbarItem>
                )
              })
            }
          </Tabbar>
        }
      </>
    )
  }
})
