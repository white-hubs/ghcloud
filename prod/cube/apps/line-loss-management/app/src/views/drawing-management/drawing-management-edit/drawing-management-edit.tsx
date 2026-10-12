import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { Space, Button, message } from '@ghcloud/cube-ui'
import { useRoute, useRouter } from 'vue-router'
import styles from './drawing-management-edit.module.less'
import { BasicInfo } from './components/basic-info'
import type { FileVOState } from "@ghcloud/cube-protocol";

export const DrawingManagementEdit = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const formState = reactive<{
      name: string;
      type: string | undefined;
      description: string;
      fileList: FileVOState[];
    }>({
      name: '',
      type: undefined,
      description: '',
      fileList: []
    })
    const loading = ref(false)
    const basicInfoRef = ref<{ handleSubmit: () => Promise<unknown> }>()

    const title = computed(() => {
      const titleType = {
        info: '电气图纸-详情',
        create: '电气图纸-新增',
        edit: '电气图纸-编辑',
      }
      return titleType[route.query?.type as keyof typeof titleType] || '电气图纸-新增'
    })

    const isInfo = computed(() => route.query?.type === 'info')

    const handleSubmit = async () => {
      try {
        const formData = await basicInfoRef.value?.handleSubmit()
        loading.value = true
        // Mock save
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        message.success('保存成功')
        setTimeout(() => {
          router.back()
        }, 500)
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    const getDetails = async () => {
      const id = route.query?.id as string
      if (!id) return
      try {
        // Mock details fetch
        await new Promise(resolve => setTimeout(resolve, 500))
        const res = {
            name: '蔬菜A区电路布局图',
            type: '1',
            description: 'xxxxx',
            fileList: [] as FileVOState[]
        }
        Object.assign(formState, res)
      } catch {
      }
    }

    onMounted(() => {
      if (route.query?.id) {
        getDetails()
      }
    })

    const layoutSlots = {
      'layout-content': () => (
        <div class={styles['edit-content']}>
          <BasicInfo ref={basicInfoRef} initFormState={formState} />
        </div>
      ),
      'footer-page': () => (
        <Space>
          <Button onClick={() => history.back()}>返回</Button>
          {!isInfo.value && (
            <Button type='primary' loading={loading.value} onClick={handleSubmit}>
              保存
            </Button>
          )}
        </Space>
      ),
    }

    return () => <CubeLayout title={title.value} v-slots={layoutSlots} showTableXScroll={false} />
  },
})
