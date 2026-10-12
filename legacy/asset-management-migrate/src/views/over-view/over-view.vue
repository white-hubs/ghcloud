<template>
  <GLayout :title="pageTitle" :showfooter="false" class="over-view">
    <template #header-btn>
      <Form layout="inline">
        <TimeRadioGroup ref="timeRadioGroupRef" v-model:value="period" @change="changeDate" />
        <Button style="margin: 0 10px;" @click="reset">重置</Button>
        <Button type="primary" @click="handleQuery">查询</Button>
      </Form>
    </template>
    <template v-if="period" #layout-content>
      <div style="width: 100%;">
        <TopSquare ref="topSquareRef" :period="period" :dimension="timeFlag" />
        <Row type="flex" :gutter="16" style="margin-bottom:16px">
          <Col :span="12">
            <AssetStatus ref="assetStatusRef" :period="period" :dimension="timeFlag" />
          </Col>
          <Col :span="12">
            <AssetCategory ref="assetCategoryRef" :period="period" :dimension="timeFlag" />
          </Col>
        </Row>
        <DeptAsset ref="deptAssetRef" :period="period" :dimension="timeFlag" />
        <ConsumablesOut ref="consumablesOutRef" :period="period" :dimension="timeFlag" />
        <Row type="flex" :gutter="16" style="margin-top:16px">
          <Col :span="12">
            <DeptUseConsumables ref="deptUseConsumablesRef" :period="period" :dimension="timeFlag" />
          </Col>
          <Col :span="12">
            <AreaAssets ref="areaAssetsRef" :period="period" :dimension="timeFlag" />
          </Col>
        </Row>
      </div>
    </template>
  </GLayout>
</template>
<script lang="ts">
import GLayout from '@/components/common/g-layout.vue'
import TimeRadioGroup from '@/components/common/time-radio-group.vue'
import { nextTick, onMounted, ref } from 'vue'
import AreaAssets from './components/area-assets.vue'
import AssetCategory from './components/asset-category.vue'
import AssetStatus from './components/asset-status.vue'
import ConsumablesOut from './components/consumables-out.vue'
import DeptAsset from './components/dept-asset.vue'
import DeptUseConsumables from './components/dept-use-consumables.vue'
import TopSquare from './components/top-square.vue'
import {Row,Col} from 'ant-design-vue'
import { usePageName } from '@ghcloud/cube-utils'
interface Component {
  getData: () => void;
}
interface TimeRadioGroupComponent {
  getDateSubsce: (par: string) => void;
}
</script>
<script lang="ts" setup>
const { pageTitle } = usePageName()
const timeRadioGroupRef = ref<TimeRadioGroupComponent>();
const period = ref('');
const timeFlag = ref('TODAY');

const topSquareRef = ref<Component>();
const assetStatusRef = ref<Component>();
const assetCategoryRef = ref<Component>();
const deptAssetRef = ref<Component>();
const consumablesOutRef = ref<Component>();
const deptUseConsumablesRef = ref<Component>();
const areaAssetsRef = ref<Component>();

const changeDate = (flag: string) => {
  timeFlag.value = flag;
  setTimeout(() => {
    handleQuery()
  }, 0);
};

// 查询
const handleQuery = () => {
  topSquareRef.value?.getData()
  assetStatusRef.value?.getData()
  assetCategoryRef.value?.getData()
  deptAssetRef.value?.getData()
  consumablesOutRef.value?.getData()
  deptUseConsumablesRef.value?.getData()
  areaAssetsRef.value?.getData()
};

const reset = () => {
  timeRadioGroupRef.value?.getDateSubsce('TODAY');
  handleQuery()
}
onMounted(() => {
  nextTick(() => {
    handleQuery()
  })
})
</script>
<style scoped lang="less">
.over-view {
  background-color: rgba(238, 242, 245, 1);
  padding: 0 !important;

  :deep(.layout-header) {
    background-color: white;
    box-sizing: border-box;
    padding: 0 10px;
  }

  :deep(.layout-footer) {
    display: none;
  }

  :deep(.content-search),
  :deep(.content-table),
  :deep(.content-right) {
    display: none !important;
  }

  :deep(.layout-content) {
    height: calc(100% - 53px);
    background-color: rgba(238, 242, 245, 1);
    overflow-y: scroll;
    overflow-x: hidden;
  }

  :deep(.ant-card-head-title) {
    font-size: 14px;
    font-weight: 400;
    color: #000000;
  }
}
</style>
