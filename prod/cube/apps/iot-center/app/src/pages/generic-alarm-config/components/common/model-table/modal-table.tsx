import { useAsyncEffect } from '@ghcloud/cube-iot-center-app/hooks/use-async-effect'
import { logger } from '@ghcloud/cube-iot-center-app/log'
import { OuaaService, type Department, type Role, type User, type UserQuery, type DepartmentQuery, type RoleQuery } from '@ghcloud/cube-service'
import { Button, Input, Modal, Pagination, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState, type ReactNode } from 'react'
import type { FC } from 'react'

type DataType = User & Role & Department
type DataQuery = UserQuery & RoleQuery & DepartmentQuery
interface ModalTableProps {
  isModalOpen: boolean;
  allSelectedRowKeys: { id: string; name: string; }[];
  closeModal?: (arg0: boolean, arg1?: string[]) => void;
  onOkModal: (arg0: { id: string; name: string; }[]) => void;
  type: 'DEPARTMENT' | 'ROLE' | 'USER';
}

export const ModalTable: FC<ModalTableProps> = ({ isModalOpen, closeModal, type, onOkModal, allSelectedRowKeys }) => {
  const [searchData, setSearchData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<DataQuery>(
    {
      name: '',
      pageNumber: 1,
      pageSize: 10,
      organizationId: undefined,
      keyword: '',
      cascaderIds: '',
      enabled: true
    }
  )

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<{ id: string; name: string; }[]>([])
  const [selectOptions, setSelectOptions] = useState<Department[]>([])
  const [dataSource, seDataSource] = useState<DataType[]>([])
  const [total, setTotal] = useState<number>(0)
  const [columns, setColumns] = useState<ColumnsType<DataType>>([])
  const rowSelection = {
    preserveSelectedRowKeys: true,
    onChange: (keys: React.Key[]): void => {
      setSelectedRowKeys(keys)
    },
    onSelect: (record: DataType, selected: boolean): void => {
      const findIndex = selectedRows.findIndex(e => e.id === record.id)
      if (selected && findIndex === -1) {
        setSelectedRows([...selectedRows, record])
      }
      if (!selected && findIndex !== -1) {
        const rows = JSON.parse(JSON.stringify(selectedRows)) as { id: string;name: string; }[]
        rows.splice(findIndex, 1)
        setSelectedRows(rows)
      }
    },
    onSelectAll: (selected: boolean): void => {
      const rows = JSON.parse(JSON.stringify(selectedRows)) as { id: string;name: string; }[]
      dataSource.forEach(record => {
        const findIndex = rows.findIndex(e => e.id === (record as { id: string; }).id)
        if (findIndex === -1 && selected) {
          rows.push(record)
        }
        if (findIndex !== -1 && !selected) {
          rows.splice(findIndex, 1)
        }
      })
      setSelectedRows(rows)
    }
  }
  const functionApi: Record<string, () => Promise<void>> = {
    DEPARTMENT: async () => {
      setColumns([
        {
          title: '部门名称',
          dataIndex: 'name',
        }
      ])
      const data = await OuaaService.getOrganizations({
        name: query?.name,
        enabled: true
      })
      seDataSource(data)
    },
    ROLE: async () => {
      setColumns([
        {
          title: '角色名称',
          dataIndex: 'name',
        }
      ])
      const data = await OuaaService.getRole({
        keyword: query?.keyword,
        cascaderIds: query?.cascaderIds,
        pageNumber: query?.pageNumber,
        pageSize: query?.pageSize,
      })
      const { records, total } = data
      setTotal(total)
      seDataSource(records)
    },
    USER: async () => {
      setColumns([])
      setColumns([
        {
          title: '名称',
          dataIndex: 'name',
        },
        {
          title: '联系电话',
          dataIndex: 'mobile',
        },
        {
          title: '部门',
          dataIndex: 'organizations',
          render: (text: Department[]): JSX.Element => (
            <div> {text?.map((item: { name: string; }) => item.name).join(',')}</div>
          ),
        },
        {
          title: '性别',
          dataIndex: 'gender',
          render: (text): JSX.Element => (
            <div> {text === 'MALE' ? '男' : text === 'FEMALE' ? '女' : '--'}</div>
          ),
        },
      ])
      const organizations = await OuaaService.getOrganizations({
        name: '',
        enabled: true
      })
      setSelectOptions(organizations)
      logger.info('data', query)
      const userData = await OuaaService.getUserList({
        organizationId: query?.organizationId === undefined ? '' : query?.organizationId,
        keyword: query?.keyword,
        cascaderIds: query?.cascaderIds,
        pageNumber: query?.pageNumber,
        pageSize: query?.pageSize,
        enabled: true
      })
      const { records, total } = userData
      setTotal(total)
      seDataSource(records)
    }
  }
  const functionDom: Record<string, () => ReactNode> = {
    DEPARTMENT: () => <Input
      style={{ width: '70%' }} placeholder='请输入部门名称' onChange={(e: { target: { value: string; }; }) => {
        setQuery({
          ...query,
          name: e.target.value
        })
      }} value={query.name}
    />,
    ROLE: () => <Input
      style={{ width: '70%' }} placeholder='请输入角色名称' onChange={(e: { target: { value: string; }; }) => {
        setQuery({
          ...query,
          keyword: e.target.value
        })
      }} value={query.keyword}
    />,
    USER: () => {
      return (
        <>
          <Select
            style={{ width: '30%' }} placeholder='请选择部门' options={selectOptions} onChange={(e) => {
              setQuery({
                ...query,
                organizationId: e
              })
            }} value={query.organizationId} fieldNames={{ label: 'name', value: 'id' }}
          /> <Input
            style={{ width: '40%' }} placeholder='请输入人员名称' onChange={(e: { target: { value: string; }; }) => {
              setQuery({
                ...query,
                keyword: e.target.value
              })
            }} value={query.keyword}
          />
        </>
      )
    },
    '': () => <div />
  }
  useAsyncEffect(async () => {
    setQuery(
      {
        name: '',
        pageNumber: 1,
        pageSize: 10,
        organizationId: undefined,
        keyword: '',
        cascaderIds: '',
        enabled: true
      }
    )
    seDataSource([])
    setSearchData(!searchData)
    setSelectedRowKeys(allSelectedRowKeys.map(item => item.id))
    setSelectedRows(allSelectedRowKeys)
  }, [isModalOpen])
  useAsyncEffect(async () => {
    try {
      setLoading(true)
      await functionApi[type]()
    } catch {

    } finally {
      setLoading(false)
    }
  }, [searchData])

  return (
    <Modal
      width={800}
      title={type === 'DEPARTMENT' ? '选择部门' : type === 'ROLE' ? '选择角色' : type === 'USER' ? '选择人员' : ''} open={isModalOpen} maskClosable onCancel={() => {
        cancelModal()
      }}
      onOk={() => {
        okModal()
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '550px' }}>
        {functionDom[type]()}
        <Button type='primary' onClick={() => {
          search()
        }}>查询</Button>
        <Button onClick={() => {
          reset()
        }}>重置</Button>
      </div>
      <Table
        loading={loading}
        pagination={type === 'DEPARTMENT' ? {} : false}
        style={{ marginTop: '20px', width: '800px' }}
        scroll={{ y: 400 }}
        rowKey='id'
        dataSource={dataSource}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          type: 'checkbox',
          ...rowSelection,
        }}
      />
      {type !== 'DEPARTMENT' ? <Pagination current={query.pageNumber} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }} total={total} showTotal={(total: number) => `共 ${total} 条`} onChange={pagination} /> : null}
    </Modal>
  )
  function search (): void {
    setSearchData(!searchData)
  }
  function reset (): void {
    setQuery(
      {
        name: '',
        pageNumber: 1,
        pageSize: 10,
        organizationId: undefined,
        keyword: '',
        cascaderIds: '',
        enabled: true
      }
    )

    setSearchData(!searchData)
  }
  function cancelModal (): void {
    closeModal?.(false)
  }
  function okModal (): void {
    onOkModal(selectedRows)
  }
  function pagination (pageNumber: number, pageSize: number): void {
    logger.info(pageNumber, pageSize, 'pagination')
    setQuery({
      ...query,
      pageNumber,
      pageSize
    })
    setSearchData(!searchData)
  }
}
