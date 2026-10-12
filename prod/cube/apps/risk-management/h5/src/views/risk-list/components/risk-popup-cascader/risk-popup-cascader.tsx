import { defineComponent, onMounted, ref, watch } from 'vue'
import { NavBar, Popup, Cascader } from 'vant'
import type { CascaderOption } from 'vant'
import { cubeDictionaryService } from '@ghcloud/cube-app-generic-component/src/api/server'
import type { CascadeDictionaryItem, DictionaryTree } from '@ghcloud/cube-dictionary-service/src/type'

interface Props {
  value: string;
}
export const RiskPopupCascader = defineComponent({
  props: ['value'],
  emits: ['ok', 'selectedOption'],
  setup (props: Props, { emit, expose }) {
    const select = ref(props.value)
    watch(() => props.value, () => {
      select.value = props.value ?? ''
    }, { immediate: true, deep: true })

    const showPicker = ref(false)
    const openPopup = (): void => {
      showPicker.value = true
    }

    const riskObj = ref<{ code: string[] | string; name: string; } | null>(null)
    const riskChange = ({ selectedOptions }: { selectedOptions: CascaderOption[]; }): void => {
      riskObj.value = {
        code: selectedOptions[selectedOptions.length - 1].code,
        name: selectedOptions.map(e => { return e.name as string }).join('/')
      }
    }
    const confirm = (): void => {
      emit('ok', riskObj.value)
      showPicker.value = false
    }
    const cancel = (): void => {
      select.value = ''
      riskObj.value = {
        code: '',
        name: ''
      }
      emit('ok', riskObj.value)
      showPicker.value = false
    }
    const dictionaryOptions = ref<CascadeDictionaryItem[]>([])
    onMounted(async () => {
      const res = await cubeDictionaryService.getDictionaryTree({ itemCode: 'risk-source-type' })
      if (res?.length) {
        for (const iterator of res) {
          removeNullChild(iterator)
        }
      }
      dictionaryOptions.value = res ?? []
      riskObj.value = {
        code: select.value,
        name: getNode(dictionaryOptions.value, select.value)?.name ?? ''
      }
      emit('selectedOption', riskObj.value)
    })
    const getNode = (list: DictionaryTree[], code: string): DictionaryTree | undefined => {
      let stark: DictionaryTree[] = []
      stark = stark.concat(list)
      while (stark.length) {
        const temp = stark.shift()
        if (temp?.nextList) {
          stark = stark.concat(temp.nextList)
        }
        if (temp?.code === code) {
          return temp
        }
      }
    }
    const removeNullChild = (option: CascaderOption): void => {
      if (option.nextList) {
        if (option.nextList.length === 0) {
          delete option.nextList
        } else {
          for (const iterator of option.nextList) {
            removeNullChild(iterator)
          }
        }
      }
    }
    expose({
      openPopup
    })
    return (): JSX.Element =>
      <>
        <Popup v-model:show={showPicker.value} round position='bottom'>
          <NavBar class='nav' title='风险源分类选择' left-text='清空' right-text='确认' onClickLeft={cancel} onClickRight={confirm} />
          <Cascader
            options={dictionaryOptions.value}
            onChange={riskChange}
            show-header={false}
            v-model={select.value}
            field-names={{ text: 'name', value: 'code', children: 'nextList' }}
          />
        </Popup>
      </>
  }
})
