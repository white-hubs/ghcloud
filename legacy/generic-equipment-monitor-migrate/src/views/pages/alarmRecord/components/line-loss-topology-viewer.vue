<template>
  <div class="line-loss-topology-viewer">
    <div v-if="!initialData" class="line-loss-topology-viewer__empty">
      <div class="line-loss-topology-viewer__empty-title">线路局部拓扑图</div>
      <div class="line-loss-topology-viewer__empty-hint">暂无拓扑快照数据</div>
    </div>
    <ElectricalEditor
      v-else
      :key="snapshotKey"
      :nodes="[]"
      :initial-data="initialData"
      :readonly="true"
      :line-loss-panel="false"
      :show-right-panel="hideRightPanel"
      :options="editorOptions"
      class="line-loss-topology-viewer__editor"
    />
  </div>
</template>

<script setup lang="ts">
import { ElectricalEditor , type ElectricalData} from '@ghcloud/cube-graph-editor-electrical'
import { computed, markRaw } from 'vue'
import { parseLineLossTopologyFromAlarmSnapshot } from '../utils/parse-line-loss-alarm-snapshot'

const props = defineProps<{
  alarmSnapshot?: string | null
}>()

const initialData = computed((): ElectricalData | null => parseLineLossTopologyFromAlarmSnapshot(props.alarmSnapshot))

const snapshotKey = computed(() => {
  const s = props.alarmSnapshot ?? ''
  return `${s.length}-${s.slice(0, 120)}`
})

const hideRightPanel = (): boolean => false

const editorOptions = markRaw({
  grid: true,
  panning: false,
  mousewheel:false,
  snapline: true,
  scroller: false,
  connecting: {
    snap: true,
    allowBlank: false,
    allowLoop: false,
    allowNode: true,
    allowEdge: false,
    allowPort: true,
    highlight: true,
    anchor: 'center',
    connectionPoint: 'anchor',
    router: { name: 'manhattan' },
    connector: { name: 'rounded', args: { radius: 8 } },
    validateMagnet: () => false,
    validateConnection: () => false,
  },
  selecting: { enabled: true, rubberband: false, movable: false, showNodeSelectionBox: true },
  history: false,
  clipboard: { enabled: false },
  keyboard: { enabled: false },
  interacting: {
    nodeMovable: false,
    edgeMovable: false,
    vertexMovable: false,
  },
})
</script>

<style scoped lang="less">
.line-loss-topology-viewer {
  width: 100%;
  min-height: 360px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
  overflow: hidden;
}

.line-loss-topology-viewer__empty {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: rgba(0, 0, 0, 0.45);
}

.line-loss-topology-viewer__empty-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 8px;
}

.line-loss-topology-viewer__empty-hint {
  font-size: 12px;
}

.line-loss-topology-viewer__editor {
  height: 380px;
}

.line-loss-topology-viewer :deep(.electrical-editor) {
  height: 100%;
}

.line-loss-topology-viewer :deep(.graph-editor) {
  height: 100%;
}

.line-loss-topology-viewer :deep(.graph-editor__canvas-container) {
  min-height: 360px;
}
</style>
