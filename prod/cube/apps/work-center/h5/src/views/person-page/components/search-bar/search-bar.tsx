import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Picker, Popup, Search } from 'vant'
import styles from './search-bar.module.less'
import { useRoute } from 'vue-router'
import { DeptSelect } from '@/components/dept-select'
import { cubeOuaaService } from '@/api/server'

export interface PersonRouteQuery {
  sourceApp?: string;
  keyword: string;
  organizationId: string;
  organizationName?: string;
  positionName?: string;
  roleName?: string;
  positionId: string;
  roleId: string;
}
/** 选择人员搜索组件 */
export const SearchBar = defineComponent({
  props: {
    isWeek: {
      type: Boolean,
      default: true
    }
  },
  emits: ['confirm'],
  setup (props, { expose, emit }) {
    const route = useRoute()
    const formState = reactive<PersonRouteQuery>({
      keyword: '',
      organizationId: '',
      positionId: '',
      roleId: '',
      organizationName: '',
      positionName: '',
      roleName: '',
    })
    const showPop = ref(false)
    const showDeptPicker = ref(false)
    const showPositionPicker = ref(false)
    const showRolePicker = ref(false)
    const handleConfirmSelectDept = (value: { text: string;value: string; }[]): void => {
      formState.organizationId = value[0].value
      formState.organizationName = value[0].text
    }

    const reset = (): void => {
      for (const key in formState) {
        formState[key as keyof PersonRouteQuery] = ''
      }
    }
    const confirm = (): void => {
      showPop.value = false
      emit('confirm')
    }

    const initialData = async (): Promise<void> => {
      try {
        const position = await cubeOuaaService.getPositionList({ enabled: true })
        positionList.value = position.map(x => {
          return { text: x.name, value: x.id }
        })
        const role = await cubeOuaaService.getRole({ enabled: true })
        roleList.value = role.map(x => {
          return { text: x.name, value: x.id }
        })
      } catch {
      }
    }
    onMounted(async () => {
      initialData()
      handleQueryParams()
    })
    const handleQueryParams = (): void => {
      const queryParams = route.query as unknown as PersonRouteQuery
      formState.keyword = queryParams.keyword ?? ''
      formState.organizationId = queryParams.organizationId ?? ''
      formState.positionId = queryParams.positionId ?? ''
      formState.roleId = queryParams.roleId ?? ''
    }
    const getFormState = (): PersonRouteQuery => {
      return formState
    }
    const positionList = ref<{ value: string; text: string; }[]>([])
    const roleList = ref<{ value: string; text: string; }[]>([])
    expose({
      getFormState
    })

    return (): JSX.Element =>
      <>
        <Search
          v-model={formState.keyword}
          show-action
          placeholder='根据人员姓名进行搜索'
          onSearch={confirm}
          v-slots={{
            action: () => {
              return (
                <div style='display:flex'>
                  <div onClick={() => {
                    showPop.value = true
                  }}>筛选</div>
                </div>
              )
            }
          }}
        />
        <Popup
          v-model:show={showPop.value}
          position='right'
          style={{ width: '80%', height: '100%' }}
        >
          <div class={styles['pop-form']}>
            <div class={styles['form-item']}>
              <div class={styles.label}>部门</div>
              <input class={styles['value-input']} placeholder='选择部门' onClick={() => {
                showDeptPicker.value = true
              }} readonly value={formState.organizationName} />
            </div>
            <div class={styles['form-item']}>
              <div class={styles.label}>职位</div>
              <input class={styles['value-input']} placeholder='选择职位' onClick={() => {
                showPositionPicker.value = true
              }} readonly value={formState.positionName} />
            </div>
            <div class={styles['form-item']}>
              <div class={styles.label}>角色</div>
              <input class={styles['value-input']} placeholder='选择角色' onClick={() => {
                showRolePicker.value = true
              }} readonly value={formState.roleName} />
            </div>
          </div>
          <div class={styles['pop-footer']}>
            <span class={styles.reset} onClick={reset}>重置</span>
            <Button type='primary' onClick={confirm}>确定</Button>
          </div>
        </Popup>
        <DeptSelect v-model:show={showDeptPicker.value} onConfirm={handleConfirmSelectDept} />
        <Popup v-model:show={showPositionPicker.value} round position='bottom'>
          <Picker
            title='职位'
            columns={positionList.value}
            onConfirm={({ selectedOptions }: { selectedOptions: { value: string; text: string; }[]; }) => {
              formState.positionName = selectedOptions[0].text
              formState.positionId = selectedOptions[0].value
              showPositionPicker.value = false
            }}
            onCancel={() => {
              showPositionPicker.value = false
            }}
          />
        </Popup>
        <Popup v-model:show={showRolePicker.value} round position='bottom'>
          <Picker
            title='角色'
            columns={roleList.value}
            onConfirm={({ selectedOptions }: { selectedOptions: { value: string; text: string; }[]; }) => {
              formState.roleName = selectedOptions[0].text
              formState.roleId = selectedOptions[0].value
              showRolePicker.value = false
            }}
            onCancel={() => {
              showRolePicker.value = false
            }}
          />
        </Popup>
      </>
  }
})
