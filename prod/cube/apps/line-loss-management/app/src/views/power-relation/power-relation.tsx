import { defineComponent, ref } from 'vue'
import { Button, Table, Space, PopConfirm, Switch, UnorderedListOutlined, AppstoreOutlined, PopOver } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import styles from './power-relation.module.less'
import { moveNodeInTree } from './tree-utils'
import { useTableScroll } from "@/hooks/use-table-scroll";
import { PowerRelationModal } from "./components/power-relation-modal";
import { usePageName } from "@ghcloud/cube-utils";


interface PowerNode {
  key: string
  name: string
  type: string
  location: string
  children?: PowerNode[]
}

export const PowerRelation = defineComponent({
  name: 'PowerRelation',
  setup() {
    const { pageTitle } = usePageName()
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      schema: [
        {
          component: 'Input',
          label: '',
          fieldName: 'keyword',
          componentProps: {
            placeholder: '节点名称/所在位置',
            style: { width: '240px' }
          }
        }
      ],
      handleSubmit: () => {
        getData()
      },
      handleReset: () => {
        getData()
      }
    })

    const loading = ref(false)
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          keyword: formApi.formValues.keyword as string ?? '',
        }
        // const res = await cubeLineLossManagementService.getRelationList(params)
        // dataSource.value = res ?? []
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 500)
      }
    }
    const dataSource = ref<PowerNode[]>([
      {
        key: '1',
        name: '园区总进线',
        type: '根节点',
        location: '全园',
        children: [
          {
            key: '1-1',
            name: '10kV进线柜1#',
            type: '高压进线柜',
            location: '总配电室',
            children: [
              {
                key: '1-1-1',
                name: '10kV母线 I 段',
                type: '母线',
                location: '总配电室'
              }
            ]
          },
          {
            key: '1-2',
            name: '母联开关柜',
            type: '联络柜',
            location: '总配电室'
          },
          {
            key: '1-3',
            name: '10kV进线柜2#',
            type: '高压进线柜',
            location: '总配电室',
            children: [
               {
                key: '1-3-1',
                name: '10kV母线 II 段',
                type: '母线',
                location: '总配电室'
              }
            ]
          }
        ]
      },
      {
        key: '2',
        name: '高压配电',
        type: '根节点',
        location: '总配电室',
        children: [
          {
            key: '2-1',
            name: '101出线柜',
            type: '高压出线柜',
            location: '总配电室'
          },
          {
            key: '2-2',
            name: '101主干电缆 (10KV 线1)',
            type: '电缆',
            location: '总配电室→1#华威市场北区'
          }
        ]
      }
    ])

    const columns = [
      {
        title: '节点名称',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '节点类型',
        dataIndex: 'type',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所在位置',
        dataIndex: 'location',
        key: 'location',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 250,
        customRender: ({ record }: { record: PowerNode }) => (
          <Space>
            <Button type="link" size="small" onClick={() => handleOpenModal('add', record)}>新增下级</Button>
            <Button type="link" size="small" onClick={() => handleOpenModal('edit', record)}>编辑</Button>
            <PopConfirm title="确认删除该节点?" onConfirm={() => deleteRow(record)}>
              <Button type="link" size="small" danger>删除</Button>
            </PopConfirm>
          </Space>
        )
      }
    ]
    const showTopology = ref(false)
    const handleViewChange = () => {
      showTopology.value = !showTopology.value
    }

    const isDragEnabled = ref(false)
    const startRecord = ref<PowerNode>({} as PowerNode)
    const endRecord = ref<PowerNode>({} as PowerNode)

    const handleCustomRow = (record: PowerNode) => {
      return {
        style: {
          cursor: isDragEnabled.value ? 'move' : 'default'
        },
        onMouseenter: (event: MouseEvent) => {
          if (isDragEnabled.value) {
            (event.target as HTMLElement).draggable = true
          } else {
             (event.target as HTMLElement).draggable = false
          }
        },
        onDragstart: (event: DragEvent) => {
          if (!isDragEnabled.value) {
             event.preventDefault()
             return
          }
          event.stopPropagation()
          startRecord.value = record
        },
        onDragover: (event: DragEvent) => {
          if (!isDragEnabled.value) return
          event.preventDefault()
        },
        onDrop: (event: DragEvent) => {
           if (!isDragEnabled.value) return
           event.preventDefault()
           endRecord.value = record
           
           if (startRecord.value.key === endRecord.value.key) return
           
           const newDataSource = moveNodeInTree(dataSource.value, startRecord.value.key, endRecord.value.key)
           dataSource.value = newDataSource
        }
      }
    }
    const { scrollY } = useTableScroll()
    const modalRef = ref()

    const handleOpenModal = (type: 'add' | 'edit', record?: PowerNode) => {
      modalRef.value?.open(type, record, type === 'add' ? record : undefined)
    }
    const deleteRow = async (record: PowerNode): Promise<void> => {
      try {
        // if (record?.children && record?.children?.length > 0) {
        //   message.warn("当前区域有下属区域，无法删除");
        //   return;
        // }
        // await cubeLineLossManagementService.deleteRelation(record?.id ?? '')
        // message.success('操作成功')
        // getData()
      } catch {
      }
    }
    const slots = {
      'layout-header': () => (
        <div class={styles.btns}>
            <Space>
                <span>拖拽排序</span>
                <Switch value={isDragEnabled.value} onChange={(checked: boolean) => isDragEnabled.value = checked} />
             </Space>
            <Button type="link" icon={showTopology.value ? <AppstoreOutlined /> : <UnorderedListOutlined />} onClick={handleViewChange}>视图切换</Button>
        </div>
      ),
      'layout-content': () => (
        <div class={styles.tableContainer}>
            <CubeForm />
            <Table
              columns={columns}
              dataSource={dataSource.value}
              rowSelection={{
                onChange: (selectedRowKeys: string[]) => {
                }
              }}
              pagination={false}
              rowKey="key"
              customRow={handleCustomRow}
              loading={loading.value}
              scrollY={scrollY.value}
            />
        </div>
      )
    }

    return () => (
      <div class={styles.container}>
        <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll={false} />
        <PowerRelationModal ref={modalRef} />
      </div>
    )
  }
})
