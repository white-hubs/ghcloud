import { defineComponent, onMounted, reactive } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GVerticalLine } from '@/components/common/vertical-line'
import { Row, Col, Spin, Button } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { basicInfoState } from './index.config'
import { useRoute, useRouter } from 'vue-router'
import { getWholesalerInfo } from '@/api/merchant-managent'
export const MerchantDetailsInfo = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const layoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <>
            <Spin spinning={state.loading}>
              <div class={styles['basic-info']}>
                <GVerticalLine title='基础信息' />
                <Row style={{ padding: '20px' }}>
                  {basicInfoState.map(item => {
                    return (
                      <Col span={item.span} style={{ marginBottom: '20px' }} key={item.field}>
                        <div>
                          <span style={{ marginRight: '10px' }}>{item.label}:</span>
                          <span>{item.render(state.details[item.field]?.toString() ?? '--')}</span>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </div>
            </Spin>
            {/* <div class={styles['business-info']}>
              <GVerticalLine title='业务信息' />
              <Row style={{ padding: '20px' }}>
                <Col span={8} style={{ marginBottom: '20px' }}>
                  <div>
                    <span style={{ marginRight: '10px' }}>经营档位:</span>
                    <span>{state.stallList.length ? state.stallList.map(item => item.name).join(',') : '--'}</span>
                  </div>
                </Col>
                <Col span={8} style={{ marginBottom: '20px' }}>
                  <div>
                    <span style={{ marginRight: '10px' }}>主营品类:</span>
                    <span>{state.details.categoryName && (state.details.categoryName as string[]).length ? (state.details.categoryName as string[]).join(',') : '--'}</span>
                  </div>
                </Col>
              </Row>
            </div> */}

          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (<Button type='primary' onClick={handleBack}>返回</Button>)
      }
    }
    const handleBack = (): void => {
      router.back()
    }
    const state = reactive<{ loading: boolean; details: Record<string, unknown>;stallList: { name: string;id: string; }[]; }>({
      details: {},
      stallList: [],
      loading: false
    })
    const getDetails = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getWholesalerInfo(route.params.id as string)
        // const result = await getMerchantStalls(route.params.id as string)
        // state.stallList = result.data
        state.details = data
      } catch {
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getDetails()
    })
    return (): JSX.Element => (
      <GLayout title='商户详情' showSearch={false} v-slots={layoutSlots} />
    )
  }
})
