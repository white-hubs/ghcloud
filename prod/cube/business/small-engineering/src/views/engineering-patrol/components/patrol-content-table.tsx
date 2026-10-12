import { computed, defineComponent, nextTick, reactive, ref, watch, type PropType } from 'vue'
import { useCubeTable, useCubeModal, DeptSelect, InspectItemTable, InspectStandardTable } from '@ghcloud/cube-app-design'
import styles from './patrol-content-table.module.less'
import { Button, Input, Space, PopConfirm, Tabs, TabPane, message, AntModal } from '@ghcloud/cube-ui'
import { modalColumns } from './constant'
import { cubeDailyInspectionService, cubeSmallEngineeringService } from '@/api/server'
import type { ProjectScheduleListRecord } from '@ghcloud/cube-small-engineering-service'
import { InspectBusinessType, type StandardItemType, type StandardVOS } from '@ghcloud/cube-daily-inspection-service'
import { useRoute } from 'vue-router'
interface StandardItemsVo {
  alias: string; // 巡检项别名
  content: string; // 巡检项内容
  id: string; // 巡检项ID
  imageResult: string; // 巡检项图片结果
  isRawItem: number; // 是否为原始项
  itemTag: string; // 巡检项标签
  name: string; // 巡检项名称
  referType: string; // 巡检项参考类型
  remarkResult: string; // 巡检项备注结果
  resultId: string; // 巡检项结果ID
  resultItemValue: string; // 巡检项结果值
  standardId: string; // 巡检项所属标准ID
  resultVO: Record<string, unknown> | null; // 巡检项结果
}
interface StandardVo {
  code: string; // 巡检标准Code
  describe: string; // 巡检标准描述
  enable: boolean; // 是否启用
  id: string; // 巡检标准ID
  name: string; // 巡检标准名称
  standardItems: StandardItemsVo[]; // 巡检标准项
}
export interface DataSourceType {
  targetName: string; // 巡检对象 设备名称
  targetId: string; // 巡检对象 ID
  targetParentId: string; // 巡检对象 父级id
  targetType: string; // 巡检对象 类型
  targetTypeName: string; // 巡检对象 类型名称
  targetCode: string; // 巡检对象 编码
  targetCategory: string; // 巡检对象 分类
  location: string; // 巡检对象 位置
  latAndLon: string; // 巡检对象 经纬度
  depName: string; // 巡检对象 所属部门
  areaName: string; // 巡检对象 所属区域
  areaId: string; // 巡检对象 所属区域id
  address: string; // 巡检对象 地址
  standardDTOList: StandardVo[];
}
let rowId: string[] = []
export const PatrolContentTable = defineComponent({
  props: {
    dataSource: {
      type: Array as PropType<DataSourceType[]>,
      default: () => []
    }
  },
  setup: (props, { expose }) => {
    const state = reactive<{
      keyword: string;
      deptId: string | undefined;
    }>({
      keyword: '',
      deptId: undefined
    })
    const route = useRoute()
    let initDataSource: DataSourceType[] = []
    watch(() => props.dataSource, () => {
      if (props.dataSource.length) {
        nextTick(() => {
          initDataSource = props.dataSource
          tableApi.setDataSource(initDataSource)
        })
      }
    })
    const standardTableRef = ref<{
      getStandardSelectedRows: () => StandardVOS[];
      setStandardSelectedRows: (rows: StandardVOS[]) => void;
    }>()
    const inspectItemTableRef = ref<{
      getInspectItemSelectedRows: () => StandardItemType[];
      setInspectItemSelectedRows: (rows: StandardItemType[]) => void;
    }>()
    const columns = [
      {
        title: '巡检对象',
        dataIndex: 'targetName',
        key: 'targetName',
      },
      {
        title: '巡检内容',
        dataIndex: 'content',
        key: 'content',
        customRender: ({ record }: { record: DataSourceType; }): string => {
          if (!record.standardDTOList.length) {
            return '--'
          }
          const text = record.standardDTOList.map((item) => item.name).join(',')
          return text
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: DataSourceType; }): JSX.Element => {
          return (
            <>
              <Button
                type='link' onClick={() => {
                  rowId = [record.targetId]
                  inspectContentModalApi.open()
                  nextTick(() => {
                    standardTableRef.value?.setStandardSelectedRows(record.standardDTOList as unknown as StandardVOS[])
                    const standard = record.standardDTOList.find((item) => item.standardItems.length)
                    if (standard) {
                      inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[])
                    }
                  })
                }}
              >添加巡检内容
              </Button>
              <PopConfirm
                title='是否确定删除?' onConfirm={() => {
                  initDataSource = initDataSource.filter((item) => item.targetId !== record.targetId)
                  tableApi.setDataSource(initDataSource)
                }}
              >
                <Button type='link' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]

    const getApiParams = (): unknown[] => {
      const params: unknown[] = []
      initDataSource.forEach(targetItem => {
        targetItem.standardDTOList.forEach(standardItem => {
          if (standardItem.standardItems.length) {
            standardItem.standardItems.forEach(items => {
              const targetObj = {
                targetCategory: 'SMALL_ENGINEERING', // 设备类型
                targetId: targetItem.targetId, // 设备id
                targetType: targetItem.targetTypeName, // 设备类型
                targetName: targetItem.targetName, // 设备名称
                standardId: standardItem.id, // 标准ID
                targetParentId: '', // 设备父级ID
                targetAddress: '', // 设备地址
                itemId: items.id, // 巡检项ID
                resultCode: items.resultId, // 巡检项结果ID
                latAndLon: '', // 设备经纬度
                targetCode: targetItem.targetCode, // 设备targetCode
                location: '', // 设备地址
                isRawItem: items.isRawItem ?? 0, // 巡检项是否为原始值
                targetAreaId: '', // 设备区域ID
                targetAreaName: ''// 设备区域名称
              }
              params.push(targetObj)
            })
          }
        })
      })
      return params
    }
    const [CubeTable, tableApi] = useCubeTable({
      columns: route.query.type === 'info' ? columns.slice(0, columns.length - 1) : columns,
      dataSource: initDataSource,
      rowSelection: 'checkbox',
      rowKey: 'targetId',
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: 'default', // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          tableApi.setState({
            pagination: {
              ...(tableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current
            },
          })
        }
      }
    })
    const [CubeModalTable, modalTableApi] = useCubeTable({
      columns: modalColumns,
      rowSelection: 'checkbox',
      scrollY: 300,
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 10, // 总条数
        size: 'default', // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          modalTableApi.setState({
            pagination: {
              ...(modalTableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current
            },
          })
          modalTableApi.query()
        }
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        if (params) {
          return cubeSmallEngineeringService.projectScheduleList({
            pageNumber: params.current as number,
            pageSize: params.pageSize as number,
            keyword: state.keyword,
            status: 'UNDERWAY',
            depId: state.deptId,
          })
        }
        return cubeSmallEngineeringService.projectScheduleList({
          pageNumber: 1,
          pageSize: 10,
          status: 'UNDERWAY',
          keyword: state.keyword,
          depId: state.deptId,
        })
      },
    })
    const [InspectContentModal, inspectContentModalApi] = useCubeModal({
      title: '添加巡检内容',
      width: '800px',
      destroyOnClose: false,
      onConfirm () {
        const standardRows: StandardVo[] = []
        const selectedStandardRows = (standardTableRef.value?.getStandardSelectedRows() || []) as unknown as StandardVo[]
        selectedStandardRows.forEach(row => {
          if (!standardRows.some(item => item.id === row.id)) {
            standardRows.push(row)
          }
        })
        // 标准自带的isRawItem为1，选择巡检项时为0
        standardRows.forEach(standard => {
          standard.standardItems = standard.standardItems.map(item => {
            return {
              ...item,
              isRawItem: 1
            }
          })
        })
        if (!standardRows.length) {
          message.error('请选择巡检标准')
          return
        }
        const selectedStandardItems = (inspectItemTableRef.value?.getInspectItemSelectedRows() as unknown as StandardItemsVo[] || []).map(item => {
          return {
            ...item,
            isRawItem: 0
          }
        })
        // 选择巡检项时为false
        standardRows[0].standardItems = [...standardRows[0].standardItems, ...selectedStandardItems]
        initDataSource = initDataSource.map(item => {
          if (rowId.includes(item.targetId)) {
            return {
              ...item,
              standardDTOList: standardRows,
            }
          }
          return item
        })
        tableApi.setDataSource(initDataSource)
        inspectContentModalApi.close()
      }
    })
    const [CubeModal, modalApi] = useCubeModal({
      title: '添加巡检对象',
      width: '1000px',
      onConfirm: async ()=> {
        const selectedRows = modalTableApi.getSelectedRows() as unknown as ProjectScheduleListRecord[]
        const setSelectedRowKeys = modalTableApi.getSelectedRowKeys()
        // 获取选中对象的巡检标准
        const checks = await Promise.all(selectedRows.map(async (item: ProjectScheduleListRecord) => {
          const standards = await cubeDailyInspectionService.getInspectStandard({
            targetCategory: 'SMALL_ENGINEERING',
            targetType: item.projectType ?? '',
            businessType: InspectBusinessType.SMALL_ENGINEERING
          })
          if (!standards || !standards.length) {
            message.error(`${item.projectName}暂无巡检标准`)
          }
          return { item, standards }
        }))
        const handleRowsPromise = checks
          .filter(({ standards }) => Array.isArray(standards) && standards.length > 0)
          .map(({ item, standards }) => {
            const patrolObjStandard = standards.map((std) => {
              return {
                code: std.code,
                describe: std.remark,
                enable: std.enable,
                id: std.id,
                name: std.name,
                standardItems: std.standardItems.map(si => {
                  return {
                    isRawItem: 1,
                    content: '',
                    ...si
                  }
                })
              }
            })
            return Promise.resolve({
              ...item,
              targetId: item.id,
              targetName: item.projectName,
              targetTypeName: item.projectTypeName ?? '',
              standardDTOList: patrolObjStandard,
              targetCategory: 'SMALL_ENGINEERING',
              targetCode: item.projectNum,
              targetType: item.projectType ?? '',
              targetParentId: '',
              location: '',
              latAndLon: '',
              areaName: '',
              areaId: '',
              address: ''
            })
          })
        const handleRows = await Promise.all(handleRowsPromise)
        const concatRows = (tableApi.state.dataSource as unknown as DataSourceType[]).filter((item) => !setSelectedRowKeys.includes(item.targetId))
        initDataSource = [...concatRows, ...handleRows]
        tableApi.setDataSource(initDataSource)
        modalApi.close()
      },
    })
    const handleTabChange = (key: string): void => {
      if (rowId.length > 1) return
      const row = initDataSource.find(item => rowId.includes(item.targetId))
      if (row) {
        if (key === '1') {
          const selectRows = standardTableRef.value?.getStandardSelectedRows() as unknown as StandardVOS[]
          const initRows = row.standardDTOList as unknown as StandardVOS[]
          const rows = [...selectRows, ...initRows]
          standardTableRef.value?.setStandardSelectedRows(rows)
        } else {
          const standard = row.standardDTOList.find(item => item.standardItems.length)
          if (!standard) return
          nextTick(() => {
            inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[])
          })
        }
      }
    }
    const handleBatchRemove = (): void => {
      AntModal.confirm({
        title: '提示',
        content: '确定要移除选中的巡检对象吗？',
        onOk: () => {
          const selectedRowKeys = tableApi.getSelectedRowKeys()
          initDataSource = initDataSource.filter(item => !selectedRowKeys.includes(item.targetId))
          tableApi.setDataSource(initDataSource)
          tableApi.setSelectedRowKeys([])
        }
      })
    }
    const handleBatchChange = (): void => {
      const selectedRowKeys = tableApi.getSelectedRowKeys()
      rowId = selectedRowKeys as string[]
      inspectContentModalApi.open()
    }
    const batchDisabled = computed(() => {
      return !tableApi.getSelectedRowKeys().length
    })
    expose({
      getApiParams
    })
    return (): JSX.Element => (
      <div>
        <div class={styles.searchContent}>
          <Space>
            <Input v-model:value={state.keyword} />
            <Button
              type='primary' onClick={() => {
                const dataSource = initDataSource.filter(item => item.targetName.includes(state.keyword))
                tableApi.setDataSource(dataSource)
              }}
            >搜索
            </Button>
            <Button onClick={() => {
              tableApi.setDataSource(initDataSource)
              state.keyword = ''
            }}
            >重置
            </Button>
          </Space>
          {route.query.type !== 'info' &&
            <Space>
              <Button type='primary' onClick={handleBatchChange} disabled={batchDisabled.value}>批量修改</Button>

              <Button type='primary' onClick={handleBatchRemove} disabled={batchDisabled.value}>批量移除</Button>
              <Button
                type='primary' onClick={() => {
                  const selectedRows = tableApi.state.dataSource as unknown as DataSourceType[]
                  modalTableApi.setSelectedRowKeys(selectedRows.map(item => item.targetId))
                  modalTableApi.setSelectedRows(selectedRows)
                  modalApi.open()
                }}
              >添加对象
              </Button>
            </Space>}

        </div>
        <CubeTable />
        <CubeModal>
          <Space style={{ marginBottom: '12px' }}>
            <DeptSelect v-model:value={state.deptId} style={{ width: '180px' }} />
            <Input placeholder='名称' v-model:value={state.keyword} />
            <Button
              type='primary' onClick={() => {
                modalTableApi.resetFetch()
              }}
            >搜索
            </Button>
            <Button onClick={() => {
              state.keyword = ''
              state.deptId = ''
              modalTableApi.resetFetch()
            }}
            >重置
            </Button>
          </Space>
          <CubeModalTable />
        </CubeModal>
        <InspectContentModal>
          <Tabs defaultActiveKey='1' onTabChange={handleTabChange} forceRender>
            <TabPane tab='巡检标准' key='1'>
              <InspectStandardTable businessType={InspectBusinessType.SMALL_ENGINEERING} ref={standardTableRef} />
            </TabPane>
            <TabPane tab='巡检项' key='2'>
              <InspectItemTable businessType={InspectBusinessType.SMALL_ENGINEERING} ref={inspectItemTableRef} />
            </TabPane>
          </Tabs>
        </InspectContentModal>
      </div>
    )
  }
})
