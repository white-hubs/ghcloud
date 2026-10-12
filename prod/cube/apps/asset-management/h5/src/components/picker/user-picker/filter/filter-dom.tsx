import { defineComponent, ref, watch, type PropType } from 'vue'
import styles from '../user-picker.module.less'
import { Button, Field, Form, Picker, Popup } from 'vant'
import { cubeOuaaService } from '@/api/server'
interface SearchType {
  pageNumber: number;
  total: number;
  pageSize: number;
  enable: boolean;
  keyword: string;
  organizationId: string;
  organizationName: string;
  positionId: string;
  roleId: string;
}
export const FilterDom = defineComponent({
  emits: ['searchForm', 'submit'],
  props: {
    searchForm: {
      type: Object as PropType<SearchType>,
      default: () => {
        return {
          pageNumber: 0,
          total: 1,
          pageSize: 10,
          enable: true,
          keyword: '',
          organizationId: '',
          positionId: '',
          roleId: ''
        }
      }
    }
  },
  setup: (props, { emit }) => {
    const search = ref({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      enable: true,
      keyword: '',
      organizationId: '',
      organizationName: '',
      positionId: '',
      roleId: ''
    })
    const depColumns = ref()
    const positionList = ref()
    const roleList = ref()
    const showDepPicker = ref(false)
    const initialData = async (): Promise<void> => {
      const dep = await cubeOuaaService.getDeptList({ enabled: true })
      depColumns.value = dep.map(x => {
        return { text: x.name, value: x.id }
      })
      const position = await cubeOuaaService.getPositionList({ enabled: true })
      positionList.value = position.map(x => {
        return { text: x.name, value: x.id }
      })
      const role = await cubeOuaaService.getRole({ enabled: true })
      roleList.value = role.map(x => {
        return { text: x.name, value: x.id }
      })
    }
    initialData()
    watch(() => props.searchForm, () => {
      search.value = props.searchForm
    }, { immediate: true, deep: true })
    watch(() => search.value, () => {
      emit('searchForm', search.value)
    }, { immediate: true, deep: true })
    return (): JSX.Element =>
      <div class={styles.filter}>
        <Form>
          <p>人员部门</p>
          <div>
            <Field
              style='width:186px'
              v-model={search.value.organizationName} is-link
              readonly
              name='organizationId'
              placeholder='选择部门'
              onClick={() => {
                showDepPicker.value = true
              }}
            />
            <Popup v-model:show={showDepPicker.value} position='bottom'>
              <Picker
                columns={depColumns.value}
                onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
                  search.value.organizationId = selectedOptions[0]?.value ?? ''
                  search.value.organizationName = selectedOptions[0]?.text ?? ''
                  showDepPicker.value = false
                }}
                onCancel={() => {
                  showDepPicker.value = false
                }}
              />
            </Popup>
          </div>
          <p>职位</p>
          <div class={styles['radio-select']}>
            {
              positionList.value?.map((item: { code: string ; value: string; text: string; }) => {
                return (
                  <Button
                    size='small'
                    plain
                    key={item.code}
                    class={search.value.positionId === item.value ? styles.active : ''}
                    onClick={() => {
                      search.value.positionId = item.value
                    }}
                  >
                    {item.text}
                  </Button>
                )
              })
            }
          </div>
          <p>角色</p>
          <div class={styles['radio-select']}>
            {
              roleList.value?.map((item: { code: string ; value: string; text: string; }) => {
                return (
                  <Button
                    size='small'
                    plain
                    key={item.code}
                    class={search.value.roleId === item.value ? styles.active : ''}
                    onClick={() => {
                      search.value.roleId = item.value
                    }}
                  >
                    {item.text}
                  </Button>
                )
              })
            }
          </div>
        </Form>
        <div class={styles['filter-button']}>
          <div
            style={{ marginRight: '16px', width: '60px' }}
            onClick={() => {
              search.value = {
                pageNumber: 0,
                total: 1,
                pageSize: 10,
                enable: true,
                keyword: '',
                organizationId: '',
                organizationName: '',
                positionId: '',
                roleId: ''
              }
            }}
          >
            重置
          </div>
          <Button
            block size='small' type='primary'
            onClick={() => {
              emit('submit', search.value)
            }}
          >
            提交
          </Button>
        </div>
      </div>
  }
})
