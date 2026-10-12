import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './device-manual-add.module.less'
import { Form, Field, Button, showNotify } from 'vant'
import { useRouter } from 'vue-router'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { cubeZhongdaHeshunService } from '@/api/server'
import { storeKill } from '@/store/kill'
import { ensureCoordsForBind } from '@/hooks/use-mp-location'

/**
 * 设备手动添加页面组件
 */
export const DeviceManualAdd = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(false)
    useMetaTitle()
    const router = useRouter()
    const store = storeKill()
    const groupActive = ref(store.groupActive)
    const isAdmin = ref(store.isAdmin)
    const loading = ref(false)
    
    const formData = reactive({
      deviceCode: '',
    })
    
    const rules = {
      deviceCode: [{ required: true, message: '请输入设备机身上的唯一SN/MAC编码' }],
    }
    
    const bindDevice = async (): Promise<void> => {
      try {
        const coords = await ensureCoordsForBind()
        const res = await cubeZhongdaHeshunService.bindDeviceOne({
          deviceCode: formData.deviceCode,
          prodCategoryId: store.selectProduct?.prodCategoryId as unknown as string ?? '',
          productId: store.selectProduct?.id as unknown as string ?? '',
          groupId: groupActive.value,
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
        if (res) {
          showNotify({ type: 'success', message: '添加成功' })
          setTimeout(() => {
            router.push({ 
              path: '/device', 
              query: { 
                refresh: 'true',
                timestamp: Date.now().toString()
              } 
            })
          }, 1500)
        } else {
          showNotify({ type: 'danger', message: '添加失败' })
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : '未获取到定位信息，请开启定位权限后重试'
        showNotify({ type: 'danger', message: msg })
      }
    }
    // 提交表单
    const handleSubmit = async (): Promise<void> => {
      if (!formData.deviceCode.trim()) {
        showNotify({ type: 'danger', message: '请输入设备机身上的唯一SN/MAC编码' })
        return
      }
      try {
        loading.value = true
        await bindDevice()
      } catch {
      } finally {
        loading.value = false
      }
    }
    
    onMounted(async (): Promise<void> => {
      await store.updateGroupInfo()
      groupActive.value = store.groupActive
      isAdmin.value = store.isAdmin
    })
    return () => (
      <div class={styles.container}>
        {/* 顶部导航栏 */}
        {/* <NavBar
          title="手动添加"
          left-arrow
          fixed
          placeholder
          safe-area-inset-top
          onClickLeft={handleBack}
        /> */}
        
        {/* 表单内容 */}
        <div class={styles.content}>
          <div class={styles.formTitle}>手动添加</div>
          <Form class={styles.form}>
            <Field
              v-model={formData.deviceCode}
              name="deviceCode"
              label=""
              placeholder="输入设备机身上的唯一SN/MAC编码"
              rules={rules.deviceCode}
              clearable
              maxlength='200'
            />
          </Form>
          
          {/* 提交按钮 */}
          <div class={styles.submitBtnWrap}>
            <Button 
              type="primary" 
              block 
              class={styles.submitBtn} 
              loading={loading.value}
              disabled={loading.value}
              onClick={handleSubmit}
            >
              提交
            </Button>
          </div>
        </div>
      </div>
    )
  }
})

export default DeviceManualAdd