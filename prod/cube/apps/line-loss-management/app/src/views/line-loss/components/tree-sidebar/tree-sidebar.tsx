import { type DataNode, Empty, InputSearch, Spin, Tree, Space, Input, Button } from '@ghcloud/cube-ui'
import { type Component, defineComponent, onMounted, ref, type PropType } from 'vue'
import styles from './tree-sidebar.module.less'

export const TreeSidebar = defineComponent({
  props: {
    optionsFetchApi: {
      type: Function as PropType<(query?: string) => Promise<DataNode[]>>,
      required: true
    },
    fieldNames: {
      type: Object as PropType<{ title: string; key: string; children: string; }>,
      default: () => ({ title: 'name', key: 'id', children: 'children' })
    },
    placeholder: {
      type: String,
      default: '输入搜索内容'
    },
    rightButton: {
      type: Object as PropType<Component>,
      default: undefined
    },
    selectedKeys: {
      type: Object as PropType<(string | number)[]>,
      default: undefined
    }
  },
  emits: ['select', 'check'],
  setup: (props, { emit }) => {
    const search = ref('')
    const treeData = ref<unknown[]>()
    const loading = ref(false)
    const handleSearch = (): void => {
      queryData()
    }
    const queryData = async (): Promise<void> => {
      loading.value = true
      const res = await props.optionsFetchApi(search.value)
      treeData.value = res
      loading.value = false
    }
    onMounted(() => {
      queryData()
    })

    const treeSlots = {
      title: ({ data }: { data: DataNode; }): JSX.Element => {
        return (
          <div class={[styles['tree-title'], props.rightButton && styles['tree-title-flex']]}>
            <span>{data.name}</span>
            {
              props.rightButton
            }
          </div>
        )
      },
    }
    return (): JSX.Element => (
      <div class={styles['tree-sidebar']}>
        <Space style={{ marginBottom: '15px', width: '100%', paddingRight: '20px' }}>
          <Input v-model:value={search.value} placeholder={props.placeholder} onChange={handleSearch} />
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Space>
        <Spin spinning={loading.value}>
          {
            treeData.value && treeData.value?.length > 0 &&
              <Tree
                v-model:selectedKeys={props.selectedKeys}
                fieldNames={props.fieldNames}
                treeData={treeData.value as DataNode[]}
                onCheck={(value: unknown, option: unknown) => {
                  emit('check', value, option)
                }}
                onSelect={(value: unknown, option: unknown) => {
                  emit('select', value, option)
                }}
                v-slots={treeSlots}
                class={styles['tree-content']}
              />
          }
          {treeData.value?.length === 0 && <Empty />}
        </Spin>
      </div>
    )
  }
})
