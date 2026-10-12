import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, DateRangePicker, Form, FormItem, Input, Modal, Page, PopOver, Select, Upload, type UploadFile } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'
import { useTableScroll } from '@/hook/use-table-scroll'
import dayjs from 'dayjs'
import { cubeAnnouncementService } from '@/api/service'
import type { AnnouncementDetail } from '@ghcloud/cube-bulletin-service'
import styles from './notice.module.less'

/** 公告信息 */
export const NoticeInfo = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const pagination = ref<
      {
        pageSize: number;
        pageNumber: number;
        total?: number;
      }
    >({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formState = reactive<{
      type: string;
      level: string;
      keyword: string;
      period: string;
    }>({
      type: '',
      level: '',
      keyword: '',
      period: '',
    })
    const route = useRoute()
    const loading = ref(false)
    const dataSource = ref<Record<string, unknown>[]>([])
    const tableCode = route.path.replaceAll('/', '')
    const { scrollY } = useTableScroll()
    const visible = ref(false)
    const noticeModel = ref<AnnouncementDetail>({
      id: '',
      title: '',
      type: '',
      level: '',
      levelName: '',
      content: '',
      noticeTime: '',
      createBy: '',
      typeName: '',
      noticeConfigs: [],
      files: []
    })
    const fileList = ref<{
      name: string;
      url: string;
      status: string;
      uid: string;
    }[]>([])
    const hasReadOptions = ref<{
      value: string;
      label: string;
    }[]>([])
    const levelOptions = ref<{
      value: string;
      label: string;
    }[]>([])
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getListAnnouncement()
    }
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getListAnnouncement()
    }
    const getListAnnouncement = async (): Promise<void> => {
      const params = {
        ...pagination.value,
        ...formState,
        status: 'DISPLAY'
      }
      delete params?.total
      loading.value = true
      const res = await cubeAnnouncementService.listAnnouncement(params)
      dataSource.value = res.records
      pagination.value.total = res.total
      loading.value = false
    }
    const reset = (): void => {
      pagination.value.pageNumber = 1
      formState.keyword = ''
      formState.type = ''
      formState.level = ''
      formState.period = ''
      getListAnnouncement()
    }
    const operationRecord = async (data: Record<string, string>): Promise<void> => {
      const res = await cubeAnnouncementService.announcementDetail(data.id)
      noticeModel.value = res
      fileList.value = noticeModel.value.files.map(item => {
        return {
          name: item.name,
          url: item.path,
          status: 'done',
          uid: item.id,
        }
      })

      visible.value = true
    }
    const preview = (value: UploadFile): void => {
      window.open(value.url)
    }
    const getNoticeType = async (): Promise<void> => {
      const res = await cubeAnnouncementService.noticeType()
      hasReadOptions.value = res.map(e => {
        return {
          value: e.id,
          label: e.typeName
        }
      })
    }
    const getNoticeLevel = async (): Promise<void> => {
      const res = await cubeAnnouncementService.noticeLevel()
      levelOptions.value = res.map(e => {
        return {
          value: e.code,
          label: e.name
        }
      })
    }
    onMounted(() => {
      getNoticeType()
      getNoticeLevel()
      getListAnnouncement()
    })
    const columns = [
      {
        title: '公告时间',
        dataIndex: 'noticeTime',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '公告标题',
        dataIndex: 'title',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '公告级别',
        dataIndex: 'levelName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '公告人',
        dataIndex: 'createBy',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        align: 'center',
        width: 120,
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                operationRecord(record)
              }}>查看</Button>
            </>
          )
        }
      },
    ]
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='公告类型' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select allowClear options={hasReadOptions.value} style={{ width: '160px' }} placeholder='请选择内容类型' v-model:value={formState.type} />
              </FormItem>
              <FormItem label='公告级别' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select allowClear options={levelOptions.value} style={{ width: '160px' }} placeholder='请选择内容类型' v-model:value={formState.level} />
              </FormItem>
              <FormItem label='公告时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker style={{ width: '220px' }} v-model:value={formState.period} valueFormat='YYYY-MM-DD' />
              </FormItem>
              <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input style={{ width: '200px' }} placeholder='请输入名称搜索' v-model:value={formState.keyword} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              scrollY={scrollY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        )
      },
    }
    const modalSlots = {
      footer: (): JSX.Element => {
        return (
          <Button onClick={() => {
            visible.value = false
          }}>关闭</Button>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '公告信息'} v-slots={layoutSlots} />
        <Modal
          visible={visible.value}
          onCancel={() => {
            visible.value = false
          }}
          title='公告信息'
          centered
          width='36%'
          v-slots={modalSlots}
        >
          <div class={styles['head-box']}>
            发送人：{noticeModel.value?.createBy || '--'} &nbsp;
            通报时间：{noticeModel.value?.noticeTime || '--'}
          </div>
          <div class={styles.title}>{noticeModel.value?.title}</div>
          <div class={styles.content} v-html={noticeModel.value?.content || ''} />
          <FormItem label='附件信息'>
            <div>
              {
                fileList.value[0].url.includes('.txt') && <a href={fileList.value[0].url + '?response-content-type=application/octet-stream'}>{fileList.value[0].name}</a>
              }
              {
                !fileList.value[0].url.includes('.txt') && <Upload onPreview={(value: UploadFile) => {
                  preview(value)
                }} v-else fileList={fileList.value} disabled />
              }
            </div>
          </FormItem>
        </Modal>
      </>
  }
})
