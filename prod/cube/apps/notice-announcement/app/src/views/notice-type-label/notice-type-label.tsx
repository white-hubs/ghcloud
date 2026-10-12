import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Form, FormItem, Input, message, Modal, PopConfirm, PopOver, type FormInstance } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'
import { useTableScroll } from '@/hook/use-table-scroll'
import type { Rule } from 'ant-design-vue/es/form'
import { cubeAnnouncementService } from '@/api/service'
import type { NoticeType } from '@ghcloud/cube-bulletin-service'
/** 公告标签 */
export const NoticeTypeLabel = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const formState = reactive<{
      keyword: string;
    }>({
      keyword: '',
    })
    const route = useRoute()
    const loading = ref(false)
    const dataSource = ref<NoticeType[]>([])
    const tableCode = route.path.replaceAll('/', '')
    const { scrollY } = useTableScroll()
    const visible = ref(false)
    const modalName = ref('新增')
    const panelRef = ref<FormInstance>()
    const currentId = ref()
    const panelModel = ref({
      typeName: '',
    })
    const panelRules = ref({
      typeName: [{ required: true, message: '请输入' }] as Rule[],
    })

    const openModel = (): void => {
      visible.value = true
      modalName.value = '新增'
    }
    const getListAnnouncement = async (): Promise<void> => {
      loading.value = true
      dataSource.value = await cubeAnnouncementService.noticeLabel(formState)
      loading.value = false
    }
    const reset = (): void => {
      formState.keyword = ''
      getListAnnouncement()
    }
    const operationRecord = async (data: NoticeType): Promise<void> => {
      currentId.value = data.id
      modalName.value = '编辑'
      panelModel.value.typeName = data.typeName
      visible.value = true
    }
    const operationDelete = async (record: NoticeType): Promise<void> => {
      await cubeAnnouncementService.removeModelType(record.id)
      message.success('操作成功')
      getListAnnouncement()
    }
    const queryForm = (): void => {
      getListAnnouncement()
    }
    const submitForm = (): void => {
      panelRef.value && panelRef.value.validate().then(async () => {
        if (modalName.value === '新增') {
          await cubeAnnouncementService.noticeLabelAdd({
            ...panelModel.value,
            modelType: 'ANNOUNCEMENT_TAG'
          })
        } else {
          await cubeAnnouncementService.noticeLabelId({
            ...panelModel.value,
            modelType: 'ANNOUNCEMENT_TAG'
          }, currentId.value)
          message.success('操作成功')
        }
        panelModel.value.typeName = ''
        currentId.value = ''
        visible.value = false
        getListAnnouncement()
      })
    }
    onMounted(() => {
      getListAnnouncement()
    })
    const columns = [
      {
        title: '公告标签',
        dataIndex: 'typeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: NoticeType; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                operationRecord(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={async () => operationDelete(record)}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <div>
            <Button class='mr-16' type='primary' onClick={openModel}>新增</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input style={{ width: '300px' }} placeholder='请输入公告标签名称搜索' v-model:value={formState.keyword} />
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
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '公告标签'} v-slots={layoutSlots} />
        <Modal
          visible={visible.value}
          onCancel={() => {
            visible.value = false
          }}
          onOk={submitForm}
          title={modalName.value}
          centered
          width='36%'
        >
          <Form ref={panelRef} model={panelModel.value} rules={panelRules.value}>
            <FormItem label='公告标签' name='typeName'>
              <Input placeholder='请输入' v-model:value={panelModel.value.typeName} />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
