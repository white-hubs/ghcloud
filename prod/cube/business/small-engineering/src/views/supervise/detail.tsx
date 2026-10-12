
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'
import './index.less'
import { scheduledetail, type AcceptType, type ScheduleType, schedulefeedback, Accept, trackDownList, trackDownDetail } from '@/api/supervise'
import { Button, FormItem, Image, Modal, PopOver, TabPane, Table, Tabs } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import FeedbackModel from './components/feedback-model'
import CheckModel from './components/check-accept-model'
import type { FeedbackDetailVo } from '@ghcloud/cube-small-engineering-service'
export const Detail = defineComponent({
  setup: () => {
    const route = useRoute()
    const { id } = route.query
    const activeKey = ref(1)
    const visible = ref(false)
    const detailinfo = reactive<{
      schedule: number;
      checkAcceptResult: string;
      operationType: string;
      hasProblem: number;
      describe: string;
      files: { path: string; }[
      ];
    }
    >({
      schedule: 0,
      checkAcceptResult: '',
      operationType: '',
      hasProblem: 0,
      describe: '',
      files: []
    })


    const currentDetail = ref({})
    const feedback = ref(false)
    const checkvisible = ref(false)
    const todetailsuper = async (id: string): Promise<void> => {
      const { data } = await trackDownDetail(id)
      Object.assign(detailinfo, data)
      visible.value = true
    }
    const detail = reactive<{
      status: string;
      projectName: string;
      partyB: string;
      completionTime: number;
      depName: string;
      username: string;
      schedule: number;
      scheduleRemark: string;
      overTime: number;
      scheduleFiles: {
        path: string;
      }[];
      checkAcceptResult: string;
      checkAcceptRemark: string;
      checkFiles: {
        path: string;
      }[];
    }>({
      overTime: 0,
      projectName: '',
      partyB: '',
      completionTime: 0,
      depName: '',
      username: '',
      schedule: 0,
      scheduleRemark: '',
      scheduleFiles: [],
      checkAcceptResult: '',
      checkAcceptRemark: '',
      checkFiles: [],
      status: ''
    })
    const getdetails = async (): Promise<void> => {
      const { data } = await scheduledetail(id)
      Object.assign(detail, data)
    }
    const recordlist = ref<unknown[]>([])
    const gettrackDownList = async (): Promise<void> => {
      const { data } = await trackDownList(id)
      recordlist.value = data
    }
    const columnsrecord = [{
      title: '时间',
      align: 'center',
      dataIndex: 'recordTime',
      customRender: ({ text }: { text: string; }): JSX.Element => {
        const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        return <PopOver content={time}>{time}</PopOver>
      }
    },
    {
      title: '姓名',
      dataIndex: 'username',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '部门',
      dataIndex: 'depName',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '状态',
      dataIndex: 'operation',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '反馈内容',
      dataIndex: 'feedbackContent',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '验收内容',
      dataIndex: 'checkAcceptContent',
      align: 'center',
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    },
    {
      title: '操作',
      align: 'center',
      dataIndex: 'action',
      customRender: ({ record }: { record: { id: string;schedule: number;status: string; }; }): JSX.Element=> {
        return (
          <>
            <Button type='link' size='small' onClick={() => {
              todetailsuper(record.id)
            }}>详情</Button>
          </>
        )
      }
    }

    ]

    const cancel = (): void => {
      feedback.value = false
    }
    const checkcancel = (): void => {
      checkvisible.value = false
    }
    const ok = async (data: ScheduleType): Promise<void> => {
      await schedulefeedback(data)
      getdetails()
      feedback.value = false
    }
    const checkok = async (data: AcceptType): Promise<void> => {
      await Accept(data)
      getdetails()
      checkvisible.value = false
    }
    const back = (): void => {
      history.back()
    }

    const check = (): void => {
      currentDetail.value = detail
      checkvisible.value = true
    }
    const feedbackEvent = (): void => {
      currentDetail.value = detail
      feedback.value = true
    }

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div style='margin-top:15px'>
              <Tabs v-model:activeKey={activeKey}>
                <TabPane tab='工程信息' key={1}>

                  <div>
                    <div class='schedule'>基本信息</div>
                    <div class='basic'>
                      <FormItem label='小散工程名称:'>{detail.projectName}</FormItem>
                      <FormItem label='乙方:'>{
                        detail.partyB
                      }</FormItem>

                    </div>
                    <div class='basic'>
                      <FormItem label='完成时间:'>{detail.overTime ? dayjs(detail.overTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</FormItem>
                      <FormItem label='监管部门:'>{
                        detail.depName
                      }</FormItem>

                    </div>
                    <div class='basic'>
                      <FormItem label='监管人:'>{detail.username}</FormItem>
                      <div />
                    </div>

                  </div>

                  <div>
                    <div class='schedule'>工程进度</div>
                    <div class='basic'>
                      <FormItem label='工程进度:'>{detail.schedule}%</FormItem>
                      <div />
                    </div>
                    <div class='basic'>
                      <FormItem label='进度描述:'>{detail.scheduleRemark}</FormItem>
                      <div />
                    </div>
                    <div class='basic'>
                      <FormItem label='进度文件:'>{detail.scheduleFiles.map(item => {
                        return (
                          <Image key={item.path} src={item.path} alt='' style='width:100px;height:100px;margin-left:10px;' />

                        )
                      })}</FormItem>
                      <div />
                    </div>
                  </div>
                  <div>
                    <div class='schedule'>工程结果</div>
                    <div class='basic'>
                      <FormItem label='验收结果:'>{detail.checkAcceptResult === 'QUALIFIED' ? '验收合格' : detail.checkAcceptResult === 'DISQUALIFICATION' ? '验收不合格' : ''}</FormItem>
                      <div />
                    </div>
                    <div class='basic'>
                      <FormItem label='备注:'>{detail.checkAcceptRemark}</FormItem>
                      <div />
                    </div>
                    <div class='basic'>
                      <FormItem label='验收文件:'>{detail.checkFiles.map(item => {
                        return (
                          <Image key={item.path} src={item.path} alt='' style='width:100px;height:100px;margin-left:10px;' />

                        )
                      })}</FormItem>
                      <div />
                    </div>
                  </div>
                </TabPane>
                <TabPane tab='跟踪记录' key={2}>
                  <Table dataSource={recordlist.value} columns={columnsrecord} pagination={false} scrollY={600} size='small' />
                </TabPane>
              </Tabs>

            </div>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (

          <div style='display:flex;justify-content:space-between;width:200px'>

            {
              detail.status === '待验收' ? <Button onClick={check}>验收</Button> : <span />
            }
            {
              detail.status === '进行中' ? <Button onClick={feedbackEvent}>反馈</Button> : <span />
            }
            <Button onClick={back}>返回</Button>
          </div>
        )
      }

    }
    onMounted(() => {
      getdetails()
      gettrackDownList()
    })
    return (): JSX.Element =>
      <>
        <Layout title='工程进度跟踪-详情' v-slots={layoutSlots} />
        <FeedbackModel visible={feedback.value} onCancel={cancel} onOk={ok} detail={currentDetail.value as unknown as FeedbackDetailVo} />
        <CheckModel visible={checkvisible.value} onCancel={checkcancel} onOk={checkok} detail={currentDetail.value as unknown as FeedbackDetailVo} />
        <Modal
          visible={visible.value} title='详情' onCancel={() => {
            visible.value = false
          }} onOk={() => {
            visible.value = false
          }}
        >
          <FormItem label='当前工程进度'>{detailinfo.schedule === null ? '' : `${detailinfo.schedule}%`}</FormItem>
          <FormItem label='进度描述'>{detailinfo.describe}</FormItem>
          <FormItem label='工程是否存在问题'>{detailinfo.hasProblem ? '是' : '否'}</FormItem>
          <FormItem label='验收结果'>{detailinfo.checkAcceptResult === 'QUALIFIED' ? '验收合格' : detailinfo.checkAcceptResult === 'DISQUALIFICATION' ? '验收不合格' : ''}</FormItem>
          <FormItem label='文件'>
            {detailinfo.files.map(item => {
              return (
                <Image key={item.path} src={item.path} style='width:100px;height:100px;margin-left:10px;' />
              )
            })}

          </FormItem>

        </Modal>
      </>
  }
})
