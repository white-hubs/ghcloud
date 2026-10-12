import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Tabs, TabPane, Form, Select, FormItem, Input, Button, Table, Page, message, PopOver, PopConfirm } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { useTableScroll } from '@/hook/use-table-scroll'
import { cubeBiDataManagementService } from '@/api/service'
import { ImportModal } from './components/import-modal/import-modal'
import type { MerchantInfoVo } from '@ghcloud/cube-bi-data-management'
import { businessScaleOptions, businessScopeOptions, genderOptions, vehicleTypeOptions } from '@/constants'
import dayjs from 'dayjs'
export const MerchantData = defineComponent({
  setup: () => {
    const importModalRef = ref<{ openModal: () => void; }>()
    const state = reactive<{
      activeTab: string;
      loading: boolean;
      downloadLoading: boolean;
      formState: {
        businessScope: string;
        vehicleType: string;
        businessScaleScope: string;
        name: string;
      };
      dataSource: MerchantInfoVo[];
      page: {
        pageSize: number;
        pageNumber: number;
        total: number;
      };
    }>({
      activeTab: 'PURCHASER',
      loading: false,
      downloadLoading: false,
      formState: {
        businessScope: '',
        vehicleType: '',
        businessScaleScope: '',
        name: ''
      },
      dataSource: [],
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0
      }

    })
    const purchaserColumns = [
      {
        title: '商户名称',
        dataIndex: 'name',
        ellipsis: true,
        fixed: 'left',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '性别',
        dataIndex: 'sex',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const gender = genderOptions.find(item => item.value === text)?.label
          return <PopOver content={gender || '--'}>{gender || '--'}</PopOver>
        }
      },
      {
        title: '年龄',
        dataIndex: 'age',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '商户类型',
        dataIndex: 'merchantType',
        align: 'center',
        ellipsis: true,
        customRender: (): JSX.Element=> {
          return <PopOver content='采购商'>采购商</PopOver>
        }
      },
      {
        title: '区域',
        dataIndex: 'area',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '经营类型',
        dataIndex: 'businessScope',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const scope = businessScopeOptions.find(item => item.value === text)?.label
          return <PopOver content={scope || '--'}>{scope || '--'}</PopOver>
        }
      },
      {
        title: '采购车类型',
        dataIndex: 'vehicleType',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const type = vehicleTypeOptions.find(item => item.value === text)?.label
          return <PopOver content={type || '--'}>{type || '--'}</PopOver>
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
    ]
    const wholesalerColumns = [
      {
        title: '商户名称',
        dataIndex: 'name',
        ellipsis: true,
        fixed: 'left',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '性别',
        dataIndex: 'sex',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const gender = genderOptions.find(item => item.value === text)?.label
          return <PopOver content={gender || '--'}>{gender || '--'}</PopOver>
        }
      },
      {
        title: '年龄',
        dataIndex: 'age',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '商户类型',
        dataIndex: 'merchantType',
        align: 'center',
        ellipsis: true,
        customRender: (): JSX.Element => {
          return <PopOver content='采购商'>采购商</PopOver>
        }
      },
      {
        title: '籍贯',
        dataIndex: 'nativePlace',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '上游来源',
        dataIndex: 'upstreamSource',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '经营规模',
        dataIndex: 'businessScaleNumber',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
    ]
    const commonColumns = [
      {
        title: '操作',
        key: 'action',
        align: 'center',
        customRender: ({ record }: { record: MerchantInfoVo; }): JSX.Element=> {
          return (
            <div class={styles.operate}>
              <Button size='small' type='link' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={async () => handleDelete(record)}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>
            </div>
          )
        }
      }
    ]

    const columns = computed(() => {
      return state.activeTab === 'PURCHASER' ? [...purchaserColumns, ...commonColumns] : [...wholesalerColumns, ...commonColumns]
    })
    const handleExport = async (): Promise<void> => {
      try {
        state.downloadLoading = true
        const res = await cubeBiDataManagementService.downloadTemplate({
          merchantType: state.activeTab
        })
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', `${state.activeTab === 'PURCHASER' ? '采购商' : '批发商'}导入模版.xlsx`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        state.downloadLoading = false
      }
    }
    const handleDelete = async (row: MerchantInfoVo): Promise<void> => {
      try {
        await cubeBiDataManagementService.deleteMerchantInfo({
          id: row.id
        })
        getData()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      }
    }
    const { scrollY } = useTableScroll()
    const pageChange = (page: number, pageSize: number): void => {
      state.page.pageNumber = page
      state.page.pageSize = pageSize
      getData()
    }
    const getData = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeBiDataManagementService.getMerchantInfoPage({
          ...state.page,
          ...state.formState,
          merchantType: state.activeTab,
        })
        state.dataSource = result.records
        state.page.total = result.total
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getData()
    })
    const handleCreate = (): void => {
      history.pushState({}, '', `/portal/bi-data-management/edit-merchant?merchantType=${state.activeTab}&type=add`)
    }
    const handleEdit = (row: MerchantInfoVo): void => {
      history.pushState({}, '', `/portal/bi-data-management/edit-merchant?merchantType=${state.activeTab}&type=edit&id=${row.id}`)
    }
    const handleImport = (): void => {
      importModalRef.value?.openModal()
    }
    const handleSearch = (): void => {
      state.page.pageNumber = 1
      getData()
    }
    const handleChangeTab = (): void => {
      handleSearch()
    }
    const handleReset = (): void => {
      state.formState = {
        businessScope: '',
        vehicleType: '',
        name: '',
        businessScaleScope: '',
      }
      handleSearch()
    }
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <div>
            <Button type='primary' onClick={handleExport} loading={state.downloadLoading}>下载模板</Button>
            <Button type='primary' style={{ marginLeft: '10px' }} onClick={handleImport}>批量导入</Button>
            <Button style={{ marginLeft: '10px' }} onClick={handleCreate} type='primary'>新增</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element =>
        <div class={[styles.container, 'layout-content']}>
          <Tabs v-model:activeKey={state.activeTab} type='card' onChange={handleChangeTab} tab-position='top' animated>
            <TabPane key='PURCHASER' tab='采购商'>
              <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='经营类型'>
                  <Select options={businessScopeOptions} style={{ width: '180px' }} placeholder='请选择经营类型' v-model:value={state.formState.businessScope} />
                </FormItem>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='采购车类型'>
                  <Select options={vehicleTypeOptions} style={{ width: '180px' }} placeholder='请选择采购车类型' v-model:value={state.formState.vehicleType} />
                </FormItem>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Input v-model:value={state.formState.name} placeholder='商户名称' showCount={false} />
                </FormItem>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
                </FormItem>
              </Form>
              <Table columns={columns.value} scrollY={scrollY.value} loading={state.loading} dataSource={state.dataSource} pagination={false} size='small' />
            </TabPane>
            <TabPane key='WHOLESALER' tab='批发商'>
              <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='经营规模'>
                  <Select options={businessScaleOptions} style={{ width: '180px' }} placeholder='请选择经营规模' v-model:value={state.formState.businessScaleScope} />
                </FormItem>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Input v-model:value={state.formState.name} placeholder='商户名称' showCount={false} />
                </FormItem>
                <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
                </FormItem>
              </Form>
              <Table columns={columns.value} scrollY={scrollY.value} loading={state.loading} dataSource={state.dataSource} pagination={false} size='small' />
            </TabPane>
          </Tabs>
        </div>,
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-show={state.page.total > 0}
            v-model:current={state.page.pageNumber}
            v-model:pageSize={state.page.pageSize}
            v-model:total={state.page.total}
            onPageChange={pageChange}
          />
        )
      }
    }
    return (): JSX.Element => (
      // <div class={styles.container}>开发</div>
      <Layout title='商户数据' v-slots={layoutSlots}>
        <ImportModal merchantType={state.activeTab} ref={importModalRef} />
      </Layout>
    )
  }
})
