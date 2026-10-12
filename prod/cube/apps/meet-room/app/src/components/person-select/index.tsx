import { defineComponent, reactive, ref, watch } from 'vue'
import { DeptCascaderSelect, RoleSelect } from '@ghcloud/cube-app-design'
import styles from './index.module.less'
import { Button, Select } from '@ghcloud/cube-ui'
import { UserPickerModal } from '@ghcloud/generic-component'
import { cubeOuaaService } from '@ghcloud/generic-component/src/api/service'
export enum PersonType {
  DEPARTMENT = 'DEPARTMENT',
  ROLE = 'ROLE',
  USER = 'USER'
}
export interface PersonSelectProps {
  type: PersonType | '';
  ids?: string[];
}
interface Props {
  value: PersonSelectProps;
}
export const PersonSelect = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const state = reactive({
      type: props.value?.type || 'DEPARTMENT',
      ids: props.value?.ids || [],
    })
    const users = ref<{ id: string; name: string; }[]>([])
    const getUserList = async (): Promise<void> => {
      const res = await cubeOuaaService.getTenantUserList({ userIds: state.ids ?? [] }, 'post')
      users.value = res?.map(item => ({
        name: item.name as string,
        id: item.id as unknown as string
      }))
    }
    watch(() => props.value, () => {
      state.type = props.value?.type || 'DEPARTMENT'
      state.ids = props.value?.ids || []
      if (state.type === 'USER' && state.ids?.length > 0) {
        getUserList()
      }
    })
    const typeOptions = [
      {
        label: '部门',
        value: 'DEPARTMENT'
      },
      {
        label: '角色',
        value: 'ROLE'
      },
      {
        label: '人员',
        value: 'USER'
      }
    ]
    const userPickerModalRef = ref<{ openModal: () => void; }>()
    const addUser = (): void => {
      userPickerModalRef.value?.openModal()
    }
    const usersHandle = async (val: { id: string; name: string; organizations: { id: string;name: string; }[]; }[]): Promise<void> => {
      users.value = val?.map(e => {
        return {
          id: e.id,
          name: e.name,
        }
      })
      state.ids = val?.map(e => e.id)
      emit('update:value', state)
    }

    return (): JSX.Element => (
      <div class={styles.container}>
        <Select
          v-model:value={state.type}
          options={typeOptions}
          style={{ width: '120px', marginRight: '5px' }}
          onChange={() => {
            state.ids = []
            emit('update:value', state)
          }}
        />
        <div class={styles.selectContainer}>
          {
            state.type === PersonType.DEPARTMENT && (
              <DeptCascaderSelect
                multiple
                maxTagCount={2}
                v-model:value={state.ids}
                onUpdate:value={() => {
                  emit('update:value', state)
                }}
              />
            )
          }
          {
            state.type === PersonType.ROLE && (
              <RoleSelect
                multiple
                maxTagCount={2}
                v-model:value={state.ids}
                onUpdate:value={() => {
                  emit('update:value', state)
                }}
              />
            )
          }
          {
            state.type === PersonType.USER && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  style={{ minWidth: '320px' }}
                  v-model:value={state.ids}
                  placeholder='请选择人员'
                  options={users.value}
                  open={false}
                  showArrow={false}
                  allowClear={false}
                  mode='multiple'
                  getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                  fieldNames={{ label: 'name', value: 'id' }}
                  maxTagCount={2}
                  onChange={() => {
                    users.value = users.value.filter(i => state.ids?.includes(i.id))
                    emit('update:value', state)
                  }}
                />
                <Button type='primary' onClick={addUser}>选择人员</Button>
              </div>
            )
          }

        </div>
        <UserPickerModal multiple ref={userPickerModalRef} v-model:value={users.value} onUpdate:value={usersHandle} />
      </div>
    )
  }
})
