import { defineComponent, reactive, ref } from 'vue'
import { List, PullRefresh, Empty, Tag, Checkbox, CheckboxGroup } from 'vant'
import { cubeDeviceCenterService } from '../../../api/service'
import type { DeviceInstancePage } from '@ghcloud/cube-iot-center-service'
import styles from './base-select-popup/base-select-popup.module.less'

interface DeviceListSelectProps {
  value: string[];
  selectedItems?: DeviceInstancePage[];
  multiple?: boolean;
}

export const DeviceListSelect = defineComponent({
  props: ['value', 'selectedItems', 'multiple'],
  emits: ['update:value', 'update:selectedItems', 'select'],
  setup (props: DeviceListSelectProps, { emit, expose }) {
    const dataSource = ref<DeviceInstancePage[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: ''
    })
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDeviceCenterService.getDeviceInstancePageAll(search)
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const toggle = (item: DeviceInstancePage): void => {
      let newIds: string[] = [...props.value]
      let newItems: DeviceInstancePage[] = [...(props.selectedItems || [])]
      const curId = `${item.id || ''}`
      if (!props.multiple) {
        newIds = [curId]
        newItems = [item]
      } else {
        const index = props.value.findIndex(id => id === curId)
        if (index === -1) {
          newIds.push(curId)
          newItems.push(item)
        } else {
          newIds.splice(index, 1)
          newItems.splice(index, 1)
        }
      }
      emit('update:value', newIds)
      emit('update:selectedItems', newItems)
      emit('select', { ids: newIds, items: newItems })
    }
    const clearSelection = (): void => {
      emit('update:value', [])
      emit('update:selectedItems', [])
      emit('select', { ids: [], items: [] })
    }
    const handleSearch = (keyword: string): void => {
      finished.value = false
      search.keyword = keyword
      search.pageNumber = 0
      dataSource.value = []
      onLoad()
    }
    expose({
      clearSelection,
      handleSearch
    })
    return (): JSX.Element =>
      <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['list-pull-refresh']} style={{ height: props.multiple ? 'calc(100vh - 210px)' : 'calc(100vh - 150px)' }}>
        <List
          v-model:loading={loading.value}
          finished={finished.value}
          finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
          onLoad={onLoad}
        >
          {dataSource.value.length > 0 && dataSource.value.map((item, index) =>
            <CheckboxGroup key={index} modelValue={props.value} shape={props.multiple ? 'square' : ''}>
              <div class={styles["cell-group"]} onClick={() => toggle(item)}>
                <div class={styles["title"]}>
                  <span class={styles["title-name"]}>
                    {item.code ?? '--'}
                    {item?.status?.onlineState ?
                      <Tag size='medium' class={[styles.tag]}>在线</Tag> :
                      <Tag size='medium' class={[styles.tag, styles.gray]}>离线</Tag>
                    }
                  </span>
                  <Checkbox name={item.id} />
                </div>
                <div class={styles.content}>
                  <div><span class={styles.label}>设备名称：</span><span>{item.name}</span></div>
                  <div><span class={styles.label}>品类：</span><span>{item?.productInfo?.productCategory?.name}</span></div>
                  <div><span class={styles.label}>所属区域：</span><span>{item?.area?.pathName}</span></div>
                </div>
              </div>
            </CheckboxGroup>)}
          {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
        </List>
      </PullRefresh>
  }
})