import { defineComponent, ref, watch } from 'vue'
import styles from '../asset-list.module.less'
import { Button, DatePicker, Field, Form, Picker, Popup, showNotify } from 'vant'
import dayjs from 'dayjs'
import { AssetSelect } from './asset-select'
import { cubeOuaaService } from '@/api/server'
export const FilterDom = defineComponent({
  emits: ['searchForm', 'submit'],
  props: {
    searchForm: {
      type: Object,
      default: () => {
        return {
          pageNumber: 0,
          total: 1,
          pageSize: 10,
          status: '',
          purchaseStartDate: '',
          purchaseEndDate: '',
          usageDate: ''
        }
      }
    }
  },
  setup: (props, { emit }) => {
    const search = ref<Record<string, string | number>>({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      sourceName: '',
      sourceId: '',
      typeId: '',
      typeName: '',
      receiveDepId: '',
      receiveDepName: '',
      purchaseStartDate: '',
      purchaseEndDate: '',
      usageDate: ''
    })
    const depColumns = ref()
    const showDepPicker = ref(false)
    const showPurchaseStartPicker = ref(false)
    const showPurchaseEndPicker = ref(false)
    const showUsageDatePicker = ref(false)
    const showAssetPicker = ref(false)
    const assetType = ref('assetType')
    // 开始时间
    const handleStartPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showPurchaseStartPicker.value = false
      const time = selectedOptions.map((item) => item.text).join('-') + ' 00:00:00'
      const purchaseEndDate = dayjs(search.value.purchaseEndDate).valueOf()
      const purchaseStartDate = dayjs(time).valueOf()
      if (search.value.purchaseEndDate && purchaseEndDate < purchaseStartDate) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        search.value.purchaseStartDate = ''
        return
      }
      search.value.purchaseStartDate = time
    }
    // 结束时间
    const handleEndPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showPurchaseEndPicker.value = false
      const time = selectedOptions.map((item) => item.text).join('-') + ' 23:59:59'
      const purchaseEndDate = dayjs(time).valueOf()
      const purchaseStartDate = dayjs(search.value.purchaseStartDate).valueOf()
      if (search.value.purchaseStartDate && purchaseEndDate < purchaseStartDate) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        search.value.purchaseEndDate = ''
        return
      }
      search.value.purchaseEndDate = time
    }
    // 过期时间
    const handleUsagePicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showUsageDatePicker.value = false
      search.value.usageDate = selectedOptions.map((item) => item.text).join('-')
    }
    // 资产类别和来源
    const handleAsset = (val: { id: string;name: string; }): void => {
      if (assetType.value === 'assetType') {
        search.value.typeId = val.id
        search.value.typeName = val.name
      } else {
        search.value.sourceId = val.id
        search.value.sourceName = val.name
      }
      showAssetPicker.value = false
    }
    const getDeptData = async (): Promise<void> => {
      const list = await cubeOuaaService.getDeptList({ enabled: true })
      depColumns.value = list.map(x => {
        return { text: x.name, value: x.id }
      })
    }
    getDeptData()
    watch(() => props.searchForm, () => {
      search.value = props.searchForm
    }, { immediate: true, deep: true })
    watch(() => search.value, () => {
      emit('searchForm', search.value)
    }, { immediate: true, deep: true })
    return (): JSX.Element =>
      <div class={styles.filter}>
        <Form>
          <p>资产类别</p>
          <div>
            <Field
              style='width:186px'
              v-model={search.value.typeName} is-link
              readonly
              name='purchaseStartDate'
              placeholder='选择资产类别'
              onClick={() => {
                showAssetPicker.value = true; assetType.value = 'assetType'
              }}
            />
          </div>
          <p>使用部门</p>
          <div>
            <Field
              style='width:186px'
              v-model={search.value.receiveDepName} is-link
              readonly
              name='receiveDepName'
              placeholder='选择部门'
              onClick={() => {
                showDepPicker.value = true
              }}
            />
            <Popup v-model:show={showDepPicker.value} position='bottom'>
              <Picker
                columns={depColumns.value}
                onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
                  search.value.receiveDepId = selectedOptions[0]?.value ?? ''
                  search.value.receiveDepName = selectedOptions[0]?.text ?? ''
                  showDepPicker.value = false
                }}
                onCancel={() => {
                  showDepPicker.value = false
                }}
              />
            </Popup>
          </div>
          <p>资产来源</p>
          <div>
            <Field
              style='width:186px'
              v-model={search.value.sourceName} is-link
              readonly
              name='purchaseStartDate'
              placeholder='选择资产来源'
              onClick={() => {
                showAssetPicker.value = true; assetType.value = 'assetSource'
              }}
            />
          </div>
          <p>购入时间</p>
          <div style={{ display: 'flex' }}>
            <Field
              v-model={search.value.purchaseStartDate}
              is-link
              readonly
              name='purchaseStartDate'
              placeholder='开始时间'
              onClick={() => {
                showPurchaseStartPicker.value = true
              }}
            />
            <Field
              v-model={search.value.purchaseEndDate}
              is-link
              readonly
              name='purchaseStartDate'
              placeholder='结束时间'
              onClick={() => {
                showPurchaseEndPicker.value = true
              }}
            />
            <Popup v-model:show={showPurchaseStartPicker.value} position='bottom'>
              <DatePicker onConfirm={handleStartPicker} onCancel={() => {
                showPurchaseStartPicker.value = false
              }} />
            </Popup>
            <Popup v-model:show={showPurchaseEndPicker.value} position='bottom'>
              <DatePicker onConfirm={handleEndPicker} onCancel={() => {
                showPurchaseEndPicker.value = false
              }} />
            </Popup>
          </div>
          <p>过期时间</p>
          <Field
            style='width:186px'
            v-model={search.value.usageDate}
            is-link
            readonly
            name='usageDate'
            placeholder='选择时间'
            onClick={() => {
              showUsageDatePicker.value = true
            }}
          />
          <Popup v-model:show={showUsageDatePicker.value} position='bottom'>
            <DatePicker onConfirm={handleUsagePicker} onCancel={() => {
              showUsageDatePicker.value = false
            }} />
          </Popup>
        </Form>
        <div class={styles['filter-button']}>
          <div
            style={{ marginRight: '16px', width: '60px' }}
            onClick={() => {
              search.value = {
                sourceName: '',
                sourceId: '',
                typeId: '',
                typeName: '',
                receiveDepId: '',
                receiveDepName: '',
                purchaseStartDate: '',
                purchaseEndDate: '',
                usageDate: ''
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
        <Popup v-model:show={showAssetPicker.value} position='right' style='height:100%;width:100%'>
          <AssetSelect assetType={assetType.value} onSubmit={(val: { id: string;name: string; }) => {
            handleAsset(val)
          }} />
        </Popup>
      </div>
  }
})
