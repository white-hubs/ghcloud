import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Field, Popup, Picker, Button, showNotify, Form, type FormInstance, CheckboxGroup, Checkbox, Empty, Loading } from 'vant'
import './reservation.less'
import { useRoute, useRouter } from 'vue-router'
import { cubeMeetRoomService } from '@/api/server'
import { storeMeet } from '@/store/meet'
import { timeListSort } from '@/utils'
import type { ReservationInfo } from '@ghcloud/cube-meet-room-service'
import { useFieldRequired } from '@/hooks/use-field-required'
import { DeptSelect } from '@/components/dept-select'
import { RoleSelect } from '@/components/role-select'
export const Reservation = defineComponent({
  setup: () => {
    const { checkFieldRequired, checkFieldHidden, loadFieldConfig } = useFieldRequired()
    
    const route = useRoute()
    const router = useRouter()
    const meetStore = storeMeet()
    const search: { date: string; conferenceId: string; } = route.query.search && JSON.parse(route.query.search as string)
    const formRef = ref<FormInstance>()
    const state = reactive<ReservationInfo>({
      showConferenceType: false,
      showParticipantType: false,
      showDeptSelect: false,
      showRoleSelect: false,
      loading: false,
      conferenceTypeOptions: [],
      participantTypeOptions: [
        { text: '部门', value: 'DEPARTMENT' },
        { text: '角色', value: 'ROLE' },
        { text: '人员', value: 'USER' },
      ],
      conferenceGoodsOptions: [],
      areaName: '',
      goodIds: [],
      formState: {
        bookNum: null,
        conferenceId: null,
        conferenceTheme: null,
        conferenceType: null,
        content: null,
        fieldConcatenation: null,
        goodsIds: null,
        goodsNames: null,
        subscribePerson: null,
        conferenceTypeName: null,
        timeInterval: null,
        participantTypeText: null,
        participantType: null,
        participantIds: null,
        dep: '',
        depName: '',
        role: '',
        roleName: '',
        users: '',
        userNames: [],
      },
      conferenceName: null,
      appointmentDate: null,
      detail: null,
    })

    const getConferenceTypeOptions = async (): Promise<void> => {
      const result = await cubeMeetRoomService.getMeetTypeList()
      state.conferenceTypeOptions = result.map(item => {
        return {
          text: item.name,
          value: item.id,
          disabled: !item.status
        }
      })
    }
    const getConferenceGoodsOptions = async (): Promise<void> => {
      const result = await cubeMeetRoomService.getMeetGoodsList({
        pageNumber: 1,
        pageSize: 100
      })
      state.conferenceGoodsOptions = result.map(item => {
        return {
          text: item.goodsName ?? '',
          value: item.id ?? null
        }
      })
    }
    const getConferenceInfo = async (): Promise<void> => {
      const result = await cubeMeetRoomService.getAppAppointmentDetail({
        conferenceId: search.conferenceId,
        date: search.date
      })
      state.detail = result
      state.conferenceName = state.detail?.name ?? ''
      state.areaName = result.areaName ?? ''
    }
    const initData = async (): Promise<void> => {
      try {
        // 回显
        state.conferenceName = state.detail?.name ?? ''
        state.appointmentDate = search.date ?? ''
        if (meetStore.reservationFormState) {
          state.formState = meetStore.reservationFormState
          const reservationTime = meetStore.reservationTime?.filter(item => item.active).map(i => {
            return i.timeInterval ?? ''
          })
          state.formState.timeInterval = reservationTime ? timeListSort(reservationTime).join(',') : null
          state.detail = meetStore.conferenceDetail?.detail ?? null
          state.conferenceName = state.detail?.name ?? ''
          state.areaName = state.detail?.areaName ?? ''
          if (meetStore.conferenceDetail?.goodIds) state.goodIds = Array.isArray(meetStore.conferenceDetail?.goodIds) ? meetStore.conferenceDetail?.goodIds : []
          if (meetStore.checkUsers) {
            state.formState.users = meetStore.checkUsers?.map(i => (i as { id: string; }).id).join(',') ?? ''
            state.formState.userNames = meetStore.checkUsers?.map(i=> (i as { name: string; }).name) ?? []
          }
        }
        await getConferenceInfo()
        await getConferenceTypeOptions()
        await getConferenceGoodsOptions()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        state.loading = false
      }
    }
    onMounted(async () => {
      await initData()
      await loadFieldConfig() // 使用loadFieldConfig替代getFieldList
    })
    
    // 添加计算属性来判断字段是否显示
    const isTimeIntervalVisible = computed(() => !checkFieldHidden('timeInterval'))
    const isGoodsNamesVisible = computed(() => !checkFieldHidden('goodsIds'))
    const isConferenceTypeVisible = computed(() => !checkFieldHidden('conferenceType'))
    const isBookNumVisible = computed(() => !checkFieldHidden('bookNum'))
    const isConferenceThemeVisible = computed(() => !checkFieldHidden('conferenceTheme'))
    const isContentVisible = computed(() => !checkFieldHidden('content'))
    const isParticipantIdsVisible = computed(() => !checkFieldHidden('participantIds'))
    
    
    const handleConfirmSelectDept = (value: { text: string;value: string; }[]): void => {
      state.formState.dep = value[0].value
      state.formState.depName = value[0].text
      state.showDeptSelect = false
    }
    const handleConfirmSelectRole = (value: { text: string;value: string; }[]): void => {
      state.formState.role = value[0].value
      state.formState.roleName = value[0].text
      state.showRoleSelect = false
    }
    const clickUser = (): void => {
      const names = typeof state.formState.userNames === 'string' ? state.formState.userNames.split(',') : state.formState.userNames
      meetStore.checkUsers = state.formState?.users?.split(',').map((item, index) => {
        return {
          id: item,
          name: names ? names[index] : ''
        }
      }).filter((item) => item.id)
      meetStore.reservationFormState = state.formState
      meetStore.conferenceDetail = state
      router.push({ path: '/person-page', query: { type: 'reserveUsers' } })
    }

    const handleSubmit = async (): Promise<void> => {
      formRef.value?.validate().then(async () => {
        try {
          state.loading = true
          const params: Record<string, unknown> = {
            appointmentDate: search.date ?? '',
            conferenceId: search.conferenceId ?? '',
          }
          
          // 只添加可见字段的数据
          if (isBookNumVisible.value) params.bookNum = state.formState.bookNum ?? null
          if (isConferenceThemeVisible.value) params.conferenceTheme = state.formState.conferenceTheme ?? ''
          if (isConferenceTypeVisible.value) params.conferenceType = state.formState.conferenceType ?? ''
          if (isContentVisible.value) params.content = state.formState.content ?? ''
          if (isGoodsNamesVisible.value) {
            params.goodsIds = state.goodIds.join(',') ?? ''
            params.goodsNames = state.conferenceGoodsOptions.filter(i => state.goodIds?.includes(i.value ?? '')).map(i => i.text ?? '').join(',')
          }
          if (isTimeIntervalVisible.value) params.timeInterval = state.formState.timeInterval ?? ''
          
          // 参会人员通知相关字段
          if (isParticipantIdsVisible.value) {
            params.participantType = state.formState.participantType ?? null
            params.participantIds = []
            
            const typeMap = new Map([
              ['USER', 'users'],
              ['ROLE', 'role'],
              ['DEPARTMENT', 'dep'],
            ])
            const participantType = state.formState.participantType ?? 'DEPARTMENT';
            const typeKey = typeMap.get(participantType);
            let ids = typeKey ? state.formState[typeKey as keyof typeof state.formState] as string : ''
            params.participantIds = Array.isArray(ids) ? ids : (ids ? ids?.split(',') : [])
          }
          
          await cubeMeetRoomService.reserveBookRoom(params)
          showNotify({ type: 'success', message: '提交成功' })
          meetStore.reservationTime = null
          meetStore.reservationFormState = {}
          router.push({ path: '/detail', query: { id: search.conferenceId } })
        } catch (error) {
          const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
          showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        } finally {
          state.loading = false
          meetStore.checkUsers = undefined
        }
      })
    }
    const checkBookNum = async (): Promise<Error | void> => {
      const max = state.detail?.capacity ?? 0
      const isRequired = checkFieldRequired('bookNum')
      if (isRequired && !state.formState.bookNum) {
        return Promise.reject(new Error('请输入参会人数'))
      }
      if (state.formState.bookNum !== null && state.formState.bookNum !== undefined && state.formState.bookNum > max) {
        return Promise.reject(new Error(`参会人数最多${max}人`))
      }
      return Promise.resolve()
    }
    const validateField = async (value: unknown, message: string): Promise<Error | void> => {
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    };
    const checkParticipant = async (rule: unknown, value: unknown): Promise<Error | void> => {
      const isRequired = checkFieldRequired('participantIds')
      if (isRequired) {
        if (!state.formState.participantType) return Promise.reject(new Error('请选择参会人员通知'))
        const msgMap = new Map([
          ['ROLE', async (): Promise<Error | void> => validateField(value, '请选择角色')],
          ['DEPARTMENT', async (): Promise<Error | void> => validateField(value, '请选择部门')],
          ['USER', async (): Promise<Error | void> => validateField(value, '请选择人员')]
        ]);
        await msgMap.get(state.formState.participantType)
      }
      return Promise.resolve()
    }
    const goodsSlots = {
      input: (): JSX.Element => {
        return (
          <CheckboxGroup v-model={state.goodIds} direction='horizontal' icon-size='16px'>
            {
              state.conferenceGoodsOptions
                ? state.conferenceGoodsOptions.map((item) => {
                  return <Checkbox name={item.value} key={item.value} class='mb-5'>{item.text}</Checkbox>
                })
                : <Empty description='暂无会议物品' />
            }
          </CheckboxGroup>
        )
      }
    }
    return (): JSX.Element => (
      <div class='container'>
        <div class='form'>
          {state.loading && <Loading type='spinner' size='24px' vertical>加载中...</Loading>}
          <Form ref={formRef} label-width='120px'>
            <Field
              v-model={state.conferenceName}
              label='会议室'
              readonly
            />
            <Field
              v-model={state.areaName}
              label='所属区域'
              readonly
            />
            <Field
              v-model={state.appointmentDate}
              label='预约日期'
              readonly
            />
            {isTimeIntervalVisible.value && (
              <Field
                v-model={state.formState.timeInterval}
                label='预约时间'
                isLink
                placeholder='请选择预约时间'
                rules={[{ required: checkFieldRequired('timeInterval'), message: '请选择预约时间' }]}
                readonly
                required={checkFieldRequired('timeInterval')}
                onClick={() => {
                  meetStore.reservationFormState = state.formState
                  meetStore.conferenceDetail = state
                  router.push({ path: '/reservation-time', query: { search: JSON.stringify({ ...search, activeTime: state.formState.timeInterval }) } })
                }}
              />
            )}
            {isGoodsNamesVisible.value && (
              <Field
                v-model={state.formState.goodsIds}
                label='物品使用登记'
                rules={[{ required: checkFieldRequired('goodsIds'), message: '请选择物品使用登记' }]}
                readonly
                required={checkFieldRequired('goodsIds')}
                v-slots={goodsSlots}
              />
            )}
            {isConferenceTypeVisible.value && (
              <Field
                v-model={state.formState.conferenceTypeName}
                label='会议类型'
                isLink
                placeholder='请选择会议类型'
                rules={[{ required: checkFieldRequired('conferenceType'), message: '请选择会议类型' }]}
                readonly
                required={checkFieldRequired('conferenceType')}
                onClick={() => {
                  state.showConferenceType = true
                }}
              />
            )}
            {isBookNumVisible.value && (
              <Field
                v-model={state.formState.bookNum}
                label='参会人数'
                placeholder='请输入参会人数'
                rules={[{ required: checkFieldRequired('bookNum'), validator: checkBookNum, message: '请输入参会人数' }]}
                required={checkFieldRequired('bookNum')}
                type='digit'
              />
            )}
            {isConferenceThemeVisible.value && (
              <Field
                v-model={state.formState.conferenceTheme}
                label='会议主题'
                maxlength='20'
                placeholder='请输入会议主题'
                show-word-limit
                rules={[{ required: checkFieldRequired('conferenceTheme'), message: '请输入会议主题' }]}
                required={checkFieldRequired('conferenceTheme')}
              />
            )}
            {isContentVisible.value && (
              <Field
                v-model={state.formState.content}
                label='会议内容'
                rows='2'
                autosize
                type='textarea'
                maxlength='200'
                placeholder='请输入会议内容'
                show-word-limit
                rules={[{ required: checkFieldRequired('content'), message: '请输入会议内容' }]}
                required={checkFieldRequired('content')}
              />
            )}
            {isParticipantIdsVisible.value && (
              <>
                <Field
                  v-model={state.formState.participantTypeText}
                  label='参会人员通知'
                  isLink
                  placeholder='请选择参会人员通知'
                  rules={[{ required: checkFieldRequired('participantIds'), message: '请选择参会人员通知' }]}
                  readonly
                  required={checkFieldRequired('participantIds')}
                  onClick={() => {
                    state.showParticipantType = true
                  }}
                />
                {
                  state.formState.participantType === 'DEPARTMENT' &&
                  <Field
                    label='选择部门'
                    placeholder='请选择部门'
                    v-model={state.formState.depName}
                    readonly
                    is-link
                    onClick={() => {
                      state.showDeptSelect = true
                    }}
                    rules={[{ required: checkFieldRequired('participantIds'), validator: checkParticipant, message: '请选择部门' }]}
                    required={checkFieldRequired('participantIds')}
                  />
                }
                {state.formState.participantType === 'ROLE' &&
                  <Field
                    label='选择角色'
                    placeholder='请选择角色'
                    v-model={state.formState.roleName}
                    readonly
                    is-link
                    onClick={() => {
                      state.showRoleSelect = true
                    }}
                    rules={[{ required: checkFieldRequired('participantIds'), validator: checkParticipant, message: '请选择角色' }]}
                    required={checkFieldRequired('participantIds')}
                  />
                }
                {state.formState.participantType === 'USER' &&
                  <Field
                    label='选择人员'
                    placeholder='请选择人员'
                    v-model={state.formState.userNames}
                    readonly
                    is-link
                    onClick={clickUser}
                    rules={[{ required: checkFieldRequired('participantIds'), validator: checkParticipant, message: '请选择人员' }]}
                    required={checkFieldRequired('participantIds')}
                  />
                }
              </>
            )}
          </Form>
        </div>
        <div class='footer'>
          <Button block type='primary' loading={state.loading} onClick={handleSubmit}>预约</Button>
        </div>
        <Popup v-model:show={state.showConferenceType} round position='bottom'>
          <Picker
            title='会议类型' columns={state.conferenceTypeOptions} onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
              state.formState.conferenceTypeName = selectedOptions[0].text
              state.formState.conferenceType = selectedOptions[0].value
              state.showConferenceType = false
            }} onCancel={() => {
              state.showConferenceType = false
            }}
          />
        </Popup>
        <Popup v-model:show={state.showParticipantType} round position='bottom'>
          <Picker
            title='参会人员通知'
            columns={state.participantTypeOptions}
            onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
              state.formState.participantTypeText = selectedOptions[0].text
              state.formState.participantType = selectedOptions[0].value
              state.showParticipantType = false
            }}
            onCancel={() => {
              state.showParticipantType = false
            }}
          />
        </Popup>
        <DeptSelect
          v-model:show={state.showDeptSelect}
          onClose={
            () => {
              state.showDeptSelect = false
            }
          }
          onConfirm={handleConfirmSelectDept}
        />
        <RoleSelect
          v-model:show={state.showRoleSelect}
          onClose={
            () => {
              state.showRoleSelect = false
            }
          }
          onConfirm={handleConfirmSelectRole}
        />
      </div>
    )
  }
})
