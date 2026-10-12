import { defineComponent, ref, onMounted, reactive } from 'vue'
import { Input, message, Button, Modal, Form, FormItem, RadioGroup, Empty, EditOutlined, DropDown, MenuItem, SubMenu } from '@ghcloud/cube-ui'
import { type FormState, initFormData, type ProjectState } from './project-i'
import { addProject, deleteProject, getProjectAll, updateProject } from '@/api/mdata'
import { Card, CardMeta, Menu, type FormInstance } from 'ant-design-vue'
import { GLayout } from '@/components/common/layout'
import styles from './project.module.less'
import { CopyOutlined, EllipsisOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { cubeVisualizationService } from '@/api/service'

export const Project = defineComponent({
  setup: () => {
    const router = useRouter()
    const uploadRef = ref<{ clearAll: () => void; }>()
    const modal = reactive({
      visible: false,
      title: '新增项目',
      submitLoading: false,
    })
    const formData = reactive<FormState>({
      ...initFormData
    })
    const formRef = ref<FormInstance>()
    const rulesRef = {
      projectName: [
        { required: true, message: '请输入项目名称' },
        { max: 20, message: '最多输入20个字' }
      ],
    }
    const openModal = (): void => {
      formRef.value?.resetFields()
      modal.title = '新增项目'
      modal.visible = true
    }
    const handelAdd = async (): Promise<void> => {
      formRef.value?.validate().then(async () => {
        try {
          if (modal.title === '新增项目') {
            const { projectName, canvas } = formData
            await addProject({
              projectName,
              canvas,
              mainStructure: 'structure-one'
            })
            message.success('添加成功')
          } else {
            await updateProject({
              ...formData,
              mainStructure: 'structure-one'
            })
            message.success('编辑成功')
          }
          handelCancel()
          getTableData()
        } catch {
        }
      })
    }

    const deleteModal = reactive<{ visible: boolean; title: string; record: ProjectState | null; }>({
      visible: false,
      title: '删除项目',
      record: null,
    })

    const handleDelete = (record: ProjectState): void => {
      deleteModal.visible = true
      deleteModal.record = record
    }

    const cancelDelete = (): void => {
      deleteModal.visible = false
      deleteModal.record = null;
    }

    const deleteRow = async (): Promise<void> => {
      try {
        const recordId = deleteModal.record?.id;
        if (!recordId) return
        await deleteProject({ id: recordId })
        message.success('操作成功')
      } catch {
      }
      getTableData()
      cancelDelete();
    }

    const handelCancel = (): void => {
      modal.visible = false
      uploadRef.value?.clearAll()
      formRef.value?.resetFields()
    }
    const tableData = ref<ProjectState[]>([])
    const tableLoading = ref<boolean>(true)
    const getTableData = async (): Promise<void> => {
      const res = await getProjectAll()
      tableLoading.value = false
      tableData.value = res as unknown as ProjectState[]
    }
    onMounted(() => {
      getTableData()
    })

    const handleEditProject = (record: ProjectState): void => {
      modal.visible = true
      modal.title = '编辑项目'
      formData.id = record.id as unknown as string
      formData.projectName = record.projectName
      formData.canvas = record.canvas
    }

    const copyLink = (record: ProjectState): void => {
      const link = `${window.location.origin}/apps-legacy/ue5?projectId=${record.id}`
      const textarea = document.createElement('textarea')
      textarea.value = link
      textarea.style.position = 'fixed' // 避免滚动
      document.body.appendChild(textarea)
      textarea.select()

      try {
        const success = document.execCommand('copy')
        if (success) {
          message.success('复制链接成功')
        } else {
          message.error('复制失败')
        }
      } catch {
        message.error('复制失败')
      } finally {
        document.body.removeChild(textarea)
      }
    }

    const copyProject = async (record: ProjectState): Promise<void> => {
      if (record.id) {
        try {
          await cubeVisualizationService.copyProject(record.id)
          message.success('复制成功')
          getTableData()
        } catch {
          message.error('复制失败')
        }
      }
    }

    const toPage = (record: ProjectState, pageName: string): void => {
      router.push({
        name: pageName,
        query: {
          projectId: record.id
        }
      })
    }

    const gLayoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <Button type='primary' onClick={() => {
            openModal()
          }}>新增项目</Button>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
          <div class={styles.content}>
            {
              tableData.value.length > 0
                ? <div class={styles.grid}>
                  {tableData.value.map((record) => {
                    return (
                      <Card
                        hoverable
                        key={record.id as unknown as string}
                        class={styles.card}
                        v-slots={{
                          actions: () =>
                            <>
                              <DropDown
                                trigger='click'
                                v-slots={{
                                  overlay: () =>
                                    <Menu>
                                      <MenuItem onClick={() => {
                                        copyLink(record)
                                      }}>复制链接</MenuItem>
                                      <MenuItem onClick={() => {
                                        copyProject(record)
                                      }}>复制项目</MenuItem>
                                    </Menu>
                                }}
                              >
                                <CopyOutlined />
                              </DropDown>

                              <EditOutlined onClick={() => {
                                handleEditProject(record)
                              }} />
                              <DropDown
                                trigger='click'
                                v-slots={{
                                  overlay: () =>
                                    <Menu>
                                      <MenuItem onClick={() => {
                                        toPage(record, 'business-menu')
                                      }}>业务菜单</MenuItem>
                                      <MenuItem onClick={() => {
                                        toPage(record, 'device-relation')
                                      }}>设备关联</MenuItem>
                                      <MenuItem onClick={() => {
                                        toPage(record, 'panel-config')
                                      }}>面板配置</MenuItem>
                                      <SubMenu title='开发配置'>
                                        <MenuItem onClick={() => {
                                          toPage(record, 'render-settings')
                                        }}>渲染设置</MenuItem>
                                        <MenuItem onClick={() => {
                                          toPage(record, 'introducing-models')
                                        }}>引入模型</MenuItem>
                                        <MenuItem onClick={() => {
                                          toPage(record, 'perspective-configuration')
                                        }}>视角配置</MenuItem>
                                        <MenuItem onClick={() => {
                                          toPage(record, 'roaming-route')
                                        }}>漫游路线</MenuItem>
                                        <MenuItem onClick={() => {
                                          toPage(record, 'other-settings')
                                        }}>其他设置</MenuItem>
                                        <MenuItem onClick={() => {
                                          toPage(record, 'guide-settings')
                                        }}>导览列表</MenuItem>
                                      </SubMenu>

                                      <MenuItem onClick={() => {
                                        handleDelete(record)
                                      }}>删除项目</MenuItem>
                                    </Menu>
                                }}
                              >
                                <EllipsisOutlined />
                              </DropDown>
                            </>
                        }}
                      >
                        <CardMeta title={record.projectName} />
                      </Card>
                    )
                  })}
                </div>
                : <Empty class='pt20' description='暂无数据' />
            }
          </div>
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <GLayout title='项目管理' showFooter={false} v-slots={gLayoutSlots} />

        <Modal
          visible={modal.visible}
          title={modal.title}
          onOk={handelAdd}
          onCancel={handelCancel}
        >
          <Form model={formData} ref={formRef} rules={rulesRef} label-col={{ style: { width: '100px' } }}>
            <FormItem label='项目名称' name='projectName'>
              <Input
                maxlength={20}
                placeholder='请输入项目名称'
                v-model:value={formData.projectName}
                onChange={() => {
                  formData.projectName = formData.projectName ? formData.projectName.replace(/\s+/g, '') : ''
                }}
              />
            </FormItem>
            <FormItem label='画布比例' name='canvas' style={{ display: 'none' }}>
              <RadioGroup
                v-model:value={formData.canvas}
                options={[{ label: '16:9', value: '16:9' }]}
              />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          visible={deleteModal.visible}
          title={deleteModal.title}
          okButtonProps={{ danger: true }}
          onOk={deleteRow}
          onCancel={cancelDelete}
        >
          <div style={{ padding: '12px 0' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              确定要删除项目 &ldquo;{deleteModal.record?.projectName}&rdquo; 吗？
            </p>
          </div>
        </Modal>
      </>
  }
})
