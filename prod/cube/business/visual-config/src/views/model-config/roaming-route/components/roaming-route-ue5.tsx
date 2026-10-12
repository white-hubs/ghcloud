
import { defineComponent, onBeforeUnmount, reactive, ref, watch, type PropType } from 'vue'
import type { ModelConfig as ModelConfigItf } from '../../model-config-init'
import { Button, Form, FormItem, Input, Modal, PopConfirm, Select, SelectOption, Table, Textarea, message } from '@ghcloud/cube-ui'
import styles from '../../model-config.module.less'
import { addModel } from '@/api/model'
import { UeClient } from '@ghcloud/cube-visual-sdk'
import { createUuid } from '@/utils/common'

export const RoamingRouteUe5 = defineComponent({
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {}
      }
    }
  },
  emits: ['getModelData'],
  setup: (props, { emit }) => {
    const ueClient = UeClient.getInstance()
    const modelContainer = ref()
    const modal = reactive({
      visible: false,
      title: '新增漫游路线',
      index: 0,
      textValue: ''
    })
    const roamingModal = reactive({
      visible: false,
      title: '新增点位',
      index: 0,
      textValue: ''
    })
    const formData = reactive({
      name: '',
      id: ''
    })
    const roamingForm = reactive({
      name: '',
      value: '',
      label: '',
      id: ''
    })
    const modelServer = ref<{ pointName: string; perspective: string;id: string;name: string;sort: number; }[]>([])
    const scrollY = ref<number>(250)
    const ue5Columns = [
      {
        title: '漫游路线名称',
        dataIndex: 'name',
        width: 150,
        align: 'center',
        key: 'name'
      },
      {
        title: '点位名称',
        dataIndex: 'pointName',
        width: 150,
        align: 'center',
        key: 'pointName'
      },
      {
        title: '视角参数',
        dataIndex: 'perspective',
        align: 'center',
        key: 'perspective'
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        align: 'center',
        key: 'action',
        customRender: ({ record, index }: { record: { id: string; name: string; url: string; }; index: number; }): JSX.Element=>
          <>
            <Button type='link' onClick={() => {
              editUe5Model(record, index)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                deleteUe5Model(record)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]

    // 计算table-y的高度
    const getScrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = (): void => {
      getScrollY()
    }
    const queryModel = (): void => {
      modelServer.value = []
      props.data.ue5.roamingRoute.forEach(e => {
        if (e.name.includes(modal.textValue)) {
          modelServer.value.push(...e.route)
        }
      })
      modelServer.value = modelServer.value.reverse()
    }
    const resetting = (): void => {
      modal.textValue = ''
      queryModel()
    }
    const roamingHandelCancel = (): void => {
      try {
        ueClient.send('disableEditing')
        ueClient.ue5Close()
      } catch {
      }
      roamingModal.visible = false
    }
    const editUe5Model = (record: { name: string; url: string;id: string; }, index: number): void => {
      roamingForm.name = record.name
      roamingForm.id = record.id
      roamingModal.title = '编辑点位'
      roamingModal.index = index
      roamingModal.visible = true
      linkModel()
    }
    const deleteUe5Model = async (record: { id: string;name: string; }): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      // ueModel.ue5.roamingRoute.splice(1, 1)
      ueModel.ue5.roamingRoute.forEach((e, i) => {
        if (e.name === record.name) {
          e.route.forEach((item, index) => {
            if (item.id === record.id) {
              e.route.splice(index, 1)
            }
          })
        }
        if (!e.route.length) {
          ueModel.ue5.roamingRoute.splice(i, 1)
        }
      })
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      message.success('删除成功')
    }
    const linkModel = (): void => {
      ueClient.loadUE5(modelContainer.value, props.data.ue5.modelServer[0].url)
      /** 模型连接成功 */
      ueClient.onConnected(async function () {
        /** 重置 ue5 分辨率 */
        ueClient.send('changeResolution', ({
          width: 1150,
          height: 500,
        } as unknown as null | undefined))
        // if (modal.title === '编辑视角') {
        //   ueClient.send('changeCameraView', (formData.value as unknown as undefined))
        // }
        ueClient.send('enableEditing')
      })
    }
    const addUe5Model = (): void => {
      formData.name = ''
      modal.title = '新增漫游路线'
      modal.visible = true
    }
    const editRouteUe5Model = (): void => {
      formData.name = ''
      modal.title = '编辑漫游路线'
      modal.visible = true
    }
    const addRoamingUe5Model = (): void => {
      roamingForm.name = ''
      roamingForm.value = ''
      roamingModal.title = '新增点位'
      roamingModal.visible = true
      linkModel()
    }
    const handelSave = async (): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      if (modal.title === '编辑漫游路线') {
        ueModel.ue5.roamingRoute.forEach(e => {
          if (e.id === formData.id) {
            e.name = formData.name
          }
        })
      } else {
        ueModel.ue5.roamingRoute.push({
          name: formData.name,
          route: [{ name: formData.name, pointName: '', perspective: '', speed: 0.3, sort: 0, id: '' }],
          id: createUuid()
        })
      }
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      modal.visible = false
      message.success('新增路线成功')
    }
    const handelCancel = (): void => {
      modal.visible = false
    }
    const roamingHandelSave = async (): Promise<void> => {
      const ueModel: ModelConfigItf = JSON.parse(JSON.stringify(props.data))
      if (roamingModal.title === '编辑点位') {
        ueModel.ue5.roamingRoute.forEach(e => {
          if (e.name === roamingForm.name) {
            e.route.forEach(item => {
              if (item.id === roamingForm.id) {
                item.pointName = roamingForm.label
                item.perspective = roamingForm.value
              }
            })
          }
        })
      } else {
        ueModel.ue5.roamingRoute.forEach(e => {
          if (e.name === roamingForm.name) {
            e.route.push({
              pointName: roamingForm.label,
              perspective: roamingForm.value,
              sort: 0,
              name: roamingForm.name,
              id: createUuid(),
              speed: 0.3
            })
          }
        })
      }
      await addModel({ modelConfiguration: JSON.stringify(ueModel) })
      emit('getModelData')
      message.success(roamingModal.title === '编辑点位' ? '编辑成功' : '新增成功')
      roamingModal.visible = false
      roamingHandelCancel()
    }
    const changePerspective = (e: string): void => {
      e && ueClient.send('changeCameraView', (e as unknown as undefined))
    }
    const getPerspective = (): void => {
      ueClient.send('getCameraView', async (cameraView: string): Promise<void> => {
        roamingForm.value = JSON.stringify(cameraView)
      })
    }
    watch(() => props.data, () => {
      props.data.ue5.roamingRoute.forEach(e => {
        e.route.forEach((item, index) => {
          item.name = e.name
          item.sort = index
        })
      })
      modelServer.value = []
      props.data.ue5.roamingRoute.forEach(e => {
        modelServer.value.push(...e.route)
      })
      modelServer.value = modelServer.value.reverse()
    })
    onBeforeUnmount(() => {
      roamingHandelCancel()
    })
    return (): JSX.Element =>
      <>
        <div class={styles['model-head']}>
          <div>
            <span> 漫游路线：</span>
            <Input
              style={{ width: '300px' }}
              maxlength={50}
              placeholder='请输入名称搜索'
              v-model:value={modal.textValue}
            />
          </div>
          <div>
            <Button type='primary' style={{ marginLeft: '10px' }} onClick={queryModel}>查询</Button>
            <Button style={{ marginLeft: '10px' }} onClick={resetting}>重置</Button>
          </div>
        </div>
        <Button type='primary' style={{ marginTop: '10px' }} onClick={addUe5Model}>新增漫游路线</Button>
        <Button type='primary' style={{ marginTop: '10px', marginLeft: '10px' }} onClick={editRouteUe5Model}>编辑漫游路线</Button>
        <Button type='primary' style={{ marginTop: '10px', marginLeft: '10px' }} onClick={addRoamingUe5Model}>新增漫游点位</Button>
        <Table
          style={{ marginTop: '10px' }}
          columns={ue5Columns}
          dataSource={modelServer.value}
          scrollY={scrollY.value}
          rowKey='id'
          pagination={false}
        />
        <Modal
          forceRender
          visible={modal.visible}
          okText='保存'
          title={modal.title}
          width='600px'
          onOk={handelSave}
          onCancel={handelCancel}
        >
          <Form model={formData} layout='inline'>
            {
              modal.title === '编辑漫游路线' &&
            <FormItem label='漫游路线' name='label'>
              <Select onChange={(value) => {
                formData.id = value
              }} style={{ width: '200px', marginBottom: '10px' }} value={roamingForm.name} disabled={roamingModal.title === '编辑点位'}>
                {
                  props.data.ue5.roamingRoute.map(e => {
                    return <SelectOption key={e.id} value={e.id}>{e.name}</SelectOption>
                  })
                }
              </Select>
            </FormItem>
            }
            <FormItem label='漫游路线名称' name='name'>
              <Input
                maxlength={8}
                style={{ width: '300px' }}
                placeholder='请输入'
                v-model:value={formData.name}
              />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          forceRender
          visible={roamingModal.visible}
          okText='保存'
          title={roamingModal.title}
          width='1200px'
          onOk={roamingHandelSave}
          onCancel={roamingHandelCancel}
        >
          <Form model={formData} layout='inline'>
            <FormItem label='漫游路线' name='label'>
              <Select onChange={(value) => {
                roamingForm.name = value
              }} style={{ width: '200px' }} value={roamingForm.name} disabled={roamingModal.title === '编辑点位'}>
                {
                  props.data.ue5.roamingRoute.map(e => {
                    return <SelectOption key={e.id} value={e.name}>{e.name}</SelectOption>
                  })
                }
              </Select>
            </FormItem>
            <FormItem label='点位名称' name='label'>
              <Input
                maxlength={20}
                style={{ width: '200px' }}
                placeholder='请输入'
                v-model:value={roamingForm.label}
              />
            </FormItem>
            <FormItem label='视角参数' name='value'>
              <Textarea onChange={changePerspective} autosize={{ minRows: 1, maxRows: 1 }} v-model:value={roamingForm.value} showCount={false} />
            </FormItem>
            <Button type='primary' onClick={getPerspective}>获取视角</Button>
          </Form>
          <div class={styles.player} id='player' ref={modelContainer} />
        </Modal>
      </>
  }
})
