import { defineComponent, ref, onMounted, reactive, nextTick } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Input, Table, message, Button, PopOver, Select, Modal, Form, FormItem, Switch, Page } from '@ghcloud/cube-ui'
import { type PublishState, type FormState, initFormData } from './publish-i'
import { getInstancePage, addInstancePage, updateInstancePage, getProjectAll } from '@/api/mdata'
import dayjs from 'dayjs'
import type { ProjectState } from '../project/project-i'
import type { FormInstance } from 'ant-design-vue'
import useClipboard from 'vue-clipboard3'
import { getNowEnterprise, getToken } from '@/utils/auth'
export const Publish = defineComponent({
  setup: () => {
    const tableData = ref<PublishState[]>([])
    const scrollY = ref<number>(200)
    const tableLoading = ref<boolean>(true)
    const searchState = reactive({
      status: null,
      projectName: '',
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const getInstanceList = async (): Promise<void> => {
      const res = await getInstancePage(searchState)
      tableLoading.value = false
      tableData.value = res.records ? res.records : res as unknown as PublishState[]
      tableData.value.forEach(item => {
        item.switchStatus = item.status === 'ENABLE'
      })
      searchState.total = res.total
    }
    const resetInstanceList = async (): Promise<void> => {
      searchState.projectName = ''
      searchState.status = null
      searchState.pageSize = 10
      searchState.pageNumber = 1
      searchState.total = 0
      getInstanceList()
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      searchState.pageNumber = pageNumber || 1
      searchState.pageSize = pageSize
      getInstanceList()
    }
    // 复制

    const { toClipboard } = useClipboard()
    const copy = async (text: string) => {
      try {
        await toClipboard(text) // 实现复制
        message.success('复制成功')
      } catch {
      }
    }
    onMounted(() => {
      getInstanceList()
      getProjectList()
      nextTick(() => {
        getScrollY()
      })
    })
    // 获取项目列表
    let projectOptions = reactive<ProjectState[]>([])
    const getProjectList = async (): Promise<void> => {
      const res = await getProjectAll()
      projectOptions = res as unknown as ProjectState[]
    }

    const modal = reactive({
      visible: false,
      title: '新增实例',
      submitLoading: false,
      action: 'add'
    })
    let formData = reactive<FormState>({
      ...initFormData
    })
    const formRef = ref<FormInstance>()
    const rulesRef = {
      instanceName: [
        { required: true, message: '请输入实例名称' },
        { max: 20, message: '最多输入20个字' },
      ],
      projectId: [{ required: true, message: '请选择项目' }],
    }
    const openModal = (type: 'add' | 'edit', record?: PublishState): void => {
      modal.action = type
      formRef.value?.resetFields()
      modal.title = type === 'add' ? '新增实例' : '编辑实例'
      formData = reactive<FormState>({
        ...initFormData
      })
      if (record) {
        formData = reactive({
          id: record.id,
          projectId: record.projectId,
          instanceName: record.instanceName,
          status: record.status
        })
      }
      modal.visible = true
    }
    const handelAdd = async (): Promise<void> => {
      formRef.value?.validate().then(async () => {
        try {
          const { id, projectId, instanceName } = formData
          if (modal.action === 'add') {
            await addInstancePage({
              projectId, instanceName
            })
            message.success('添加成功')
          } else {
            await updateInstancePage({
              id, projectId, instanceName
            })
            message.success('修改成功')
          }
          getInstanceList()
          handelCancel()
        } catch {
        }
      })
    }
    // 状态开关
    const changeStatus = async (record: PublishState) => {
      try {
        const { id, projectId, instanceName, status } = record
        await updateInstancePage({
          id,
          projectId,
          instanceName,
          status: status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
        })
        message.success('操作成功')
        getInstanceList()
      } catch {
        record.switchStatus = record.status === 'ENABLE'
      }
    }
    const handelCancel = (): void => {
      modal.visible = false
      formRef.value?.resetFields()
    }
    const getScrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 240
      }
    }
    window.onresize = (): void=> {
      getScrollY()
    }
    const columns = [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '实例名称',
        dataIndex: 'instanceName',
        key: 'instanceName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element=> {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '链接地址',
        dataIndex: 'path',
        key: 'path',
        align: 'center',
        customRender: ({ record }: { record: PublishState; }): JSX.Element => {
          const env = (import.meta as unknown as { env: { VITE_VISUAL_LOW_CODE_URL: string; }; }).env
          const token = getToken()
          const path = env.VITE_VISUAL_LOW_CODE_URL + `/render?type=render&instanceId=${record.id}&access_token=${token.access_token}
          &nowEnterprise=${JSON.stringify(getNowEnterprise())}`
          return (
            <PopOver content='复制地址'>
              <Button type='link' block onClick={() => {
                copy(path)
              }}><span class='address'>{path || '--'}</span></Button>
            </PopOver>
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: PublishState; }): JSX.Element=> {
          return <Switch v-model:value={record.switchStatus} checked-children='启用' un-checked-children='禁用' onChange={async () => changeStatus(record)} />
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: PublishState; }): JSX.Element=>
          <>
            <Button type='link' onClick={() => {
              openModal('edit', record)
            }}>编辑</Button>
          </>
      }
    ]
    const gLayoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <Button type='primary' onClick={() => {
            openModal('add')
          }}>新增实例</Button>
        )
      },
      'content-search': (): JSX.Element => {
        return (
          <>
            <div class='flexBetween'>
              <Form layout='inline'>
                <FormItem label='项目名称'>
                  <Input
                    v-model:value={searchState.projectName} placeholder='请输入项目名称搜索' showCount={false}
                    onChange={() => {
                      searchState.projectName = searchState.projectName ? searchState.projectName.replace(/\s+/g, '') : ''
                    }}
                  />
                </FormItem>
                <FormItem label='状态'>
                  <Select
                    v-model:value={searchState.status} style='width: 200px;' options={[{ value: 'DISABLE', label: '禁用' }, { value: 'ENABLE', label: '启用' }]}
                    allow-clear placeholder='请选择状态'
                  />
                </FormItem>
                <FormItem>
                  <Button type='primary' onClick={async () => getInstanceList()}>查询</Button>
                  <Button style='margin-left:20px' onClick={async () => resetInstanceList()}>重置</Button>
                </FormItem>
              </Form>
            </div>
          </>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <Table
              columns={columns}
              dataSource={tableData.value}
              scrollY={scrollY.value}
              rowKey='id'
              loading={tableLoading.value}
              pagination={false}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Page
              style='margin-bottom:20px;text-align: right;'
              v-model:current={searchState.pageNumber}
              v-model:pageSize={searchState.pageSize}
              v-model:total={searchState.total}
              onPageChange={pageChange}
            />
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <GLayout title='发布管理' showFooter v-slots={gLayoutSlots} />
        <Modal
          visible={modal.visible}
          title={modal.title}
          onOk={handelAdd}
          onCancel={handelCancel}
        >
          <Form model={formData} ref={formRef} rules={rulesRef} label-col={{ style: { width: '100px' } }}>
            <FormItem label='选择项目' name='projectId'>
              <Select
                v-model:value={formData.projectId}
                options={projectOptions}
                allowClear
                fieldNames={{ label: 'projectName', value: 'id' }}
              />
            </FormItem>
            <FormItem label='实例名称' name='instanceName'>
              <Input
                maxlength={20}
                placeholder='请输入实例名称'
                v-model:value={formData.instanceName}
                onChange={() => {
                  formData.instanceName = formData.instanceName ? formData.instanceName.replace(/\s+/g, '') : ''
                }}
              />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
