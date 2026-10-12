import { getGetwayTree } from '@/api/login'
import { InputSearch, Tree } from '@ghcloud/cube-ui'
import { defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import './tree.less'
import { Button } from 'ant-design-vue'
import type { GatewayUrlParams } from '@/typings/gateway'
interface GatewayTreeProps {
  levelNeed: number;
  checkable: boolean;
  selectedGateway?: string;
  checkedList?: (string | number)[];
}
export const GatewayTree = defineComponent({
  props: {
    levelNeed: {
      type: Number,
      default: 3
    },
    checkable: {
      type: Boolean,
      default: false
    },
    selectedGateway: {
      type: String,
      default: ''
    },
    checkedList: {
      type: Array<string | number>,
      default: []
    }
  },
  emits: ['check', 'select', 'updateRight'],
  setup: (props: GatewayTreeProps, { emit, expose }) => {
    interface DataType {
      titleId: string ; titleName: string;
      children: DataType[];
    }
    const treelist = ref<DataType[]>([])
    const formdata = reactive<{
      keyword: string;
      levelNeed: number;
    }>({
      keyword: '',
      levelNeed: props.levelNeed
    })
    const checkedKeys = ref<(string | number)[]>([])
    const currentid = ref<number | null>(null)

    const route = useRoute()
    const urlPrames = ref<string[]>([
      route.query?.gwId as string,
      route.query?.channelId as string,
      route.query?.controllerId as string
    ].filter(item => item))

    const selectedList = ref<string[]>(urlPrames.value.slice(urlPrames.value.length - 1) || [])
    const expandList = ref<string[]>(urlPrames.value || [])
    // 默认选中菜单项，更新右边视图
    const handleInit = (): void => {
      let typeName = ''
      for (const prop in route.query) {
        if (route.query[prop] === selectedList.value[0]) {
          typeName = prop
        }
      }
      emit('updateRight', selectedList.value[0], typeName)
      if (props.checkedList && props.checkedList?.length > 0) {
        checkedKeys.value = props.checkedList
        emit('check', checkedKeys.value)
      }
    }
    const selectTree = (): void => {
      nextTick(() => {
        setTimeout(() => {
          const { gwId, channelId, controllerId } = route.query as unknown as GatewayUrlParams
          const urlParam = [gwId, channelId, controllerId].filter(e => !!e) as string[]
          selectedList.value = urlParam.slice(urlParam.length - 1)
          expandList.value = urlParam
          handleInit()
        }, 500)
      })
    }
    const treeHeight = ref(0)
    onMounted(async () => {
      query()
      handleInit()
      treeHeight.value = document.querySelector('#treeId')?.clientHeight ?? 0
    })
    interface Tree {
      level: number; disableCheckbox: boolean;
      children: Tree[];
    }
    const treeRef = ref()
    const query = async (): Promise<void> => {
      const { data } = await getGetwayTree(formdata)
      treelist.value = (props.checkable ? data === null ? [] : copy(data as Tree[]) : data === null ? [] : data) as DataType[]
    }

    const search = (): void => {
      checkedKeys.value = []
      query()
    }
    const check = (value: string[], e: { node: { parentId: number;titleId: number; }; }): void => {
      if (e.node.parentId === currentid.value) {
        emit('check', checkedKeys.value)
      } else {
        checkedKeys.value = []
        checkedKeys.value = [e.node.titleId]
        emit('check', checkedKeys.value)
      }
      currentid.value = e.node.parentId
    }

    const select = (value: string[], e: unknown): void => {
      emit('select', value[0], e)
    }


    const copy = (tree: Tree[]): Tree[] | undefined => {
      let list
      if (tree?.length > 0) {
        list = tree?.map((res: Tree) => {
          res.disableCheckbox = res.level !== 3
          if (res.children.length > 0) {
            copy(res.children)
          }
          return res
        })
      }
      return list
    }
    const autoExpandParent = ref<boolean>(true)
    const titleSlots = {
      title: ({ data }: { data: DataType; }): JSX.Element=> {
        return (
          <>
            {
              data.titleName.includes(formdata.keyword)
                ? <div title={data.titleName.substring(data.titleName.indexOf(formdata.keyword) + formdata.keyword.length)} class='treeTitle'>
                  {data.titleName.substring(0, data.titleName.indexOf(formdata.keyword))}
                  <span style='color: #f50'>{formdata.keyword}</span>
                  {data.titleName.substring(data.titleName.indexOf(formdata.keyword) + formdata.keyword.length)}
                </div>
                : <span title={data.titleName} class='treeTitle'>{data.titleName}</span>
            }
          </>
        )
      }
    }
    expose({
      query,
      selectTree
    })
    interface DataType {
      titleId: string ; titleName: string;
      children: DataType[];
    }
    const getp = (data: DataType[], pid: string | null, res: { id: string ;pid: string | null;name: string; }[]): string[] => {
      data.forEach((element: DataType) => {
        res.push({ pid, id: element.titleId, name: element.titleName })
        if (element.children && element.children.length !== 0) {
          getp(element.children, element.titleId, res)
        }
      })


      return res.map((item: { id: string; }) => item.id)
    }
    watch(() => formdata.keyword, () => {
      expandList.value = getp(treelist.value, null, [])
      treelist.value.map(() => {
        return null
      })
    })
    const expandFlag = ref<boolean>(false)
    const prevExpand = ref<string[]>([])
    const autoExpandHandle = (): void => {
      expandFlag.value = !expandFlag.value
      if (expandList.value.length > 0) {
        prevExpand.value = [...expandList.value]
        expandList.value = []
      } else {
        expandList.value = [...prevExpand.value]
      }
    }
    return (): JSX.Element =>
      <>
        <div style='display: flex;align-items: center;justify-content: space-between;'>
          <InputSearch placeholder='请输入' v-model:value={formdata.keyword} onSearch={search} onChange={search} />
          <Button type='link' onClick={autoExpandHandle}>一键{expandFlag.value ? '展开' : '收起'}</Button>
        </div>
        <div style='margin-top:15px;height:calc(100vh - 220px);overflow:auto' id='treeId'>
          {treelist.value.length === 0
            ? <div style='text-align:center'>暂无数据</div>
            : <Tree
              ref={treeRef}
              checkable={props.checkable}
              v-model:checkedKeys={checkedKeys.value}
              onCheck={check}
              onSelect={select}
              treeData={treelist.value}
              height={treeHeight.value - 50}
              fieldNames={{
                children: 'children', title: 'titleName', key: 'titleId'
              }}
              v-model:selectedKeys={selectedList.value}
              v-model:expandedKeys={expandList.value}
              auto-expand-parent={autoExpandParent}
              v-slots={titleSlots}
            />}

        </div>
      </>
  }
})
