import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import styles from '@/views/energy-overview/index.module.less'
import './card.module.less'
import { storeEnergy } from '@/store/energy'
import { DropdownMenu, DropdownItem, ConfigProvider, Cascader, Popup, type CascaderOption, NavBar } from 'vant'
import { cubeEnergyManagementService } from '@/api/server'
import dayjs from 'dayjs'
export const Card = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    showDate: {
      type: Boolean,
      default: true
    },
    showType: {
      type: Boolean,
      default: true
    },
    showArea: {
      type: Boolean,
      default: false
    },
    showAreaPop: {
      type: Boolean,
      default: false
    },
  },
  emits: ['change'],
  setup: (props, { slots, emit }) => {
    const piniaStoreEnergy = storeEnergy()
    const themeVars = {
      dropdownMenuHeight: '30px'
    }
    const dateArr = [
      {
        label: '日',
        type: 'TODAY',
        value: dayjs().format('YYYY-MM-DD 00:00:00') + ',' + dayjs().format('YYYY-MM-DD HH:mm:ss')
      },
      {
        label: '月',
        type: 'THIS_MONTH',
        value: dayjs().startOf('month').format('YYYY-MM-DD 00:00:00') + ',' + dayjs().endOf('months').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        label: '年',
        type: 'THIS_YEAR',
        value: dayjs().startOf('year').format('YYYY-MM-DD 00:00:00') + ',' + dayjs().endOf('year').format('YYYY-MM-DD HH:mm:ss')
      },
    ]
    const cascaderValue = ref([])
    const options = ref<any[]>([])
    const areaOptions = ref<any[]>([])
    const show = ref(false)
    const showAreaFlag = ref(false)
    const fieldValue = ref({
      id: '',
      name: '分项层级'
    })
    const areaValue = ref({
      id: '',
      name: '区域层级'
    })
    const currentPrams = reactive({
      date: dayjs().format('YYYY-MM-DD 00:00:00') + ',' + dayjs().format('YYYY-MM-DD HH:mm:ss'),
      type: 'electricity_meter',
      dateType: 'TODAY'
    })
    const changeDate = (item: { label: string;value: string;type: string; }): void => {
      if (currentPrams.date !== item.value) {
        currentPrams.date = item.value
        currentPrams.dateType = item.type
        emit('change', { period: currentPrams.date, type: currentPrams.dateType, instrumentType: currentPrams.type, projectIds: fieldValue.value.id, projectAreaIds: areaValue.value.id })
      }
    }
    const filterTree = (arr: any[]): any => {
      return arr.map(node => {
        if (node.children && node.children.length > 0) {
          node.children = filterTree(node.children)
          return node
        } else {
          node.children = null
          return node
        }
      })
    }
    const getProjectTreeSpecial = async (): Promise<void> => {
      if (props.showArea) {
        const data = await cubeEnergyManagementService.projectTreeSpecial({ instrumentType: currentPrams.type })
        if (data[0]?.children.length) {
          options.value = filterTree(data[0]?.children)
        } else {
          options.value = []
        }
      }
    }
    const getAreaProjectTree = async (): Promise<void> => {
      if (props.showAreaPop) {
        areaOptions.value = await cubeEnergyManagementService.AreaProjectTree({ instrumentType: currentPrams.type })
        areaOptions.value = filterTree(areaOptions.value)
      }
    }
    const openPopup = (): void => {
      show.value = true
    }
    const openAreaPopup = (): void => {
      showAreaFlag.value = true
    }
    const areaChange = ({ selectedOptions }: { selectedOptions: CascaderOption[]; }): void => {
      fieldValue.value = {
        id: selectedOptions.map(e => e.id).join(','),
        name: selectedOptions.map(e => e.projectName).join('/')
      }
      emit('change', { period: currentPrams.date, type: currentPrams.dateType, instrumentType: currentPrams.type, projectIds: fieldValue.value.id, projectAreaIds: areaValue.value.id })
    }
    const areaItemChange = ({ selectedOptions }: { selectedOptions: CascaderOption[]; }): void => {
      areaValue.value = {
        id: selectedOptions.map(e => e.id).join(','),
        name: selectedOptions.map(e => e.areaName).join('/')
      }
      emit('change', { period: currentPrams.date, type: currentPrams.dateType, instrumentType: currentPrams.type, projectIds: fieldValue.value.id, projectAreaIds: areaValue.value.id })
    }
    const changeType = (): void => {
      getProjectTreeSpecial()
      getAreaProjectTree()
      cascaderValue.value = []
      fieldValue.value = {
        id: '',
        name: '分项层级'
      }
      areaValue.value = {
        id: '',
        name: '区域层级'
      }
      emit('change', { period: currentPrams.date, type: currentPrams.dateType, instrumentType: currentPrams.type, projectIds: fieldValue.value.id, projectAreaIds: areaValue.value.id })
    }
    const cancel = (): void => {
      cascaderValue.value = []
      fieldValue.value = {
        id: '',
        name: '分项层级'
      }
      areaValue.value = {
        id: '',
        name: '区域层级'
      }
      show.value = false
      showAreaFlag.value = false
    }
    onMounted(() => {
      getProjectTreeSpecial()
      getAreaProjectTree()
      emit('change', { period: currentPrams.date, type: currentPrams.dateType, instrumentType: currentPrams.type, projectIds: fieldValue.value.id })
    })
    watch(() => [piniaStoreEnergy.energyType], () => {
      currentPrams.type = piniaStoreEnergy.energyType[0]?.value
    })
    return () => (
      <>
        <div class={[styles.card]}>
          <div class={styles.head}>
            <div>
              {props.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ConfigProvider v-show={props.showType} theme-vars={themeVars}>
                <DropdownMenu style={{ width: '50px' }}>
                  <DropdownItem teleport='#app' v-model={currentPrams.type} options={piniaStoreEnergy.energyType} onChange={changeType} />
                </DropdownMenu>
              </ConfigProvider>
              <div v-show={props.showArea} class={styles.areTitle} onClick={openPopup}>{fieldValue.value.name}</div>
              <div v-show={props.showAreaPop} class={styles.areTitle} onClick={openAreaPopup}>{areaValue.value.name}</div>
              <div class={styles['date-selection']} v-show={props.showDate}>
                {
                dateArr.map((item) => {
                  return <div key={item.label} onClick={() => { changeDate(item) }} class={currentPrams.date === item.value ? styles.activation : styles['date-selection-item']}>{item.label}</div>
                })
              }
              </div>
            </div>
          </div>
          {slots.default?.()}
        </div>
        <Popup teleport='#app' z-index='9999' v-model:show={show.value} round position='bottom' lazy-render={false}>
          <NavBar class='nav' title='分项选择' left-text='清空' right-text='确认' onClickLeft={cancel} onClickRight={() => { show.value = false }} />
          <Cascader
            options={options.value}
            show-header={false}
            onChange={areaChange}
            v-model={cascaderValue.value}
            field-names={{ text: 'projectName', value: 'id', children: 'children' }}
          />
        </Popup>
        <Popup teleport='#app' z-index='9999' v-model:show={showAreaFlag.value} round position='bottom' lazy-render={false}>
          <NavBar class='nav' title='区域层级' left-text='清空' right-text='确认' onClickLeft={cancel} onClickRight={() => { showAreaFlag.value = false }} />
          <Cascader
            options={areaOptions.value}
            show-header={false}
            onChange={areaItemChange}
            v-model={cascaderValue.value}
            field-names={{ text: 'areaName', value: 'id', children: 'children' }}
          />
        </Popup>
      </>
    )
  }
})
