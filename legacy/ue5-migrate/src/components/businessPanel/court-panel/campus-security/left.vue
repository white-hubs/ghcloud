<template>
  <SubPanelTemplate title="空间基础信息">
    <SpaceBasicInfo />
  </SubPanelTemplate>
  <SubPanelTemplate title="实时庭审信息">
    <template #extra>
      <div class="refresh">
        <div class="text">切换</div>
        <img src="/resource/v1/ue5-migrate/assets/images/refresh-icon.png" alt="" srcset="">
      </div>
    </template>
    <!-- <overviewPanel :overPanelData="overPanelData">
    </overviewPanel> -->
    <RealTimeCourtTrial />
  </SubPanelTemplate>
  <SubPanelTemplate title="庭审设备信息">
    <CourtTrailDevice />
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CourtTrailDevice from './components/court-trail-device.vue';
import SpaceBasicInfo from './components/space-basic-info.vue';
import RealTimeCourtTrial from './components/real-time-court-trial.vue';
</script>
<style lang="less" scoped>
.refresh {
  margin-right: 22px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  font-family: Source Han Sans CN, Source Han Sans CN-Medium;
  font-weight: Medium;
  text-align: center;
  color: #d0deee;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 2px;

  .text {
    line-height: 20px;
    box-sizing: border-box;
    font-size: 14px;
  }

  img {
    width: 16px;
    height: 14px;
    margin-left: 4px;
  }
}
</style>