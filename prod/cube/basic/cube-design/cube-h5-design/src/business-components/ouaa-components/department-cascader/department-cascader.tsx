import { defineComponent, onMounted, ref } from 'vue'
import { Popup, NavBar, Cascader } from 'vant'
import { cubeOuaaService } from '../../../api/service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'

export const DepartmentCascader = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: ['confirm', 'close'],
  setup: (props, { emit }) => {
    const options = ref<DeptList[]>([])
    const select = ref<{ id: string; name: string; }>({
      id: props.value.id,
      name: props.value.name
    })

    const getData = async (): Promise<void> => {
      const res = await cubeOuaaService.getDept({ enabled: true })
      options.value = res
    }

    onMounted(() => {
      getData()
    })

    const handleCancel = (): void => {
      emit('close')
    }

    const handleConfirm = (): void => {
      emit('confirm', select.value)
    }

    const onChange = (selectedOption: { selectedOptions: DeptList[]; value: string; }): void => {
      const item = selectedOption.selectedOptions[selectedOption.selectedOptions.length - 1]
      select.value = {
        id: item.id,
        name: item.name
      }
    };

    return (): JSX.Element => (
      <>
        <Popup onClose={handleCancel} v-model:show={props.show} round position="bottom">
          <NavBar
            class="nav"
            title="部门选择"
            left-text="取消"
            right-text="确认"
            onClickLeft={handleCancel}
            onClickRight={handleConfirm}
          />
          <Cascader
            v-model={select.value.id}
            options={options.value}
            fieldNames={
              {
                text: 'name',
                value: 'id',
                children: 'children'
              }
            }
            onChange={onChange}
            showHeader={false} />
        </Popup>
      </>
    )
  }
})