
import { defineComponent, onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { Space, Button, message } from '@ghcloud/cube-ui'
import { BasicInfo } from './components/basic-info/basic-info'
import { GuideContent, type GuideContentItem } from './components/guide-content/guide-content'
import styles from './guide-sign-edit.module.less'
import { cubeParkingLotService } from "@/api/service";

export const GuideSignEdit = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    
    const basicInfoRef = ref<{ handleSubmit: () => Promise<any> }>()
    const guideContentRef = ref<{ getApiParams: () => GuideContentItem[] }>()

    const state = reactive({
      formState: {},
      contentData: [] as GuideContentItem[]
    })

    const title = computed(() => {
      const type = route.query.type as string
      if (type === 'create') return '新增引导牌'
      if (type === 'edit') return '编辑引导牌'
      if (type === 'info') return '引导牌详情'
      return '新增引导牌'
    })

    const isView = computed(() => route.query.type === 'info')

    onMounted(async () => {
      const id = route.query.id as string
      if (id) {
        await getDetails(id)
      }
    })

    const getDetails = async (id: string) => {
      try {
        const res = await cubeParkingLotService.getGuideSignDetail(id)
        state.formState = {
          ...res,
          // map fields if necessary
        }
        // contentConfigs mapping
        // Assuming res.contentConfigs matches GuideContentItem structure or needs mapping
        state.contentData = (res as any).contentConfigs || []
      } catch (error) {
        message.error('获取详情失败')
      }
    }

    const handleSubmit = async () => {
      try {
        const basicInfo = await basicInfoRef.value?.handleSubmit()
        const contentConfigs = guideContentRef.value?.getApiParams()
        
        if (!contentConfigs || contentConfigs.length === 0) {
            // It might be allowed to have no content, but let's warn or check requirements.
            // Requirement doesn't explicitly say. But typically valid.
        }

        const type = route.query.type as string
        const id = route.query.id as string

        const params = {
          ...basicInfo,
          contentConfigs,
          id: type === 'create' ? undefined : id
        }
        if (params?.sceneImageFiles) delete params.sceneImageFiles
        loading.value = true
        if (type === 'create') {
          await cubeParkingLotService.createGuideSign(params)
          message.success('创建成功')
        } else {
          await cubeParkingLotService.updateGuideSign(params)
          message.success('更新成功')
        }
        router.back()
      } catch (error: any) {
        // const errorMessage = error?.toJSON?.()?.errorMessage || '保存失败'
        // message.error(errorMessage)
      } finally {
        loading.value = false
      }
    }

    const layoutSlots = {
      'layout-content': () => (
        <div class={styles['edit-content']}>
          <div class={styles.title}>基础信息</div>
          <BasicInfo initFormState={state.formState} ref={basicInfoRef} />
          <div class={styles.title}>引导内容</div>
          <GuideContent initData={state.contentData} ref={guideContentRef} />
        </div>
      ),
      'footer-page': () => (
        <Space>
          <Button onClick={() => router.back()}>返回</Button>
          {!isView.value && (
            <Button type="primary" loading={loading.value} onClick={handleSubmit}>
              保存
            </Button>
          )}
        </Space>
      )
    }

    return () => (
      <CubeLayout title={title.value} v-slots={layoutSlots} />
    )
  }
})
