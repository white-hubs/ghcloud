import { defineComponent, nextTick, onMounted, ref } from 'vue'
import { CLayout } from '@/components/clayout/clayout'
import { GatewayInfo } from './components/gateway-info'
import { ChannelInfo } from './components/channel-info'
import { ControllerInfo } from './components/controller-info'
import { GatewayTree } from '@/components/tree'
import { useRoute, useRouter } from 'vue-router'
import type { TreeDataItemNode } from '@ghcloud/cube-ui/src/components/tree/tree'

export const GatewayDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const changeInfo = async (): Promise<void> => {
      await nextTick()
      gatewaytree.value?.query()
    }
    const handleSelectTree = (value: string, name: string): void => {
      dataId.value = value
      type.value = name
      gatewaytree.value?.selectTree()
    }
    const selectedGateway = ref<string>(route.query?.gwId as string)
    const type = ref<string | undefined>('gateway')
    const titleMap = new Map<number, string>([
      [1, 'gateway'],
      [2, 'channel'],
      [3, 'controller']
    ])
    const title = new Map<string | undefined, string>([
      ['gateway', '网关详情'],
      ['channel', '通道详情'],
      ['controller', '控制器详情']
    ])
    const dataId = ref<string>('')
    const gatewaytree = ref()
    const select = async (value: string, e: { node: { level: number; titleId: number; parent: TreeDataItemNode; }; }): Promise<void> => {
      type.value = titleMap.get(e.node?.level)
      await nextTick()
      dataId.value = value
      selectedGateway.value = value
      // 添加 网关|通道|控制器 路由参数
      const paramsMap = new Map([
        ['gateway', { gwId: dataId.value }],
        ['channel', { gwId: e.node?.parent?.node?.parentId || e.node?.parent?.node.titleId, channelId: dataId.value }],
        ['controller', { gwId: e.node?.parent?.node.parentId, channelId: e.node?.parent?.node.titleId, controllerId: dataId.value }],
      ])
      const params = paramsMap.get(type.value || '')
      router.replace({
        query: {
          ...params
        }
      })
    }
    const typeId = ref<string>('')
    const updateRight = async (value: string, typeName: string): Promise<void> => {
      const typeNameList = new Map<string | undefined, string>([
        ['gwId', 'gateway'],
        ['channelId', 'channel'],
        ['controllerId', 'controller']
      ])
      typeId.value = value
      type.value = typeNameList.get(typeName)
    }
    onMounted(() => {
      dataId.value = typeId.value ?? selectedGateway.value
    })
    const layoutSlots = {
      'layout-left': (): JSX.Element => {
        return (
          <div>
            <GatewayTree
              ref={gatewaytree} levelNeed={3}
              checkable={false} onSelect={select}
              onUpdateRight={updateRight}
            />
          </div>
        )
      },
      'layout-right': (): JSX.Element => {
        return (
          <>
            {
              type.value === 'gateway' && <GatewayInfo onChangeInfo={changeInfo} onSelectTree={handleSelectTree} id={dataId.value} />
            }
            {
              type.value === 'channel' && <ChannelInfo onChangeInfo={changeInfo} onSelectTree={handleSelectTree} id={dataId.value} />
            }
            {
              type.value === 'controller' && <ControllerInfo onChangeInfo={changeInfo} onSelectTree={handleSelectTree} id={dataId.value} />
            }
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <CLayout title={title.get(type.value) ?? ''} v-slots={layoutSlots} showFooter={false} />
      </>
  }
})
