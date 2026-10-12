<template>
  <a-spin :spinning="false" :tip="tip">
    <div class="command-dispatch" :class="{ serious_alarm: seriousAlarm }">
      <div class="commandDispatch-title" :class="{ serious_alarm: seriousAlarm }" @click="goBack">
        指挥综合监管平台
      </div>
      <div id="commandDispatch" :ref="commandDispatchRef"></div>
      <div class="commandDispatch-left" :class="[
        seriousAlarm ? 'serious_alarm' : '',
        viewFull ? 'stow' : 'open',
      ]">
        <div class="alarm-container">
          <div class="alarm-type-tab">
            <div :class="[activeAlarmType==='alarm'&&'active',newMessage.alarm && 'new-dot']"
              @click="()=>checkAlarmType('alarm')">
              报<br>警
            </div>
            <div :class="[activeAlarmType==='patrol'&&'active',newMessage.patrol&&'new-dot']"
              @click="()=>checkAlarmType('patrol')">
              巡<br>更
            </div>
          </div>
          <div class="alarm-type" v-show="activeAlarmType==='alarm'">
            <div v-for="item in typeList" :key="item.value" :class="activeType === item.value ? 'active' : ''"
              @click="clickType(item)">
              {{ item.label }}
            </div>
          </div>
          <div class="patrol-type" v-show="activeAlarmType!=='alarm'">
            <div v-for="item in patrolTabs" :key="item.value" :class="activePatrolType === item.value ? 'active' : ''"
              @click="clickPatrolType(item)">
              {{ item.label }}
            </div>
          </div>
          <div class="selecrData" v-show="activeAlarmType==='alarm'">
            <a-select style="width: 150px" v-model:value="alarmLevelId" @change="alarmLevelChange">
              <a-select-option v-for="item in levelList" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>

            <a-select ref="select" style="width: 150px" @change="alarmTypeChange" v-model:value="alarmTypeId">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="SECURITY_MONITORING">
                安防监控报警
              </a-select-option>
              <a-select-option value="ELECTRICMANAGE">电气报警</a-select-option>
              <a-select-option value="ROTATINGMANAGE">动环报警</a-select-option>
              <a-select-option value="AIRCONDITIONER">空调报警</a-select-option>
              <a-select-option value="FIRECONTROL">消防报警</a-select-option>
              <!-- <a-select-option value="WATERSUPPLYDRAINAGE">
                给排水报警
              </a-select-option>
              <a-select-option value="AIRSUPPLYANDEXHAUST">
                送排风报警
              </a-select-option> -->
              <a-select-option value="ELECTRONIC_PATROL">
                电子巡更报警
              </a-select-option>
            </a-select>
          </div>
          <div class="alarm-list-content" v-show="activeAlarmType==='alarm'">
            <div class="alarm-list" ref="alarmitemRef" v-if="alarmList.length" @scroll="scrool">
              <div class="alarm-item" :style="+new Date() - +new Date(item.alarmTime) < 60000
                ? 'animation: move 2s;'
                : ''
                " :class="{
    serious: item.alarmLevelCode == 'one_level',
    selected: item.id == selectedAlarm?.id,
  }" v-for="(item, index) in alarmList" :key="item.id" :id="`alarm-${index}`" @click="changeAlarmItem(item)">
                <div style="color: #fff">
                  <img :src="getImg(item.applicationCode)" alt="" />
                  {{ item.alarmTypeName }}({{item.alarmTargetName}})
                </div>
                <div class="alarm-title">
                  <div class="title-text">
                    {{ item.alarmEventName }}
                    <span>{{ item.alarmLevelName }}</span>
                  </div>
                  <div class="timeout" v-if="item.alarmHandlerTimeoutStatus == 'TIMED_OUT'">
                    <img :src="`${RES}/images/cs.png`" alt="" />
                  </div>
                  <div class="title-status">
                    {{ item.alarmStatusName }}
                  </div>
                </div>

                <div class="alarm-info">报警时间:{{ item.alarmTime }}</div>
                <div v-if="item.applicationCode!=='ELECTRONIC_PATROL'" class="alarm-info">报警区域:{{ item.areaName }}</div>
                <div v-if="item.applicationCode=='ELECTRONIC_PATROL'" class="alarm-info">负责人:{{
                  getJson(item.snapshot,'publisherName') }}</div>
                <div v-if="item.applicationCode=='ELECTRONIC_PATROL'" class="alarm-info">
                  巡更点:{{getJson(item.snapshot,'patrolLocationNum')}}</div>

                <div class="alarm-info handler" v-if="item.applicationCode!=='ELECTRONIC_PATROL'">
                  处理人:{{
                  item.alarmHandlerName ? item.alarmHandlerName : "--"
                  }}
                </div>
                <div class="alarm-btn" v-if="item.applicationCode=='ELECTRONIC_PATROL'">
                  <div class="btn-item" @click.stop="clickpDetail(item)">详情</div>
                </div>
                <div class="alarm-btn" v-if="item.applicationCode!=='ELECTRONIC_PATROL'">
                  <div class="btn-item" @click.stop="clickDetail(item)">详情</div>
                  <div v-if="item.alarmStatus !== 'ALARM_HANDLER'" class="btn-item"
                    @click.stop="clickTransfer(item, 'assign')">
                    指派
                  </div>
                  <div class="btn-item" @click.stop="clickHandle(item, 'transfer')" v-if="item.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
                    item.alarmStatus === 'ALARM_SUSPEND' ||
                    item.alarmStatus === 'ALARM_UN_CONFIRMED'
                    ">
                    处理
                  </div>
                  <div class="btn-item" @click.stop="clickSuspend(item)"
                    v-if="item.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'">
                    挂起
                  </div>
                </div>
              </div>
              <div class="loading">
                <a-spin :spinning="loadingAlarm" />
              </div>
              <!-- </TransitionGroup> -->
            </div>
            <div v-else class="not-data">
              <a-spin :spinning="loadingAlarm" v-if="loadingAlarm" />
              <img :src="`${RES}/images/not.png`" alt="" v-else />
            </div>
          </div>
          <div class="patrol-list-content" v-show="activeAlarmType!=='alarm'">
            <div class="patrol-list" v-if="patrolList.length" @scroll="handlePatrolListScroll">
              <template v-for="item in patrolList" :key="item.id">
                <patrolListItem :partolInfo="item" :activeId="activePatrolId" @getList="getPatrolListClearActiveId"
                  @click.self="()=>handleClickPatrol(item)" />
              </template>
              <div class="loading">
                <a-spin :spinning="patrolListLoading" />
              </div>
            </div>
            <div v-else class="not-data">
              <a-spin :spinning="patrolListLoading" v-if="patrolListLoading" />
              <img :src="`${RES}/images/not.png`" alt="" v-else />
            </div>
          </div>




        </div>
      </div>
      <div class="commandDispatch-right" :class="[
        seriousAlarm ? 'serious_alarm' : '',
        viewFull ? 'stow' : 'open',
      ]">
        <div class="site-conditions">
          <SubPanelTemplate title="现场情况">

            <template v-slot:extra>
              <a-cascader v-model:value="currentArea" :options="areaOptions" @change="onChangeArea" change-on-select
                :fieldNames="{ label: 'name', value: 'id' }"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode">
                <a-button class="header-btn" size="small">
                  <RetweetOutlined />
                  <span>切换</span>
                </a-button>
              </a-cascader>
            </template>
            <div class="live-video">
              <sceneMonitor :videoList="videoList" @enlargeVideo="enlargeVideo"></sceneMonitor>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="值班人员">
            <div class="personnel">
              <div class="personnel-search">
                <a-input-search size="small" placeholder="根据设备名称或编号搜索" v-model:value="keyword"
                  @pressEnter="getDispatchDeviceList" @search="getDispatchDeviceList" />
              </div>
              <div v-if="deviceList.length" class="personnel-list">
                <div class="personnel-item" v-for="item in deviceList" :key="item.id" @click="prosonPosition(item)">
                  <div class="personnel-info">
                    <div class="personnel-icon">
                      <IconFont type="icon-ren" :style="{ fontSize: '30px', color: '#FFF' }" />
                    </div>
                    <div class="personnel-name">
                      <div class="name">
                        <span>{{ item.name }}</span>
                      </div>
                      <div class="code">号码：{{ item.code }}</div>
                    </div>
                  </div>
                  <div class="personnel-btn">
                    <div @click="SingleCall(item.code)">
                      <IconFont type="icon-yuyin" :style="{ fontSize: '18px', color: '#FFF' }" />
                    </div>
                    <div @click="SingleVideoCall(item.code)">
                      <IconFont type="icon-shipin" :style="{ fontSize: '18px', color: '#FFF' }" />
                    </div>
                    <!-- <div><IconFont type="icon-xiaoxi1" :style="{ fontSize: '18px', color: '#FFF' }"/></div> -->
                  </div>
                </div>
              </div>
              <div v-else class="not-data">
                <img :src="`${RES}/images/not.png`" alt="" />
              </div>
            </div>
          </SubPanelTemplate>
        </div>
      </div>

      <div class="alarm-statistics">
        <div class="statistics-item">
          <div class="statistics-icon">
            <img src="./images/statistics1.png" alt="" />
          </div>
          <div class="statistics-text">
            <div>今日报警</div>
            <div class="statistics-num" style="color: #ff7070">
              <count-to :startVal="0" :endVal="ALARM_TOTAL" :duration="4000"></count-to>
            </div>
          </div>
        </div>
        <div class="statistics-item">
          <div class="statistics-icon">
            <img src="./images/statistics5.svg" alt="" />
          </div>
          <div class="statistics-text">
            <div>待接收</div>
            <div class="statistics-num" style="color: #2989ff">
              <count-to :startVal="0" :endVal="ALARM_UN_CONFIRMED" :duration="4000"></count-to>
            </div>
          </div>
        </div>
        <div class="statistics-item">
          <div class="statistics-icon">
            <img src="./images/statistics2.svg" alt="" />
          </div>
          <div class="statistics-text">
            <div>处理中</div>
            <div class="statistics-num" style="color: #ff9737">
              <count-to :startVal="0" :endVal="ALARM_PROGRESS_CONFIRMED" :duration="4000"></count-to>
            </div>
          </div>
        </div>
        <div class="statistics-item">
          <div class="statistics-icon">
            <img src="./images/statistics3.svg" alt="" />
          </div>
          <div class="statistics-text">
            <div>今日已处理</div>
            <div class="statistics-num" style="color: #1ec138">
              <count-to :startVal="0" :endVal="ALARM_HANDLER_NUM" :duration="4000"></count-to>
            </div>
          </div>
        </div>
        <div class="statistics-item">
          <div class="statistics-icon">
            <img src="./images/statistics4.png" alt="" />
          </div>
          <div class="statistics-text">
            <div>已挂起</div>
            <div class="statistics-num" style="color: #1ec1c1">
              <count-to :startVal="0" :endVal="ALARM_SUSPEND" :duration="4000"></count-to>
            </div>
          </div>
        </div>
        <div class="statistics-item">
          <div class="statistics-icon">
            <img src="./images/statistics4.png" alt="" />
          </div>
          <div class="statistics-text">
            <div>超时未处理</div>
            <div class="statistics-num" style="color: red">
              <count-to :startVal="0" :endVal="TIME_OUT_UN_HANDLER" :duration="4000"></count-to>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-btn" :class="viewFull ? 'stow' : 'open'">
        <div class="btn-box">
          <div class="btn-item" @click="clickFull">
            <FullscreenOutlined v-if="!viewFull" :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <FullscreenExitOutlined v-else :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <p>全屏</p>
          </div>
          <div class="line"></div>
          <div class="btn-item" @click="openMouseTool" :class="{ active: mapEdit }">
            <sync-outlined :style="{
              color: mapEdit ? '#2BAC7E' : '#BBD1EC',
              fontSize: '18px',
            }"></sync-outlined>
            <p>圈选对讲</p>
          </div>
          <div class="btn-item" @click="openMouseToolgb" :class="{ active: mapEditgb }">
            <sync-outlined :style="{
              color: mapEditgb ? '#2BAC7E' : '#BBD1EC',
              fontSize: '18px',
            }"></sync-outlined>
            <p>圈选广播</p>
          </div>
          <div class="line"></div>
          <div class="btn-item" @click="restore">
            <ReloadOutlined :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <p>复位</p>
          </div>
          <div class="btn-item" @click="openCarModal">
            <CarOutlined :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <p>车辆查询</p>
          </div>
        </div>
      </div>
      <!-- market信息框 -->
      <div style="display: none">
        <div class="custom-info" ref="customRef">
          <span class="custom-info-close" @click="closeInfoWindow">
            <CloseOutlined />
          </span>
          <div class="custom-person">
            <div class="custom-person-icon">
              <IconFont type="icon-ren" :style="{ fontSize: '30px', color: '#FFF' }" />
            </div>
            <div class="custom-person-name">
              <div class="person-status">
                {{ markerInfo.name }}
                <span v-if="!markerInfo.onlineStatus">离线</span>
              </div>
              <div class="person-device">
                {{ "智能终端(" + markerInfo.code + ")" }}
              </div>
            </div>
            <div class="custom-person-line" @click="mapTrajectoryList">
              <IconFont type="icon-guiji" :style="{ fontSize: '14px', color: '#FFF' }" />
            </div>
          </div>
          <div class="custom-address">
            <!-- <div>四川省成都市高新区建材路008</div> -->
            <div>{{ "经度：" + markerInfo.lng }}</div>
            <div>{{ "纬度：" + markerInfo.lat }}</div>
            <div>{{ markerInfo.uploadTime }}</div>
          </div>
          <div class="custom-btn">
            <div @click="SingleCall(markerInfo.code)">
              <IconFont type="icon-yuyin" :style="{ fontSize: '14px', color: '#FFF' }" />
              对讲
            </div>
            <div @click="SingleVideoCall(markerInfo.code)">
              <IconFont type="icon-shipin" :style="{ fontSize: '14px', color: '#FFF' }" />
              调度视频
            </div>
            <!-- <div @click="clickMsg">
              <IconFont
                type="icon-xiaoxi1"
                :style="{ fontSize: '14px', color: '#FFF' }"
              />消息
            </div> -->
          </div>
        </div>
        <div class="alarm-market" :class="alarmMarkerInfo.alarmLevelCode == 'one_level' ? 'serious' : 'normal'
          " ref="alarmRef">
          <span class="alarm-market-close" @click="closeInfoWindow">
            <CloseOutlined />
          </span>
          <div class="alarm-title">{{ alarmMarkerInfo.alarmEventName }}</div>
          <div class="alarm-detail">
            <div>报警设备：{{ alarmMarkerInfo.alarmTargetName }}</div>
            <div>报警地点：{{ alarmMarkerInfo.areaName || "--" }}</div>
            <div>报警时间：{{ alarmMarkerInfo.alarmTime }}</div>
          </div>
        </div>
        <!-- 广播 -->
        <div class="custom-info" ref="customBroadcast">
          <span class="custom-info-close" @click="closeInfoWindow">
            <CloseOutlined />
          </span>
          <div class="custom-name">
            <a-tag color="orange" v-if="!currentDevice.deviceStatus">
              离线
            </a-tag>

            <a-tag color="green" v-else>
              在线
            </a-tag>
            {{ currentDevice.deviceName }}
          </div>
          <div class="custom-content">所属区域：{{ currentDevice.areaName }}</div>
          <div class="custom-btn" v-show="currentDevice.deviceStatus">
            <div @click="clickStop">
              <IconFont type="icon-yuyin" :style="{ fontSize: '14px', color: '#FFF' }" />
              停止播放
            </div>
            <div @click="clickShout">
              <IconFont type="icon-yuyin" :style="{ fontSize: '14px', color: '#FFF' }" />
              广播喊话
            </div>
          </div>
        </div>
        <div ref="patrolWindowRef">
          <customMapWindow @click="closeInfoWindow" :state="currentPatrolPoint" />
        </div>

      </div>
      <!-- 详情 -->

      <div v-if="modalData.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal" style="width: 1092px">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <IconFont type="icon-offline" :style="{ fontSize: '24px', color: 'rgba(41, 137, 255, 1)' }" />
              <span>{{ modalData.title }}</span>
            </div>
            <div class="header-close" @click="closeModal">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column">
            <div class="content-tabs">
              <div v-for="item in tabsList" :key="item" :class="item === activeTabs ? 'active' : ''"
                @click="activeTabs = item">
                <div>{{ item }}</div>
                <span>
                  <RightOutlined />
                </span>
              </div>
            </div>
            <div class="conent-body" style="padding-bottom: 10px">
              <alarm-info :id="modalData.id" v-if="activeTabs === '报警详情'" @toDeviceInfo="toDeviceInfo"></alarm-info>
              <alarm-plan :id="modalData.id" :businessKey="modalData.businessKey"
                v-if="activeTabs === '联动预案'"></alarm-plan>
              <alarm-flow :id="modalData.id" v-if="activeTabs === '处理流程'"></alarm-flow>
            </div>
          </div>
        </div>
      </div>

      <div v-if="DevicemodalData.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal videInfo">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <IconFont type="icon-offline" :style="{ fontSize: '24px', color: 'rgba(41, 137, 255, 1)' }" />
              <span>设备详情</span>
            </div>
            <div class="header-close" @click="closeModalDevice">
              <CloseOutlined />
            </div>
          </div>
          <div style="overflow-y: auto; height: 545px" class="atabs">
            <a-tabs v-model:activeKey="activeKey">
              <a-tab-pane key="1" tab="设备信息">
                <g-device-basic :deviceId="DeviceInfo" v-if="DevicemodalData.visible"></g-device-basic>
              </a-tab-pane>
              <a-tab-pane key="4" tab="关联监控">
                <div class="tab-pane-content gvideo-box" v-if="deviceDataVideos.length > 0">
                  <div v-for="(item, index) in deviceDataVideos" :key="index">
                    <div>
                      <span class="gvideo-title" style="color: #fff">{{
                        item.name
                        }}</span>
                      <g-video :ref="(el) => setRef(el, index)" class="gvideo" :token="item.thirdPartyId"
                        :control="true" @fullScreen="fullScreen1(item, index)"></g-video>
                    </div>
                  </div>
                </div>
                <div v-else class="empty">
                  <a-empty />
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </div>
      <div v-if="PatrolData.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>任务详情</span>
            </div>
            <div class="header-close" @click="closeModalAssigntask">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column">
            <!-- <div class="content-tabs"></div> -->
            <div class="conent-body">
              <Task :taskInfo="PatrolData.taskInfo" :id="PatrolData.id" @close="taskclose"></Task>
              <!-- <taskInfo></taskInfo> -->

            </div>

          </div>


        </div>
      </div>
      <!-- 移交 -->
      <div v-if="modalAssign.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>选择人员</span>
            </div>
            <div class="header-close" @click="closeModalAssign">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column">
            <!-- <div class="content-tabs"></div> -->
            <div class="conent-body">
              <personList :operationType="type" :id="modalAssign.id" @close="closeModalAssign" />
            </div>
          </div>
        </div>
      </div>
      <!-- 挂起 -->
      <div v-if="modalSuspend.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>挂起</span>
            </div>
            <div class="header-close" @click="closeModalSuspend">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column">
            <div class="conent-body">
              <alarm-suspend :id="modalSuspend.id" @closeModal="closeModalSuspend"></alarm-suspend>
            </div>
          </div>
        </div>
      </div>
      <!-- /**处理 */ -->
      <div v-if="modalSuspend.handlervisible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>处理</span>
            </div>
            <div class="header-close" @click="closeModalHandle">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column">
            <div class="conent-body">
              <alarm-handle :id="modalSuspend.id" @closeModal="closeModalHandle"></alarm-handle>
            </div>
          </div>
        </div>
      </div>
      <!-- 设备选择 -->
      <div v-if="modalEquipment.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal" :style="mapEditgb ? 'width:800px' : ''">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>{{ mapEditgb ? "圈选广播" : "圈选对讲" }}</span>
            </div>
            <div class="header-close" @click="closeModalEquipment">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column">
            <div class="conent-body">
              <select-circle :selected="modalEquipment.selectedEq" :type="mapEditgb"
                @openbroadcast="openbroadcast"></select-circle>
            </div>
          </div>
        </div>
      </div>
      <!-- 摄像机 -->
      <div v-if="modalVideo.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal vidicon" :class="{ full: videoFull }">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>
                {{
                modalVideo.curEnlargeVideo.name ||
                modalVideo.curEnlargeVideo.deviceName
                }}
              </span>
            </div>
            <div class="header-close" @click="closeModalVideo">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column vidiconcontent" style="padding: 0; height: 670px">
            <div class="conent-body">
              <g-video :token="modalVideo.curEnlargeVideo.thirdPartyId" :control="true"
                @fullScreen="fullScreen"></g-video>
            </div>
          </div>
        </div>
      </div>
      <!-- 广播喊话 -->
      <div v-if="broadcast.visible" class="alarmDetail-wrap">
        <div class="alarmDetail-modal">
          <div class="alarmDetail-modal-header">
            <div class="header-title">
              <span>广播喊话</span>
            </div>
            <div class="header-close" @click="closeModalBroadcast">
              <CloseOutlined />
            </div>
          </div>
          <div class="alarmDetail-modal-content flex-column">
            <div class="conent-body">
              <broadcast-modal :value="currentDevice" :device="broadcastdevice"
                @close="closeModalBroadcast"></broadcast-modal>
            </div>
          </div>
        </div>
      </div>
      <div v-if="carSearchConfig.visible">
        <car-search @close="closeCarSearch" />
      </div>
    </div>
  </a-spin>
</template>

<script>
import {
  CloseOutlined,
  DownOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  CarOutlined,
  RetweetOutlined,
  RightOutlined,
  SyncOutlined,
} from "@ant-design/icons-vue";
import AMap from "AMap";
import "animate.css";
import moment from "moment";

import {
  computed,
  createVNode,
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowReactive,
  shallowRef,
  toRefs,
  watch,
} from "vue";
import { useStore } from "vuex";
import broadcastModal from "./broadcast.vue";
import patrolListItem from './components/patrol-list-item/index.vue'
import alarmFlow from "./flow.vue";
import alarmHandle from "./handle.vue";
import alarmInfo from "./info.vue";
import { AcitvexInit, DestrUct, Load } from "./js/init";
import { CircleShow } from "./js/mapCircleLayer";
import { SingleCall, SingleVideoCall } from "./js/voice";
import personList from "./person.vue";
import Task from './task.vue'
import alarmPlan from "./plan.vue";
import sceneMonitor from "./sceneMonitor";
import selectCircle from "./selectCircle";
import customMapWindow from './components/custom-map-window/index.vue'
import SubPanelTemplate from "./SubPanelTemplate";
import alarmSuspend from "./suspend.vue";
import carSearch from "./components/car-search/car-search.vue";
const alarmMarker = require("./images/alarmMarker.svg");
const personMarket = require("./images/person.png");
const serious = require("./images/serious.png");
const normal = require("./images/normal.png");
const broadcast = require("./images/broadcast.png");
const sybroadcast = require("./images/sy.png");
const patroledIcon = require("./images/patroled-icon.png");
const noPatrolIcon = require("./images/no-patrol-icon.png");
const patrolAbnormalIcon = require("./images/patrol-abnormal-icon.png");
const commandDispatchRef = ref()
import { message } from "ant-design-vue";
import { geTreeLastItem, treeLevelArray } from "@/utils/common";
import { cloneDeep } from "lodash-es";
import { useRouter } from "vue-router";
import { CountTo } from "vue3-count-to";
const RES = '/resource/v1/command-dispatch-putian-migrate'
const alarmIcon = `${RES}/images/alarm-icon.png`
const topBg = `${RES}/images/toast-bg.png`
import { showToast } from './components/toast/index.js'

export default defineComponent({
  components: {
    customMapWindow,
    CountTo,
    SubPanelTemplate,
    CloseOutlined,
    RightOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    DownOutlined,
    RetweetOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    ReloadOutlined,
    SyncOutlined,
    CarOutlined,
    alarmInfo,
    alarmPlan,
    alarmSuspend,
    alarmHandle,
    selectCircle,
    alarmFlow,
    personList,
    Task,
    sceneMonitor,
    carSearch,
    broadcastModal,
    patrolListItem
  },
  setup() {
    const showstatistics = ref(false);
    const router = useRouter();
    const store = useStore();
    const customRef = ref();
    const alarmRef = ref();
    const customBroadcast = ref();
    const alarmitemRef = ref(null);
    const { proxy } = getCurrentInstance();
    const map = shallowRef(null);
    const shallowState = shallowReactive({
      circles: null,
      polyLine: null,
      marketList: [],
      alarmMarker: null,
    });
    const state = reactive({
      alarmState: null,
      deviceDataVideos: [],
      patrolListLoading: false,
      activePatrolId: '',
      type: "",
      seriousAlarm: false,
      loadingAlarm: false,
      timer: null,
      activeAlarmType: 'alarm',
      newMessage: {
        alarm: false,
        patrol: false
      },
      mouseTool: null,
      videoList: [],
      carSearchConfig: {
        visible: false,
      },
      modalVideo: {
        visible: false,
        curEnlargeVideo: null,
      },
      original: {
        center: [],
        level: 15,
      },
      mapEdit: false,
      mapEditgb: false,
      deviceList: [],
      keyword: null,
      typeList: [
        {
          label: "待接收",
          value: "ALARM_UN_CONFIRMED",
          color: "#D9001B",
        },
        {
          label: "处理中",
          value: "ALARM_PROGRESS_CONFIRMED",
          color: "#F59A23",
        },
        {
          label: "已挂起",
          value: "ALARM_SUSPEND",
          color: "#02A7F0",
        },
        {
          label: "已超时",
          value: "TIMED_OUT",
          color: "#02A7F0",
        },
        {
          label: "今日已处理",
          value: "ALARM_HANDLER",
          color: "#02A7F0",
        },
      ],
      alarmList: [],
      activeType: "ALARM_UN_CONFIRMED",
      activeTypecopy: "",

      tabsList: ["报警详情", "联动预案", "处理流程"],
      activeTabs: "报警详情",
      markerInfo: {
        code: "801005",
        direction: 0,
        id: "801005",
        lat: 30.585970927387315,
        lng: 104.0566594377133,
        name: "801005",
        onlineStatus: false,
        speed: 0,
        type: "50",
        typeName: "",
        uploadTime: 1660098103000,
        userId: "",
        videoStatus: false,
      },
      currentDevice: {},
      alarmMarkerInfo: {},
      modalData: {
        visible: false,
        title: "",
        id: "",
        businessKey: "",
      },
      PatrolData: {
        visible: false,
        title: '',
        id: '',
        taskInfo: '',
      },
      DevicemodalData: {
        visible: false,
        title: "",
        id: "",
        businessKey: "",
      },
      modalAssign: {
        visible: false,
        id: "",
      },
      modalSuspend: {
        visible: false,
        handlervisible: false,
        id: "",
      },
      modalEquipment: {
        visible: false,
        selectedEq: [],
      },
      broadcast: {
        visible: false,
      },
      patrolTabs: [
        {
          label: "待确认",
          value: "UN_CONFIRMED",
          color: "#02A7F0",
        },
        {
          label: "已处理",
          value: "HANDLER",
          color: "#02A7F0",
        },
      ],
      ALARM_TOTAL: 0,
      activePatrolType: 'UN_CONFIRMED',
      ALARM_PROGRESS_CONFIRMED: 0,
      ALARM_HANDLER: 0,
      ALARM_HANDLER_NUM: 0,
      ALARM_SUSPEND: 0,
      TIME_OUT_UN_HANDLER: 0,
      ALARM_UN_CONFIRMED: 0,
      selectedAlarm: null,
      videoFull: false,
      currentArea: [],
      index: 0,
      areaOptions: [],
      areaList: [],
      swiperAreaList: [],
      patrolList: [],
      patrolListParams: {
        pageSize: 15,
        pageNumber: 1,
        totalPage: 0
      },
      viewFull: true,
      currentPatrolPoint: {}
    });
    const checkAlarmType = (type) => {
      state.activeAlarmType = type
      if (type === 'patrol') {
        state.patrolList = []
        state.patrolListParams.pageNumber = 1
        state.newMessage.patrol = false
        getPatrolList()
        state.selectedAlarm = null
        if (shallowState.circles) {
          shallowState.circles.remove(map.value);
          map.value.remove(shallowState.alarmMarker);
          shallowState.circles = null;
          shallowState.alarmMarker = null;
        }
        // 取消选中的报警时恢复轮播
        onChangeArea(state.currentArea);
      } else {
        state.alarmList = []
        state.newMessage.alarm = false
        page.value.pageNumber = 1
        getAlarm()
        // 清除点线标记 选中巡更点
        state.activePatrolId = ''
        removePatrolMarkers()
        clearMapPoly()
      }
    }
    let patrolMarkers = []
    let patrolPoly = []
    // 转换
    const handlePatrolForPolyLineLocation = (data = []) => {
      const patrolPolyPath = {
        patroledPath: [],
        unPathrol: []
      }
      const findPatroledIndex = data.findLastIndex(item => item.patrolDate)
      if (findPatroledIndex > -1) {
        patrolPolyPath.patroledPath = data.slice(0, findPatroledIndex + 1)
        patrolPolyPath.unPathrol = data.slice(findPatroledIndex)
      } else {
        patrolPolyPath.patroledPath = []
        patrolPolyPath.unPathrol = data
      }
      return patrolPolyPath
    }
    const handleClickPatrol = (item) => {
      const { locations = [], id } = item;
      // 清除当前的巡更点位及线条及窗体
      removePatrolMarkers()
      closeInfoWindow()
      if (state.activePatrolId === id) {
        state.activePatrolId = ''
      } else {
        state.activePatrolId = id
        const polyPath = handlePatrolForPolyLineLocation(locations)
        const solidPath = polyPath.patroledPath.map(item => {
          return [+item.patrolDimension, +item.patrolLongitude]
        })
        const dashedPath = polyPath.unPathrol.map(item => {
          return [+item.patrolDimension, +item.patrolLongitude]
        })

        // 画点位
        locations.forEach(item => {
          let icon = patroledIcon;
          if (!item.patrolDate) {
            icon = noPatrolIcon
          }
          if (item.result === 'ABNORMAL' && item.patrolDate) {
            icon = patrolAbnormalIcon
          }
          if (item.result === 'NORMAL' && item.patrolDate) {
            icon = patroledIcon;
          }

          const lngLat = [+item.patrolDimension, +item.patrolLongitude]
          addMarkToMap(lngLat, icon, item)
        })
        // 需求删除巡更画线 暂注释
        // // 画实线
        // paintSolidPolyForMap(solidPath)
        // // 画虚线
        // paintDashedPolyForMap(dashedPath)
      }

    }
    const patrolWindowRef = ref()
    // 清除线
    const clearMapPoly = () => {
      map.value.remove(patrolPoly)
    }
    // 画虚线
    const paintDashedPolyForMap = (path = []) => {
      if (path.length < 2) return;
      const polyline = new AMap.Polyline({
        map: map.value,
        path: path,
        strokeColor: "#2989FF",
        strokeWeight: 6,
        strokeStyle: 'dashed',
        showDir: true
      })
      if (!map.value) return
      map.value.setFitView([polyline])
      patrolPoly.push(polyline)
    }
    // 画实线
    const paintSolidPolyForMap = (path = []) => {
      if (path.length < 2) return;
      const polyline = new AMap.Polyline({
        map: map.value,
        path: path,
        strokeColor: "#2989FF",
        strokeWeight: 6,
        strokeStyle: 'solid',
        showDir: true
      })
      if (!map.value) return
      map.value.setFitView([polyline])
      patrolPoly.push(polyline)
    }
    // 清除巡更点标记
    const removePatrolMarkers = () => {
      if (!map.value) return
      if (!patrolMarkers.length) return
      patrolMarkers.forEach(item => {
        map.value.remove(item);
      })
      patrolMarkers = []
    }
    // 新增巡更点标记
    const addMarkToMap = (lngLat, icon, patrolPoint) => {
      const mapIcon = new AMap.Icon({
        size: new AMap.Size(36, 52),
        // 图标尺寸
        image: icon ?? broadcast, // Icon的图像
        imageSize: new AMap.Size(36, 52), // 根据所设置的大小拉伸或压缩图片
      });
      const marker = new AMap.Marker({
        position: new AMap.LngLat(lngLat[0], lngLat[1]),
        // 将一张图片的地址设置为 icon
        icon: mapIcon,
        // 设置了 icon 以后，设置 icon 的偏移量，以 icon 的 [center bottom] 为原点
        offset: new AMap.Pixel(-13, -30)
      });
      if (!map.value) return;
      map.value.add(marker);
      patrolMarkers.push(marker)
      marker.on("click", function () {
        state.currentPatrolPoint = patrolPoint
        state.currentPatrolPoint.patrolTime = patrolPoint.patrolDate ? moment(patrolPoint.patrolDate).format('YYYY-MM-DD hh:mm') : ''
        let infoWindow = new AMap.InfoWindow({
          isCustom: true, //使用自定义窗体
          content: patrolWindowRef.value,
          offset: new AMap.Pixel(0, -26),
        });
        infoWindow.open(map.value, marker.getPosition());
      });
      map.value.setFitView([marker])
    }
    const getPatrolListClearActiveId = () => {
      getPatrolList()
      removePatrolMarkers()
      clearMapPoly()
      state.activePatrolId = ''
    }
    const getPatrolList = async () => {
      try {
        state.patrolListLoading = true
        const params = {
          ...state.patrolListParams,
          affirm: state.activePatrolType === 'UN_CONFIRMED' ? false : true
        }
        const res = await proxy.$api.getPatrolAbnormalList(params)
        const patrolList = res.records.map(item => {
          return {
            ...item,
            startTime: moment(item.startDate).format('MM.DD hh:mm'),
            endTime: moment(item.endDate).format('MM.DD hh:mm'),
          }
        })
        state.patrolListParams.totalPage = res.pages
        state.patrolList = state.patrolListParams.pageNumber > 1 ? [...state.patrolList, ...patrolList] : [...patrolList]
      } catch (error) {
      } finally {
        state.patrolListLoading = false
      }

    }
    //设备链接状态
    const verifyResult = computed(() => {
      return store.getters.commandDispatch.verifyResult;
    });
    //登录状态
    const loginResult = computed(() => {
      return store.getters.commandDispatch.loginResult;
    });
    const tip = computed(() => {
      let txt = "连接系统中...";
      if (!store.getters.commandDispatch.verifyResult) {
        txt = "连接系统中...";
      }
      return txt;
    });
    watch(
      () => store.getters.commandDispatch.verifyResult,
      (n) => {
        if (n) {
          getDispatchConfig();
          // AcitvexInit(800000,800000,'192.168.0.205')
        }
      }
    );
    let markArray = ref([]);
    const setmark = () => {
      if (markArray.value.length > 0) {
        for (let i = 0; i < markArray.value.length; i++) {
          map.value.remove(markArray.value[i]);
        }
        markArray.value = [];
      }
    };
    const openCarModal = () => {
      state.carSearchConfig.visible = true
    }
    const closeCarSearch = () => {
      state.carSearchConfig.visible = false
    }
    // 获取广播设备
    const getDeviceByModel = () => {
      proxy.$api
        .getbroadcastDeviceInfo({ applicationCode: "BROADCAST_CENTER" })
        .then((res) => {
          setmark();
          res.forEach((item) => {
            if (item.lntAndLat) {
              let lngLat = item.lntAndLat.split(",");
              var icon = new AMap.Icon({
                size: new AMap.Size(36, 52),
                // 图标尺寸
                image: item.workStatus == "1" ? sybroadcast : broadcast, // Icon的图像
                imageSize: new AMap.Size(36, 52), // 根据所设置的大小拉伸或压缩图片
              });
              let marker = new AMap.Marker({
                position: new AMap.LngLat(lngLat[0], lngLat[1]), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                icon: icon,
                offset: new AMap.Pixel(-18, -26),
              });
              markArray.value.push(marker);
              marker.on("click", function () {
                Object.assign(state.currentDevice, item);
                let infoWindow = new AMap.InfoWindow({
                  isCustom: true, //使用自定义窗体
                  content: customBroadcast.value,
                  offset: new AMap.Pixel(0, -26),
                });
                infoWindow.open(map.value, marker.getPosition());
              });
              map.value.add(marker);
            }
          });
        });
    };
    const settime = ref(null);
    settime.value = setInterval(() => {
      getDeviceByModel();
    }, 600000);
    const getLatLngOptionByAddress = () => {
      const id = store.getters.nowEnterprise?.code ?? '58197260';
      return new Promise((resolve, reject) => {
        proxy.$api.getTenantInfo({ id }).then(res => {
          let { lntAndLat } = res
          if (lntAndLat) {
            resolve({ lng: lntAndLat.split(',')[1], lat: lntAndLat.split(',')[0] })
          } else {
            resolve({ lng: 104.021509, lat: 30.565134 })
          }
        })
      })
    }
    //高德地图引入
    const gaode = async () => {
      const locationInfo = await getLatLngOptionByAddress() //获取位置
      state.original.center = [locationInfo.lng, locationInfo.lat]
      state.original.level = 18;

      // 创建地图实例
      map.value = new AMap.Map("commandDispatch", {
        center: [locationInfo.lng, locationInfo.lat],
        zoom: 18,
        resizeEnable: true, //是否监控地图容器尺寸变化
        mapStyle: "amap://styles/darkblue",
        // showLabel: false, //不显示地图文字标记
      });
      state.mouseTool = new AMap.MouseTool(map.value);
      let overlays = [];
      state.mouseTool.on("draw", function (e) {
        map.value.remove(overlays);
        overlays = [];
        overlays.push(e.obj);
        if (e.obj._opts.center.lng && e.obj._opts.radius) {
          getDispatchCircleDevice(
            e.obj._opts.center.lng,
            e.obj._opts.center.lat,
            e.obj._opts.radius
          );
        }
      });
      // openMouseTool()
      getDispatchDeviceList();
    };
    //获取租户的调度台配置
    const getDispatchConfig = () => {
      proxy.$api.getDispatchConfig().then((res) => {
        if (res && res.account) {
          AcitvexInit(
            res.account,
            res.password,
            res.platformAddr.split("//")[1].split(":")[0]
          );
          // if (map.value) {
          //   let extendConfig = JSON.parse(res.extendConfig);
          //   map.value.setCenter([
          //     extendConfig.center.lng,
          //     extendConfig.center.lat,
          //   ]);
          //   state.original.center = [
          //     extendConfig.center.lng,
          //     extendConfig.center.lat,
          //   ];
          //   map.value.setZoom(state.original.level);
          // }
        }
      });
    };
    const restore = () => {
      map.value.setCenter(state.original.center);
      map.value.setZoom(state.original.level);
      if (shallowState.polyLine) {
        map.value.remove(shallowState.polyLine);
        shallowState.polyLine = null;
      }
    };
    // 调度设备状态列表
    const getDispatchDeviceList = () => {
      if (shallowState.marketList.length) {
        map.value.remove(shallowState.marketList);
      }
      proxy.$api
        .getDispatchDeviceList({ name: state.keyword, onlineStatus: 1 })
        .then((res) => {
          state.deviceList = res.filter((item) => {
            if (item.lat && item.lng) {
              return item;
            }
          });
          shallowState.marketList = [];
          state.deviceList.forEach((item) => {
            let marker = new AMap.Marker({
              position: new AMap.LngLat(item.lng, item.lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
              title: item.name,
              icon: personMarket,
            });
            marker.on("click", () => {
              state.markerInfo = {
                ...item,
                uploadTime: moment(item.uploadTime).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
              };
              nextTick(() => {
                let infoWindow = new AMap.InfoWindow({
                  isCustom: true, //使用自定义窗体
                  content: customRef.value,
                  offset: new AMap.Pixel(20, 0),
                });
                infoWindow.open(map.value, marker.getPosition());
              });
            });
            shallowState.marketList.push(marker);
          });
          map.value.add(shallowState.marketList);
        });
    };
    const intervalTimer = setInterval(() => {
      getDispatchDeviceList();
    }, 1000 * 60);
    //关闭窗体信息
    const closeInfoWindow = () => {
      map.value.clearInfoWindow();
    };
    //关闭圈选效果
    const closeMouseTool = () => {
      state.mapEdit = false;
      // state.mapEditgb = false;
      state.mouseTool.close(true);
    };
    //打开圈选效果
    const openMouseTool = () => {
      state.mouseTool.circle({
        fillColor: "#00b0ff",
        strokeColor: "#80d8ff",
        //同Circle的Option设置
      });
      state.mapEdit = true;
      state.mapEditgb = false;
    };
    const openMouseToolgb = () => {
      state.mouseTool.circle({
        fillColor: "#00b0ff",
        strokeColor: "#80d8ff",
        //同Circle的Option设置
      });
      state.mapEditgb = true;
      state.mapEdit = false;
    };
    //圈选查询设备
    const getDispatchCircleDevice = (lng, lat, radius) => {
      if (state.mapEditgb) {
        proxy.$api
          .getDispatchCircleBroadcast({
            lng,
            lat,
            radius,
          })
          .then((res) => {
            state.modalEquipment.visible = true;
            state.modalEquipment.selectedEq = res;
            closeMouseTool();
          });
      } else {
        proxy.$api
          .getDispatchCircleDevice({ lng, lat, radius, onlineStatus: 1 })
          .then((res) => {
            state.modalEquipment.visible = true;
            state.modalEquipment.selectedEq = res;
            closeMouseTool();
          });
      }
    };
    // 关闭设备设备组建框
    const closeModalEquipment = () => {
      state.modalEquipment.visible = false;
      state.mapEditgb = false;
      state.modalEquipment.selectedEq = [];
    };
    //点击报警类型
    const clickType = (item) => {
      state.activeType = item.value;
      state.selectedAlarm = {};
      state.timer = null;
      page.value.pageNumber = 1;
      if (item.value == "TIMED_OUT") {
        state.activeType = item.value;
        getAlarm("TIMED_OUT", "");
      } else if (item.value == "ALARM_HANDLER") {
        state.activeType = item.value;

        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    };
    const clickPatrolType = (item) => {
      state.activePatrolType = item.value
      state.patrolListParams.pageNumber = 1
      getPatrolList()
    }
    //点击消息
    const clickMsg = () => { };
    const alarmLevelId = ref("");
    const alarmTypeId = ref("");
    const alarmLevelChange = (value) => {
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    };
    const alarmTypeChange = (value) => {
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    };
    //获取报警列表
    const page = ref({
      pageSize: 10,
      pageNumber: 1,
      pages: 0
    });
    const getAlarm = async (alarmHandlerTimeoutStatus, period) => {
      state.loadingAlarm = true;
      await proxy.$api
        .unHandleAlarmRecordList({
          alarmTypeId: "",
          ...page.value,
          period: state.activeType == "ALARM_HANDLER" ? period : "",
          alarmTypeCode: alarmTypeId.value,
          alarmLevelId: alarmLevelId.value,
          alarmStatus:
            state.activeType == "TIMED_OUT" ? null : state.activeType,
          alarmHandlerTimeoutStatus: alarmHandlerTimeoutStatus,
          businessType: "EMERGENCY_CENTER_ALARM",
        })
        .then((res) => {
          const alarmList = res.records.map((item) => {
            return {
              ...item,
              alarmTime: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
            };
          })
          state.alarmList = page.value.pageNumber !== 1 ? [...state.alarmList, ...alarmList] : [...alarmList]
          nextTick(() => {
            alarmitemRef.value && alarmitemRef.value.addEventListener("scrοll", scrool);
          })
          page.value.pages = res.pages
        })
        .finally(() => {
          state.loadingAlarm = false;
        });
    };

    //获取报警统计
    const getAlarmStatistics = () => {
      state.loadingAlarm = true;
      proxy.$api
        .getAlarmStatistics({
          businessType: "EMERGENCY_CENTER_ALARM",
          period: [
            moment(new Date()).format("YYYY-MM-DD 00:00:00"),
            moment(new Date()).format("YYYY-MM-DD 23:59:59"),
          ].join(","),
        })
        .then((res) => {
          state.ALARM_TOTAL = res.alarmNum;
          state.ALARM_HANDLER_NUM = res.alarmHandlerNum
          res.alarmStatusStatisticsVOS.forEach((item) => {
            switch (item.alarmStatus) {
              case "ALARM_UN_CONFIRMED":
                state.ALARM_UN_CONFIRMED = item.alarmNum;
                break;
              case "ALARM_PROGRESS_CONFIRMED":
                state.ALARM_PROGRESS_CONFIRMED = item.alarmNum;
                break;
              case "ALARM_SUSPEND":
                state.ALARM_SUSPEND = item.alarmNum;
                break;
              case "ALARM_HANDLER":
                state.ALARM_HANDLER = item.alarmNum;
                break;
              case "TIME_OUT_UN_HANDLER":
                state.TIME_OUT_UN_HANDLER = item.alarmNum;
            }
          });
        }).finally(() => {
          state.loadingAlarm = false;
        });
    };
    let starttime = moment(new Date()).format("YYYY-MM-DD ") + "00:00:00";
    let enttime = moment(new Date()).format("YYYY-MM-DD ") + "23:59:59";
    //点击详情
    const clickDetail = (item) => {
      state.modalData.visible = true;
      state.modalData.title = item.alarmTargetName + "-" + item.alarmTypeName;
      state.modalData.businessKey = item.businessKey;
      state.modalData.id = item.id;
    };
    const clickpDetail = (item) => {
      state.PatrolData.visible = item.id;
      state.PatrolData.visible = true;
      state.PatrolData.taskInfo = Object.assign(JSON.parse(item.snapshot), { alarmid: item.id, alarmStatus: item.alarmStatus })
    }
    //关闭弹框
    const closeModal = () => {
      state.modalData.visible = false;
      state.modalData.id = null;
      state.modalData.businessKey = null;
      state.activeTabs = "报警详情";
    };
    //点击移交
    const clickTransfer = (item, type) => {
      state.type = type;
      state.modalAssign.visible = true;
      state.modalAssign.id = item.id;
    };
    /**点击处理 */
    const clickHandle = (item) => {
      state.modalSuspend.handlervisible = true;
      state.modalSuspend.id = item.id;
    };
    // 挂起
    const clickSuspend = (item) => {
      state.modalSuspend.visible = true;
      state.modalSuspend.id = item.id;
    };
    // 关闭挂起弹窗
    const closeModalSuspend = () => {
      state.modalSuspend.visible = false;
      state.modalSuspend.id = null;
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    };
    const closeModalHandle = () => {
      state.modalSuspend.handlervisible = false;
      state.modalSuspend.id = null;
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    };
    //关闭弹框
    const closeModalAssigntask = () => {
      state.PatrolData.visible = false
    }
    const closeModalAssign = () => {
      state.modalAssign.visible = false;
      state.modalAssign.id = null;
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
      getAlarmStatistics();
    };
    // 选择报警
    const changeAlarmItem = (item) => {
      state.seriousAlarm = false;
      if (state.selectedAlarm && state.selectedAlarm.id == item.id) {
        state.selectedAlarm = null;
        if (shallowState.circles) {
          shallowState.circles.remove(map.value);
          map.value.remove(shallowState.alarmMarker);
        }
        // shallowState.circles.remove(map.value);
        // map.value.remove(shallowState.alarmMarker);
        shallowState.circles = null;
        shallowState.alarmMarker = null;
        restore();
        // 取消选中的报警时恢复轮播
        onChangeArea(state.currentArea);
        state.timer = setInterval(() => {
          carousel();
        }, 1000 * 60 * 10);
      } else {
        state.selectedAlarm = item;
        if (item.alarmTypeCode == 'ELECTRONIC_PATROL') {
          addPatrolMarket(item)
        } else {
          addAlarmMarket(item);
        }

        //清除轮播区域摄像机的定时器
        clearInterval(state.timer);
        state.timer = null;
        // 根据报警事件获取关联摄像机
        getEventVideo(item.businessKey);
      }
    };
    // 人员定位
    const prosonPosition = (item) => {
      if (item.lat && item.lng) {
        map.value.setCenter([item.lng, item.lat]);
        map.value.setZoom(21);
      }
    };
    // 根据事件获取摄像机动作列表
    const getEventVideo = (businessKey) => {
      proxy.$api.getEventVideo({ id: businessKey }).then((res) => {
        if (res instanceof Array) {
          state.videoList = res.map(item => {
            return {
              ...item,
              thirdPartyId: item.token
            }
          });
        }
      });
    };
    // gps轨迹查询
    const mapTrajectoryList = () => {
      if (shallowState.polyLine !== null) return;
      proxy.$api
        .mapTrajectoryList({
          code: state.markerInfo.code,
          period: [
            moment(new Date()).format("YYYY-MM-DD 00:00:00"),
            moment(new Date()).format("YYYY-MM-DD 23:59:59"),
          ].join(","),
        })
        .then((res) => {
          let lineArr = res.map((item) => [item.lng, item.lat]);
          shallowState.polyLine = new AMap.Polyline({
            map: map.value,
            path: lineArr,
            showDir: true,
            strokeColor: "#28F",
            strokeWeight: 6,
          });
          map.value.setCenter([state.markerInfo.lng, state.markerInfo.lat]);
          map.value.setZoom(21);
        });
    };
    // 添加巡更点图
    const addPatrolMarket = (data) => {
      if (shallowState.alarmMarker) {
        shallowState.alarmMarker.setMap(null);
        shallowState.alarmMarker = null;
      }
      if (shallowState.circles) {
        shallowState.circles.remove(map.value);
        shallowState.circles = null;
      }
      let TargetLongitudeList = JSON.parse(data.snapshot).data
      TargetLongitudeList.forEach(ele => {
        let lngLat = [ele.nfcDimension, ele.nfcLongitude]
        let fillColor =
          data.alarmLevelCode == "one_level" ? "#FF4D50" : "#387af2";
        shallowState.circles = new CircleShow(
          map.value,
          5,
          4,
          lngLat,
          { fillColor: fillColor, fillOpacity: 0.5 },
          serious
        );
        shallowState.circles.start(500, 2000);
        map.value.setCenter(lngLat);
        map.value.setZoom(21);
        var icon = new AMap.Icon({
          size: new AMap.Size(52, 50),
          // 图标尺寸
          image: data.alarmLevelCode == "one_level" ? serious : normal, // Icon的图像
          imageSize: new AMap.Size(52, 50), // 根据所设置的大小拉伸或压缩图片
        });

        shallowState.alarmMarker = new AMap.Marker({
          position: new AMap.LngLat(lngLat[0], lngLat[1]), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          title: data.alarmTargetName,
          icon: icon,
          offset: new AMap.Pixel(-26, -50),
        });
      })
      shallowState.alarmMarker.on("click", () => {
        state.alarmMarkerInfo = {
          ...data,
          alarmTime: moment(data.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        };
        nextTick(() => {
          let infoWindow = new AMap.InfoWindow({
            isCustom: true, //使用自定义窗体
            content: alarmRef.value,
            offset: new AMap.Pixel(0, -50),
          });
          infoWindow.open(map.value, shallowState.alarmMarker.getPosition());
        });
      });
      shallowState.alarmMarker.setMap(map.value);

    }
    // 添加报警图标
    const addAlarmMarket = (data) => {
      if (shallowState.alarmMarker) {
        shallowState.alarmMarker.setMap(null);
        shallowState.alarmMarker = null;
      }
      if (shallowState.circles) {
        shallowState.circles.remove(map.value);
        shallowState.circles = null;
      }
      if (data.alarmTargetLongitude) {
        let lngLat = data.alarmTargetLongitude.split(",");
        if (lngLat.length < 2) return;
        let fillColor =
          data.alarmLevelCode == "one_level" ? "#FF4D50" : "#387af2";
        shallowState.circles = new CircleShow(
          map.value,
          5,
          4,
          lngLat,
          { fillColor: fillColor, fillOpacity: 0.5 },
          serious
        );
        shallowState.circles.start(500, 2000);
        var icon = new AMap.Icon({
          size: new AMap.Size(52, 50),
          // 图标尺寸
          image: data.alarmLevelCode == "one_level" ? serious : normal, // Icon的图像
          imageSize: new AMap.Size(52, 50), // 根据所设置的大小拉伸或压缩图片
        });
        shallowState.alarmMarker = new AMap.Marker({
          position: new AMap.LngLat(lngLat[0], lngLat[1]), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          title: data.alarmTargetName,
          icon: icon,
          offset: new AMap.Pixel(-26, -50),
        });

        shallowState.alarmMarker.on("click", () => {
          state.alarmMarkerInfo = {
            ...data,
            alarmTime: moment(data.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
          };
          let infoWindow = new AMap.InfoWindow({
            isCustom: true, //使用自定义窗体
            content: alarmRef.value,
            offset: new AMap.Pixel(0, -50),
          });
          infoWindow.open(map.value, shallowState.alarmMarker.getPosition());

        });
        shallowState.alarmMarker.setMap(map.value);
        map.value.setFitView([shallowState.alarmMarker])
        // shallowState.alarmMarker.setAnimation("AMAP_ANIMATION_BOUNCE");
      }
    };
    // 摄像机放大
    const enlargeVideo = (item) => {
      state.modalVideo.visible = true;
      state.modalVideo.curEnlargeVideo = item;
    };
    const closeModalVideo = () => {
      state.modalVideo.visible = false;
      state.modalVideo.curEnlargeVideo = null;
    };
    // 视频放大
    const fullScreen = (full) => {
      state.videoFull = full;
    };
    // 获取区域树
    const getAreaList = () => {
      proxy.$api.getAreaList().then((res) => {
        state.areaOptions = cloneDeep(res);
        state.areaList = treeLevelArray(cloneDeep(res));
        state.swiperAreaList = geTreeLastItem(cloneDeep(res));

        if (res.length) {
          state.currentArea = getAreaTreeIds(state.swiperAreaList[state.index]);
          onChangeArea(state.currentArea);
          // setTimeout(() => {
          //   carousel();
          // }, 500);
          state.timer = setInterval(() => {
            carousel();
          }, 1000 * 60 * 10);
        }
      });
    };
    const carousel = () => {
      state.index++;
      if (state.index > state.swiperAreaList.length) {
        state.index = 0;
      }
      state.currentArea = getAreaTreeIds(state.swiperAreaList[state.index - 1]);
      onChangeArea(state.currentArea);
    };
    // 根据区域id获取父级id
    const getAreaTreeIds = (item, result = []) => {
      result.unshift(item.id);
      if (item.parentId) {
        let parentItem = state.areaList.find((v) => v.id == item.parentId);
        getAreaTreeIds(parentItem, result);
      }
      return result;
    };
    [
      {
        "id": "string",
        "code": "string",
        "name": "string",
        "token": "string",
        "status": "string",
        "statusName": "string",
        "steamMediaName": "string",
        "steamMediaIpAddress": "string",
        "steamMediaIntranetAddress": "string"
      }
    ]
    // 选择区域
    const onChangeArea = async (value, selectedOptions) => {
      const res = await proxy.$api.getVideoListByArea({ areaId: value.at(-1) })
      const validResults = res.filter(d => d.deviceStatus === true)
      // if (validResults.length === 0) {
      //   clearInterval(state.timer)
      //   carousel()
      //   state.timer = setInterval(() => {
      //     carousel()
      //   }, 1000 * 60 * 10)
      //   return
      // }
      state.videoList = validResults
    };
    // 点击广播喊话
    const clickShout = () => {
      closeInfoWindow();
      state.broadcast.visible = true;
    };
    //点击停止喊话
    const clickStop = () => {
      proxy.$api.stopBroadcast({
        deviceId: state.currentDevice.deviceId,
      });
      proxy.$message.success("操作成功");
      closeInfoWindow();
    };
    const closeModalBroadcast = () => {
      state.broadcast.visible = false;
    };
    // 点击全屏
    const clickFull = () => {
      state.viewFull = !state.viewFull;
    };
    const goBack = () => {
      location.href = window.config?.businessPlatformUrl ?? "/index"
    };
    const levelList = ref([]);
    const getAlarmLevelsList = async () => {
      let data = await proxy.$api.getAlarmLevels();
      levelList.value = data.map((res) => {
        return {
          value: res.id,
          label: res.name,
        };
      });
      levelList.value.unshift({
        label: "全部",
        value: "",
      });
    };
    const guid = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    };
    let currentTime = ref(0);
    const getBasicVideosData = async () => {
      const data = await proxy.$api.getDeviceCenterVideos({
        deviceId: DeviceInfo.value,
      });
      if (data) {
        state.deviceDataVideos = data;
      }
    };
    const handleNetWorkOffline = () => {
      showToast('当前网络离线,请检查网络状态')
    }
    // 超时监听
    const handleTimeoutListener = () => {
      proxy.$emitter.on("timeoutEvent", (data) => {
        const { msgContent, msgType, businessPrincipal } = data
        if (!msgContent || !msgType || !businessPrincipal) return;
        if (msgType === 'PATROL_TASK_ABNORMAL_MESSAGE') {
          state.newMessage.patrol = true
        }
        if (msgType !== 'PATROL_TASK_ABNORMAL_MESSAGE') {
          state.newMessage.alarm = true
        }
        const handleTimeOutFun = async () => {
          alarmLevelId.value = ''
          alarmTypeId.value = ''
          state.activeType = data.businessPrincipal.alarmStatus;
          const params = {
            alarmStatus: data.businessPrincipal.alarmStatus,
            id: data.businessPrincipal.id,
            businessType: 'EMERGENCY_CENTER_ALARM',
            pageSize: 10
          }
          const result = await proxy.$api.getAlarmPageNum(params)
          if (result !== page.value.pageNumber && result > 0) {
            page.value.pageNumber = result
            await getAlarm("", "");
          }
          const index = state.alarmList.findIndex(item => item.id === data.businessPrincipal.id)
          // 选中并滚动到可视区域
          nextTick(() => {
            document.getElementById('alarm-' + index).scrollIntoView()
            changeAlarmItem(state.alarmList[index])
          })
        }
        const handleMessage = {
          ALARM_TIMEOUT_UN_CONFIRMED_NOTICE: handleTimeOutFun,
          ALARM_IMMEDIATELY_TIMEOUT_NOTICE: handleTimeOutFun,
          ALARM_TIMEOUT_UN_HANDLER_NOTICE: handleTimeOutFun,
          PATROL_TASK_ABNORMAL_MESSAGE: () => {
          }
        }
        showToast(msgContent, { duration: 10000 }, handleMessage[msgType])
      })
    }
    // 报警监听
    const handleAlarmListener = () => {
      // 点击报警弹窗
      proxy.$emitter.on("clickAlarm", async (data) => {
        if (state.selectedAlarm && state.selectedAlarm.id === data.id) return;
        alarmLevelId.value = ''
        alarmTypeId.value = ''
        state.activeType = data.alarmStatus;
        const params = {
          alarmStatus: data.alarmStatus,
          id: data.id,
          businessType: 'EMERGENCY_CENTER_ALARM',
          pageSize: 10
        }
        const result = await proxy.$api.getAlarmPageNum(params)
        if (result !== page.value.pageNumber && result > 0) {
          page.value.pageNumber = result
          await getAlarm("", "");
        }
        const index = state.alarmList.findIndex(item => item.id === data.id)
        // 选中并滚动到可视区域
        nextTick(() => {
          document.getElementById('alarm-' + index).scrollIntoView()
          changeAlarmItem(state.alarmList[index])
          state.seriousAlarm = false
        })
      })
      // 收到报警事件
      proxy.$emitter.on("alarmMessagePush", (data) => {
        state.newMessage.alarm = true
        getAlarm("", "");
        if (currentTime.value == 0) {
          currentTime.value = +new Date() - data.alarmTime;
        }
        // 选中报警事件
        // changeAlarmItem(data)
        if (data.businessType === "EMERGENCY_CENTER_ALARM") {
          if (data.alarmTargetLongitude) {
            state.viewFull = false;
            addAlarmMarket(data);
          }
          if (data.alarmLevelCode === "one_level") {
            state.seriousAlarm = true;
            // setTimeout(() => {
            //   state.seriousAlarm = false;
            // }, 1000)
          }
          getAlarmStatistics();
        }
      });
    }
    // 打开设备监听
    const startDeviceListen = () => {
      proxy.$emitter.on("openDevice", (data) => {
        state.modalData.visible = true;
        state.modalData.title = data.alarmTargetName + "-" + data.alarmTypeName;
        state.modalData.businessKey = data.businessKey;
        state.modalData.id = data.id;
        // DeviceInfo.value = data.alarmTargetKey;
        // state.DevicemodalData.visible = true;
      });
    }
    // 接收到报警
    onMounted(async () => {
      state.alarmState = setInterval(() => {
        if (page.value.pageNumber <= 0) return
        getAlarmStatistics();
        if (state.activeType == "TIMED_OUT") {
          getAlarm("TIMED_OUT", "");
        } else if (state.activeType == "ALARM_HANDLER") {
          getAlarm("", `${starttime},${enttime}`);
        } else {
          getAlarm("", "");
        }
      }, 10000);
      window.addEventListener('offline', handleNetWorkOffline)
      getAlarmLevelsList();
      Load();
      await gaode();
      getAlarm("", "");
      getDeviceByModel();
      getAlarmStatistics();
      getAreaList();
      getDispatchConfig();
      setTimeout(() => {
        state.viewFull = false;
      }, 300);

      // 超时监听
      handleTimeoutListener()
      // 报警事件
      handleAlarmListener()
      // 设备
      startDeviceListen()
    });
    const handlePatrolListScroll = (e) => {
      let clientHeight = e.target.clientHeight;
      let scrollTop = e.target.scrollTop;
      let scrollHeight = e.target.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight) {
        if (state.patrolListParams.totalPage === state.patrolListParams.pageNumber) return
        if (state.patrolListLoading) return
        ++state.patrolListParams.pageNumber
        getPatrolList()
      }
    }

    const scrool = (e) => {
      let clientHeight = e.target.clientHeight;
      let scrollTop = e.target.scrollTop;
      let scrollHeight = e.target.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight) {
        if (state.loadingAlarm) return;
        if (page.value.pages === page.value.pageNumber) return
        ++page.value.pageNumber
        if (state.activeType == "TIMED_OUT") {
          getAlarm("TIMED_OUT", "");
        } else if (state.activeType == "ALARM_HANDLER") {
          getAlarm("", `${starttime},${enttime}`);
        } else {
          getAlarm("", "");
        }
      }
    };
    onBeforeUnmount(() => {
      clearInterval(state.timer);
      clearInterval(state.alarmState);
      state.timer = null;
      clearInterval(intervalTimer);
      clearInterval(settime.value);
      window.removeEventListener("offline", handleNetWorkOffline);
      // 退出指挥调度登录
      DestrUct();
    });
    const getImg = (type) => {
      if (type == "SECURITY_MONITORING") {
        return `${RES}/images/af.png`;
      } else if (type == "ELECTRICMANAGE") {
        return `${RES}/images/dq.png`;
      } else if (type == "ROTATINGMANAGE") {
        return `${RES}/images/dh.png`;
      } else if (type == "AIRCONDITIONER") {
        return `${RES}/images/jk.png`;
      } else if (type == "FIRECONTROL") {
        return `${RES}/images/xf.png`;
      } else {
        return `${RES}/images/af.png`;
      }
    };
    const DeviceInfo = ref("");
    const toDeviceInfo = (data) => {
      activeKey.value = "1";
      DeviceInfo.value = data.alarmTargetKey;
      state.DevicemodalData.visible = true;

      getBasicVideosData();
    };
    const closeModalDevice = () => {
      state.DevicemodalData.visible = false;
    };
    const activeKey = ref("1");
    const setRef = (el, index) => {
      refList.value[index] = el;
    };
    const refList = ref([]);
    const fullScreen1 = (status, index) => {
      const element = refList.value[index].$el;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
      }
    };
    const broadcastdevice = ref([]);
    const openbroadcast = (data) => {
      broadcastdevice.value = data;
      state.mapEditgb = false;
      state.modalEquipment.visible = false;
      clickShout();
    };

    const getJson = (item, key) => {

      if (item == '') {
        return ''
      } else {
        let data = JSON.parse(item)[key]
        return data
      }

    }
    const taskclose = () => {
      state.PatrolData.visible = false
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    }
    return {
      RES,
      taskclose,
      getJson,
      clickStop,
      broadcastdevice,
      openbroadcast,
      openMouseToolgb,
      refList,
      fullScreen1,
      setRef,
      activeKey,
      page,
      DeviceInfo,
      closeModalDevice,
      toDeviceInfo,
      scrool,
      commandDispatchRef,
      alarmitemRef,
      guid,
      getImg,
      alarmLevelId,
      alarmTypeId,
      showstatistics,
      levelList,
      getAlarmLevelsList,
      ...toRefs(state),
      SingleCall,
      SingleVideoCall,
      closeMouseTool,
      openMouseTool,
      clickType,
      verifyResult,
      loginResult,
      clickPatrolType,
      tip,
      closeModalAssigntask,
      markArray,
      clickMsg,
      customRef,
      alarmRef,
      customBroadcast,
      closeInfoWindow,
      clickShout,
      clickpDetail,
      clickDetail,
      closeModal,
      clickTransfer,
      clickSuspend,
      closeModalAssign,
      getDispatchDeviceList,
      changeAlarmItem,
      closeModalSuspend,
      mapTrajectoryList,
      closeModalEquipment,
      restore,
      closeModalVideo,
      enlargeVideo,
      fullScreen,
      onChangeArea,
      clickFull,
      goBack,
      prosonPosition,
      closeModalBroadcast,
      clickHandle,
      closeModalHandle,
      alarmLevelChange,
      alarmTypeChange,
      currentTime,
      openCarModal,
      closeCarSearch,
      checkAlarmType,
      handleClickPatrol,
      patrolWindowRef,
      handlePatrolListScroll,
      getPatrolListClearActiveId
    };
  },
});
</script>

<style lang="less" scoped>
.videInfo {
  width: 1439px !important;
  padding: 0 10px !important;
  overflow-y: hidden !important;
}

.command-dispatch {
  width: 100vw;
  height: 100vh;
  position: fixed;
  background: black;
  padding: 0 20px;
  background-image: url("./images/bg.svg");
  background-repeat: no-repeat;
  background-size: cover;

  .selecrData {
    display: flex;
    justify-content: space-between;

    :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
      background: transparent;
      border: 1px solid #374870;
      color: #ffffff;
    }
  }

  &.serious_alarm {
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("./images/bg.png");
  }

  &.alarm {
    &::before {
      box-shadow: 0 0 80px 20px red inset;
      animation: colorAnimation 1s infinite;
    }

    .commandDispatch-left {
      background: transparent;
    }

    .commandDispatch-right {
      background: transparent;
    }
  }

  .commandDispatch-title {
    cursor: pointer;
    width: 1190px;
    height: 70px;
    margin: 0 auto;
    background-image: url("./images/title.svg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    // position: absolute;
    // top: 0;
    // left: 50%;
    // transform: translate(-50%, 0);
    font-size: 24px;
    font-family: HuXiaoBo-NanShen-Regular, HuXiaoBo-NanShen;
    font-weight: 400;
    color: #ffffff;
    line-height: 28px;
    text-shadow: 0px 0px 8px #388ef3, 0px 4px 4px #215a9d,
      0px 0px 4px rgba(56, 142, 243, 0.4);
    text-align: center;
    line-height: 70px;

    &.serious_alarm {
      background-image: url("./images/title.png");
    }
  }

  .commandDispatch-left {
    position: absolute;
    top: 70px;
    width: 350px;
    height: calc(100% - 80px);
    background: rgba(2, 13, 41, 0.94);
    z-index: 9;

    &.open {
      left: 25px;
      transition: all 1s ease-in;
    }

    &.stow {
      left: -350px;
      transition: all 1s ease-in;
    }

    &.serious_alarm {
      animation: leftColorAnimation 1s infinite;
    }
  }

  .commandDispatch-right {
    position: absolute;
    top: 70px;
    width: 350px;
    height: calc(100% - 80px);
    background: rgba(2, 13, 41, 0.94);

    // z-index: 9;
    &.open {
      right: 25px;
      transition: all 1s ease-in;
    }

    &.stow {
      right: -350px;
      transition: all 1s ease-in;
    }

    &.serious_alarm {
      animation: rightColorAnimation 1s infinite;
    }
  }

  #commandDispatch {
    width: 100%;
    height: calc(100% - 70px);
  }

  .alarm-container {
    width: 330px;
    margin-left: 10px;
    height: 100%;
    position: relative;

    .alarm-type-tab {
      background: rgba(2, 13, 41, 0.94);
      position: absolute;
      display: flex;
      flex-direction: column;
      right: -50px;
      border-radius: 10px;
      top: -10px;
      width: 40px;
      color: #fff;
      text-align: center;
      line-height: 22px;
      z-index: -1;

      .new-dot {
        position: relative;

        &::after {
          display: block;
          width: 8px;
          height: 8px;
          content: '';
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ee0a24;
          border-radius: 50%;
        }
      }

      &>div {
        padding: 10px 0;
        border: 1px solid rgba(45, 113, 175, 0.3);
        border-left: none;
        cursor: pointer;

        &:first-child {
          border-top: 1px solid transparent;
        }
      }



      .active {
        background: rgba(56, 142, 243, 0.3);
        border: 1px solid #388ef3 !important;
      }
    }

    .patrol-type {
      >div {
        width: 48% !important;
        text-align: center;
      }

    }

    .alarm-type,
    .patrol-type {
      height: 26px;
      width: 100%;
      margin: 10px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;

      >div {
        height: 100%;
        width: 70px;
        text-align: center;
        line-height: 26px;
        border: 1px solid rgba(45, 113, 175, 0.3);
        background: rgba(49, 49, 67, 0.4);
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        cursor: pointer;

        &.active {
          background: rgba(56, 142, 243, 0.3);
          border: 1px solid #388ef3;
        }
      }
    }

    .alarm-list-content,
    .patrol-list-content {
      height: calc(100% - 60px);
      overflow-y: auto;
    }

    .alarm-list,
    .patrol-list {
      height: calc(100% - 60px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .loading {
        padding: 0 0 16px;
        text-align: center;
      }

      // transform: translate(300px);
      // animation: move 2s;
      .alarm-item {
        position: relative;

        // height: 127px;
        padding: 10px;
        margin: 12px 0;
        border-radius: 4px 4px 4px 4px;

        &.selected {
          background-image: url("./images/normalBg.png");
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }

        &.serious {
          border: 1px solid rgba(231, 31, 31, 0.3);
          background: rgba(255, 61, 61, 0.2);

          // background: linear-gradient(
          //   270deg,
          //   rgba(231, 30, 30, 0.5) 0%,
          //   rgba(231, 30, 30, 0.3) 100%,
          //   rgba(231, 30, 30, 0.2) 100%
          // );
          &.selected {
            background-image: url("./images/alarmItem.png");
            background-size: 100% 100%;
            background-repeat: no-repeat;
            border: none;
          }
        }

        position: relative;

        .alarm-title {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .timeout {
            position: absolute;
            top: 63px;
            right: 37px;
            color: red;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 1px solid red;
            text-align: center;
            line-height: 50px;
          }

          .title-text {
            font-size: 16px;
            font-family: PingFang SC-Medium;
            font-weight: 500;
            color: #f4f4f4;

            >span {
              display: inline-block;
              width: 36px;
              height: 18px;
              line-height: 18px;
              background: rgba(255, 61, 61, 0.3);
              border-radius: 2px 2px 2px 2px;
              margin-left: 4px;
              font-size: 12px;
              text-align: center;
            }
          }

          .title-status {
            font-size: 14px;
            font-family: PingFang SC-Regula;
            font-weight: 400;
            color: #ff9737;
            flex-shrink: 0;
          }
        }

        .alarm-info {
          height: 20px;
          font-size: 14px;
          font-family: PingFang SC-Regular;
          font-weight: 400;
          color: #e4e4e4;
          line-height: 20px;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 8px;

          &.handler {
            width: 220px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .alarm-btn {
          // position: absolute;
          // bottom: 10px;
          // right: 20px;
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;

          >div {
            width: 46px;
            height: 24px;
            background: #205798;
            border-radius: 2px 2px 2px 2px;
            opacity: 1;
            text-align: center;
            line-height: 24px;
            cursor: pointer;
            margin-left: 12px;
            color: white;
            font-size: 12px;
            font-family: PingFang SC-Regular;
            font-weight: 400;
            color: #ffffff;

            &:hover {
              box-shadow: 0px 0px 1px 1px rgba(44, 131, 239, 0.2);
            }
          }
        }
      }

      .patrol-item {}
    }
  }

  .site-conditions {
    width: 330px;
    margin-left: 10px;

    .live-video {
      height: 320px;
      width: 100%;
    }

    .personnel {
      height: 500px;
      overflow: hidden;
    }

    .header-btn {
      background-color: #1e4690;
      border-color: #216bc3;
      color: #fff;
    }
  }

  .personnel {
    .personnel-list {
      height: 470px;
      overflow: auto;

      .personnel-item {
        height: 87px;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        padding-left: 10px;
        cursor: pointer;

        &:hover {
          background: url("./images/personnelItem.svg");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        >div {
          flex: 1;
          height: 100%;

          &.personnel-info {
            flex: 2;
            display: flex;
            align-items: center;
            justify-content: space-around;
            color: white;
            font-size: 12px;
            font-family: PingFang SC-Regular;

            .personnel-icon {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              background: rgba(56, 122, 242, 1);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .personnel-name {
              >div {
                >span {
                  font-size: 16px;
                }
              }

              .name {
                width: 140px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }

              .code {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.8);
              }
            }
          }

          &.personnel-btn {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-left: 10px;

            >div {
              width: 30px;
              height: 30px;
              background: #1e3664;
              border-radius: 2px 2px 2px 2px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              margin-right: 10px;
            }
          }
        }
      }
    }
  }

  .alarm-statistics {
    height: 80px;
    width: 800px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 70px;
    z-index: 9;
    left: 30%;
    // transform: translateX(-50%);
    background: rgba(2, 13, 41, 0.94);
    padding: 10px;

    &.stow {
      left: 25px;
      transition: all 1s ease-in;
    }

    &.open {
      left: 400px;
      transition: all 1s ease-in;
    }

    .statistics-item {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .statistics-icon {
        margin-right: 10px;
      }

      .statistics-text {
        font-size: 12px;
        font-family: Inter-Regular, Inter;
        font-weight: 400;
        color: #ffffff;

        .statistics-num {
          font-size: 36px;
          font-family: DIN Alternate-Bold, DIN Alternate;
          font-weight: bold;
          color: #388ef3;
        }
      }
    }
  }
}

.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}

.alarmDetail-modal {
  width: 1250px;
  height: 545px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      >span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;
        margin-left: 4px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: #101010;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .alarmDetail-modal-content {
    height: 495px;
    width: 100%;
    padding: 0 16px;
    overflow: hidden;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      >div {
        width: 84px;
        height: 26px;
        opacity: 1;
        border: 1px solid rgba(183, 197, 211, 0.3);
        margin-right: 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 0px 2px 0px rgba(56, 142, 243, 0.45);
        cursor: pointer;

        >span {
          display: inline-block;
          color: white;
          width: 12px;
          height: 12px;
          border-radius: 2px;
          margin-left: 2px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.active {
          background: #2989ff;

          >span {
            color: rgba(4, 14, 38, 0.96);
            background: white;
          }
        }
      }
    }

    .conent-body {
      // height: calc(100% - 55px);
      flex: 1;
      overflow: hidden;
      overflow-y: scroll;
    }
  }

  .vidiconcontent {
    height: 670px;
  }
}

.vidicon {
  height: 725px;
}

.bottom-btn {
  position: absolute;
  bottom: 10px;
  left: 380px;
  display: flex;
  z-index: 10;

  &.stow {
    left: 25px;
    transition: all 1s ease-in;
  }

  &.open {
    left: 380px;
    transition: all 1s ease-in;
  }

  .btn-box {
    height: 56px;
    display: flex;
    background: linear-gradient(180deg, #134297 0%, #12316a 100%);
    margin-right: 16px;
    border-radius: 6px 6px 6px 6px;

    .line {
      width: 2px;
      height: 34px;
      background: linear-gradient(90deg, #09204a 50%, #13387f 100%);
      margin-top: 11px;
    }

    .btn-item {
      width: 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &.active {
        p {
          color: #2bac7e;
        }
      }

      p {
        margin: 0;
        color: #bcd2ed;
        font-size: 12px;
      }
    }
  }
}

.not-data {
  text-align: center;
  margin-top: 16px;
}

@keyframes rightColorAnimation {
  0% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0) 0%,
        rgba(168, 24, 11, 0.62) 100%);
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0) 0%,
        rgba(168, 24, 11, 0.62) 100%);
  }
}

@keyframes leftColorAnimation {
  0% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0.62) 0%,
        rgba(168, 24, 11, 0) 100%);
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0.62) 0%,
        rgba(168, 24, 11, 0) 100%);
  }
}
</style>

<style lang="less">
.atabs {
  .ant-tabs-tab {
    color: #fff;
  }
}

.amap-logo,
.amap-copyright {
  display: none !important;
}

.alarm-market {
  width: 260px;
  padding: 20px;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;

  &.serious {
    background-image: url("./images/alarmBg.svg");
  }

  &.normal {
    background-image: url("./images/marketBg.svg");
  }

  .alarm-market-close {
    position: absolute;
    right: 10px;
    top: 10px;
    color: white;
    cursor: pointer;
  }

  .alarm-title {
    font-size: 18px;
    font-family: PingFang SC-Medium, PingFang SC;
    font-weight: 500;
    color: #ffffff;
    text-shadow: 0px 0px 4px #ff2e00;
  }

  .alarm-detail {
    width: 210px;
    margin-top: 20px;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
    color: #e4e4e4;
  }
}

.custom-info {
  width: 300px;
  height: 260px;
  background: url("./images/marketBg.svg");
  background-size: contain;
  background-repeat: no-repeat;
  // position: fixed;
  // top: 50px;
  // left: 100px;
  z-index: 100;

  .custom-info-close {
    top: 10px;
    right: 10px;
    color: white;
    cursor: pointer;
    position: absolute;
  }

  .custom-person {
    position: absolute;
    top: 40px;
    left: 12px;
    background: url("./images/customPerson.svg");
    background-size: contain;
    background-repeat: no-repeat;
    width: 275px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .custom-person-icon {
      width: 50px;
      height: 50px;
      opacity: 1;
      border: 1px solid #388ef3;
      border-radius: 50%;
      margin-left: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .custom-person-name {
      margin-left: 12px;

      .person-status {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;

        >span {
          width: 36px;
          height: 18px;
          background: rgba(255, 151, 55, 0.3);
          border-radius: 2px 2px 2px 2px;
          font-size: 12px;
          font-family: PingFang SC-Regular;
          font-weight: 400;
          color: #ff9737;
          line-height: 18px;
          text-align: center;
        }
      }

      .person-device {
        font-size: 14px;
        font-family: PingFang SC-Regular;
        font-weight: 400;
        color: #a2b5d6;
        text-align: left;
      }
    }

    .custom-person-line {
      width: 30px;
      height: 30px;
      background: #2c83ef;
      border-radius: 50%;
      margin-left: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .custom-address {
    position: absolute;
    top: 100px;
    left: 22px;
    width: 255px;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
    color: #e4e4e4;

    >div {
      text-align: left;
      line-height: 28px;
    }
  }

  .custom-name {
    position: absolute;
    top: 40px;
    left: 13px;
    height: 62px;
    line-height: 62px;
    width: 274px;
    background-image: url("./images/contentBg.png");
    color: #fff;
    font-size: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 16px;
  }

  .custom-content {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #e4e4e4;
    position: absolute;
    top: 102px;
    left: 0;
    padding: 16px;
  }

  .custom-btn {
    width: 100%;
    position: absolute;
    bottom: 40px;
    left: 0;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    >div {
      padding: 0 12px;
      height: 26px;
      background: #1f4790;
      border-radius: 4px 4px 4px 4px;
      opacity: 1;
      border: 1px solid #216cc3;
      font-size: 12px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      cursor: pointer;
      line-height: 26px;
      text-align: center;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}

.personnel-search {
  .ant-input-affix-wrapper {
    background: transparent !important;
    color: rgba(183, 197, 211, 0.3);
    border-color: rgba(183, 197, 211, 0.3);

    .ant-input-suffix {
      color: rgba(183, 197, 211, 0.3);
    }
  }

  .ant-input {
    background: transparent;
    color: rgba(183, 197, 211, 1);
  }

  .ant-input-search-icon {
    color: rgba(183, 197, 211, 0.3);
  }

  .ant-select {
    color: rgba(183, 197, 211, 1);
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent;
    border: none;
  }

  .ant-select-arrow {
    color: rgba(183, 197, 211, 1);
  }
}

.site-conditions {
  .ant-cascader-menus {
    background: rgba(29, 57, 110, 0.96);
    color: #e1e3e6;
  }

  .ant-cascader-menu {
    border-right: 1px solid #141f35;
  }

  .ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled),
  .ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled):hover {
    background: rgba(5, 18, 31, 0.2);
  }

  .ant-cascader-menu-item:hover {
    background: rgba(5, 18, 31, 0.2);
  }

  .ant-cascader-menu-item-expand .ant-cascader-menu-item-expand-icon,
  .ant-cascader-menu-item-loading-icon {
    color: #e1e3e6;
  }
}

.container {
  position: relative;
  padding: 0;
}

/* 1. 声明过渡效果 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.fade-enter-from,
.fade-leave-to {
  // opacity: 0;
  // transform: scaleY(0.01);
  transform: translateX(300px);
}

/* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
.fade-leave-active {
  position: absolute;
}

@keyframes move {
  from {
    transform: translate(300px);
  }

  to {
    transform: translate(0px);
  }
}

@keyframes movetop {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(0, 100px);
  }
}

.alarm {
  position: absolute;
  right: 0;
  top: 0;
  width: 88px;
  color: #fff;
  border-radius: 0 0 0 30px;
  text-align: center;
  font-size: 12px;
}

.one {
  background: rgba(255, 61, 61, 0.7);
}

.two {
  background: rgba(255, 102, 30, 0.7);
}

.three {
  background: rgba(231, 166, 13, 0.7);
}

.four {
  background: rgba(3, 9, 17, 0.3);
}

.gvideo-box {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;

  .gvideo {
    margin-bottom: 10px;
    margin-right: 10px;
    width: 504px;
    height: 304px;
  }

  .gvideo-title {
    font-size: 16px;
    color: #3d3d3d;
  }
}
</style>

<style lang="less">
.empty {
  color: #fff;

  :deep(.ant-empty-description) {
    color: #fff !important;
  }
}
</style>
