import { defineComponent, ref } from 'vue'
import { ChartGlobalImage } from '../chart-global-image'
import { createUuid } from '@/utils'
import './tab.less'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { Input, Icon, Search } from '@ghcloud/visual-view-ui'
import { useMenuDragger } from '@/packages/use-resource-dragger'

import { ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
export const ChartTab = defineComponent({
  setup: () => {
    /**
     * 初始化配置
     */
    const initOptions: CreateComponentType[] = [
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'device-statistics',
        title: '设备总统计',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          showDate: true,
          devicesNum: true,
          title: '',
          showRatio: true,
          deviceStatus: true,
          deviceType: true,
          legendDirection: 'direction-top',
          showList: true,
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 500,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'device-status',
        title: '设备状态',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          deviceNum: true,
          deviceNumStyle: 'numIcon',
          deviceNumStyleInner: 'registerNum',
          deviceStatus: true,
          statusStyle: 'statusNumIon',
          statusStyleInner: 'numName',
          numStyle: ['normal', 'fault', 'alarm', 'offline'],
          statusDistribution: true,
          distributionStyle: 'pie',
          distributionStyleInner: 'radius',
          chartPosition: 'direction-top',
          showList: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'device-type',
        title: '设备类型',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          statusDistribution: true,
          chartStyle: 'pie',
          chartStyleInner: 'radius',
          chartPosition: 'direction-top',
          deviceStatusDetail: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'device-fault-conditions',
        title: '设备故障',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          deviceRange: ['allDevice'],
          isDeviceFault: true,
          deviceFaultStyle: { main: 'pie', item: 'radius' },
          isDeviceFaultDistribution: true,
          distributionStyle: { main: 'pie', item: 'radius' },
          legendDirection: 'direction-right',
          isDeviceFaultItem: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 400,
          width: 500,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'device-offline',
        title: '设备离线',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          deviceOffline: true,
          deviceOfflineStyle: 'numIcon',
          deviceOfflineStyleInner: 'registerNum',
          deviceOfflineDistribution: true,
          distributionStyle: 'histogram',
          distributionStyleInner: 'horizontal-bar-chart',
          chartPosition: 'bottom',
          deviceDetailList: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 500,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'device-abnormal',
        title: '设备异常',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          deviceAbnormal: true,
          deviceAbnormalStyle: 'numIcon',
          deviceAbnormalStyleInner: 'registerNum',
          deviceAbnormalTrend: true,
          distributionStyle: 'histogram',
          distributionStyleInner: 'horizontal-bar-chart',
          chartPosition: 'bottom',
          deviceDetailList: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 500,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'alarm-status',
        title: '报警状态',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          alarmNum: true,
          alarmNumStyle: 'numIcon',
          alarmNumStyleInner: 'registerNum',
          alarmStatus: true,
          statusStyle: 'statusNumIon',
          statusStyleInner: 'numName',
          numStyle: ['level1', 'level2', 'level3', 'level4'],
          statusDistribution: true,
          distributionStyle: 'pie',
          distributionStyleInner: 'radius',
          chartPosition: 'direction-top',
          showList: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'alarm-level',
        title: '报警级别',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          numStyle: ['level1', 'level2', 'level3', 'level4'],
          title: '',
          deviceRange: ['allDevice'],
          alarmStatus: true,
          levelStyle: 'levelNumIon',
          levelStyleInner: 'numName',
          levelDistribution: true,
          distributionStyle: 'pie',
          distributionStyleInner: 'radius',
          chartPosition: 'direction-top',
          showList: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'alarm-detail',
        title: '报警明细',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          showNumber: '5',
        },
        styles: {
          x: 0,
          y: 0,
          height: 500,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'alarm-trend',
        title: '报警趋势',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          alarmNum: true,
          alarmNumStyle: 'numIcon',
          alarmNumStyleInner: 'registerNum',
          alarmTrend: true,
          trendStyle: 'trendIcon',
          trendStyleInner: 'linerTrendIcon',
          showList: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 500,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'alarm-rank',
        title: '报警排名',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          distributionStyle: 'histogram',
          distributionStyleInner: 'rank',
          statisticalCategory: 'event',
        },
        styles: {
          x: 0,
          y: 0,
          height: 400,
          width: 500,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'alarm-rate',
        title: '设备报警率',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: ['allDevice'],
          alarmStatus: true,
          rateStyle: 'levelNumIon',
          rateStyleInner: 'registerNum',
          rateDistribution: true,
          distributionStyle: 'pie',
          distributionStyleInner: 'ripple',
          showList: true
        },
        styles: {
          x: 0,
          y: 0,
          height: 600,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
      {
        id: createUuid(),
        category: ComponentCategoryEnum.CHART,
        categoryName: '图表',
        key: 'device-list',
        title: '设备列表',
        components: null,
        attr: {
          isShareData: false
        },
        config: {
          title: '',
          deviceRange: undefined
        },
        styles: {
          x: 0,
          y: 0,
          height: 900,
          width: 400,
          show: true,
          zIndex: 100
        },
      },
    ]
    const options = ref<CreateComponentType[]>(initOptions)
    const { dragstart, dragend } = useMenuDragger()
    const searchInputSlot = {
      prefix: () => <Icon><Search /></Icon>
    }
    const handleInputChange = (val: string): void => {
      options.value = initOptions.filter(item => item.title.includes(val))
    }
    return () => (
      <>
        <Input v-slots={searchInputSlot} onInput={handleInputChange} />
        <div class='options_container'>
          {options.value.map((item: CreateComponentType) => {
            return (
              <div class='item_container' key={item.key} draggable onDragstart={($event) => { dragstart($event, item) }} onDragend={() => { dragend() }}>
                <ChartGlobalImage chartConfig={item} />
                <div class='text_center'>{item.title}</div>
              </div>
            )
          })}
        </div>
      </>
    )
  },
})
