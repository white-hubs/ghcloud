import { defineComponent, onMounted, reactive, type VNode } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './record-info.module.less'
import { Button, Col, message, Row } from '@ghcloud/cube-ui'
import { ResultItem } from './components/result-item'
import { useRoute } from 'vue-router'
import { cubeDailyInspectionService } from '@/api/server'
import { InspectBusinessType, type InspectRecordVo } from '@ghcloud/cube-daily-inspection-service'
import dayjs from 'dayjs'
const statusEnum: Record<string, string> = {
  EXECUTING: '待巡检',
  OVER: '已完成',
  EXPIRE: '已过期',
  STOP: '已终止',
  CONFIRM: '待确认',
  SPLIT: '待拆解',
  ACCEPT: '待接收',
  OVERTIME: '超时完成',
  default: '--'
}
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
        errNames: ''
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
              history.pushState({}, '', `/portal/small-engineering/engineering-patrol-task-edit?type=info&id=${state.formData.taskId}`)
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
              history.pushState({}, '', `/portal/small-engineering/engineering-patrol-plan-edit?type=info&id=${state.formData.planId}`)
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
          id,
          businessType: InspectBusinessType.SMALL_ENGINEERING
        })
        state.formData = {
          ...result,
          createTimeFormat: dayjs(result.createTime).format('YYYY-MM-DD HH:mm:ss'),
          timeFormat: result.time ? dayjs(result.time).format('YYYY-MM-DD HH:mm:ss') : '--',
          resultName: result.result ? result.result === 'ABNORMAL' ? '异常' : '正常' : '--',
          statusName: statusEnum[result.status]
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
            </Row>
            <div class={styles['item-title']} style={{ marginTop: '32px' }}>巡检结果</div>
            <ResultItem patrolResult={state.formData.standardVOS} />
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
