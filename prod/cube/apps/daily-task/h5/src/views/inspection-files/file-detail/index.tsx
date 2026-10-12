import { defineComponent, onMounted, ref, type VNode } from 'vue'
import { CellGroup, Cell, Tabs, Tab } from 'vant'
import './inspection-detail.less'
import { InspectionList } from './inspection-list'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { useMetaTitle } from '@/views/hooks/use-meta-title-hook'
import { Bar } from '@/components/bar/bar'
import { cubeDailyInspectionService } from '@/api/server'
import type { ArchivesDetail } from '@ghcloud/cube-daily-inspection-service'
/** 巡检详情页面 */
export const FileDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const inspectionDetail = ref<ArchivesDetail>()
    const targetId = route.query.targetId as string ?? route.query.entityId as string ?? ''
    const { entityType } = JSON.parse(route.query.entity as string || '{}') as { entityType: string; entityName: string; entityId: string; }
    onMounted(async () => {
      useMetaTitle()
      inspectionDetail.value = await cubeDailyInspectionService.getInspectArchivesDetail({ targetId, targetCategory: entityType })
    })
    const activeTab = ref('')
    return (): VNode=>
      <div style={{ background: '#f3f7fa', height: '100vh', position: 'relative' }}>
        <Bar />
        <CellGroup class='inspection-detail-cell-group'>
          <Cell>
            <div class='inspection-cell-title'>
              <span>{inspectionDetail.value?.targetName}</span>
            </div>
          </Cell>
          <Cell class='inspection-cell'>
            <div>
              <label>所属部门：</label>
              <span>{inspectionDetail.value?.organizationName || '--'}</span>
            </div>
            <div>
              <label>所在区域：</label>
              <span>{inspectionDetail.value?.areaName || '--'}</span>
            </div>
            <div>
              <label>最近巡检时间：</label>
              <span>{inspectionDetail.value?.time ? dayjs(inspectionDetail.value?.time).format('YYYY-MM-DD HH:mm') : '--'}</span>
            </div>
            <div>
              <label>最近巡检结果：</label>
              <span style={{ color: `${inspectionDetail.value?.result === 'NORMAL' ? '#6AB539' : '#FF4158'}` }}>
                {inspectionDetail.value?.result === 'NORMAL' ? '正常' : '异常'}
              </span>
            </div>
          </Cell>
        </CellGroup>
        <Tabs v-model:active={activeTab.value} class='inspection-detail-tabs' title-active-color='var(--van-primary-color)'>
          <Tab title='日常巡检' name='information'>
            <InspectionList targetId={targetId} temporary='1' />
          </Tab>
          <Tab title='临时巡检' name='trainers'>
            <InspectionList targetId={targetId} temporary='2' />
          </Tab>
        </Tabs>
      </div>
  }
})
