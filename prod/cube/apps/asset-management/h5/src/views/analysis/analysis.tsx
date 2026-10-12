import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './analysis.module.less'
import { timePeriod } from '@/utils'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { TimePicker } from '../../components/time-picker/time-picker'
import { Cell, CellGroup, Empty, Loading, showNotify } from 'vant'
import { Pie } from '../../components/echart/pie'
import { Line } from '../../components/echart/line'
import { cubeAssetManagementService } from '@/api/server'
import { getAssetStatus, getAssetStatusColor } from '../entry/type'
import type { PropertyType } from '@ghcloud/cube-asset-management-service'
interface AssetData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: { normal: { color: string; }; };
}
/** 资产分析页 */
export const Analysis = defineComponent({
  setup: () => {
    onMounted(() => {
      getData()
    })
    const assetList = ref<AssetData[]>([])
    const loading = ref(false)
    const classifyPercentageList = ref<PropertyType[]>([])
    const trend = ref<{ name: string; data: number[]; }[]>([{ name: '耗材出库趋势', data: [] }])
    const trendX = ref<string[]>([])
    const areaList = ref<AssetData[]>([])
    const depAssetList = ref<AssetData[]>([])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const colors = ['#1989fa', '#0d924d', '#07c160', '#ff976a', '#F53F3F', '#FBA33F']
        const result = await Promise.all([
          cubeAssetManagementService.getPropertyByStatus({ dimension: time.name, period: time.value }),
          cubeAssetManagementService.getPropertyByType({ dimension: time.name, period: time.value }),
          cubeAssetManagementService.getReduceRecord({ dimension: time.name, period: time.value }),
          cubeAssetManagementService.getReduceStockStatByDep({ dimension: time.name, period: time.value }),
          cubeAssetManagementService.getPropertyBySourcePie({ dimension: time.name, period: time.value })
        ])
        // 资产状态占比
        assetList.value = result[0].map((x) => {
          return { name: getAssetStatus.get(x.name) ?? '', value: x.value, ratio: x.totalRatio, itemStyle: { normal: { color: getAssetStatusColor.get(x.name) ?? '' } } }
        })
        // 资产分类占比
        classifyPercentageList.value = result[1]
        // 耗材出库趋势
        trendX.value = result[2].map(x => x.name)
        trend.value[0].data = result[2].map(x => x.value)
        // 部门使用耗材占比
        depAssetList.value = result[3].map((x, i) => {
          return { name: x.name, value: x.value, ratio: x.totalRatio, itemStyle: { normal: { color: colors[i] ?? '' } } }
        })
        // 区域资产分布占比
        areaList.value = result[4].map((x, i) => {
          return { name: x.name, value: x.value, ratio: x.totalRatio, itemStyle: { normal: { color: colors[i] ?? '' } } }
        })
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        loading.value = false
      }
    }
    const time = reactive({
      name: 'TODAY',
      value: timePeriod('TODAY')
    })
    const changeTime = (item: { value: string; name: string; }): void => {
      time.name = item.name
      time.value = item.value
      getData()
    }

    // 资产状态占比
    const assetStatus = (): VNode =>
      <>
        <div class={styles.echart}>
          <Pie
            legend={{ show: false }}
            label={{ show: true, position: 'outer' }}
            labelLine={{
              show: true,
              length: 10,
              length2: 10
            }}
            data={assetList.value}
            center={['50%', '50%']}
            radius={['45%', '80%']}
          />
        </div>
        <ul class={styles['pie-legend']}>
          {
            assetList.value.map(item =>
              <li key={item.name}>
                <span class={styles.dot} style={{ borderColor: item.itemStyle.normal.color ?? 'green' }} />
                <span>{item.name}({item.value})</span><span>{item.ratio}%</span>
              </li>)
          }
        </ul>
      </>
    const dom = (): VNode =>
      <div class={styles.container}>
        <CellGroup inset class={styles.group}>
          <Cell title='资产状态占比' />
          <Cell>
            <div class={styles.content}>
              {assetList.value.length > 0 ? assetStatus() : <Empty />}
            </div>
          </Cell>
        </CellGroup>
        <CellGroup inset class={styles.group}>
          <Cell title='资产分类占比' />
          <Cell>
            <div style='height:260px' class={styles.content}>
              <div class={styles.echart}>
                {
                  classifyPercentageList.value.length > 0
                    ? <Pie
                      legend={{ show: true, right: '5%', top: '50%', orient: 'vertical', icon: 'circle' }}
                      label={{
                        show: true,
                        position: 'outer'
                      }}
                      labelLine={{
                        show: true,
                        length: 10,
                        length2: 10
                      }}
                      data={classifyPercentageList.value}
                      center={['35%', '55%']}
                      radius={['45%', '80%']}
                    />
                    : <Empty />
                }
              </div>
            </div>
          </Cell>
        </CellGroup>
        <CellGroup inset class={styles.group}>
          <Cell title='耗材出库趋势' />
          <Cell>
            <div style='height:200px' class={styles.content}>
              <div class={styles.echart}>
                {
                  trendX.value?.length > 0
                    ? <Line legend={{ show: false }} data={trend.value} xAxis={trendX.value} />
                    : <Empty />
                }
              </div>
            </div>
          </Cell>
        </CellGroup>
        <CellGroup inset class={styles.group}>
          <Cell title='部门使用耗材占比（金额）' />
          <Cell>
            <div style='height:200px' class={styles.content}>
              <div class={styles.echart}>
                {
                  depAssetList.value.length > 0
                    ? <Pie
                      legend={{ show: true, right: '0%', top: '25%', orient: 'vertical', icon: 'circle' }}
                      label={{
                        show: true,
                        position: 'outer',
                      }}
                      labelLine={{
                        show: true,
                        length: 5,
                        length2: 6
                      }}
                      data={depAssetList.value}
                      center={['28%', '45%']}
                      radius={['20%', '40%']}
                    />
                    : <Empty />
                }
              </div>
            </div>
          </Cell>
        </CellGroup>
        <CellGroup inset class={styles.group}>
          <Cell title='区域资产分布占比' />
          <Cell>
            <div style='height:200px' class={styles.content}>
              <div class={styles.echart}>
                {
                  areaList.value.length > 0
                    ? <Pie
                      legend={{ show: true, right: '0%', top: '25%', orient: 'vertical', icon: 'circle' }}
                      label={{
                        show: true,
                        position: 'outer',
                      }}
                      labelLine={{
                        show: true,
                        length: 5,
                        length2: 6
                      }}
                      data={areaList.value}
                      center={['28%', '45%']}
                      radius={['20%', '40%']}
                    />
                    : <Empty />
                }
              </div>
            </div>
          </Cell>
        </CellGroup>
      </div>
    return (): JSX.Element =>
      <div>
        <CubeNavBar showBack title='资产分析' />
        <TimePicker class={styles.time} onChange={changeTime} />
        {
          loading.value
            ? <Loading size='30px' type='spinner' vertical loading={loading.value} color='var(--van-primary-color)' />
            : dom()
        }
      </div>
  }
})
