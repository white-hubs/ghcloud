import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, message, Modal, Page, PopConfirm, PopOver, Radio, RadioButton, RadioGroup, Select, Textarea, Upload, type FormInstance } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { AliasTable } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { cubeBroadcastService, cubeFileService } from '@/api/service'
import type { BroadcastTemplatePage } from '@ghcloud/cube-broadcast-center-service'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadProps } from 'ant-design-vue/es/upload'
import styles from './broadcast.module.less'
import { usePageName } from '@ghcloud/cube-utils'

/** 广播模板 */
export const BroadcastTemplate = defineComponent({
  setup: () => {
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
    const { pageTitle } = usePageName()
    const formState = reactive<{
      keyword: string | undefined;
      contentType: string | undefined;
    }>({
      keyword: undefined,
      contentType: undefined,
    })
    const route = useRoute()
    const loading = ref(false)
    const tableCode = route.path.replaceAll('/', '')
    const dataSource = ref<BroadcastTemplatePage[]>([])
    const { scrollY } = useTableScroll()
    const panelRef = ref<FormInstance>()
    const videoList = ref<{
      uid: string;
      name: string;
      status: string;
      path: string;
    }[]>([])
    const state = reactive({
      panelVisible: false,
      panelLoading: false,
      disabled: false,
      modalName: '新增',
      itemId: '',
      panelModel: {
        contentType: 'TEXT',
        name: '',
        code: 'name',
        content: '',
        audioContent: '',
        audioContentId: '',
      },
      cursorPosition: 0,
      panelRules: {
        name: [{ required: true, message: '类型名称不能为空' }] as Rule[],
        code: [{ required: true, message: '请选择广播变量' }] as Rule[],
        audioContent: [{ required: true, message: '广播内容不能为空' }] as Rule[],
      },
    })
    const columns = [
      {
        title: '序号',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        width: 70,
        customRender: ({ index }: { index: number; }): JSX.Element => {
          return <PopOver content={index + 1 || '--'}>{index + 1 || '--'}</PopOver>
        }
      },
      {
        title: '模板名称',
        dataIndex: 'name',
        align: 'center',
        width: 150,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '广播内容',
        dataIndex: 'content',
        ellipsis: true,
        align: 'center',
        width: 400,
        customRender: ({ text, record }: { text: string;record: BroadcastTemplatePage; }): JSX.Element => {
          if (record.contentType === 'TEXT') {
            return (
              <PopOver
                content={
                  text
                    ? text
                      .replaceAll('${name}', '{ 姓名 }')
                      .replaceAll('${address}', '{ 地址 }')
                      .replaceAll('${plateNo}', '{车牌号 }')
                      .replaceAll('${curTime}', '{当前时间}')
                      .replaceAll('${curDate}', '{当前日期}')
                      .replaceAll('${phone}', '{ 电话 }')
                      .replaceAll('${genericText}', '{ 通用文本 }')
                    : ''
                }
              >
                {text
                  ? text
                    .replaceAll('${name}', '{ 姓名 }')
                    .replaceAll('${address}', '{ 地址 }')
                    .replaceAll('${plateNo}', '{车牌号 }')
                    .replaceAll('${curTime}', '{当前时间}')
                    .replaceAll('${curDate}', '{当前日期}')
                    .replaceAll('${phone}', '{ 电话 }')
                    .replaceAll('${genericText}', '{ 通用文本 }')
                  : '--'}
              </PopOver>
            )
          } else {
            return (
              <audio
                src={record.fileVOList?.[0] ? record.fileVOList[0].path : ''}
                style='max-width: 100%;max-height: 100%;' controls
              />
            )
          }
        }
      },
      {
        title: '编辑人',
        dataIndex: 'updateByName',
        ellipsis: true,
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最近编辑时间',
        dataIndex: 'updateTime',
        ellipsis: true,
        align: 'center',
        width: 160,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        align: 'center',
        width: 120,
        customRender: ({ record }: { record: BroadcastTemplatePage; }): JSX.Element => {
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
    const hasReadOptions = [
      {
        label: '文本',
        value: 'TEXT',
      },
      {
        label: '音频',
        value: 'AUDIO',
      }
    ]
    const operationDelete = async (record: BroadcastTemplatePage): Promise<void> => {
      await cubeBroadcastService.deleteBroadcastTemplate(record.id)
      message.success('操作成功')
      getBroadcastTemplatePage()
    }
    const openModel = (type: string): void => {
      state.panelVisible = true
      if (type === 'add') {
        resetPanelModel()
        state.modalName = '新增'
      }
    }
    const resetPanelModel = (): void => {
      state.panelModel = {
        contentType: 'TEXT',
        name: '',
        code: 'name',
        content: '',
        audioContent: '',
        audioContentId: '',
      }
      videoList.value = []
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getBroadcastTemplatePage()
    }
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getBroadcastTemplatePage()
    }
    const operationRecord = (record: BroadcastTemplatePage): void => {
      state.disabled = record.defaulted
      state.modalName = '编辑'
      state.panelVisible = true
      state.itemId = record.id
      Object.assign(state.panelModel, {
        name: record.name,
        contentType: record.contentType,
        code: 'name',
        content: record.content?.replace(/\${(\w+)}/g, '{ $1 }'),
        audioContent: record.fileVOList?.[0]?.name || '',
        audioContentId: record.fileVOList?.[0]?.id || '',
      })
    }
    const reset = (): void => {
      pagination.value.pageNumber = 1
      formState.keyword = ''
      formState.contentType = undefined
      getBroadcastTemplatePage()
    }
    const getBroadcastTemplatePage = async (): Promise<void> => {
      const params = {
        ...pagination.value,
        ...formState,
      }
      delete params?.total
      loading.value = true
      const res = await cubeBroadcastService.broadcastTemplatePage(params)
      dataSource.value = res.records
      pagination.value.total = res.total
      loading.value = false
    }
    const changeTab = (type: string): void => {
      const mapping: Record<string, string> = {
        name: '{ 姓名 }',
        address: '{ 地址 }',
        plateNo: '{车牌号 }',
        curTime: '{当前时间}',
        curDate: '{当前日期}',
        phone: '{ 电话 }',
        genericText: '{ 通用文本 }',
      }
      const val = mapping[type]
      const pos = state.cursorPosition
      const content = state.panelModel.content

      state.panelModel.content =
        content.slice(0, pos) + val + content.slice(pos)
    }
    const panelCancel = (): void => {
      panelRef.value && panelRef.value.resetFields()
      state.panelVisible = false
      resetPanelModel()
    }
    const customRequest: UploadProps['customRequest'] = async (data) => {
      const res = await cubeFileService.uploadFile({
        businessKey: 'alarm',
        file: data.file as File,
      })
      if (res.id && res.name && res.path) {
        videoList.value = [{
          uid: res.id,
          name: res.name,
          status: 'success',
          path: res.path,
        }]
        state.panelModel.audioContent = res.name
        state.panelModel.audioContentId = res.id
      }
    }
    const save = async (): Promise<void> => {
      panelRef.value && panelRef.value.validate().then(async () => {
        state.panelLoading = true
        const params = { ...state.panelModel }

        if (params.contentType === 'TEXT') {
          params.content = params.content
            .replaceAll('{ 姓名 }', '${name}')
            .replaceAll('{ 地址 }', '${address}')
            .replaceAll('{车牌号 }', '${plateNo}')
            .replaceAll('{当前时间}', '${curTime}')
            .replaceAll('{当前日期}', '${curDate}')
            .replaceAll('{ 电话 }', '${phone}')
            .replaceAll('{ 通用文本 }', '${genericText}')
        } else {
          params.content = params.audioContentId
        }
        if (state.modalName === '新增') {
          await cubeBroadcastService.broadcastTemplate(params)
        } else {
          await cubeBroadcastService.editBroadcast(state.itemId, params)
        }
        panelCancel()
        reset()
        message.success('操作成功')
        state.panelLoading = false
      })
    }
    const removeFile = (): boolean => {
      return true
    }
    onMounted(() => {
      getBroadcastTemplatePage()
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <div>
            <Button class='mr-16' type='primary' onClick={() => {
              openModel('add')
            }}>新增</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input style={{ width: '220px' }} placeholder='请输入名称搜索' v-model:value={formState.keyword} />
              </FormItem>
              <FormItem label='内容类型' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select allowClear options={hasReadOptions} style={{ width: '220px' }} placeholder='请选择内容类型' v-model:value={formState.contentType} />
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
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '广播模版'} v-slots={layoutSlots} />
        <Modal
          visible={state.panelVisible}
          title={state.modalName}
          centered
          width='45%'
          confirmLoading={state.panelLoading}
          onOk={save}
          onCancel={panelCancel}
        >
          <Form ref={panelRef} model={state.panelModel} rules={state.panelRules}>
            <FormItem label='模板名称' name='name'>
              <Input
                v-model={[state.panelModel.name, 'value']}
                maxlength={6}
                disabled={state.disabled}
                placeholder='请输入模板名称'
              />
            </FormItem>

            <FormItem label='内容类型' name='contentType'>
              <RadioGroup v-model={[state.panelModel.contentType, 'value']}>
                <Radio value='TEXT'>文本</Radio>
                <Radio value='AUDIO'>音频</Radio>
              </RadioGroup>
            </FormItem>

            {state.panelModel.contentType === 'TEXT'
              ? (
                <>
                  <FormItem label='广播变量' name='code'>
                    <RadioGroup
                      v-model={[state.panelModel.code, 'value']}
                      buttonStyle='solid'
                      onChange={(e: string) => {
                        changeTab(e)
                      }}
                    >
                      {['name', 'address', 'plateNo', 'curTime', 'curDate', 'phone', 'genericText'].map(
                        (type) => (
                          <RadioButton value={type} key={type}>
                            {{
                              name: '姓名',
                              address: '地址',
                              plateNo: '车牌号',
                              curTime: '当前时间',
                              curDate: '当前日期',
                              phone: '电话',
                              genericText: '通用文本',
                            }[type]}
                          </RadioButton>
                        )
                      )}
                    </RadioGroup>
                  </FormItem>
                  <FormItem label='广播内容' name='content'>
                    <Textarea
                      v-model={[state.panelModel.content, 'value']}
                      rows={6}
                      maxlength={200}
                      allowClear
                      showCount
                      onBlur={(e: FocusEvent) => {
                        state.cursorPosition = (e.target as HTMLTextAreaElement).selectionStart || 0
                      }}
                    />
                  </FormItem>
                </>
              )
              : (
                <FormItem label='广播内容' name='audioContent'>
                  <Input
                    showCount={false}
                    placeholder=''
                    v-model:value={state.panelModel.audioContent}
                    disabled
                    style={{ width: '50%', marginRight: '10px' }}
                  />
                  {videoList.value.length > 0 && (
                    <span
                      style={{ color: 'red' }} onClick={() => {
                        videoList.value = []
                        state.panelModel.audioContent = ''
                        state.panelModel.audioContentId = ''
                      }}
                    >
                      删除
                    </span>
                  )}
                  <Upload
                    fileList={videoList.value}
                    v-model={[videoList.value, 'fileList']}
                    onRemove={removeFile}
                    customRequest={customRequest}
                    showUploadList={false}
                    accept='.mp3,.mp4'
                  >
                    <Button type='primary'>上传</Button>
                  </Upload>
                  <span class={styles['upload-tip']}>
                    支持mp3格式，文件大小不超过5MB
                  </span>
                </FormItem>
              )}
          </Form>
        </Modal>
      </>
  }
})
