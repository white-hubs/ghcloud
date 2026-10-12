import { defineComponent, reactive, type PropType } from 'vue'
import { RadioGroup, Radio } from 'vant'
import styles from './index.module.less'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
export const PersonList = defineComponent({
  props: {
    dataList: {
      type: Array as PropType<PersonItem[]>,
      default: () => []
    },
    checked: {
      type: String,
      default: () => ''
    }
  },
  emits: ['update:checked'],
  setup: (props, { emit }) => {
    const state = reactive({
      checked: ''
    })
    const handleCheckPerson = (name: string): void => {
      const checkedInfo = props.dataList.find(item => item.id === name)
      if (!checkedInfo) return
      const updateInfo = {
        userId: checkedInfo.id,
        userName: checkedInfo.name,
        departmentId: checkedInfo.organizations[0] ? checkedInfo.organizations[0].id : '',
        departmentName: checkedInfo.organizations[0] ? checkedInfo.organizations[0].name : ''
      }

      emit('update:checked', updateInfo)
    }
    return (): JSX.Element=> (
      <>
        <RadioGroup v-model={state.checked} onChange={handleCheckPerson}>
          <div class={styles.personList}>
            {props.dataList.map(item => {
              return (
                <div class={styles.personItem} key={item.id}>
                  <div class={styles.personInfo}>
                    <div class={styles.personImg}>{item.name.slice(item.name.length - 2, item.name.length)}</div>
                    <div class={styles.info}>
                      <div class={styles.personName}>{item.name}</div>
                      <div class={styles.infoItem}>
                        <div class={styles.label}>部门：</div>
                        <div class={styles.value}>{
                          item.organizations.length > 0 ? item.organizations.map((orgItem, index) => {
                            return <span key={orgItem.id}>{orgItem.name}{index !== item.organizations.length - 1 ? <span>-</span> : ''}</span>
                          }) : '--'
                        }
                        </div>
                      </div>
                      <div class={styles.infoItem}>
                        <div class={styles.label}>电话：</div>
                        <div class={styles.value}>{item.mobile}</div>
                      </div>
                    </div>

                  </div>
                  <div class={styles.radio}>
                    <Radio name={item.id} />
                  </div>
                </div>
              )
            })}

          </div>
        </RadioGroup>

      </>
    )
  }
})
