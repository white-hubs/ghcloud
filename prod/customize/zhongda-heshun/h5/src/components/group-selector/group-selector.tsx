import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import styles from './group-selector.module.less'
import { Popup, Picker, Icon } from 'vant'
import { storeKill } from '@/store/kill'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'

interface GroupOption {
  label: string;
  value: string;
}

export const GroupSelector = defineComponent({
  props: {
    activeGroup: {
      type: String,
      default: ''
    },
    groupOptions: {
      type: Array as PropType<GroupOption[]>,
      default: () => []
    }
  },
  emits: ['changeGroup'],
  setup: (props, { emit }) => {
    const store = storeKill()
    const showPicker = ref(false)
    const groups = ref(props.groupOptions)
    const currentGroup = ref([props.activeGroup])
    
    watch(
      () => props,
      (newValue) => {
        groups.value = props.groupOptions
        currentGroup.value = [props.activeGroup]
      },
      { deep: true }
    )

    const onConfirm = ({ selectedOptions }: { selectedOptions: GroupOption[]; }): void => {
      currentGroup.value = [selectedOptions[0].value]
      emit('changeGroup', selectedOptions[0])
      showPicker.value = false
      cubeWxService.postMessage({
        action: 'updateGroupActive',
        groupActive: {
          ...selectedOptions[0],
          id: selectedOptions[0]?.value,
          groupName: selectedOptions[0]?.label
        }
      }, false)
    }

    const onCancel = (): void => {
      showPicker.value = false
    }

    const groupText = computed(() => {
      const group = groups.value.find(item => item.value === currentGroup.value[0])
      store.setGroupChecked({ id: group?.value, groupName: group?.label})
      return group ? group.label : ''
    })

    return (): JSX.Element => (
      <div class={styles['group-selector']} onClick={() => {
        showPicker.value = true
      }}>
        <div class={styles['selector-content']}>
          <span class={styles.label}>{groupText.value || '选择分组'}</span>
          <span class={styles.arrow}>
            <Icon name="arrow-down" />
          </span>
        </div>
        <Popup
          v-model:show={showPicker.value}
          position="bottom"
          round
          closeOnClickOverlay={true}
          onClickOverlay={onCancel}
          teleport='#app'
        >
          <Picker
            title="选择分组"
            columns={groups.value}
            v-model={currentGroup.value}
            onConfirm={onConfirm}
            onCancel={onCancel}
            columns-field-names={{ text: 'label', value: 'value' }}
          />
        </Popup>
      </div>
    )
  }
})