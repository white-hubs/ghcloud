import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Input, Button, message } from '@ghcloud/cube-ui'
import { getShowStoreRecord, type ShowRecordState, getDownloadShowInfo } from '@/apis/index'
import { downloadZipFile } from '@/utils'
import { AliasTable } from '@ghcloud/generic-component'
export const ShowStore = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      scrollY: number;
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        programName: string;
      };
    }>({
      loading: false,
      dataSource: [],
      scrollY: 500,
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        programName: ''
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams
        }
        const { data } = await getShowStoreRecord(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '节目单名称',
        dataIndex: 'programName',
        key: 'programName',
      },
      {
        title: '分类名称',
        dataIndex: 'categoryName',
        key: 'categoryName',
      },
      {
        title: '节目素材',
        dataIndex: 'download',
        key: 'download',
        customRender: ({ record }: { record: ShowRecordState; }) => {
          return (
            <Button
              type='link' onClick={() => { handleDownload(record) }}
            >下载
            </Button>
          )
        }
      },
    ]
    const handleDownload = async (record: ShowRecordState): Promise<void> => {
      const payload = {
        thirdProgramIds: [record.thirdProgramId],
      }
      try {
        const result = await getDownloadShowInfo(payload)
        if (!result.data.length) {
          message.error('未找到节目素材')
          return
        }
        const downloadPayload = result.data[0].materialVos?.map(item => {
          return {
            url: item.address,
            name: item.materialName,
          }
        })
        if (downloadPayload) {
          await downloadZipFile(record.programName, downloadPayload)
          message.success('下载成功')
        }
      } catch (error) {

        // message.error('下载节目素材失败')
      }
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.programName = ''
      state.searchParams.pageNumber = 1
      getList()
    }
    onMounted(() => {
      getScrollY()
      getList()
    })
    const getScrollY = (): void => {
      const content = document.querySelector('.layout-table')
      if (!content) {
        state.scrollY = 500
        return
      }
      state.scrollY = content.clientHeight - 50
    }
    const layoutSlots = {
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem>
              <Input placeholder='请输入节目名称' v-model:value={state.searchParams.programName} />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': () => {
        return <AliasTable columns={columns} rowKey='id' scrollX={0} loading={state.loading} tableCode='SHOW_STORE' applicationCode='INFORMATION_PUBLISH' dataSource={state.dataSource} pagination={false} scrollY={500} />
      },
      'footer-page': () => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return () => <GLayout title='节目库' v-slots={layoutSlots} />
  }
})
