import { defineComponent, ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { Button } from '@ghcloud/cube-ui'
import styles from './app-details.module.less'
import { RichTextContent } from './rich-text-content/rich-text-content'
import { IterationRecords } from './iteration-records/iteration-records'
import { RecommendedApps } from './recommended-apps/recommended-apps'
import { useRoute, useRouter } from 'vue-router'
import { cubeApplicationCenterService } from '@/api/service'
import type { ApplicationEntity } from '@ghcloud/cube-application-center-service'

export const AppDetails = defineComponent({
  setup () {
    const route = useRoute()
    const router = useRouter()

    // 使用computed来响应式地获取appId
    const appId = computed((): string => route.query.id as string)

    const appDetail = ref<ApplicationEntity | null>(null)
    const recommendedApps = ref<ApplicationEntity[]>([])

    const activeTab = ref('introduction')
    const isScrolling = ref(false)
    const scrollContainer = ref<HTMLElement | null>(null)
    const iterationRecordsRef = ref<{ hasData: boolean; }>()

    // 基础菜单配置
    const baseMenuItems = [
      { key: 'introduction', label: '产品介绍' },
      { key: 'features', label: '功能说明' },
      { key: 'usage', label: '使用帮助' },
      { key: 'purchase', label: '购买说明' },
      { key: 'recommended', label: '推荐应用' }
    ]

    // 动态菜单配置 - 直接使用 hasData 状态
    const menuItems = computed(() => {
      const items = [...baseMenuItems]
      // 只有当有迭代记录数据时才显示迭代记录菜单项
      if (iterationRecordsRef.value?.hasData) {
        items.splice(4, 0, { key: 'iterations', label: '迭代记录' })
      }
      return items
    })

    // 获取应用详情数据
    const fetchAppDetail = async (): Promise<void> => {
      const currentAppId = appId.value
      if (!currentAppId) return

      try {
        appDetail.value = await cubeApplicationCenterService.getApplication(currentAppId)
      } catch {}
      try {
        // 获取推荐应用数据
        recommendedApps.value = await cubeApplicationCenterService.getRecommendApplications({
          applicationId: currentAppId,
          applicationGroupId: appDetail.value?.applicationGroupId ?? ''
        })
      } catch {}
    }

    // 重置页面状态
    const resetPageState = (): void => {
      activeTab.value = 'introduction'
      isScrolling.value = false

      // 滚动到页面顶部
      if (scrollContainer.value) {
        scrollContainer.value.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    }

    // 监听路由参数变化
    watch(
      () => route.query.id,
      async (newId, oldId) => {
        if (newId && newId !== oldId) {
          // 重置页面状态
          resetPageState()

          // 重新获取数据
          await fetchAppDetail()

          // 重新初始化滚动位置检查
          setTimeout(() => {
            handleScroll()
          }, 500)
        }
      },
      { immediate: true }
    )

    // 获取固定导航的高度
    const getNavigationHeight = (): number => {
      const navElement = document.querySelector(`.${styles['fixed-navigation']}`)
      return navElement ? navElement.clientHeight : 60
    }

    // 获取响应式的布局参数
    const getLayoutParams = (): { headerHeight: number; scrollOffset: number; anchorOffset: number; } => {
      const isMobile = window.innerWidth <= 768
      return {
        headerHeight: isMobile ? 240 : 340,
        scrollOffset: isMobile ? 30 : 40,
        anchorOffset: isMobile ? 70 : 80
      }
    }

    // 处理菜单点击，滚动到对应内容区域
    const handleMenuClick = async (key: string): Promise<void> => {
      activeTab.value = key
      isScrolling.value = true

      await nextTick()

      const targetElement = document.getElementById(`section-${key}`)
      const container = scrollContainer.value

      if (targetElement && container) {
        const navHeight = getNavigationHeight()
        const { headerHeight, anchorOffset } = getLayoutParams()

        // 考虑CSS中设置的锚点偏移和scroll-margin-top
        // 使用锚点偏移来精确定位到导航栏下方
        const targetOffsetTop = targetElement.offsetTop - headerHeight - navHeight - anchorOffset + 20

        container.scrollTo({
          top: targetOffsetTop,
          behavior: 'smooth'
        })

        // 滚动完成后重置标志
        setTimeout(() => {
          isScrolling.value = false
        }, 1000)
      } else {
        isScrolling.value = false
      }
    }

    // 监听滚动事件，更新当前激活的菜单项
    const handleScroll = (): void => {
      if (isScrolling.value || !scrollContainer.value) return

      const container = scrollContainer.value
      const navHeight = getNavigationHeight()
      const { headerHeight, scrollOffset } = getLayoutParams()
      const scrollTop = container.scrollTop

      let currentSection = 'introduction' // 默认第一个

      for (let i = 0; i < menuItems.value.length; i++) {
        const element = document.getElementById(`section-${menuItems.value[i].key}`)
        if (element) {
          // 使用与点击滚动相同的计算逻辑，确保一致性
          const elementTop = element.offsetTop - headerHeight - navHeight
          const elementBottom = elementTop + element.offsetHeight

          // 使用scroll-margin-top作为判断阈值
          if (scrollTop + scrollOffset >= elementTop && scrollTop + scrollOffset < elementBottom) {
            currentSection = menuItems.value[i].key
            break
          } else if (scrollTop + scrollOffset >= elementTop) {
            currentSection = menuItems.value[i].key
          }
        }
      }

      if (activeTab.value !== currentSection) {
        activeTab.value = currentSection
      }
    }

    // 添加窗口大小变化监听，重新计算布局参数
    const handleResize = (): void => {
      // 窗口大小变化时，重新计算当前激活的菜单项
      setTimeout(() => {
        handleScroll()
      }, 100)
    }

    onMounted(() => {
      fetchAppDetail()

      // 获取滚动容器的引用
      scrollContainer.value = document.querySelector(`.${styles['app-details']}`) as HTMLElement

      if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleResize, { passive: true })

        // 初始化时检查一次当前位置
        setTimeout(() => {
          handleScroll()
        }, 500)
      }
    })

    onUnmounted(() => {
      if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
      }
    })

    // 处理立即咨询按钮点击
    const handleConsultClick = (): void => {
      const isInIframe = window.self !== window.top
      if (isInIframe) {
        // 向父页面发送消息
        window.parent.postMessage({
          type: 'CONSULT_BUTTON_CLICKED',
          data: {
            appId: appDetail.value?.id,
            appName: appDetail.value?.name,
            timestamp: Date.now(),
            source: 'application-center'
          }
        }, "*") // 生产环境建议指定具体的origin
      } else {

      }
    }

    // 处理返回按钮点击
    const handleBackClick = (): void => {
      router.back()
    }

    return (): JSX.Element => (
      <div class={styles['app-details']}>
        {appDetail.value && (
          <>
            {/* 头部背景区域 - 按照设计图 */}
            <div class={styles['app-header']}>
              <div class={styles['header-content']}>
                {/* 应用图标 */}
                {appDetail.value.icon ? (
                  <div class={styles['app-icon']}>
                    <img
                      src={appDetail.value.icon}
                      alt={appDetail.value.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                  </div>
                ) : (
                  <div class={styles['app-icon-text']}>{appDetail.value.name?.charAt(0) || 'A'}</div>
                )}

                {/* 内容区域 */}
                <div class={styles['title-content-section']}>
                  <div class={styles['title-section']}>
                    <h1 class={styles['app-title']}>{appDetail.value.name}</h1>
                  </div>

                  {/* 应用描述 */}
                  {appDetail.value.remark && (
                    <p class={styles['app-description']}>
                      {appDetail.value.remark.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                </div>

                <div class={styles['button-container']}>
                  {/* 立即咨询按钮 */}
                  <Button
                    type="primary"
                    class={styles['consult-btn']}
                    onClick={handleConsultClick}
                  >
                    立即咨询
                  </Button>

                  {/* 返回按钮 */}
                  <Button
                    class={styles['back-btn']}
                    onClick={handleBackClick}
                  >
                    返回列表
                  </Button>
                </div>
              </div>
            </div>

            {/* 固定导航菜单 */}
            <div class={styles['fixed-navigation']}>
              <div class={styles['nav-container']}>
                <div class={styles['nav-menu']}>
                  {menuItems.value.map(item => (
                    <div
                      key={item.key}
                      class={[
                        styles['nav-item'],
                        activeTab.value === item.key ? styles['nav-item-active'] : ''
                      ]}
                      onClick={async () => handleMenuClick(item.key)}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 内容区域 - 展示所有内容 */}
            <div class={styles['app-content']}>
              {/* 产品介绍 */}
              <div id="section-introduction">
                <RichTextContent
                  content={appDetail.value.applicationExtendInfo?.description ?? ''}
                  title="产品介绍"
                />
              </div>

              {/* 功能说明 */}
              <div id="section-features">
                <RichTextContent
                  content={appDetail.value.applicationExtendInfo?.featureDesc ?? ''}
                  title="功能说明"
                />
              </div>

              {/* 使用帮助 */}
              <div id="section-usage">
                <RichTextContent
                  content={appDetail.value.applicationExtendInfo?.helpInfo ?? ''}
                  title="使用帮助"
                />
              </div>

              {/* 购买说明 */}
              <div id="section-purchase">
                <RichTextContent
                  content={appDetail.value.applicationExtendInfo?.purchaseInfo ?? ''}
                  title="购买说明"
                />
              </div>

              {/* 迭代记录 - 始终渲染，让组件内部控制显示 */}
              <div id="section-iterations">
                <IterationRecords
                  ref={iterationRecordsRef}
                  applicationId={appId.value}
                />
              </div>

              {/* 推荐应用 */}
              <div id="section-recommended">
                <RecommendedApps apps={recommendedApps.value} />
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
})