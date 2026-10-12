import { defineComponent, ref, onMounted, type VNode, type PropType } from 'vue'
import styles from './detail.module.less'
import { Checkbox, Loading, showImagePreview, Image } from 'vant'
import { timeFormat } from '../../../../utils/index'
import _ from 'lodash'
import type { InspectRecord, RecordToBusinessVOS, StandardVOS } from '@ghcloud/cube-daily-inspection-service'
import type { InspectionParams } from '../../inspection-task/type'
import { InspectionRecord } from '../record'

export const InspectionRecordDetail = defineComponent({
  props: {
    options: {
      type: Object as PropType<{
        searchParams: InspectionParams;
        getDetailApi: (params?: InspectionParams) => Promise<InspectRecord>;
      }>,
      default: () => {
        return {}
      }
    },
  },
  // 查看巡检对象详情/巡检台账详情

  setup (props) {
    const showErr = ref(false)
    onMounted(() => {
      getInspectRecord()
    })
    const inspectionRecord = new InspectionRecord<InspectRecord>({ ...props.options })
    const recordList = ref<StandardVOS[]>([])
    const filterList = ref<StandardVOS[]>([])
    const getInspectRecord = async (): Promise<void> => {
      await inspectionRecord.getDetailData(props.options.getDetailApi, props.options.searchParams)
      filterList.value = inspectionRecord.dataDetail.standardVOS as StandardVOS[]
      recordList.value = inspectionRecord.dataDetail.standardVOS as StandardVOS[]
    }
    const typeMap = new Map([
      ['DEVICE', '设备'],
      ['STALL', '档位'],
      ['PROPERTY', '资产'],
      ['SITE_POINT', '现场点'],
      ['RISK_SOURCE', '风险源'],
      ['SMALL_ENGINEERING', '小散工程']
    ])
    const showErrClick = (): void => {
      if (showErr.value) {
        filterList.value = _.cloneDeep(recordList.value).map((item: StandardVOS) => {
          const x = item.itemVOS?.filter((x) => {
            return x.errorValueFlag
          })
          item.itemVOS = x ?? []
          return item
        }).filter(x => x.itemVOS && x.itemVOS.length > 0)
      } else {
        filterList.value = recordList.value
      }
    }
    const previewImg = (path: string): void => {
      showImagePreview([path])
    }
    const ItemDom = (): VNode =>
      <>
        <div class={styles['cell-group']}>
          <div class={styles.title}>巡检信息</div>
          <div class={styles.content}>
            <div><span>巡检对象：</span><span style={{ color: 'black' }}>{inspectionRecord.dataDetail?.targetName}</span></div>
            <div><span>巡检对象类型：</span><span style={{ color: 'black' }}>{typeMap.get(inspectionRecord.dataDetail?.targetCategory as string)}</span></div>
            <div><span>巡检结果：</span>
              <span style={{ color: `${inspectionRecord.dataDetail?.result === 'NORMAL' ? '#07c160' : inspectionRecord.dataDetail?.result === '' ? '#c1c1c1' : '#e0120e'}` }}>
                {inspectionRecord.dataDetail?.result === 'NORMAL' ? '正常' : inspectionRecord.dataDetail?.result === '' ? '--' : '异常'}
              </span>
            </div>
            <div><span>巡检人员：</span><span style={{ color: 'black' }}>{inspectionRecord.dataDetail?.nickname}</span></div>
            <div>
              <span>巡检时间：</span><span style={{ color: 'black' }}>{timeFormat(inspectionRecord.dataDetail?.time as string ?? '', true)}</span>
              <div><span>协同人：</span><span style={{ color: 'black' }}>{inspectionRecord.dataDetail?.assistNames ?? '--'}</span></div>
            </div>
            <div v-show={inspectionRecord.dataDetail.recordToBusinessVOS && (inspectionRecord.dataDetail.recordToBusinessVOS as RecordToBusinessVOS[]).length > 0}>
              <span>关联工单：</span>
              <div style={{ color: 'black' }}>
                {
                  (inspectionRecord.dataDetail.recordToBusinessVOS as RecordToBusinessVOS[])?.map((x) =>
                    <div key={x.recordId}>
                      <span style={{ color: 'black' }}>{x.businessName ?? '--'}</span>
                      <span
                        style={{ color: 'var(--van-primary-color' }}
                        onClick={() => {
                          window.location.href = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=${x.businessCategory}&processId=${x.businessId}`
                        }}
                      >查看
                      </span>
                    </div>)
                }
              </div>
            </div>
          </div>
        </div>
        <div class={styles['cell-group']}>
          <div class={styles.title}>
            <span>巡检结果</span>
            <span style={{ fontSize: '15px' }}><Checkbox shape='square' v-model={showErr.value} onClick={showErrClick}>只看异常</Checkbox></span>
          </div>
          {
            filterList.value.map((standard, index) =>
              <div class={styles['result-content']} key={standard.standardId}>
                <div class={styles['title-second']}>{index + 1}、{standard.standardName}</div>
                {standard.itemVOS?.map((item, index) =>
                  <div class={styles.item} key={item.itemId}>
                    <div style={{ color: 'black' }}>{index + 1}、{item.itemName}</div>
                    <div>
                      <span>结果：</span>
                      <span style={{ color: `${item.errorValueFlag ? '#e0120e' : '#07c160'}` }}>{item.itemResultName}</span>
                      {item.fileVOS.map(x =>
                        <div key={x.id} onClick={() => {
                          previewImg(x.path)
                        }} style={{ width: '50px', height: '50px' }}>
                          <Image src={x.path} alt='' width='50' height='50' />
                        </div>)}
                      <div style={{ color: '#5f5c5c' }}>描述信息: {item.errorDesc}</div>
                    </div>
                  </div>)}
              </div>)
          }
        </div>
      </>
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        {inspectionRecord.loadingStatus.loading
          ? <Loading size='24px' vertical>加载中...</Loading>
          : ItemDom()}

      </div>
  }
})
