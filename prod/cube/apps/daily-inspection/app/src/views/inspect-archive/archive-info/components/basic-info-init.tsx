import { defineComponent, reactive } from 'vue'
import { Form, FormItem, Row, Col, Switch, Textarea } from '@ghcloud/cube-ui'
import { PlanNameInput, TaskTimeLimit, InspectTypeSelect, InspectLevelSelect, PersonLiableSelect } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
export const BasicInfo = defineComponent({
  setup: () => {
    const state = reactive({
      formState: {
        name: '',
        cycle: false,
        type: '',
        receiveType: '2',
        level: '',
      }
    })
    return (): JSX.Element => (
      <Form
        layout='inline' labelCol={{
          style: {
            width: '120px'
          }
        }}
      >
        <Row gutter={[8 * 12, 12]} style={{ width: '100%' }}>
          <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
            <FormItem label='计划名称'>
              <PlanNameInput
                checkNameApi={async (params: unknown) => {
                  return cubeDailyInspectionService.checkPlanNameRepeat(params as { planName: string; })
                }} v-model:value={state.formState.name}
              />
            </FormItem>
          </Col>
          <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
            <FormItem label='巡查类型'>
              <InspectTypeSelect
                v-model:value={state.formState.type}
                optionsFetchApi={async () => {
                  return cubeDailyInspectionService.getInspectTypeList()
                }}
              />
            </FormItem>
          </Col>
          <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
            <FormItem label='巡检级别'>
              <InspectLevelSelect
                v-model:value={state.formState.type}
              />
            </FormItem>
          </Col>
          <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
            <FormItem label='责任人'>
              <PersonLiableSelect v-model:value={state.formState.receiveType} />
            </FormItem>
          </Col>
          <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
            <FormItem label='扫码巡检'>
              <Switch />
            </FormItem>
          </Col>
          <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
            <FormItem label='巡检任务时限'>
              <TaskTimeLimit />
            </FormItem>
          </Col>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <FormItem label='备注'>
              <Textarea />
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
})
