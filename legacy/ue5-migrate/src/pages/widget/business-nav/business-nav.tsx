import { defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import styles from './business-nav.module.less'
import type { SceneDataType } from '@/api/models/mdata'
import Swiper from 'swiper'
import { sceneTypePage } from '@/api/mdata'
import { eventInstance } from '@/pages/event/event'
import { BusinessNavItem } from './components/business-nav-item'
import { SubBusinessNavItem } from './components/sub-business-nav-item'
import { useStateStore } from '@/pages/state/use-state-store'

export const BusinessNav = defineComponent({
  setup: () => {
    const { globalState } = useStateStore()
    const swiperObj = ref<Swiper>()
    const swiperBtn = '/resource/v1/ue5-migrate/assets/images/business-icon/right-swiper.png'
    const businessNavData = ref<SceneDataType[]>([])
    const active = ref<SceneDataType>() // 当前选中的菜单
    const activeParentNav = ref<SceneDataType>() // 当前选中的一级菜单
    const parentNav = ref<SceneDataType>()
    const showSubNav = ref<boolean>(false)
    const mouseInSubNav = ref(false)

    watch(() => globalState.panel.rightPanelName, () => {
      if (globalState.panel.rightPanelName === 'AlarmListPanel') {
        active.value = undefined
      }
    })

    function getQuery (): string {
      const query = new URLSearchParams(window.location.search)
      const menuName = query.get('menuName')
      return decodeURIComponent(menuName)
    }

    // 切换业务菜单
    async function switchNav (item: SceneDataType): Promise<void> {
      globalState.business.currentMenu = item.id
      eventInstance.emitEvent('switchBusinessPanel', true)
    }
    /** 获取菜单 */
    async function getMenuList (): Promise<void> {
      const res = await sceneTypePage()
      const menuName = getQuery()
      if (res.length) {
        businessNavData.value = res
        globalState.business.menu = res
        if (businessNavData.value.find(e => e.name === menuName)) {
          active.value = businessNavData.value.find(e => e.name === menuName)
          parentNav.value = businessNavData.value.find(e => e.name === menuName)
          activeParentNav.value = businessNavData.value.find(e => e.name === menuName)
        } else {
          active.value = businessNavData.value[0]
          parentNav.value = businessNavData.value[0]
          activeParentNav.value = businessNavData.value[0]
        }
        if (parentNav.value.children.length) {
          showSubNav.value = true
        }
        switchNav(active.value)
      }
      nextTick(() => {
        swiperObj.value = new Swiper('.business-nav', {
          loop: true,
          slidesPerView: businessNavData.value.length > 5 ? 5 : businessNavData.value.length,
          observer: true,
          observeSlideChildren: true,
          observeParents: true,
        })
      })
    }

    /** 点击菜单 */
    function clickNav (nav: SceneDataType, lv: number): void {
      if (nav.disabled) {
        return
      }
      switchNav(nav)
      active.value = nav
      if (lv === 1) {
        if (parentNav.value.id !== nav.id) {
          parentNav.value = nav
          showSubNav.value = !!parentNav.value.children.length
        } else {
          showSubNav.value = parentNav.value.children.length ? !showSubNav.value : false
        }
        eventInstance.emitEvent('setFirstPerspective')
      }
      activeParentNav.value = parentNav.value
    }

    onMounted(() => {
      getMenuList()
    })

    return (): JSX.Element=> {
      return (
        <div class={styles['business-nav']}>
          {
            !!businessNavData.value.length &&
              <>
                {
                  businessNavData.value.length >= 6 &&
                    <>
                      <img src={swiperBtn} class={styles['swiper-left-btn']} onClick={() => {
                        swiperObj.value.slidePrev()
                      }} />
                      <img src={swiperBtn} class={styles['swiper-right-btn']} onClick={() => {
                        swiperObj.value.slideNext()
                      }} />
                    </>
                }
                <div class={`${styles.outSwiperBox} swiper business-nav`}>
                  <div class={`swiper-wrapper ${businessNavData.value.length < 6 ? styles['less-line'] : ''}`}>
                    {
                      businessNavData.value.map((item) =>
                        <div
                          class='swiper-slide' key={item.id} style='display: flex;justify-content: center;'
                        >
                          <BusinessNavItem
                            activeId={parentNav.value?.id}
                            navItem={item}
                            onClickNav={clickNav}
                          />
                        </div>)
                    }
                  </div>
                </div>
                <SubBusinessNavItem
                  parentNav={parentNav.value}
                  activeId={active.value?.id}
                  onClickNav={clickNav}
                  v-model:mouseInSubNav={mouseInSubNav.value}
                  visible={showSubNav.value}
                  class={!showSubNav.value ? styles['hide-sub-nav'] : ''}
                />
              </>
          }
        </div>
      )
    }
  }
})
