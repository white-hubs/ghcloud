<template>
  <g-layout title="事件详情">
    <template #content-table>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="事件详情">
          <div class="tab-pane-content">
            <div class="sub-item">
              <div class="sub-item-header">
                <g-vertical-line title="事件信息"></g-vertical-line>
              </div>
              <div class="sub-item-content">
                <a-card>
                  <a-card-grid style="width: 20%; text-align: center">事件名称：{{detail.name || '--'}}</a-card-grid>
                  <a-card-grid style="width: 40%; text-align: center">事件时间：{{putFullTime(detail.triggerTime)}}</a-card-grid>
                </a-card>
              </div>
            </div>
            <div class="sub-item">
              <div class="sub-item-header">
                <g-vertical-line title="事件状态"></g-vertical-line>
              </div>
              <div class="sub-item-content">
                <a-card v-for="(item,index) in eventList" :key="index">
                  <a-card-grid style="width: 20%; text-align: center">{{index+1}}</a-card-grid>
                  <a-card-grid style="width: 40%; text-align: center">设备名称：{{item.name}}</a-card-grid>
                  <a-card-grid
                    style="width: 40%; text-align: center">事件条件：{{item.propName+getComparatorLabel(item.op).label+item.oprand}}</a-card-grid>
                </a-card>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="通知记录">
          <message-notice-record :businessKey="id"></message-notice-record>
        </a-tab-pane>
        <a-tab-pane key="3" tab="设备联动">
          <div class="tab-pane-content">
            <equipment-linkage :businessKey="id"></equipment-linkage>
            <equipment-linkage-record :businessKey="id"></equipment-linkage-record>
          </div>
        </a-tab-pane>
        <a-tab-pane key="4" tab="监控联动">
          <video-linkage :businessKey="id"></video-linkage>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template #footer-btn>
      <a-button @click="back">返回</a-button>
    </template>
  </g-layout>
</template>

<script>
import { defineComponent, reactive, toRefs, onMounted, getCurrentInstance } from "vue";
import { comparator } from "@/utils/enumerate"
import { putFullTime } from "@/utils/common"
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const { id } = route.query;
    const state = reactive({
      detail: {},
      putFullTime: putFullTime,
      eventList: []
    })
    const getLinkageEventDetail = async () => {
      const data = await proxy.$api.getLinkageEventDetail({ id: id });
      if (data) {
        state.detail = data;
        state.eventList = JSON.parse(data.ruleConfig);
      }
    }
    const getComparatorLabel = (key) => {
      return comparator.find(item => item.value === key);
    }
    onMounted(() => {
      getLinkageEventDetail()
    })
    const back = () => {
      router.back()
    }
    return {
      ...toRefs(state),
      getComparatorLabel,
      id,
      back
    }
  }
})
</script>

<style lang="less" scoped>
.tab-pane-content {
  height: 100%;
  overflow: auto;

}

:deep(.content-search) {
  padding-top: 0 !important;
}

:deep(.ant-tabs-bar) {
  margin: 0;
}

:deep(.footer-btn) {
  width: 100%;
  text-align: right;
}
</style>
<style>
.sub-item-header {
  margin-bottom: 15px;
  margin-top: 10px;
}
</style>