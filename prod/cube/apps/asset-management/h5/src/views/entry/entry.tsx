import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './entry.module.less'
import { Cell, CellGroup, Divider, showNotify } from 'vant'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeAssetManagementService } from '@/api/server'
import { getAssetsFile, timePeriod } from '@/utils'
import { Pie } from '../../components/echart/pie'
import { routes } from '@/router'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { CardItem } from '../../components/card/card'
import { getAssetStatus, getAssetStatusColor } from './type'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
interface AssetData {
  name: string;
  value: number;
  itemStyle: { normal: { color: string; }; };
}
/** 入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    const loading = ref(false)
    const router = useRouter()
    const assetList = ref<AssetData[]>([])
    const timeSelect = ref(timePeriod())
    const suppliesNumber = reactive({
      consumableNumber: 0,
      stockMax: 0,
      stockMin: 3
    })
    const assetNumber = reactive({
      propertyNumber: 0,
      usageNumber: 0
    })
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const { consumableNumber, stockMax, stockMin } = await cubeAssetManagementService.getStockAvailability()
        suppliesNumber.consumableNumber = consumableNumber
        suppliesNumber.stockMax = stockMax
        suppliesNumber.stockMin = stockMin
        const { propertyNumber, usageNumber } = await cubeAssetManagementService.getOverdue()
        assetNumber.propertyNumber = propertyNumber
        assetNumber.usageNumber = usageNumber
        const list = await cubeAssetManagementService.getPropertyByStatus({ dimension: 'TODAY', period: timeSelect.value })
        assetList.value = list.map((x) => {
          return { name: getAssetStatus.get(x.name) ?? '', value: x.totalRatio, itemStyle: { normal: { color: getAssetStatusColor.get(x.name) ?? '' } } }
        })
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      getData()
      useMetaTitle()
    })
    // 耗材总数
    const consumablesTotal = {
      detail: (): JSX.Element=>
        <div class={styles['card-item']}>
          <div class={styles.value}>{suppliesNumber.consumableNumber}</div>
          <div class={styles.title}>耗材总数</div>
        </div>,
    }
    // 超过库存上限
    const consumablesTop = {
      detail: (): JSX.Element=>
        <div class={styles['card-item']} onClick={() => {
          router.push({ path: '/consumableList', query: { title: '耗材库存', type: 'STOCK_MAX' } })
        }}>
          <div>{suppliesNumber.stockMax}</div>
          <div>超过库存上限</div>
        </div>,
    }
    // 低于库存下限
    const consumablesBottom = {
      detail: (): JSX.Element =>
        <div class={styles['card-item']} onClick={() => {
          router.push({ path: '/consumableList', query: { title: '耗材库存', type: 'STOCK_MIN' } })
        }}>
          <div>{suppliesNumber.stockMin}</div>
          <div>低于库存下限</div>
        </div>,
    }
    // 固定资产数
    const fixedAssets = {
      detail: (): JSX.Element =>
        <div class={styles['card-item']}>
          <div class={styles.title}>固定资产数</div>
          <div class={styles.value}>{assetNumber.propertyNumber}</div>
        </div>
      ,
    }
    // 使用到期数
    const expireAssets = {
      detail: (): JSX.Element =>
        <div class={styles['card-item']}>
          <div class={styles.title}>使用到期数</div>
          <div class={styles.value}>{assetNumber.usageNumber}</div>
        </div>
    }
    const echart = (): VNode =>
      <Cell>
        <div class={styles.echart}>
          <Pie
            legend={{
              show: false,
            }}
            tooltipFormatter='{b0}: {c0}%'
            data={assetList.value}
          />
          <div class={styles['pie-legend']}>
            <ul>
              {
                assetList.value.map(item =>
                  <li key={item.name}>
                    <span class={styles.dot} style={{ background: item.itemStyle.normal.color ?? 'green' }} />
                    <span>{item.name}</span><span>{item.value}%</span>
                  </li>)
              }
            </ul>
          </div>
        </div>
      </Cell>
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='资产管理' />
        <div class={styles.container}>
          <EntryMenu applicationCode='PROPERTY_MANAGEMENT' routes={routes} title='业务操作' />
          <CellGroup inset class={styles.group}>
            <Cell title='资产管理' />
            <Cell>
              <template class={styles.statistics}>
                <div class={styles.total} onClick={() => {
                  router.push({ path: '/consumableList', query: { title: '耗材库存' } })
                }}>
                  <CardItem cardItem={{ img: getAssetsFile('ic_card_record.svg') }}>{consumablesTotal}</CardItem>
                </div>
                <Divider style='height: 100%;' vertical />
                <div class={styles.detail}>
                  <CardItem>{consumablesTop}</CardItem>
                  <CardItem>{consumablesBottom}</CardItem>
                </div>
              </template>
            </Cell>
            <Cell>
              <template class={styles.statistics}>
                <div class={styles.total} onClick={() => {
                  router.push({ path: '/assetList' })
                }}>
                  <CardItem cardItem={{ img: getAssetsFile('ic_card_info_number.svg') }}>{fixedAssets}</CardItem>
                </div>
                <div class={styles.total} onClick={() => {
                  router.push({ path: '/assetList', query: { usageDate: dayjs().format('YYYY-MM-DD') } })
                }}>
                  <CardItem cardItem={{ img: getAssetsFile('ic_card_expire.svg') }}>{expireAssets}</CardItem>
                </div>
              </template>
            </Cell>
            {assetList.value && assetList.value.length > 0 ? echart() : null}
          </CellGroup>
        </div>
      </>
  }
})
