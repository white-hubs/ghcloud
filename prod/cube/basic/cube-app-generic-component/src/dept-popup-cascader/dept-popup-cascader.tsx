import { defineComponent, onMounted, ref, watch } from 'vue'
import { NavBar, Popup, Cascader } from 'vant'
import type { CascaderOption } from 'vant'
import { cubeOuaaService } from '../api/server'

interface Props {
  value: string;
  title?: string;
}
export const DeptPopupCascader = defineComponent({
  props: ['value', 'title'],
  emits: ['ok'],
  setup (props: Props, { emit, expose }) {
    const select = ref(props.value)
    watch(() => props.value, () => {
      select.value = props.value ?? ''
    }, { immediate: true })

    const showPicker = ref(false)
    const openPopup = (): void => {
      showPicker.value = true
    }

    const deptObj = ref<{ id: string[]; name: string; } | null>(null)
    const deptChange = ({ selectedOptions }: { selectedOptions: CascaderOption[]; }): void => {
      deptObj.value = {
        id: selectedOptions[selectedOptions.length - 1].id,
        name: selectedOptions.map(e => {
          return e.name as string
        }).join('/')
      }
    }
    const confirm = (): void => {
      emit('ok', deptObj.value)
      showPicker.value = false
    }
    const cancel = (): void => {
      select.value = ''
      emit('ok', {
        id: '',
        name: ''
      })
      showPicker.value = false
    }
    const deptOptions = ref<CascaderOption[]>([])
    onMounted(async () => {
      const res = await cubeOuaaService.getDeptList()
      for (const iterator of res) {
        removeNullChild(iterator)
      }
      deptOptions.value = res
    })
    const removeNullChild = (option: CascaderOption): void => {
      if (option.children) {
        if (option.children.length === 0) {
          delete option.children
        } else {
          for (const iterator of option.children) {
            removeNullChild(iterator)
          }
        }
      }
    }
    expose({
      openPopup
    })
    return () =>
      <>
        <Popup v-model:show={showPicker.value} round position='bottom'>
          <NavBar class='nav' title={props.title ?? '部门选择'} left-text='清空' right-text='确认' onClickLeft={cancel} onClickRight={confirm} />
          <Cascader
            options={deptOptions.value}
            onChange={deptChange}
            show-header={false}
            v-model={select.value}
            field-names={{ text: 'name', value: 'id', children: 'children' }}
          />
        </Popup>
      </>
  }
})
