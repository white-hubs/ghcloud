import { defineComponent, onMounted, ref, watch } from 'vue'
import { NavBar, Popup, Cascader } from 'vant'
import type { CascaderOption } from 'vant'
import { cubeMdataService } from '../api/server'

interface Props {
  value: string;
  tenant?: string;
}
export const AreaPopupCascader = defineComponent({
  props: ['value', 'tenant'],
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

    const areaObj = ref<{ id: string[]; name: string; } | null>(null)
    const areaChange = ({ selectedOptions }: { selectedOptions: CascaderOption[]; }): void => {
      areaObj.value = {
        id: selectedOptions[selectedOptions.length - 1].id,
        name: selectedOptions.map(e => { return e.name as string }).join('/')
      }
    }
    const confirm = (): void => {
      emit('ok', areaObj.value)
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
    const areaOptions = ref<CascaderOption[]>([])
    onMounted(async () => {
      const res = await cubeMdataService.getAreaTree(props.tenant)
      for (const iterator of res) {
        removeNullChild(iterator)
      }
      areaOptions.value = res
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
          <NavBar class='nav' title='区域选择' left-text='清空' right-text='确认' onClickLeft={cancel} onClickRight={confirm} />
          <Cascader
            options={areaOptions.value}
            onChange={areaChange}
            show-header={false}
            v-model={select.value}
            field-names={{ text: 'name', value: 'id', children: 'children' }}
          />
        </Popup>
      </>
  }
})
