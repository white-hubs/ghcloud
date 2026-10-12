import { defineComponent, onMounted, ref, type VNode } from 'vue'
import styles from './detail.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRoute, useRouter } from 'vue-router'
import { cubePropertyService } from '@/api/server'
import { Cell, Empty, List, Tab, Tabs, Button, Image, showImagePreview } from 'vant'
import { CardItem } from '../components/card/card'
import type { RiskSourceLedgerDetails } from '@ghcloud/cube-risk-management-service'
import { getAssetsFile, timeFormat } from '@/utils'
import { kkFilePreview, type FileState } from '@ghcloud/cube-utils'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const RiskDetail = defineComponent({
  setup () {
    useMetaTitle()
    const detail = ref<RiskSourceLedgerDetails>()
    const activeTab = ref('basic')
    const route = useRoute()
    const basicData = ref<{ name: string; value: string | number; key?: string;files?: { path: string; }[]; }[]>()
    const distributionData = ref<{ name: string; value: string | number; files?: { path: string; }[]; }[]>()
    const otherData = ref<{ name: string; value: string | number; key?: string;files?: { path: string; }[]; }[]>()
    const fittingsList = ref<{ id: string; name: string; rTitle: string; detail: string; note: string; }[]>([])
    const filesList = ref<{ id: string; path: string; name: string; type: string;icon: string; }[]>([])
    const detailList = ref<{ name: string; value: string | number; files?: { path: string; }[]; }[]>()
    onMounted(() => {
      getTaskDetail()
    })
    const receiveUserTypeList = new Map([
      ['MERCHANT', '商户'],
      ['MARKET', '市场']
    ])
    const getTaskDetail = async (): Promise<void> => {
      detail.value = await cubePropertyService.riskSourceLedgerDetails(route.query.id as string)
      basicData.value = [
        { name: '风险源编码', value: detail.value?.serialNumber || '--' },
        { name: '风险源名称', value: detail.value?.name || '--' },
        { name: '风险源分类', value: detail.value?.typeName || '--', key: detail.value?.typeCode ?? '' },
        { name: '模型编码', value: detail.value?.bimCode || '--' },
        { name: '关联档位', value: detail.value?.stallName || '--', key: detail.value?.stallId ?? '' },
        { name: '所在区域', value: detail.value?.areaName || '--', key: detail.value?.areaId ?? '' },
        { name: '详细位置', value: detail.value?.attribute || '--' },
        { name: '关联现场点', value: detail.value?.sitePointName || '--', key: detail.value?.sitePointId ?? '' },
        { name: '维护部门', value: detail.value?.maintenanceDepName || '--', key: detail.value?.maintenanceDepId ?? '' },
        { name: '维护人', value: detail.value?.maintenanceUserName || '--', key: detail.value?.maintenanceUserId ?? '' },
        { name: '规格型号', value: detail.value?.norms || '--' },
        { name: '使用部门', value: detail.value?.receiveDepName || '--', key: detail.value?.receiveDepId ?? '' },
        { name: '使用人', value: detail.value?.receiveUserName || '--' },
        { name: '使用人类型', value: receiveUserTypeList.get(detail.value?.receiveUserType) || '--', key: detail.value?.receiveUserType ?? '' },
        { name: '联系方式', value: detail.value?.receiveUserPhone || '--' },
        { name: '使用到期日期', value: timeFormat(detail.value?.usageDate) || '--' },
        { name: '购买日期', value: timeFormat(detail.value?.purchasingDate) || '--' },
        { name: '强检日期', value: timeFormat(detail.value?.mandatoryTestingDate) || '--' },
      ]
      distributionData.value = [
        { name: '生产厂家', value: detail.value?.produceFactory || '--' },
        { name: '生产厂家地址', value: detail.value?.produceAddress || '--' },
        { name: '配送公司', value: detail.value?.deliveryCompany || '--' },
        { name: '配送公司地址', value: detail.value?.deliveryAddress || '--' },
      ]
      otherData.value = [
        { name: '功率', value: detail.value?.efficiency || '--' },
        { name: '车牌号', value: detail.value?.plateNumber || '--' },
        { name: '是否购买保险', value: detail.value?.insurance ? (detail.value?.insurance === '1' ? '是' : '否') : '--', key: detail.value?.insurance },
      ]
      fittingsList.value = detail.value.partsDetails.map(item => {
        return { id: item.id, name: item.name, rTitle: `到期时间：${timeFormat(item.expireDate)}`, detail: `编号：${item.code}`, note: item.remarks }
      })
      filesList.value = detail.value.files.map(item => {
        return { id: item.id, name: item.name, icon: item.type === 'png' ? item.path : ['pdf', 'ppt', 'txt'].includes(item.type) ? getAssetsFile(item.type + '.png') : getAssetsFile('docx.png'), path: item.path, type: item.type }
      })
      detailList.value = [
        { name: '风险源分类', value: detail.value?.typeName || '--' },
        { name: '维护部门', value: detail.value?.maintenanceDepName || '--' },
        { name: '使用人员', value: detail.value?.receiveUserName || '--' },
        { name: '使用部门', value: detail.value?.receiveDepName || '--' },
      ]
    }
    const detailDom = {
      extra: (): JSX.Element =>
        <div class={styles.detailItem}>
          {detailList.value?.map(x =>
            <div key={x.value} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>{x.name}</label>
              <span>{x.value}</span>
            </div>
          )}
        </div>
    }
    // 配件信息插槽
    const notesDom = (note: string): { content: () => VNode; } | string => {
      return {
        content: (): VNode =>
          <div class={styles.note}>
            <span class={styles.title}>备注：</span>
            <span class={styles.content}>{note}</span>
          </div>
      }
    }
    // 附件信息
    const fileDom = (item: {
      icon: string;path: string; name: string; type: string;
    }): { content: () => VNode; } => {
      return {
        content: (): VNode =>
          <div
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => { preview(item) }}
          >
            <Image src={item.icon} alt='' width='35' height='35' />
            <span style={{ marginLeft: '10px' }}>{item.name}</span>
          </div>
      }
    }
    const preview = (file: { path: string;name: string;type: string; }): void => {
      if (['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].findIndex(x => x === file.type)) {
        showImagePreview([file.path])
      } else {
        kkFilePreview(file as FileState)
      }
    }
    const router = useRouter()
    const edit = (): void => {
      router.push({ path: '/risk-edit', query: { id: route.query.id } })
    }
    return (): JSX.Element =>
      <>
        <CubeNavBar title='风险源详情' showBack />
        <div class={styles.wrapper}>
          <div class={styles.detail}>
            <div class={styles.title}>{detail.value?.name}</div>
            <div class={styles.content}>
              <List>
                <Cell v-slots={detailDom} style={{ paddingTop: '0px' }} />
              </List>
            </div>
          </div>
          <Tabs v-model:active={activeTab.value} title-active-color='var(--van-primary-color)' line-width='24px'>
            <Tab title='基础信息' name='basic'>
              <div style={{ height: '60vh', overflow: 'auto' }}>
                <List class={styles.basic}>
                  <div class={styles.title}>基础信息</div>
                  {basicData.value?.map(item =>
                    <Cell key={item.name} title={item.name} value={item.value} />
                  )}
                </List>
                <List class={styles.basic}>
                  <div class={styles.title}>生产配送信息</div>
                  {distributionData.value?.map(item =>
                    <Cell key={item.name} title={item.name} value={item.value} />
                  )}
                </List>
                <List class={styles.basic}>
                  <div class={styles.title}>产品其他信息</div>
                  {otherData.value?.map(item =>
                    <Cell key={item.name} title={item.name} value={item.value} />
                  )}
                </List>
              </div>
            </Tab>
            <Tab title='配件信息' name='fittings'>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', height: '60vh', overflow: 'auto' }}>
                {fittingsList.value.length > 0
                  ? fittingsList.value.map(item =>
                    <CardItem cardItem={item} key={item.id} v-slots={notesDom(item.note)} />
                  )
                  : <Empty />}
              </div>
            </Tab>
            <Tab title='附件信息' name='annex'>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', height: '60vh', overflow: 'auto' }}>
                <List>
                  {filesList.value.length > 0
                    ? filesList.value.map(item =>
                      <CardItem key={item.name} v-slots={fileDom(item)} />
                    )
                    : <Empty style={{ height: '100%' }} />}
                </List>
              </div>
            </Tab>
          </Tabs>
          <Button block type='primary' class={styles.button} onClick={edit} v-show={route.query.isLogin !== 'false'}>编辑</Button>
        </div>
      </>
  }
})
