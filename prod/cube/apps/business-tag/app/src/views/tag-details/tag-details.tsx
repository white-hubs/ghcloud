import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './tag-details.module.less'
import { BasicInfo } from './components/basic-info/basic-info'
import { useRoute } from 'vue-router'
import { Button, message, Space, TabPane, Tabs } from '@ghcloud/cube-ui'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { cubeBusinessTagService } from '@/api/server'
import { TagAssociationArea } from './components/tag-association-area/tag-association-area'
import { TagAssociationCommonList } from './components/tag-association-common-list/tag-association-common-list'
import { AssociatedObjectType, getAssociatedObjectTypeLabel } from '@/components/tag-associated-object-select/tag-associated-object-select-modal'

export const TagDetails = defineComponent({
  setup () {
    const route = useRoute()
    const state = reactive<{
      formState: Record<string, unknown>;
      loading: boolean;
    }>({
      formState: {},
      loading: false,
    })
    const activeKey = ref<AssociatedObjectType>(AssociatedObjectType.AREA)

    onMounted(() => {
      getDetails()
    })
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string
      if (!id) return
      try {
        const res = await cubeBusinessTagService.getTagDetails(id)
        state.formState = {
          ...res
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }


    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles['content']}>
            <div class={styles.title}>基础信息</div>
            <div style={{ flexShrink: 0 }}>
              <BasicInfo initFormState={state.formState} />
            </div>
            <div class={styles.title}>关联信息</div>
            <div id='tag-association-container' style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {state.formState.id ? (
                <Tabs v-model:activeKey={activeKey.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.AREA)}
                    key={AssociatedObjectType.AREA}>
                    <TagAssociationArea 
                      tagId={state.formState.id as string} 
                      active={activeKey.value === AssociatedObjectType.AREA}
                    />
                  </TabPane>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.DEVICE)}
                    key={AssociatedObjectType.DEVICE}>
                    <TagAssociationCommonList
                      tagId={state.formState.id as string}
                      active={activeKey.value === AssociatedObjectType.DEVICE}
                      type={AssociatedObjectType.DEVICE}
                    />
                  </TabPane>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.PROPERTY)}
                    key={AssociatedObjectType.PROPERTY}>
                    <TagAssociationCommonList
                      tagId={state.formState.id as string}
                      active={activeKey.value === AssociatedObjectType.PROPERTY}
                      type={AssociatedObjectType.PROPERTY}
                    />
                  </TabPane>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.STALL)}
                    key={AssociatedObjectType.STALL}>
                    <TagAssociationCommonList
                      tagId={state.formState.id as string}
                      active={activeKey.value === AssociatedObjectType.STALL}
                      type={AssociatedObjectType.STALL}
                    />
                  </TabPane>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.SITE_POINT)}
                    key={AssociatedObjectType.SITE_POINT}>
                    <TagAssociationCommonList
                      tagId={state.formState.id as string}
                      active={activeKey.value === AssociatedObjectType.SITE_POINT}
                      type={AssociatedObjectType.SITE_POINT}
                    />
                  </TabPane>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.PATROL_POINT)}
                    key={AssociatedObjectType.PATROL_POINT}>
                    <TagAssociationCommonList
                      tagId={state.formState.id as string}
                      active={activeKey.value === AssociatedObjectType.PATROL_POINT}
                      type={AssociatedObjectType.PATROL_POINT}
                    />
                  </TabPane>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.RISK_SOURCE)}
                    key={AssociatedObjectType.RISK_SOURCE}>
                    <TagAssociationCommonList
                      tagId={state.formState.id as string}
                      active={activeKey.value === AssociatedObjectType.RISK_SOURCE}
                      type={AssociatedObjectType.RISK_SOURCE}
                    />
                  </TabPane>
                  <TabPane
                    tab={getAssociatedObjectTypeLabel(AssociatedObjectType.SMALL_ENGINEERING)}
                    key={AssociatedObjectType.SMALL_ENGINEERING}>
                    <TagAssociationCommonList
                      tagId={state.formState.id as string}
                      active={activeKey.value === AssociatedObjectType.SMALL_ENGINEERING}
                      type={AssociatedObjectType.SMALL_ENGINEERING}
                    />
                  </TabPane>
                </Tabs>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#999' }}>
                  加载中...
                </div>
              )}
            </div>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Space>
            <Button onClick={() => {
              history.back()
            }}
            >返回
            </Button>
          </Space>
        )
      }
    }
    return (): JSX.Element => (
      <CubeLayout title={'标签详情'} v-slots={layoutSlots} />
    )
  },
})
