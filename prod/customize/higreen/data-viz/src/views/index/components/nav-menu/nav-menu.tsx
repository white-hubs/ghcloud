import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue'
import styles from './nav-menu.module.less'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperType } from 'swiper'
import { EffectCoverflow, Pagination, Navigation, Virtual, A11y } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { authStore } from '@/api/auth-store'
import type { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { useRouter } from 'vue-router'
import { message } from '@ghcloud/cube-ui'

interface NavItem {
  title: string;
  icon?: string;
  cardIndex: number;
  onClick?: () => Promise<void>;
}

export const NavMenu = defineComponent({
  setup () {
    const router = useRouter()
    const swiperInstance = ref<SwiperType>()
    const navItems: NavItem[] = [
      {
        title: '业务数据可视化平台',
        cardIndex: 1,
        onClick: async (): Promise<void> => {
          router.push({ path: '/entry' })
        }
      },
      {
        title: '安全管理平台',
        cardIndex: 2,
        onClick: async (): Promise<void> => {
          const cubeSecret = await getShortSecret('three-dimensional-visualization');
          openUrl('/apps-legacy/ue5', { 'cube-secret': cubeSecret })

        }
      },
      {
        title: '指挥调度平台',
        cardIndex: 3,
        onClick: async (): Promise<void> => {
          const cubeSecret = await getShortSecret('command-dispatch-app');
          openUrl('/command-dispatch', { 'cube-secret': cubeSecret })

        }
      },
      {
        title: '业务数据可视化平台',
        cardIndex: 1,
        onClick: async (): Promise<void> => {
          router.push({ path: '/entry' })
        }
      },
      {
        title: '安全管理平台',
        cardIndex: 2,
        onClick: async (): Promise<void> => {
          const cubeSecret = await getShortSecret('three-dimensional-visualization');
          openUrl('/apps-legacy/ue5', { 'cube-secret': cubeSecret })

        }
      },
      {
        title: '指挥调度平台',
        cardIndex: 3,
        onClick: async (): Promise<void> => {
          const cubeSecret = await getShortSecret('command-dispatch-app');
          openUrl('/command-dispatch', { 'cube-secret': cubeSecret })

        }
      }
    ]
    const getShortSecret = async (code: string): Promise<string> => {
      const cubeAuthService = new CubeAuthService(code as CubeTerminalEnum, authStore.tenant, authStore.token)
      return cubeAuthService.getSecretByToken()
    };
    const openUrl = (url: string, params: Record<string, string> | null): void => {
      if (!params) {
        router.push({ path: url })
      } else {
        // const urlObj = new URL(url, window.location.origin);
        const urlObj = new URL(url, 'https://safe.higreen-gm.com:30000');

        const query = new URLSearchParams(params);
        urlObj.search = urlObj.search ? `${urlObj.search}&${query}` : `?${query}`;
        const webviewUrl = urlObj.toString()
        const type = url.split('/').filter(Boolean).pop() || ''
        router.push({ path: '/webview', query: { url: webviewUrl, type: type } })
      }
    }

    const activeIndex = ref(1)
    const handleNavClick = (item: NavItem, index: number): void => {
      activeIndex.value = index
      item.onClick?.()
    }

    // 修改coverflow效果参数
    let coverflowEffect = {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: false
    }

    const handlePrev = (): void => {
      swiperInstance.value?.slidePrev(800)
    }

    const handleNext = (): void => {
      swiperInstance.value?.slideNext(800)
    }

    // 添加键盘事件处理函数
    const handleKeyDown = (event: KeyboardEvent): void => {
      // 阻止默认行为，避免与页面滚动冲突
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
        event.preventDefault()
      }
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          handlePrev()
          break
        case 'ArrowRight':
        case 'ArrowDown':
          handleNext()
          break
        case 'Enter':
          const currentIndex = swiperInstance.value?.realIndex ?? activeIndex.value
          const currentItem = navItems[currentIndex]
          if (currentItem) {
            handleNavClick(currentItem, currentIndex)
          }
          break
      }
    }
    const init = async (): Promise<void> => {
      await nextTick()
      if (swiperInstance.value) {
        swiperInstance.value.update()
        swiperInstance.value.slideTo(1, 0)

        // 额外添加多次更新，确保所有卡片正确显示
        setTimeout(() => {
          swiperInstance.value?.update()
          setTimeout(() => {
            swiperInstance.value?.update()
          }, 200)
        }, 100)
      }
    }

    onMounted(async () => {
      init()
      message.destroy()
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('resize', init)

    })
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
      window.addEventListener('resize', init)
    })

    return (): JSX.Element => (
      <div class={styles['nav-menu-container']}>
        <div class={styles['arrow-btn']} onClick={handlePrev}>
          <img src="/apps/@ghcloud/higreen-data-viz/images/home/arrow.webp" class={styles['arrow-left']} alt="上一个" />
        </div>
        <Swiper
          class={styles['swiper-container']}
          loop={true}
          initial-slide={1}
          centered-slides={true}
          slides-per-view={3}
          space-between={20}
          effect={'coverflow'}
          coverflow-effect={coverflowEffect}
          speed={800} /* 增加过渡时间，使动画更平滑 */
          observer={true}
          observer-parents={true}
          watchSlidesProgress={true}
          updateOnWindowResize={true}
          preventInteractionOnTransition={false}
          grabCursor={true} /* 添加抓取光标效果 */
          autoplay={false} /* 确保不自动播放 */
          // 在这里直接传入模块
          modules={[EffectCoverflow, Pagination, Navigation, Virtual, A11y]}
          onSwiper={(swiper) => {
            swiperInstance.value = swiper
            swiper.update()
          }}
          onSlideChangeTransitionStart={() => {
            // 滑动开始时更新，确保动画流畅
            swiperInstance.value?.update()
          }}
          onSlideChangeTransitionEnd={() => {
            // 滑动结束后再次更新，确保所有卡片正确显示
            swiperInstance.value?.update()
          }}
          onClick={() => {
            const currentIndex = swiperInstance.value?.realIndex ?? activeIndex.value
            const currentItem = navItems[currentIndex]
            handleNavClick(currentItem, currentIndex)
          }}
        >
          {navItems.map((item, index) => (
            <SwiperSlide
              class={styles['swiper-slide']}
              key={item.cardIndex}
            >
              <div
                class={`${styles['nav-item']} ${activeIndex.value === index ? styles['nav-item-active'] : ''}`}
                onClick={() => handleNavClick(item, index)}
              >
                <img src={`/apps/@ghcloud/higreen-data-viz/images/home/card-${item.cardIndex}.png`} class={styles['nav-card']} />
                <div class={styles['nav-card-bottom']}>
                  <div class={styles['nav-title']}>{item.title}</div>
                  <img src='/apps/@ghcloud/higreen-data-viz/images/home/card-2-bottom.png' class={styles['nav-title-bg']} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div class={styles['arrow-btn']} onClick={handleNext}>
          <img src="/apps/@ghcloud/higreen-data-viz/images/home/arrow.webp" class={styles['arrow-right']} alt="下一个" />
        </div>
      </div>
    )
  }
})