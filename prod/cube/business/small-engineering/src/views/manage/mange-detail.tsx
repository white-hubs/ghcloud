import { FileUpload, Layout, VerticalLine } from '@ghcloud/generic-component'
import { defineComponent, onMounted, ref } from 'vue'
import styles from './manage-detail.module.less'
import { Col, Form, FormItem, Modal, PopOver, Row, Skeleton, Spin, Table, Textarea, message, Button } from '@ghcloud/cube-ui'
import { cubeSmallEngineeringService } from '@/api/server'
import { useRoute } from 'vue-router'
import type { FeedbackDetailVo, ProjectDetail, ProjectScheduleTrackDownList } from '@ghcloud/cube-small-engineering-service'
import dayjs from 'dayjs'

export const ManageDetail = defineComponent({
  setup: () => {
    const { id } = useRoute().query as { id: string; }
    const loading = ref(false)
    const tableLoading = ref(false)
    const projectDetail = ref<ProjectDetail | undefined>()
    const projectScheduleTrackDownList = ref<ProjectScheduleTrackDownList[]>([])
    const showFeedBackModal = ref(false)
    const modalTitle = ref('反馈详情')
    const feedbackFrom = ref<FeedbackDetailVo | undefined>()
    const feedbackDetailId = ref()
    const feedbackDetailLoading = ref(false)

    function toFlowOrder (processInsId: string | null | undefined): void {
      if (!processInsId) {
        return
      }
      history.pushState({}, '', `/portal/stream-engine-render/index?businessType=PROJECT_APPLY&appName=small-engineering&processInstanceId=${processInsId}&currentTaskId=&status=ACTIVE&type=detail&title=工程请示`)
    }
    async function showFeedBackDetail (id: string, title: string): Promise<void> {
      feedbackDetailId.value = id
      showFeedBackModal.value = true
      modalTitle.value = title + '详情'
      try {
        feedbackDetailLoading.value = true
        feedbackFrom.value = await cubeSmallEngineeringService.getFeedbackDetail({ id })
      } catch {
        message.error('获取反馈详情失败')
        showFeedBackModal.value = false
      } finally {
        feedbackDetailLoading.value = false
      }
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Spin size='large' spinning={loading.value}>
              <div class={styles['small-engineering-name']}>小散工程名称:{projectDetail.value?.projectName || '--'}</div>
              <VerticalLine title='工程请示' />
              <Form>
                <Row style='padding-left: 100px'>
                  <Col span={6}>
                    <FormItem label='发起人'>{projectDetail.value?.apply?.username || '--'}</FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label='发起部门'>{projectDetail.value?.apply?.depName || '--'}</FormItem>
                  </Col>
                </Row>
                <Row style='padding-left: 100px'>
                  <Col span={6}>
                    <FormItem label='通过时间'>{projectDetail.value?.signing?.passTime ? dayjs(projectDetail.value?.apply?.passTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label='请示工单'>
                      <Button type='link' onClick={() => {
                        toFlowOrder(projectDetail.value?.apply?.processInsId)
                      }}>{projectDetail.value?.apply?.orderNumber || '--'}</Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
              <VerticalLine title='工程签约' />
              <Form>
                <Row style='padding-left: 100px'>
                  <Col span={6}>
                    <FormItem label='发起人'>{projectDetail.value?.signing?.username || '--'}</FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label='发起部门'>{projectDetail.value?.signing?.depName || '--'}</FormItem>
                  </Col>
                </Row>
                <Row style='padding-left: 100px'>
                  <Col span={6}>
                    <FormItem label='通过时间'>{projectDetail.value?.signing?.passTime ? dayjs(projectDetail.value?.signing?.passTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label='签约工单'>
                      <Button type='link' onClick={() => {
                        toFlowOrder(projectDetail.value?.signing?.processInsId)
                      }}>{projectDetail.value?.signing?.orderNumber || '--'}</Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
              {
                projectDetail.value?.scheduleId &&
                  <>
                    <VerticalLine title='工程施工' />
                    <Table
                      pagination={false}
                      size='small'
                      style='width: 80%;margin-left:50px;margin-bottom:20px'
                      dataSource={projectScheduleTrackDownList.value.filter(e => e.operationCode === 'FEEDBACK')}
                      columns={[
                        {
                          title: '反馈时间',
                          dataIndex: 'recordTime',
                          align: 'center',
                          customRender: ({ text }: { text: string; }): JSX.Element => {
                            const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
                            return <PopOver content={time}>{time}</PopOver>
                          }
                        },
                        {
                          title: '反馈人',
                          dataIndex: 'username',
                          align: 'center',
                          customRender: ({ text }: { text: string; }): JSX.Element => {
                            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
                          }
                        },
                        {
                          title: '反馈部门',
                          dataIndex: 'depName',
                          align: 'center',
                          customRender: ({ text }: { text: string; }): JSX.Element => {
                            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
                          }
                        },
                        {
                          title: '工程进度',
                          dataIndex: 'feedbackContent',
                          align: 'center',
                          customRender: ({ text }: { text: string; }): JSX.Element => {
                            text = (text || '--') + '%'
                            return <PopOver content={text}>{text}</PopOver>
                          }
                        },
                        {
                          title: '操作',
                          align: 'center',
                          customRender: ({ record }: { record: { id: string; }; }): JSX.Element => {
                            return <Button type='link' size='small' onClick={() => {
                              showFeedBackDetail(record.id, '反馈')
                            }}>详情</Button>
                          }
                        }
                      ]}
                    />
                    <VerticalLine title='工程验收' />
                    <Table
                      pagination={false}
                      size='small'
                      style='width: 80%;margin-left:50px;margin-bottom:20px'
                      dataSource={projectScheduleTrackDownList.value.filter(e => e.operationCode === 'CHECK_ACCEPT')}
                      columns={[
                        {
                          title: '验收时间',
                          dataIndex: 'recordTime',
                          align: 'center',
                          customRender: ({ text }: { text: string; }): JSX.Element => {
                            const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
                            return <PopOver content={time}>{time}</PopOver>
                          }
                        },
                        {
                          title: '验收人',
                          dataIndex: 'username',
                          align: 'center',
                          customRender: ({ text }: { text: string; }): JSX.Element => {
                            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
                          }
                        },
                        {
                          title: '验收结果',
                          dataIndex: 'acceptanceResult',
                          align: 'center',
                          customRender: ({ text }: { text: string; }): JSX.Element => {
                            text = text === 'QUALIFIED' ? '合格' : '不合格'
                            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
                          }
                        },
                        {
                          title: '操作',
                          align: 'center',
                          customRender: ({ record }: { record: { id: string; }; }): JSX.Element => {
                            return <Button type='link' size='small' onClick={() => {
                              showFeedBackDetail(record.id, '验收')
                            }}>详情</Button>
                          }
                        }
                      ]}
                    />
                  </>
              }
              <Modal visible={showFeedBackModal.value} title={modalTitle.value} width='50%' onCancel={() => {
                showFeedBackModal.value = false
              }} okButtonProps={{ style: { display: 'none' } }} cancelText='关闭'>
                <Skeleton loading={feedbackDetailLoading.value} active>
                  {
                    !feedbackDetailLoading.value &&
                      <Form label-col={{ style: { width: '120px' } }}>
                        <FormItem label='当前按工程进度' name='schedule'>{feedbackFrom.value?.schedule ?? 0}% </FormItem>
                        <FormItem label='进度描述:'>
                          <Textarea value={feedbackFrom.value?.description || '--'} readonly bordered={false} showCount={false} placeholder='' autoSize />
                        </FormItem>
                        <FormItem label='文件上传:'>
                          {
                            feedbackFrom.value?.problemFileList.length
                              ? <FileUpload value={feedbackFrom.value?.problemFileList} readonly />
                              : '暂无文件'
                          }
                        </FormItem>
                      </Form>
                  }
                </Skeleton>
              </Modal>
            </Spin>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return <Button onClick={() => {
          history.back()
        }}>返回</Button>
      }
    }

    onMounted(async () => {
      try {
        tableLoading.value = true
        loading.value = true
        projectDetail.value = await cubeSmallEngineeringService.getProjectDetail(id)
        if (projectDetail.value.scheduleId) {
          projectScheduleTrackDownList.value = await cubeSmallEngineeringService.projectScheduleTrackDownList(projectDetail.value.scheduleId)
        }
      } catch {
        message.error('获取工程详情失败')
      } finally {
        loading.value = false
        tableLoading.value = false
      }
    })
    return (): JSX.Element => <Layout title='工程详情' class='small-engineering' v-slots={layoutSlots} />


  }
})
