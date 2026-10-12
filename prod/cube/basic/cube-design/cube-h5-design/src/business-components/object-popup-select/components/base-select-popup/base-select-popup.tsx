import { defineComponent, reactive, ref, watch } from 'vue'
import { Button, NavBar, Popup, Search } from 'vant'
import styles from './base-select-popup.module.less'

interface BaseSelectProps {
  value: string | string[];
  title?: string;
  multiple?: boolean;
  show: boolean;
}
interface SelectedItem {
  id: string;
  name: string;
}

export const BaseSelectPopup = defineComponent({
  props: ['value', 'title', 'multiple', 'show'],
  emits: ['update:show', 'update:value', 'ok', 'cancel', 'search'],
  setup (props: BaseSelectProps, { emit, slots }) {
    const showPicker = ref(props.show)

    watch(() => props.show, (val) => {
      showPicker.value = val
    })
    watch(() => showPicker.value, (val) => {
      emit('update:show', val)
    })
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: '',
    })
    const selectedIds = ref<string[]>([])
    const selectedItems = ref<SelectedItem[]>([])

    watch(() => props.value, () => {
      selectedIds.value = props.value ? (Array.isArray(props.value) ? props.value : [props.value]) : []
    }, { immediate: true })

    const confirm = (): void => {
      emit('ok', { ids: selectedIds.value, items: selectedItems.value })
      emit('update:value', props.multiple ? selectedIds.value : (selectedIds.value[0] || ''))
      showPicker.value = false
    }

    const cancel = (): void => {
      selectedIds.value = []
      selectedItems.value = []
      emit('cancel')
      emit('ok', { ids: selectedIds.value, items: selectedItems.value })
      emit('update:value', props.multiple ? selectedIds.value : (selectedIds.value[0] || ''))
      showPicker.value = false
    }

    const onSearch = (): void => {
      search.pageNumber = 0
      if (slots.onSearch) {
        slots.onSearch()
      }
      emit('search', search.keyword)
    }

    return (): JSX.Element =>
      <Popup v-model:show={showPicker.value} position="right" style={{ width: '100%', height: '100%' }} >
        <NavBar class={styles.nav} title={props.title ?? '选择'} left-text='清空' right-text='确认' onClickLeft={cancel} onClickRight={confirm} />
        <div class={styles['selected-page']}>
          <Search v-model={search.keyword} placeholder='根据对象名称进行搜索' show-action onSearch={onSearch} onClear={onSearch}
            v-slots={{
              action: () => (
                <>
                  <div key='back' onClick={onSearch}>搜索</div>
                </>
              )
            }}
          />
          {slots.default && slots.default({
            search,
            selectedIds: selectedIds.value,
            selectedItems: selectedItems.value,
            multiple: props.multiple
          })}
          {props.multiple && <div class={styles["selected-info"]}>
            <div class={styles["selected-tip"]}>
              已选：<span>{selectedIds.value.length}</span>项
            </div>
            <Button type='primary' size='small' loading-text='确定' onClick={confirm}>确定</Button>
          </div>
          }
        </div>
      </Popup>
  }
})