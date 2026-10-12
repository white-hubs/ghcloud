import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { CellGroup, Field, Form, Picker, Popup, Button, DatePicker, showToast, showNotify } from 'vant'
import styles from './add-booking.module.less'
import { cubeOuaaService, cubeVisitorManagementService } from '@/api/server'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
export const AddBooking = defineComponent({
  setup () {
    useMetaTitle()
    const showAreaPicker = ref(false)
    const showDatePicker = ref(false)
    const showTimePicker = ref(false)
    const minDate = new Date()
    const maxDate = new Date(minDate.getTime() + (7 * 24 * 60 * 60 * 1000))
    const formRef = ref()
    const bookLoading = ref(false)
    const bookingData = reactive({
      date: '',
      areaName: '',
      areaId: '',
      time: '',
      timeId: '',
      name: '',
      phone: ''
    })
    const checkedDate = ref<string[]>([])
    const checkedArea = ref<number[]>([])
    const checkedPeriod = ref<string[]>([])
    const phone = ref('')
    const timeListOptions = ref()
    const areaOptions = ref()
    const route = useRoute()
    const router = useRouter()
    const getTimeOption = async (): Promise<void> => {
      try {
        const dateTime = bookingData.date.includes(',') ? bookingData.date : `${bookingData.date},${bookingData.date} 23:59:59`
        const res = await cubeVisitorManagementService.getPeriodDetail({ period: dateTime, areaId: bookingData.areaId, areaName: bookingData.areaName })
        timeListOptions.value = res.detailList[0]?.timeList ?? []
      } catch {}
    }
    const getUser = async (): Promise<void> => {
      try {
        const { name, mobile } = await cubeOuaaService.getUserMine()
        bookingData.name = name
        phone.value = mobile
      } catch {}
    }
    // 获取区域
    const getVisitorArea = async (): Promise<void> => {
      try {
        areaOptions.value = await cubeVisitorManagementService.getVisitorArea()
      } catch {}
    }
    // 选择日期
    const handleDate = ({ selectedValues }: { selectedValues: string[]; }): void => {
      bookingData.date = selectedValues.join('-')
      bookingData.time = ''
      getTimeOption()
      showDatePicker.value = false
    }
    // 选择场馆
    const confirmArea = ({ selectedOptions }: { selectedOptions: { id: string; name: string; }[]; }): void => {
      bookingData.areaId = selectedOptions[0].id
      bookingData.areaName = selectedOptions[0].name
      bookingData.time = ''
      getTimeOption()
      showAreaPicker.value = false
    }
    // 打开时段选择弹窗
    const openTimePopup = (): void => {
      if (!bookingData.areaId)showToast('请选择预约场馆')
      if (!bookingData.date)showToast('请选择预约时间')
      if (bookingData.areaId && bookingData.date) showTimePicker.value = true
    }
    // 选择时段
    const confirmTime = ({ selectedOptions }: { selectedOptions: { id: string; timeStr: string; }[]; }): void => {
      bookingData.time = selectedOptions[0].timeStr
      bookingData.timeId = selectedOptions[0].id
      showTimePicker.value = false
    }
    // 提交预约
    const handleBooking = (): void => {
      formRef.value.validate().then(async () => {
        const timeData = timeListOptions.value.find((t: { id: string; }) => t.id === route.query.timeId)
        const endDate = timeData.nextDayBool ? dayjs(bookingData.date).add(1, 'day').format('YYYY-MM-DD') : dayjs(bookingData.date).format('YYYY-MM-DD')
        const period = `${bookingData.date} ${timeData.startTimeStr},${endDate} ${timeData.endTimeStr}`
        try {
          bookLoading.value = true
          const { id, appointmentCode } = await cubeVisitorManagementService.reservationAdd({
            areaId: bookingData.areaId,
            areaName: bookingData.areaName,
            period,
            timeStr: bookingData.time,
            dayStr: bookingData.date,
            name: bookingData.name,
            phone: bookingData.phone,
            nextDayBool: timeData.nextDayBool
          })

          showNotify({ type: 'success', message: '预约成功' })
          router.push({
            path: '/result',
            query: {
              detail: JSON.stringify({
                id,
                areaName: bookingData.areaName,
                timeStr: bookingData.time,
                dayStr: bookingData.date,
                name: bookingData.name,
                code: appointmentCode
              })
            }
          })
        } catch (error) {
          const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
          showNotify({ type: 'danger', message: errorMessage || '预约失败' })
        } finally {
          bookLoading.value = false
        }
      })
    }
    onMounted(() => {
      getVisitorArea()
      getUser()
      const dateArr = (route.query.period as string).split(',')
      bookingData.date = dateArr[0]
      const timeArr = dateArr[0].split('-')
      checkedDate.value = checkedDate.value.concat(timeArr)
      bookingData.areaName = route.query.areaName as string
      bookingData.areaId = route.query.areaId as string
      checkedArea.value = [Number(route.query.areaId as string)]
      timeListOptions.value = JSON.parse(route.query.timeList as string)
      bookingData.time = route.query.time as string
      checkedPeriod.value = [route.query.time as string]
    })
    return (): JSX.Element =>
      <div class={styles.container}>
        <Form ref={formRef}>
          <div class={styles['booking-form']}>
            <CellGroup inset>
              <Field
                required
                is-link
                readonly
                placeholder='选择日期'
                v-model={bookingData.date}
                name='预约日期'
                label='预约日期'
                rules={[{ required: true, message: '请选择日期' }]}
                onClick={() => {
                  showDatePicker.value = true
                }}
              />
              <Popup v-model:show={showDatePicker.value} position='bottom'>
                <DatePicker
                  v-model={checkedDate.value}
                  title='选择日期'
                  onConfirm={handleDate}
                  min-date={minDate}
                  max-date={maxDate}
                />
              </Popup>
              <Field
                v-model={bookingData.areaName}
                is-link
                readonly
                name='picker'
                required
                label='预约场馆'
                placeholder='选择场馆'
                rules={[{ required: true, message: '请选择场馆' }]}
                onClick={() => {
                  showAreaPicker.value = true
                }}
              />
              <Popup v-model:show={showAreaPicker.value} position='bottom'>
                <Picker
                  v-model={checkedArea.value}
                  columns-field-names={{
                    text: 'name',
                    value: 'id',
                  }}
                  columns={areaOptions.value}
                  onConfirm={confirmArea}
                  onCancel={() => {
                    showAreaPicker.value = false
                  }}
                />
              </Popup>
              <Field
                v-model={bookingData.time}
                is-link
                required
                rules={[{ required: true, message: '请选择时段' }]}
                readonly
                name='picker'
                label='预约时段'
                placeholder='选择时段'
                onClick={openTimePopup}
              />
              <Popup v-model:show={showTimePicker.value} position='bottom'>
                <Picker
                  v-model={checkedPeriod.value}
                  columns={timeListOptions.value}
                  columns-field-names={{
                    text: 'timeStr',
                    value: 'id',
                  }}
                  onConfirm={confirmTime}
                  onCancel={() => {
                    showTimePicker.value = false
                  }}
                />
              </Popup>
            </CellGroup>

          </div>
          <div class={styles['booking-title']}>预约人员</div>
          <div class={styles['booking-form']}>
            <CellGroup inset>
              <Field
                v-model={bookingData.name}
                name='姓名'
                label='姓名'
                required
                maxlength='20'
                rules={[{ required: true, message: '请填写姓名' }]}
              />
              <Field
                v-model={bookingData.phone}
                type='tel'
                name=''
                label='手机号'
                maxlength='11'
                required
                rules={[
                  { required: true, message: '请填写手机号' },
                  { validator: (val: string) => /^1[3456789]\d{9}$/.test(val), message: '手机号格式错误' }]}
                placeholder='请填写手机号'
                v-slots={{ button: () => <a onClick={() => {
                  bookingData.phone = phone.value
                }}>获取手机号</a> }}
              />
            </CellGroup>
          </div>
        </Form>
        <div class={styles.btn}>
          <Button block type='primary' loading={bookLoading.value} onClick={handleBooking}>预约</Button>
        </div>
      </div>
  }
})
