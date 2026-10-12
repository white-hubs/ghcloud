<template>
  Hello cube h5.
  <CubeLoading :visible="showTest"/>
  <VanButton type="success" size="small" @click="()=>{showTest = !showTest}">loading test</VanButton>
  <VanButton type="success" size="small" @click="scan">SCAN TEST</VanButton>
  <VanButton type="success" size="small" @click="legacyScan">SCAN LEGACY</VanButton>
  <VanSpace>
    <VanButton type="success" size="small" @click="getCubeAppBridge">getCubeAppBridge</VanButton>
    <VanButton type="success" size="small" @click="getCubeH5Bridge">getCubeH5Bridge</VanButton>
    <VanButton type="success" size="small" @click="getUserAgent">getUserAgent</VanButton>
    <VanButton type="success" size="small" @click="getAppVersion">getAppVersion</VanButton>
    <VanButton type="success" size="small" @click="getRequestHeader">getRequestHeader</VanButton>
  </VanSpace>
  <VanSpace>
    <VanButton
      v-for="[type, label] of Object.entries(FormProcessOperateEnum)" :key="type" type="primary" size="small"
      @click="goFlowHandlePage(type)"
    >
      {{ label.cnName }}
    </VanButton>
  </VanSpace>
  <VanSpace>
    <VanButton type="primary" size="small" @click="goDynamicTable('LEAVE')">请假申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('CANCEL_LEAVE')">销假申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OVERTIME')">加班申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('REPAIR_CLOCK')">补卡申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('LEAVE_THE_POST')">离岗申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('AWAY_BUSINESS')">出差申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('CHANGE_CLASSES')">换班申请</VanButton>
  </VanSpace>
  <VanDivider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">人事管理</VanDivider>
  <VanSpace>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_RECRUIT')">招聘申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_INDUCTION')">入职申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_PROBATION_ASSESS')">考核申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_REGULAR_WORKER')">转正申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_TRAIN')">培训申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_LEAVE_OFFICE')">离职申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_LEAVE_OFFICE_PROCEDURES')">离职手续</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PERSONNEL_ROTATION_POST')">离岗申请</VanButton>
  </VanSpace>
  <VanDivider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">行政管理</VanDivider>
  <VanSpace>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_REGULATION')">制度征求</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_SEAL')">用印申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_TOPIC')">议题预报</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_DOCUMENT_CIRCULATION')">文件传阅</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_DOCUMENT_RECEIVED')">来文申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_FOCUS_WORK')">事项审批</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_URGENT_WORK')">催办申请</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OFFICIAL_FOCUS_WORK_UPDATE')">事项变更</VanButton>
  </VanSpace>
  <VanDivider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">工作汇报</VanDivider>
  <VanButton type="primary" size="small" @click="goDynamicTable('REPORT')">工作汇报</VanButton>
  <VanDivider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">资产管理</VanDivider>
  <VanSpace>
    <VanButton type="primary" size="small" @click="goDynamicTable('PROPERTY_DEPOSITORY')">资产入库</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PROPERTY_ALLOT_PERSONAL')">资产派发</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PROPERTY_ALLOT')">资产调拨</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('PROPERTY_WEED_OUT')">清理报废</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('CONSUMABLE_ADD')">耗材入库</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('CONSUMABLE_REDUCE')">耗材出库</VanButton>
  </VanSpace>
  <VanDivider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">停车管理</VanDivider>
  <VanSpace>
    <VanButton type="primary" size="small" @click="goDynamicTable('VECHICLE_INSERT')">新增车辆</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('VECHICLE_UPDATE')">变更车辆</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('VECHICLE_DELETE')">删除车辆</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('ILLEGAL_PARKING')">车辆违停</VanButton>
  </VanSpace>
  <VanDivider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">运维工单</VanDivider>
  <VanSpace>
    <VanButton type="primary" size="small" @click="goDynamicTable('FAULT')">故障单</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('HIDDENDANGER')">隐患单</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('RETROFIT')">更新改造</VanButton>
    <VanButton type="primary" size="small" @click="goDynamicTable('OUTSOURCE_REPAIR')">委外维修</VanButton>
  </VanSpace>
  <VanSpace>
    <input type="text" v-model="processId" placeholder="processId">
    <VanButton type="danger" size="small" @click="goProcessDetail()">表单详情</VanButton>
    <VanButton type="danger" size="small" @click="goProcessLine()">处理进度</VanButton>
  </VanSpace>
</template>
<script setup lang="ts">
import { CubeAppBusinessBridge, cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { DynamicTableProcessType } from './business/dynamic-table/dynamic-table'
import { FormProcessOperateEnum } from './domain/form-flow'
import CubeLoading from './business/dynamic-table/component/cube-loading.vue';

const scan =async ()=>{
  const res =  await CubeAppBusinessBridge.handleBusinessScanCode()
  alert(res)
}
const legacyScan =async ()=>{
  const res =  await cubeAppService.onScanCode()
  alert(res)
}

const showTest=ref(false)
const router = useRouter()
function getCubeAppBridge () {
  alert((window as any).cubeAppBridge)
}
function getCubeH5Bridge () {
  alert((window as any).cubeH5Bridge)
}
function getUserAgent () {
  alert(window.navigator.userAgent)
}
function getAppVersion () {
  alert(window.navigator.appVersion)
}

async function getRequestHeader () {
  try {
    const user = await cubeAppService.getRequestHeader()
    alert(JSON.stringify(user))
  } catch (error) {
    alert(error)
  }
}

function goDynamicTable (businessType: string) {
  router.push({ name: 'dynamic-table', query: { businessType, processType: DynamicTableProcessType.ADD } })
}

const processId=ref('')
function goProcessDetail () {
  router.push({ name: 'dynamic-table', query: {processId:processId.value, processType: DynamicTableProcessType.HANDLING } })
}

function goProcessLine () {
  router.push({ name: 'process', query: {processId:processId.value } })
}

async function goFlowHandlePage (buttonType: string) {
  await cubeAppService.toFlowProcessHandleEventPage(buttonType, {})
}
</script>
<style>
.van-space {
  display: flex;
  flex-wrap: wrap;
}
.van-space-item {
  margin: 5px;
}
</style>
