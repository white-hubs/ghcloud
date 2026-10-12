import { GLayout } from '@/components/common/layout'
import { Button, Form, FormItem, Input, Page, Empty } from '@ghcloud/cube-ui'
import { Modal } from 'ant-design-vue'
import { defineComponent, reactive, ref, onMounted } from 'vue'
import './model-menu.less'
import { deleteModelPageById, getModelPage, getSysDictionaryByItem } from '@/api/model'
import { GlobalSelect } from '@ghcloud/generic-component'
import type { RecordItf } from '@/api/models/mdata'
export const ModelMenu = defineComponent({
  setup: () => {
    const searchState = reactive({
      name: '',
      id: '',
      modelType: null,
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const modellist = ref<RecordItf[]>([])
    const getInstanceList = async (): Promise<void> => {
      const data = await getModelPage(searchState)
      modellist.value = data.records
      searchState.total = data.total
    }
    const resetInstanceList = async (): Promise<void> => {
      Object.assign(searchState, {
        name: '',
        id: '',
        modelType: '',
        pageSize: 10,
        pageNumber: 1,
        total: 0
      })
      getInstanceList()
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      searchState.pageNumber = pageNumber || 1
      searchState.pageSize = pageSize
      getInstanceList()
    }
    const deletemodel = (id: string): void => {
      Modal.confirm({
        title: '你确定删除当前模型',
        cancelText: '取消',
        okText: '确定',
        content: '删除将无法被项目引用',
        async onOk () {
          await deleteModelPageById(id)
          getInstanceList()
        },

      })
    }
    const editmodel = (id: string): void => {
      history.pushState({}, '', `/portal/visual-config/model-edit?id=${id}`)
    }
    const exportmodel = (): void => {
      history.pushState({}, '', '/portal/visual-config/model-edit')
    }
    onMounted(async () => {
      getInstanceList()
    })
    const gLayoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <Button type='primary' onClick={exportmodel}>导入模型</Button>
        )
      },
      'content-search': (): JSX.Element => {
        return (
          <>
            <div class='flexBetween'>
              <Form layout='inline'>
                <FormItem label='模型名称'>
                  <Input
                    v-model:value={searchState.name} placeholder='请输入模型名称搜索' showCount={false}
                    onChange={() => {
                      searchState.name = searchState.name ? searchState.name.replace(/\s+/g, '') : ''
                    }}
                  />
                </FormItem>
                <FormItem label='模型ID'>
                  <Input
                    v-model:value={searchState.id} placeholder='请输入模型ID搜索' showCount={false}
                    onChange={() => {
                      searchState.id = searchState.id ? searchState.id.replace(/\s+/g, '') : ''
                    }}
                  />
                </FormItem>
                <FormItem label='模型类型'>
                  <GlobalSelect
                    placeholder='请选择模型类型' fieldNames={{
                      label: 'name',
                      value: 'code'
                    }} v-model:value={searchState.modelType} width={200} apiFunction={getSysDictionaryByItem}
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
      'content-table': (): JSX.Element=> {
        return (
          <>

            <div class='content' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gridTemplateRows: '200px' }}>
              {
                modellist.value.length === 0
                  ? <Empty style='margin:auto;transform: translateX(300%);' />
                  // @ts-ignore
                  : modellist.value.map((res, index) => {
                    return (
                      <div class='model' key={index}>
                        <img src={res?.file?.path} style='width:100%;height:100%; position: absolute;' />
                        <div class='model_con'>
                          <div class='type'>{res.modelTypeName}</div>
                          <div style='position: relative;'>
                            <div style=' position: absolute;;right:0;top:-25px'>
                              <Button shape='round' danger size='small' style='margin-right:10px' onClick={() => {
                                deletemodel(res.id)
                              }}>删除</Button>
                              <Button shape='round' type='primary' size='small' style='margin-right:5px' onClick={() => {
                                editmodel(res.id)
                              }}>编辑</Button>
                            </div>

                            <div class='model_name'>
                              <div>
                                模型名称:{res.name}
                              </div>
                              <div>
                                模型id:{res.id}
                              </div>
                            </div>
                            <div />
                          </div>

                        </div>
                      </div>
                    )
                  })
              }
              <div class='hidden' />
            </div>

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
        <GLayout title='模型管理' showFooter v-slots={gLayoutSlots} />
      </>
  }
})
