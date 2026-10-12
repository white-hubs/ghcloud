import { defineComponent, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { cubeSmallEngineeringService } from '@/api/server'
import type { TemporaryPatrolRecordVO } from '@ghcloud/cube-small-engineering-service'
import { Button, Col, message, Row, Image } from '@ghcloud/cube-ui'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './temporary-patrol-details.module.less'
import dayjs from 'dayjs'

export const TemporaryPatrolDetails = defineComponent({
  name: 'TemporaryPatrolRecord',
  setup: () => {
    const route = useRoute()
    const state = reactive<{
      formData: TemporaryPatrolRecordVO;
    }>({
      formData: {
        id: '',
        name: '',
        userName: '',
        completeTime: 0,
        projectName: '',
        result: '',
        remarks: '',
        imageFiles: [],
      }
    })

    onMounted(() => {
      getDetails()
    })
    const getDetails = async (): Promise<void> => {
      const id = route.query.id as string
      try {
        state.formData = await cubeSmallEngineeringService.temporaryPatrolDetails(id)
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.container}>
            <div class={styles['item-title']}>基本信息</div>
            <Row gutter={[32, 32]} >
              <Col xs={{ span: 5 }} lg={{ span: 6 }}>
                <div class={styles['item-content']}>
                  <label>巡检对象：</label>
                  <span>{state.formData.projectName}</span>
                </div>
              </Col>
              <Col xs={{ span: 5 }} lg={{ span: 6 }}>
                <div class={styles['item-content']}>
                  <label>巡检人员：</label>
                  <span>{state.formData.userName}</span>
                </div>
              </Col>
              <Col xs={{ span: 5 }} lg={{ span: 6 }}>
                <div class={styles['item-content']}>
                  <label>巡检时间：</label>
                  <span>{dayjs(state.formData.completeTime).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              </Col>
              <Col xs={{ span: 5 }} lg={{ span: 6 }}>
                <div class={styles['item-content']}>
                  <label>巡检结果：</label>
                  <span>{state.formData.result ? (state.formData.result === 'NORMAL' ? '正常' : '异常') : '--'}</span>
                </div>
              </Col>
              <Col xs={{ span: 5 }} lg={{ span: 6 }}>
                <div class={styles['item-content']}>
                  <label>备注：</label>
                  <span>{state.formData.remarks}</span>
                </div>
              </Col>
            </Row>
            <Row gutter={[32, 32]} style={{ marginTop: '24px' }}>
              <Col xs={{ span: 5 }} lg={{ span: 6 }}>
                <div class={styles['item-content']}>
                  <label>图片：</label>
                  {
                    state.formData.imageFiles.map((item, index) => {
                      return (
                        <div class={styles['image-item']} key={index} style={{ marginRight: '10px' }}>
                          <Image src={item.path.startsWith('http') ? item.path : `${location.origin}${item.path}`} alt='' width='80px' height='80px' />
                        </div>
                      )
                    })
                  }
                </div>
              </Col>
            </Row>
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
      <CubeLayout title='临时巡检详情' v-slots={layoutSlots} />
    )
  }
})