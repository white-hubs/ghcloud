import { defineComponent, onMounted, ref, type VNode } from 'vue'
import { CellGroup, Cell, Tabs, Tab, Image, List, showImagePreview, Empty, Button } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import styles from './asset-detail.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { CardItem } from '@/components/card/card'
import { kkFilePreview, type FileState } from '@ghcloud/cube-utils'
import type { AssetType, HistoryRecordType } from '@ghcloud/cube-asset-management-service'
import { getAssetStatus, getAssetStatusColor } from '@/views/entry/type'
import { cubeAssetManagementService } from '@/api/server'
import { getAssetsFile, timeFormat } from '@/utils'
/** 资产详情页面 */
interface File {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey: string;
  endpointPath: string;
  createTime: number;
  icon: string;
}
interface FormData {
  name: string;
  value: string | number | { path: string; }[];
  key?: string | string[];
  files?: { path: string; }[];
}
export const AssetDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const assetId = ref('')
    const detail = ref<AssetType>()
    const basicData = ref<FormData[]>()
    const personData = ref<FormData[]>()
    const maintainData = ref<FormData[]>()
    const otherData = ref<FormData[]>()
    const historyRecordList = ref<HistoryRecordType[]>([])
    const filesList = ref<File[]>([])
    const activeTab = ref('')
    const router = useRouter()
    onMounted(async () => {
      useMetaTitle()
      assetId.value = route.query.id as string
      getTaskDetail()
      getRecordList()
    })
    // 基础信息
    const getTaskDetail = async (): Promise<void> => {
      detail.value = await cubeAssetManagementService.getDetailById({ id: assetId.value ?? '', pageNumber: 1, pageSize: 100 })
      basicData.value = [
        { name: '资产编码', value: detail.value?.serialNumber || '--' },
        { name: '财务编码', value: detail.value?.financeNumber || '--' },
        { name: '资产类型', value: detail.value?.typeName || '--', key: detail.value?.typeId ?? '' },
        { name: '资产名称', value: detail.value?.name || '--' },
        { name: '入库日期', value: timeFormat(detail.value?.startTime ?? '') || '--' },
        { name: '原值', value: detail.value?.price || '--' },
        { name: '标准型号', value: detail.value?.norms || '--' },
        { name: '计量单位', value: detail.value?.unit || '--' },
        { name: '设备编码', value: detail.value?.deviceNumber || '--' },
        { name: '管理人员', value: detail.value?.adminName || '--', key: detail.value?.adminId ?? '' },
        { name: '区域', value: detail.value?.area?.map((x: { name: string; }) => x.name).join('/') || '--', key: detail.value?.area?.map((x: { id: string; }) => x.id) ?? [] },
        { name: '存放地点', value: detail.value?.storageLocation || '--' },
        { name: '购入日期', value: timeFormat(detail.value?.purchaseDate ?? '') || '--' },
        { name: '维护部门', value: detail.value?.maintenanceDepName || '--', key: detail.value?.maintenanceDepId ?? '' },
      ]
      personData.value = [
        { name: '使用人', value: detail.value?.receiveUserName || '--', key: detail.value?.receiveUserId ?? '' },
        { name: '使用部门', value: detail.value?.receiveDepName || '--', key: detail.value?.receiveDepId ?? '' },
        { name: '联系方式', value: detail.value?.receiveUserPhone || '--' },
      ]
      maintainData.value = [
        { name: '供应商', value: detail.value?.supplier || '--' },
        { name: '联系人', value: detail.value?.supplierUser || '--' },
        { name: '联系方式', value: detail.value?.supplierPhone || '--' },
        { name: '维保期限（月）', value: detail.value?.maintenanceTime || '--' },
      ]
      otherData.value = [
        { name: '使用期限（月）', value: detail.value?.usageTime || '--' },
        { name: '来源', value: detail.value?.sourceName || '--', key: detail.value?.sourceId ?? '' },
        { name: '资产照片', value: detail.value?.imgs || '--' },
        { name: '备注', value: detail.value?.remarks || '--' },
      ]
      filesList.value = detail.value.file?.map(item => {
        return {
          ...item,
          icon: item.type === 'png' ? item.path : ['pdf', 'ppt', 'txt', 'word'].includes(item.type) ? getAssetsFile(item.type + '.png') : getAssetsFile('docx.png'),
        }
      }) ?? []
    }
    // 资产履历
    const getRecordList = async (): Promise<void> => {
      const list = await cubeAssetManagementService.getPropertyHistoryList({ id: assetId.value ?? '', pageNumber: 1, pageSize: 100 })
      historyRecordList.value = list.records
    }
    // 附件信息
    const fileDom = (item: File): { detail: () => VNode; } => {
      return {
        detail: (): VNode =>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}
            onClick={() => {
              preview(item)
            }}
          >
            <Image src={item.icon} alt='' width='45' height='45' />
            <div style={{ marginLeft: '10px' }}>
              <p style={{ color: '#646566' }}>{item.name}</p>
              <p><span>{Math.ceil(item.size / 1024)}kb</span><span style={{ marginLeft: '6px' }}>{dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</span> </p>
            </div>
          </div>
      }
    }
    // 资产履历插槽
    const notesDom = (note: HistoryRecordType): { detail: () => VNode; } | string => {
      return {
        detail: (): VNode =>
          <>
            <p>{dayjs(note.handleTime).format('YYYY-MM-DD')}</p>
            <div class={styles.note}>
              <div class={styles.title}>
                <span class={styles.left}>资产入库</span>
                <span class={styles.right}>处理人：{note.createByName}</span>
              </div>
              <div class={styles.content}>操作内容：{note.remarks}</div>
            </div>
          </>
      }
    }
    // 预览
    const preview = (file: File): void => {
      if (['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].findIndex(x => x === file.type) !== -1) {
        showImagePreview([file.path])
      } else {
        kkFilePreview(file as FileState)
      }
    }
    // 编辑
    const edit = (): void => {
      router.push({
        path: '/assetList/asset-edit',
        query: {
          basicData: JSON.stringify(basicData.value),
          id: route.query.id,
          status: detail.value?.status,
          personData: JSON.stringify(personData.value),
          maintainData: JSON.stringify(maintainData.value),
          otherData: JSON.stringify(otherData.value),
        }
      })
    }
    const imgDom = (item: FormData): VNode =>
      <Cell key={item.name} v-show={item.value !== '--'}>
        <div class={styles['img-item']}>
          <div>{item.name}</div>
          {
            (item.value as { path: string; }[])?.map(x => <Image style='margin: 10px;' key={x.path} src={x.path} width='70' height='70' />)
          }
        </div>
      </Cell>
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', height: '100vh', position: 'relative' }}>
        <CubeNavBar showBack title='资产详情' />
        <CellGroup class={styles['cell-group']}>
          <Cell>
            <div class={styles['cell-title']}>
              <span class={styles.status} style={{ background: `${getAssetStatusColor.get(detail.value?.status ?? '')}` }}>{getAssetStatus.get(detail.value?.status ?? '')}</span>
              <span>{detail.value?.name}</span>
            </div>
          </Cell>
          <Cell class={styles.cell}>
            <div class={styles['cell-item']}>
              <label style='color:#666666'>财务编码：</label>
              <span>{detail.value?.financeNumber || '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>资产类别：</label>
              <span>{detail.value?.typeName || '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>购入日期：</label>
              <span>{detail.value?.purchaseDate ? dayjs(detail.value?.purchaseDate).format('YYYY-MM-DD') : '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>使用部门：</label>
              <span>  {detail.value?.receiveDepName || '--'} </span>
            </div>
            <div class={styles['cell-item']}>
              <label>使用人员：</label>
              <span>{detail.value?.receiveUserName || '--'}</span>
            </div>
            <Image
              class={styles.img}
              src={detail.value?.imgs?.[0]?.path}
              width='70' height='70' alt=''
            />
          </Cell>
        </CellGroup>
        <Tabs class={styles['detail-tabs']} v-model:active={activeTab.value} title-active-color='var(--van-primary-color)' line-width='24px'>
          <Tab title='基础信息' name='basic'>
            <div style={{ height: '57vh', overflow: 'auto' }}>
              <List class={styles.basic}>
                <div class={styles.title}>基础信息</div>
                {basicData.value?.map(item =>
                  <Cell key={item.name} title={item.name} value={item.value} />)}
              </List>
              <List class={styles.basic}>
                <div class={styles.title}>使用人信息</div>
                {personData.value?.map(item =>
                  <Cell key={item.name} title={item.name} value={item.value} />)}
              </List>
              <List class={styles.basic}>
                <div class={styles.title}>维保信息</div>
                {maintainData.value?.map(item =>
                  <Cell key={item.name} title={item.name} value={item.value} />)}
              </List>
              <List class={styles.basic}>
                <div class={styles.title}>其他信息</div>
                {
                  otherData.value?.map(item =>
                    <div key={item.name}>
                      {
                        item.name === '资产照片'
                          ? imgDom(item)
                          : <Cell key={item.name} title={item.name} value={item.value} />
                      }
                    </div>)
                }
              </List>
            </div>
          </Tab>
          <Tab title='附件信息' name='annex'>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', height: '57vh', overflow: 'auto' }}>
              <List>
                {
                  filesList.value.length > 0
                    ? filesList.value.map(item =>
                      <CardItem class={styles['file-item']} key={item.name} v-slots={fileDom(item)} />)
                    : <Empty style={{ height: '100%' }} />
                }
              </List>
            </div>
          </Tab>
          <Tab title='资产履历' name='fittings'>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', height: '57vh', overflow: 'auto' }}>
              <List>
                {
                  historyRecordList.value.length > 0
                    ? historyRecordList.value.map(item =>
                      <CardItem class={styles['note-item']} key={item.createBy} v-slots={notesDom(item)} />)
                    : <Empty />
                }
              </List>
            </div>
          </Tab>
        </Tabs>
        <Button block size='small' type='primary' class={styles.button} onClick={edit}>编辑</Button>
      </div>
  }
})
