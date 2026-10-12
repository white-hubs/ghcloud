import { Input, DateRangePicker, PopConfirm, Button, PopOver, Modal, Form, FormItem, Textarea } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { cubeTypeService } from '@/api/service'
import style from './index.module.less'
import Table from '@ghcloud/cube-ui/src/components/table/table'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'
interface AccessoryData {
  code: string;
  keyword: string;
  remarks: string;
  expireDate: string;
  modifyFlag: boolean;
}
export const RiskType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const open = ref<boolean>(false)
    const dataSource = ref<AccessoryData[]>([])
    const formData = ref<{
      name: string;
      remarks: string;
      itemCode: string;
      superiorsId: string;
      level: number;
    }>({
      superiorsId: '',
      level: 1,
      name: '',
      remarks: '',
      itemCode: 'risk-source-type'

    })
    const query = ref({
      keyword: '',
      itemCode: 'risk-source-type',
      pageNumber: 1,
      pageSize: 10
    })
    const state = ref<string>('add')
    const getTypeList = async (): Promise<void> => {
      const data = await cubeTypeService.getType(query.value)
      dataSource.value = data.map((item: { children: any[]; nextList: any[]; }) => {
        return item
      })
    }
    const delRow = async (id: string): Promise<void> => {
      await cubeTypeService.deleteType(id)
      getTypeList()
    }

    const editRow = (record: { name: string; remarks: string; itemCode: string;superiorsId: string;level: number; }): void => {
      state.value = 'edit'
      open.value = true
      formData.value = {...record}
    }
    const columns = [
      {
        title: '序号',
        dataIndex: 'code',
        align: 'center',
        width: 50,
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },

      {
        title: '分类名称',
        dataIndex: 'name',
        align: 'center',
        width: 100,
        ellipsis: true,
        customRender: ({ record, text }: { text: string; record: { expireDate: string;modifyFlag: boolean; }; }): JSX.Element => {
          return record.modifyFlag
            ? <DateRangePicker v-model:value={record.expireDate} />
            : <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '备注说明',
        dataIndex: 'remarks',
        align: 'center',
        width: 300,
        ellipsis: true,
        customRender: ({ record, text }: { text: string; record: { remarks: string;modifyFlag: boolean; }; }): JSX.Element => {
          return record.modifyFlag
            ? <Input showCount={false} v-model:value={record.remarks} />
            : <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        align: 'center',
        width: 300,
        customRender: ({ record }: { record: { permissionState: string; name: string; remarks: string; itemCode: string; id: string;superiorsId: string;level: number; }; }): JSX.Element => {
          return (
            <>
              {record.permissionState === 'NO_DELETE_AND_UPDATE' ? null : <Button type='link' onClick={() => {
                editRow(record)
              }}>编辑</Button>}
              {record.level === 3
                ? null
                : (
                  <Button
                    type='link' onClick={() => {
                      formData.value = {
                        superiorsId: '',
                        name: '',
                        remarks: '',
                        level: 1,
                        itemCode: 'risk-source-type'
                      }
                      formData.value.superiorsId = record.id
                      formData.value.level = record.level + 1

                      state.value = 'add'
                      open.value = true
                    }}
                  >新增分类
                  </Button>
                )}
              {record.permissionState === 'NO_DELETE_AND_UPDATE'
                ? null
                : (
                  <PopConfirm title='确认删除该项？' onConfirm={() => {
                    delRow(record.id)
                  }}>
                    <Button type='link' size='small' danger>删除</Button>
                  </PopConfirm>)}
            </>
          )
        }
      }
    ]
    // const rules = {
    //   serialNumber: { required: true, message: '请输入风险源编码' },
    //   typeCode: { required: true, message: '请选择风险源分类' },
    //   name: { required: true, message: '风险源名称' },
    // }

    const add = async (): Promise<void> => {
      formData.value = {
        superiorsId: '',
        name: '',
        remarks: '',
        level: 1,
        itemCode: 'risk-source-type'
      }
      state.value = 'add'
      open.value = true
    }
    onMounted(async () => {
      // getAreaData()
      // getDeptData()
      getTypeList()
    })
    const addRiskType = async (): Promise<void> => {
      await formRef.value?.validate()
      if (state.value === 'add') {
        await cubeTypeService.addType(formData.value)
      } else {
        await cubeTypeService.putType(formData.value)
      }

      open.value = false
      getTypeList()
    }
    const labelCol = { style: { width: '120px' } }
    const rules = { name: [{ required: true, message: '请输入分险分类' }] }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <div class={style.contentBox}>
              <div style={{ display: 'flex', width: '350px', justifyContent: 'space-between', marginTop: '10px' }}>
                <Input showCount={false} v-model:value={query.value.keyword} style={{ width: '200px' }} />
                <Button type='primary' onClick={async () => getTypeList()}>查询</Button>
                <Button onClick={() => {
                  query.value =
                {
                  keyword: '',
                  itemCode: 'risk-source-type',
                  pageNumber: 1,
                  pageSize: 10
                }
                  getTypeList()
                }}
                >重置
                </Button>
              </div>
              <Table rowKey='id' childrenColumnName='nextList' class={style.mt20} columns={columns} dataSource={dataSource.value} pagination={false} size='small' />
            </div>

          </div>
        )
      },
      'layout-header': (): JSX.Element => {
        return (
          <>
            <Button class={style.ml10} type='primary' onClick={add}>新增</Button>
          </>
        )
      }
    }
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} showFooter={false} />
        <Modal v-model:visible={open.value} title={state.value === 'add' ? '新增风险源分类' : '编辑风险源分类'} onOk={() => {
          addRiskType()
        }}>
          <Form model={formData.value} rules={rules} labelCol={labelCol} ref={formRef}>
            <FormItem label='分类名称' name='name'>
              <Input v-model:value={formData.value.name} showCount={false} />
            </FormItem>
            <FormItem label='备注说明'>
              <Textarea v-model:value={formData.value.remarks} />
            </FormItem>
          </Form>
        </Modal>
      </>
    )
  }
})
