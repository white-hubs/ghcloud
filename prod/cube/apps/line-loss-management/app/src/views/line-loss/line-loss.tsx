import { defineComponent, reactive, ref } from 'vue'
import { Button, Descriptions, DescriptionsItem } from '@ghcloud/cube-ui'
import { Empty } from 'ant-design-vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { usePageName } from "@ghcloud/cube-utils"
import { TreeSidebar } from './components/tree-sidebar/tree-sidebar'
import { LineLossList } from './components/line-loss-list/line-loss-list'
import { AlarmRecordList } from './components/alarm-record-list/alarm-record-list'
import { LineLossTrend } from './components/line-loss-trend/line-loss-trend'
import { LineLossEditModal } from './components/line-loss-edit-modal/line-loss-edit-modal'
import styles from './line-loss.module.less'
import type { DataNode, EventDataNode, TreeDataItem } from 'ant-design-vue/es/tree'
import { cubeMdataService } from "@/api/server";

interface TreeSelected {
  selected: boolean;
  selectedNodes: TreeDataItem[];
  node: EventDataNode;
  event: string;
}

export const LineLoss = defineComponent({
  name: 'LineLoss',
  setup: () => {
    const { pageTitle } = usePageName()
    const editModalRef = ref()
    const selectedNodeId = ref<string | number>('')
    
    const detailInfo = reactive({
      lineName: '10kV进线柜1#——1#进线柜（总进线）',
      location: '总配电室——1#北区配电房',
      lineType: '',
      lineLength: '',
      lineModel: '',
      installMethod: '',
      remark: '',
    })
    
    const queryTreeData = async (search?: string): Promise<DataNode[]> => {
      return cubeMdataService.getAreaTree() as unknown as DataNode[]
    }
    const handleTreeSelect = (value: unknown, e: TreeSelected): void => {
      const { id, name } = e.node
      selectedNodeId.value = id
    }

    const handleEdit = () => {
      editModalRef.value?.open(detailInfo)
    }

    const handleSave = (data: typeof detailInfo) => {
      Object.assign(detailInfo, data)
    }

    return () => (
          <CubeLayout title={pageTitle} showFooter={false} showTableXScroll={false}>
            {{
              'layout-header': () => (
                selectedNodeId.value ? <Button type='primary' onClick={handleEdit}>编辑</Button> : null
              ),
              'layout-content': () => (
                <div class={styles.container}>
                  <div class={styles.left}>
                    <TreeSidebar
                      placeholder="线路名称"
                      optionsFetchApi={queryTreeData}
                      onSelect={(value: unknown, e: TreeSelected) => {
                        handleTreeSelect(value, e)
                      }}
                    />
                  </div>
                  <div class={styles.right}>
                    {selectedNodeId.value ? (
                    <div class={styles.content}>
                      <div class={styles.sectionHeader}>
                        <div class={styles.title}>基本信息</div>
                      </div>
                      <div class={styles.infoSection}>
                        <Descriptions column={2}>
                          <DescriptionsItem label="线路名称" style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Button type="link" style={{ marginTop: '-5px' }} >{detailInfo?.lineName || '--'}</Button>
                          </DescriptionsItem>
                          <DescriptionsItem label="所在位置">
                            {detailInfo?.location || '--'}
                          </DescriptionsItem>
                          <DescriptionsItem label="线路类型">{detailInfo?.lineType || '--'}</DescriptionsItem>
                          <DescriptionsItem label="线路长度">{detailInfo?.lineLength || '--'}</DescriptionsItem>
                          <DescriptionsItem label="线路型号">{detailInfo?.lineModel || '--'}</DescriptionsItem>
                          <DescriptionsItem label="铺设方式">{detailInfo?.installMethod || '--'}</DescriptionsItem>
                          <DescriptionsItem label="备注" span={2}>{detailInfo?.remark || '--'}</DescriptionsItem>
                        </Descriptions>
                      </div>
                      <div class={styles.sectionHeader}>
                        <div class={styles.title}>线损列表</div>
                      </div>
                      <LineLossList />
                      <div class={styles.sectionHeader}>
                        <div class={styles.title}>线损趋势</div>
                      </div>
                      <LineLossTrend />
                      <div class={styles.sectionHeader}>
                        <div class={styles.title}>预警信息</div>
                      </div>
                      <AlarmRecordList />
                      <LineLossEditModal ref={editModalRef} onOk={handleSave} />
                  </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#fff' }}>
                        <Empty description="请在左侧选择线路" />
                    </div>
                  )}
                </div>
              </div>
              )
            }}
          </CubeLayout>
    )
  }
})
