import { defineComponent, onMounted, ref } from 'vue'
import styles from './command-status-select.module.less'
import { NavBar, Tabs, Tab, Cell, Button, Icon, Popup } from 'vant'
import { useRouter } from 'vue-router'
import { DisplayCell } from '@/components/displayCell/displayCell'
import { storeKill } from '@/store/kill'

/**
 * 设备状态选择页面组件
 */
export const CommandStatusSelect = defineComponent({
  setup: () => {
    const router = useRouter()
    const commandName = ref('')
    
    // 设备状态选择相关变量
    const showStatusPicker = ref(false) // 控制状态选择器弹出层显示
    const selectedStatus = ref('') // 存储选择的状态用于回显
    
    /**
     * 处理返回按钮点击
     */
    const handleBack = (): void => {
      router.back()
    }
    
    /**
     * 处理下一步按钮点击
     */
    const handleNext = (): void => {
      // 保存选择的状态信息
      router.back()
    }
    
    /**
     * 处理条件点击，打开状态选择器
     */
    const conditionClick = () => {
      showStatusPicker.value = true
    }
    
    /**
     * 处理选择离线状态
     */
    const selectOffline = () => {
      selectedStatus.value = '离线'
      commandName.value = '离线' // 设置回显的值
      showStatusPicker.value = false // 关闭弹出层
    }
    
    /**
     * 处理选择在线状态
     */
    const selectOnline = () => {
      selectedStatus.value = '在线'
      commandName.value = '在线' // 设置回显的值
      showStatusPicker.value = false // 关闭弹出层
    }
    
    /**
     * 处理状态选择器取消
     */
    const onStatusCancel = () => {
      showStatusPicker.value = false // 关闭弹出层
    }

    const store = storeKill()
    const isAdmin = ref(store.isAdmin)
    onMounted(async () => {
      await store.updateGroupInfo()
      isAdmin.value = store.isAdmin
    })
    
    return (): JSX.Element => (
      <div class={styles.container}>
        {/* <NavBar
          title="设备状态"
          leftArrow
          onClickLeft={handleBack}
          class={styles.navbar}
        /> */}
        <div class={styles.content}>
            <div class={styles.sectionTitles}>设备状态</div>
            <div class={styles.sectionTitles}>当</div>
            <DisplayCell value={commandName.value} placeholder ='请选择条件' onClick={conditionClick}></DisplayCell>
         
        </div>
        
        {
          isAdmin.value &&
        <div class={styles.footer}>
          <Button 
            type="primary" 
            block 
            onClick={handleNext}
            class={styles.nextBtn}
          >
            下一步
          </Button>
        </div>
        }
        {/* 设备状态选择弹出层 */}
        <Popup 
          v-model:show={showStatusPicker.value} 
          position="bottom"
          style={ { height: '30%' }}
          round
        >
          <div class={styles.statusPickerContainer}>
            <div class={styles.statusPickerHeader}>
              <div class={styles.cancelBtn} onClick={onStatusCancel}>取消</div>
              <div class={styles.statusTitle}>设备状态</div>
              <div class={styles.confirmBtn}></div>
            </div>
            <div class={styles.statusOptions}>
              <div class={styles.statusOption} onClick={selectOffline}>离线</div>
              <div class={`${styles.statusOption} ${styles.selected}`} onClick={selectOnline}>在线</div>
            </div>
          </div>
        </Popup>
      </div>
    )
  }
})