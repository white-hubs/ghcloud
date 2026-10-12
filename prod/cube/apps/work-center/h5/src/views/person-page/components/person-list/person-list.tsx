import { defineComponent, watch, type PropType } from 'vue'
import { CheckboxGroup, Checkbox } from 'vant'
import styles from './person-list.module.less'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'

const workStatusTextMap: Record<string, string> = {
  REST: '休息',
  WORKING: '在岗',
  LEAVE_POST: '离岗',
  AWAY_BUSINESS: '出差',
  ASK_LEAVE: '请假',
}

const workStatusClassMap: Record<string, string> = {
  REST: styles.rest,
  WORKING: styles.working,
  LEAVE_POST: styles.leavePost,
  AWAY_BUSINESS: styles.awayBusiness,
  ASK_LEAVE: styles.askLeave,
}

const getWorkStatusInfo = (raw?: string): { text: string; className: string; } => {
  const code = (raw && raw.trim()) || 'LEAVE_POST'
  const text = workStatusTextMap[code] ?? workStatusTextMap.LEAVE_POST
  const className = workStatusClassMap[code] ?? workStatusClassMap.LEAVE_POST
  return { text, className }
}

export const PersonList = defineComponent({
  props: {
    dataList: {
      type: Array as PropType<PersonItem[]>,
      default: () => []
    },
    checked: {
      type: Array as PropType<string[]>,
      default: () => ''
    },
    multiple: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ['update:checked'],
  setup: (props, { emit }) => {
    const toggle = (index: number): void => {
      if (!props.multiple) {
        const checked = [props.dataList[index].id]
        emit('update:checked', checked)
      } else {
        if (props.checked.includes(props.dataList[index].id)) {
          const checked = props.checked.filter(item => item !== props.dataList[index].id)
          emit('update:checked', checked)
          return
        }
        const checked = [...props.checked, props.dataList[index].id]
        emit('update:checked', checked)
      }
    }
    watch(()=> props, ()=> {
    }, { deep: true, immediate: true })
    return (): JSX.Element => (
      <>
        <CheckboxGroup modelValue={props.checked} shape={props.multiple ? 'square' : ''}>
          <div class={styles.personList}>
            {props.dataList.map((item, index) => {
              return (
                <div class={styles.personItem} key={item.id} onClick={() => {
                  toggle(index)
                }}>
                  <div class={styles.personInfo}>
                    <div class={styles.personImg}>
                      <div>{item.name.slice(item.name.length - 2, item.name.length)}</div>
                    </div>
                    <div class={styles.info}>
                      <div class={styles.personName}>{item.name}</div>
                      <div class={styles.infoItem}>
                        <div class={styles.label}>部门：</div>
                        <div class={styles.value}>{
                          item.organizations.length > 0 && item.organizations.map((orgItem, index) => {
                            return <span key={orgItem.id}>{orgItem.name}{index !== item.organizations.length - 1 ? <span>-</span> : ''}</span>
                          })
                        }{item.organizations.length === 0 && '--'}
                        </div>
                      </div>
                      <div class={styles.infoItem}>
                        <div class={styles.label}>电话：</div>
                        <div class={styles.value}>{item.mobile}</div>
                      </div>
                      <div class={styles.infoItem}>
                        <div class={styles.label}>员工状态：</div>
                        {(() => {
                          const { text, className } = getWorkStatusInfo((item as unknown as { workStatus?: string; }).workStatus)
                          return (
                            <div class={[styles.value, styles.workStatusTag, className]}>
                              {text}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                  </div>
                  <div class={styles.radio}>
                    <Checkbox
                      name={item.id}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CheckboxGroup>

      </>
    )
  }
})
