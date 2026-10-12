import { defineComponent, onMounted, reactive, type VNode } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './record-info.module.less'
import { Button, Col, Image, ImagePreviewGroup, message, Row } from '@ghcloud/cube-ui'
import { ResultItem } from './components/result-item/result-item'
import { useRoute } from 'vue-router'
import { cubeDailyInspectionService } from '@/api/server'
import { objectStatusMap, type InspectRecordVo } from '@ghcloud/cube-daily-inspection-service'
import dayjs from 'dayjs'
import { ExceptionTimeline } from './components/exception-timeline/exception-timeline'
import { CancelRepairExplanation } from './components/cancel-repair-explanation/cancel-repair-explanation'
import { WorkOrderRelation } from '@/views/inspect-records/record-info/components/work-order-relation/work-order-relation'

export const RecordInfo = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{
      formData: InspectRecordVo & Record<string, unknown>;
    }>({
      formData: {
        id: '',
        taskId: '',
        taskName: '',
        planName: '',
        targetCategory: '',
        targetId: '',
        targetName: '',
        status: '',
        time: 0,
        organizationName: '',
        positionName: '',
        userId: '',
        username: '',
        nickname: '',
        itemName: '',
        result: '',
        remark: '',
        assistNames: '',
        areaId: '',
        areaName: '',
        recordItemVOS: [],
        recordToBusinessVOS: [],
        standardVOS: [],
        inspectMethod: '',
        errNames: '',
        snapCaptureUrls: []
      }
    })
    const schemaData = [
      {
        fieldName: 'createTimeFormat',
        label: '发布时间',
      },
      {
        fieldName: 'targetName',
        label: '巡检对象',
      },
      {
        fieldName: 'taskName',
        label: '任务名称',
        customRender: (value: unknown): JSX.Element | string => {
          if (!value) {
            return '--'
          }
          return (
            <a onClick={() => {
              history.pushState({}, '', `/portal/daily-inspection/inspect-task-info?type=info&id=${state.formData.taskId}`)
            }}
            >{value}
            </a>
          )
        }
      },
      {
        fieldName: 'planName',
        label: '巡检计划',
        customRender: (value: unknown): JSX.Element | string => {
          if (!value) {
            return '--'
          }
          return (
            <a onClick={() => {
              history.pushState({}, '', `/portal/daily-inspection/inspect-plan-edit?type=info&id=${state.formData.planId}`)
            }}
            >{value || '--'}
            </a>
          )
        }
      },
      {
        fieldName: 'nickname',
        label: '巡检人员',
        customRender: (value: unknown): JSX.Element | string => {
          return <span>{value || '--'}</span>
        }
      },
      {
        fieldName: 'timeFormat',
        label: '巡检时间',
      },
      {
        fieldName: 'statusName',
        label: '状态',
      },
      {
        fieldName: 'resultName',
        label: '巡检结果',
      },
    ]
    onMounted(() => {
      getDetails()
    })
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string
      try {
        const result = await cubeDailyInspectionService.getInspectRecordDetail({
          id
        })
        state.formData = {
          ...result,
          createTimeFormat: dayjs(result.createTime).format('YYYY-MM-DD HH:mm:ss'),
          timeFormat: result.time ? dayjs(result.time).format('YYYY-MM-DD HH:mm:ss') : '--',
          resultName: result.result ? result.result === 'ABNORMAL' ? '异常' : '正常' : '--',
          statusName: result.status ? objectStatusMap.get(result.status) : ''
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }
    const FieldComponent = (props: { label: string;fieldName: string; span?: number; customRender: ((value: unknown) => VNode | string) | undefined; }): VNode => (
      <Col xxl={props.span || 8} xl={8} lg={8} md={12} sm={12} xs={24}>
        <div class={styles['item-content']}>
          <label>{props.label}：</label>
          <span>{props.customRender ? props.customRender(state.formData[props.fieldName]) : state.formData[props.fieldName]}</span>
        </div>
      </Col>
    )
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.container}>
            <div class={styles['item-title']}>基本信息</div>
            <Row gutter={[0, 32]}>
              {schemaData.map(item => {
                return (
                  <FieldComponent span={8} fieldName={item.fieldName} key={item.fieldName} customRender={item.customRender} label={item.label} />
                )
              })}
              <Col xxl={8} xl={8} lg={8} md={12} sm={12} xs={24}>
                <div class={styles['item-content']}>
                  <label>巡检抓拍：</label>
                  <div style={{ minHeight: '100px', display: 'flex', alignItems: 'center' }}>
                    {Array.isArray(state.formData?.snapCaptureUrls) && state.formData.snapCaptureUrls.length > 0
                      ? (
                        <ImagePreviewGroup>
                          {state.formData.snapCaptureUrls.map((url, index) => {
                            return (
                              <Image
                                key={`${url}-${String(index)}`}
                                src={url}
                                style={{ width: '100px', height: '100px' }}
                                width={100}
                                height={100}
                              />
                            )
                          })}
                        </ImagePreviewGroup>
                        )
                      : '--'}
                  </div>
                </div>
              </Col>
            </Row>
            {
              state.formData?.recordToBusinessVOS?.length > 0 && 
              <>
                <div class={styles['item-title']} style={{ marginTop: '32px' }}>关联工单</div>
                <WorkOrderRelation dataSource={state.formData?.recordToBusinessVOS || []}/>
              </>
            }

            {
              state.formData.standardVOS?.length > 0 && 
              <>
              <div class={styles['item-title']} style={{ marginTop: '32px' }}>巡检结果</div>
              <ResultItem patrolResult={state.formData.standardVOS || []} />
              </>
            }
            {
              state.formData?.recordHandledManuallyPOS && state.formData?.recordHandledManuallyPOS?.length > 0 && 
              <>
              <div class={styles['item-title']} style={{ marginTop: '32px' }}>异常处理</div>
              <ExceptionTimeline exceptionRecords={state.formData.recordHandledManuallyPOS || []} />
              </>
            }

            {
              ((state.formData?.cancelReason && state.formData?.cancelReason !== '') || (state.formData?.cancelFileList && state.formData?.cancelFileList?.length > 0)) && 
              <>
              <div class={styles['item-title']} style={{ marginTop: '32px' }}>取消修复说明</div>
              <CancelRepairExplanation cancelItems={[{ reason: state.formData?.cancelReason || '', fileList: state.formData?.cancelFileList || [] }]} />
              </>
            }

            {
              ((state.formData?.cancelInspectReason && state.formData?.cancelInspectReason !== '') || (state.formData?.cancelInspectFileList && state.formData?.cancelInspectFileList?.length > 0)) && 
              <>
              <div class={styles['item-title']} style={{ marginTop: '32px' }}>取消修复说明</div>
              <CancelRepairExplanation cancelItems={[{ reason: state.formData?.cancelInspectReason || '', fileList: state.formData?.cancelInspectFileList || [] }]} />
              </>
            }
            
            
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Button onClick={() => {
            history.back()
          }}
          >返回
          </Button>
        )
      }
    }
    return (): JSX.Element => (
      <CubeLayout title='巡检记录详情' v-slots={layoutSlots} />
    )
  }
})
