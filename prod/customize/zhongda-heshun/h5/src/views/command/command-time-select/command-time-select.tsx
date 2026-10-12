import { defineComponent, ref, onMounted } from 'vue'
import styles from './command-time-select.module.less'
import { Tabs, Tab, Button, Popup, TimePicker, showNotify } from 'vant'
import { useRouter } from 'vue-router'
import { DisplayCell } from '@/components/displayCell/displayCell'
// 在文件顶部引入store
import { useCommandStore } from '@/store/command'
import { storeKill } from '@/store/kill'
/**
 * 指令时间选择页面组件
 */
export const CommandTimeSelect = defineComponent({
  setup: () => {
    const store = storeKill()
    const isAdmin = ref(store.isAdmin)
    const router = useRouter()
    const activeTab = ref('EVERY_WEEK') // 默认选中每周
    const selectedDay = ref<string[]>([])
    const selectedDayIndex = ref<number[]>([])
    const monthly = ['一号', '二号', '三号', '四号', '五号', '六号', '七号', '八号', '九号', '十号', '十一号', '十二号', '十三号', '十四号', '十五号', '十六号', '十七号', '十八号', '十九号', '二十号', '二十一号', '二十二号', '二十三号', '二十四号', '二十五号', '二十六号', '二十七号', '二十八号', '二十九号', '三十号', '三十一号']
    const commandName = ref('')

    const selectedMonthly = ref<string[]>([])
    const selectedMonthlyIndex = ref<number[]>([])
    // 时间选择器相关变量
    const showTimePicker = ref(false) // 控制时间选择器弹出层显示
    const currentTime = ref<string[]>([]) // 当前选择的时间
    const selectedTime = ref('') // 存储选择的时间用于回显

    /**
     * 处理返回按钮点击
     */
    const handleBack = (): void => {
      router.back()
    }


    /**
     * 处理选择星期几
     */
    const handleSelectDay = (day: string, index: number): void => {

      if (selectedDayIndex.value.includes(index + 1)) {
        selectedDay.value.splice(selectedDay.value.indexOf(day), 1)
        selectedDayIndex.value.splice(selectedDayIndex.value.indexOf(index + 1), 1)
      } else {
        selectedDay.value.push(day)
        selectedDayIndex.value.push(index + 1)
      }
    }
    const handleSelectMonthly = (day: string, index: number): void => {

      if (selectedMonthlyIndex.value.includes(index + 1)) {
        selectedMonthly.value.splice(selectedMonthly.value.indexOf(day), 1)
        selectedMonthlyIndex.value.splice(selectedMonthlyIndex.value.indexOf(index + 1), 1)
      } else {
        selectedMonthly.value.push(day)
        selectedMonthlyIndex.value.push(index + 1)
      }
    }


    // 在setup函数中获取store实例
    const commandStore = useCommandStore()

    onMounted(async () => {
      await store.updateGroupInfo()
      isAdmin.value = store.isAdmin
      commandName.value = commandStore.loopHour
      currentTime.value = commandStore.loopHour.split(':')
      activeTab.value = commandStore.loopType
      switch (commandStore.loopType) {
        case 'EVERY_WEEK':
          const week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          selectedDay.value = commandStore.loopDay.map((item) =>{
            return week[item - 1]
          })
          selectedDayIndex.value = commandStore.loopDay
          break
        case 'EVERY_MONTH':
          activeTab.value = 'EVERY_MONTH'
          selectedMonthlyIndex.value = commandStore.loopDay
          selectedMonthly.value = commandStore.loopDay.map((item) =>{
            return monthly[item - 1]
          })
          break
      }
    })

    /**
     * 处理下一步按钮点击
     */
    const handleNext = (): void => {
      if (!commandName.value){
        showNotify({ type: 'danger', message: '请选择条件' })
        return
      }
      let timer = ''
      let loopDay: number[] = []

      switch (activeTab.value) {
        case 'EVERY_DAY':
          loopDay = []
          timer = '每天' + selectedTime.value
          break
        case 'EVERY_WEEK':
          loopDay = selectedDayIndex.value
          if (!selectedDay.value.length){
            showNotify({ type: 'danger', message: '请选择星期几' })
            return
          }
          timer = '每周' + selectedDay.value.join('、') + selectedTime.value
          break
        case 'EVERY_MONTH':
          loopDay = selectedMonthlyIndex.value
          if (!selectedMonthly.value.length){
            showNotify({ type: 'danger', message: '请选择日期' })
            return
          }
          timer = '每月' + selectedMonthly.value.join('、') + selectedTime.value
          break
      }

      const timeData = {
        loopHour: selectedTime.value,
        loopType: activeTab.value,
        timer: timer,
        loopDay: loopDay
      }

      // 保存数据到store
      commandStore.saveTimeData(timeData)

      // 返回上一页
      router.back()
    }

    /**
     * 处理条件点击，打开时间选择器
     */
    const conditionClick = () => {
      showTimePicker.value = true
    }

    /**
     * 处理时间选择器确认
     */
    const onTimeConfirm = (timer: { selectedValues: string[]; selectedIndexes: string[]; }) => {
      currentTime.value = timer.selectedValues
      selectedTime.value = timer.selectedValues.join(':')
      commandName.value = timer.selectedValues.join(':') // 设置回显的值
      showTimePicker.value = false // 关闭弹出层
    }

    /**
     * 处理时间选择器取消
     */
    const onTimeCancel = () => {
      showTimePicker.value = false // 关闭弹出层
    }

    const tabClick = (index: number) => {
    }

    return (): JSX.Element => (
      <div class={styles.container}>
        {/* <NavBar
          title="选择时间"
          leftArrow
          onClickLeft={handleBack}
          class={styles.navbar}
        /> */}

        <div class={styles.content}>
          <div class={styles.sectionTitles}>选择时间</div>
          <div class={styles.sectionTitles}>当</div>
          <DisplayCell value={commandName.value} placeholder ='请选择条件' onClick={conditionClick}></DisplayCell>
          <div class={styles.repeatSection}>
            <div class={styles.sectionTitle}>重复</div>
            <div class={styles.tabsWrapper}>
              <Tabs v-model:active={activeTab.value} >
                <Tab title="每天" name={'EVERY_DAY'}></Tab>
                <Tab title="每周" name={'EVERY_WEEK'}></Tab>
                <Tab title="每月" name={'EVERY_MONTH'}></Tab>
              </Tabs>
            </div>

            {activeTab.value === 'EVERY_WEEK' && (
              <div class={styles.weekdaySelector}>
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                  <div
                    key={day}
                    class={[styles.weekdayItem, selectedDay.value.includes(day) ? styles.selected : '']}
                    onClick={() => handleSelectDay(day, index)}
                  >
                    {day}
                    {selectedDay.value.includes(day) && <div class={styles.checkIcon}>✓</div>}
                  </div>
                ))}
              </div>
            )}

            {activeTab.value === 'EVERY_MONTH' && (
              <div class={styles.weekdaySelector}>
                {monthly.map((day, index) => (
                  <div
                    key={day}
                    class={[styles.weekdayItem, selectedMonthly.value.includes(day) ? styles.selected : '']}
                    onClick={() => handleSelectMonthly(day, index)}
                  >
                    {day}
                    {selectedMonthly.value.includes(day) && <div class={styles.checkIcon}>✓</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
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

        {/* 时间选择器弹出层 */}
        <Popup
          v-model:show={showTimePicker.value}
          position="bottom"
          style={ { height: '50%' }}
          round
        >
          <div>
            <TimePicker
              v-model={currentTime.value}
              type="time"
              title="选择时间"
              item-height="44"
              visible-item-count="5"
              onConfirm={onTimeConfirm}
              onCancel={onTimeCancel}
            />
          </div>
        </Popup>
      </div>
    )
  }
})