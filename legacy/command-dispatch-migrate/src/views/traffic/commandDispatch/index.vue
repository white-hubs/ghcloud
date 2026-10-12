<template>
  <a-spin :spinning="false" :tip="tip">
    <div class="command-dispatch" :class="{ serious_alarm: seriousAlarm }">
      <div class="commandDispatch-title" :class="{ serious_alarm: seriousAlarm }">指挥调度平台</div>
      <div id="commandDispatch"></div>
      <!-- 左侧报警 -->
      <div class="commandDispatch-left" :class="[seriousAlarm ? 'serious_alarm' : '', viewFull ? 'stow' : 'open']">
        <div class="alarm-container">
          <div class="alarm-type-tab">
            <div :class="[activeAlarmType === 'alarm' && 'active']" @click="() => checkAlarmType('alarm')">报<br />警</div>
            <div :class="[activeAlarmType === 'patrol' && 'active']" @click="() => checkAlarmType('patrol')">巡<br />更</div>
          </div>
          <div class="alarm-type" v-show="activeAlarmType === 'alarm'">
            <div v-for="item in typeList" :key="item.value" :class="activeType === item.value ? 'active' : ''" @click="clickType(item)">
              {{ item.label }}
            </div>
          </div>
          <div class="patrol-type" v-show="activeAlarmType !== 'alarm'">
            <div
              v-for="item in patrolTabs"
              :key="item.value"
              :class="activePatrolType === item.value ? 'active' : ''"
              @click="clickPatrolType(item)"
            >
              {{ item.label }}
            </div>
          </div>
          <div class="selecrData" v-show="activeAlarmType === 'alarm'">
            <a-select style="width: 150px" v-model:value="alarmLevelId" @change="alarmLevelChange">
              <a-select-option v-for="item in levelList" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>

            <a-select ref="select" style="width: 150px" @change="alarmTypeChange" v-model:value="alarmTypeId">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="SECURITY_MONITORING"> 安防监控报警 </a-select-option>
              <a-select-option value="ELECTRICMANAGE">电气报警</a-select-option>
              <a-select-option value="ROTATINGMANAGE">动环报警</a-select-option>
              <a-select-option value="AIRCONDITIONER">空调报警</a-select-option>
              <a-select-option value="FIRECONTROL">消防报警</a-select-option>
              <a-select-option value="ELECTRONIC_PATROL"> 电子巡更报警 </a-select-option>
            </a-select>
          </div>
          <div class="alarm-list-content" v-show="activeAlarmType === 'alarm'">
            <div class="alarm-list" ref="alarmitemRef" v-if="alarmList && alarmList.length" @scroll="scrool">
              <div
                v-for="(item, index) in alarmList"
                :style="+new Date() - +new Date(item.alarmTime) < 60000 ? 'animation: move 2s;' : ''"
                :key="item.id"
                :id="`alarm-${index}`"
              >
                <alarmListItem
                  :activeId="selectedAlarm?.id"
                  :alarmInfo="item"
                  @click="changeAlarmItem(item)"
                  @refresh="refreshCurrentAlarmList"
                />
              </div>
              <div class="loading">
                <a-spin :spinning="loadingAlarm" />
              </div>
            </div>
            <div v-else class="not-data">
              <a-spin :spinning="loadingAlarm" v-if="loadingAlarm" />
              <img :src="`${CDA}/not.png`" alt="" v-else />
            </div>
          </div>
          <div class="patrol-list-content" v-show="activeAlarmType !== 'alarm'">
            <div class="patrol-list" v-if="patrolList.length" @scroll="handlePatrolListScroll">
              <template v-for="item in patrolList" :key="item.id">
                <patrolListItem
                  :partolInfo="item"
                  :activeId="activePatrolId"
                  @getList="getPatrolListClearActiveId"
                  @click="() => handleClickPatrol(item)"
                />
              </template>
              <div class="loading">
                <a-spin :spinning="patrolListLoading" />
              </div>
            </div>
            <div v-else class="not-data">
              <a-spin :spinning="patrolListLoading" v-if="patrolListLoading" />
              <img :src="`${CDA}/not.png`" alt="" v-else />
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧  -->
      <div class="commandDispatch-right" :class="[seriousAlarm ? 'serious_alarm' : '', viewFull ? 'stow' : 'open']">
        <div class="site-conditions">
          <SubPanelTemplate class="scene-panel" title="现场情况">
            <template v-slot:extra>
              <a-cascader
                v-model:value="checkedArea"
                :options="areaOptions"
                @change="onChangeArea"
                change-on-select
                :fieldNames="{ label: 'name', value: 'id' }"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode"
              >
                <a-button class="header-btn" size="small">
                  <RetweetOutlined />
                  <span>切换</span>
                </a-button>
              </a-cascader>
            </template>
            <div class="live-video">
              <sceneMonitor :videoList="videoList" @notVideo="handleNotVideo" @enlargeVideo="enlargeVideo"> </sceneMonitor>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate class="person-panel">
            <template v-slot:title>
              <button class="online-person-title" type="button" @click="openOnlinePersonQuery">
                在线人员：<strong>{{ panelOnlineCount }}</strong
                >个
              </button>
            </template>
            <div class="personnel">
              <PersonList
                compact
                online-mode
                :online-person-list="deviceList"
                @focusPerson="focusOnlinePerson"
                @makeCall="handleMakeCall"
                @onlineCountChange="handleOnlineCountChange"
                @openPersonQuery="openOnlinePersonQuery"
              />
            </div>
          </SubPanelTemplate>
        </div>
      </div>
      <!-- 顶部统计 -->
      <div class="alarm-statistics">
        <div class="statistics-item">
          <div class="statistics-icon">
            <img :src="`${CDI}/statistics1.png`" alt="" />
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
            <img :src="`${CDI}/statistics5.svg`" alt="" />
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
            <img :src="`${CDI}/statistics2.svg`" alt="" />
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
            <img :src="`${CDI}/statistics3.svg`" alt="" />
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
            <img :src="`${CDI}/statistics4.png`" alt="" />
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
            <img :src="`${CDI}/statistics4.png`" alt="" />
          </div>
          <div class="statistics-text">
            <div>超时未处理</div>
            <div class="statistics-num" style="color: red">
              <count-to :startVal="0" :endVal="TIME_OUT_UN_HANDLER" :duration="4000"></count-to>
            </div>
          </div>
        </div>
      </div>
      <!-- market信息窗体 -->
      <div style="display: none">
        <!-- 人员窗口 -->
        <div ref="customRef">
          <customPersonWindow
            ref="personWindow"
            @openVideoConference="
              conferenceState.videoVisible = true;
              conferenceState.videoIsMinimized = false;
            "
            @openAudioConference="
              conferenceState.audioVisible = true;
              conferenceState.audioIsMinimized = false;
            "
            :mapInstance="map"
            @close="closeInfoWindow"
            :state="currentPersonInfo"
          />
        </div>
        <!-- 报警窗口 -->
        <div ref="alarmRef">
          <alarmMapWindow
            @openAudioConference="
              conferenceState.audioVisible = true;
              conferenceState.audioIsMinimized = false;
            "
            :alarmInfo="alarmMarkerInfo"
            :onlineDevices="deviceList"
            @close="closeAlarmInfoWindow"
          />
        </div>
        <!-- 广播窗口 -->
        <div class="custom-info" ref="customBroadcast">
          <span class="custom-info-close" @click="closeInfoWindow">
            <CloseOutlined />
          </span>
          <div class="custom-name">
            <a-tag color="orange" v-if="!currentDevice.deviceStatus"> 离线 </a-tag>

            <a-tag color="green" v-else> 在线 </a-tag>
            {{ currentDevice.deviceName }}
          </div>
          <div class="custom-content">所属区域：{{ currentDevice.areaName }}</div>
          <div class="custom-btn" v-if="currentDevice.deviceStatus">
            <div @click="clickStop">
              <IconFont type="icon-yuyin" :style="{ fontSize: '14px', color: '#FFF' }" />
              停止播放
            </div>
            <div @click="clickShout">
              <IconFont type="icon-yuyin" v :style="{ fontSize: '14px', color: '#FFF' }" />
              广播喊话
            </div>
          </div>
        </div>
        <!-- 巡更窗口 -->
        <div ref="patrolWindowRef">
          <patrolMapWindow @close="closeInfoWindow" :state="currentPatrolPoint" />
        </div>
        <!-- 风险设备窗口 -->
        <div ref="riskDeviceWindowRef">
          <riskDeviceWindow @close="closeInfoWindow" :currentDevice="currentFireFighting" />
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
            <sync-outlined
              :style="{
                color: mapEdit ? '#2BAC7E' : '#BBD1EC',
                fontSize: '18px',
              }"
            ></sync-outlined>
            <p>圈选人员</p>
          </div>
          <div class="btn-item" @click="openMouseToolgb" :class="{ active: mapEditgb }">
            <sync-outlined
              :style="{
                color: mapEditgb ? '#2BAC7E' : '#BBD1EC',
                fontSize: '18px',
              }"
            ></sync-outlined>
            <p>圈选广播</p>
          </div>
          <div class="line"></div>
          <div class="btn-item" @click="handleMapZoom('amplify')">
            <PlusCircleOutlined :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <p>放大</p>
          </div>
          <div class="line"></div>
          <div class="btn-item" @click="handleMapZoom('lower')">
            <MinusCircleOutlined :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <p>缩小</p>
          </div>
          <div class="line"></div>
          <div class="btn-item" @click="restore">
            <ReloadOutlined :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <p>复位</p>
          </div>
        </div>
        <div class="btn-box">
          <div class="btn-item" @click="openCarModal">
            <CarOutlined :style="{ color: '#BBD1EC', fontSize: '18px' }" />
            <p>车辆查询</p>
            <car-search
              v-if="carSearchConfig.visible"
              v-model:visible="carSearchConfig.visible"
              v-model:isMinimized="carSearchConfig.isMinimized"
              @close="closeCarSearch"
            />
          </div>
          <!-- <div class="line"></div> -->
          <!-- <div class="btn-item" @click="intercomGroupModal.visible=true;intercomGroupModal.isMinimized=false;">
            <img :src="`${CDI}/intercom-icon.png`" alt="">
            <p>群组对讲</p>
            <intercomGroupModalModal v-if='intercomGroupModal.visible' v-model:visible="intercomGroupModal.visible"
              v-model:isMinimized="intercomGroupModal.isMinimized" @close="intercomGroupModal.visible=false" />
          </div> -->
          <div class="line"></div>
          <div
            class="btn-item"
            @click="
              onlinePersonModal.visible = true;
              onlinePersonModal.isMinimized = false;
            "
          >
            <img :src="`${CDI}/phone-video-icon.png`" alt="" />
            <p>人员查询</p>
            <div style="position: relative">
              <onlinePersonModal
                @makeCall="handleMakeCall"
                v-if="onlinePersonModal.visible"
                v-model:visible="onlinePersonModal.visible"
                v-model:isMinimized="onlinePersonModal.isMinimized"
                @openVideoConference="
                  conferenceState.videoVisible = true;
                  conferenceState.videoIsMinimized = false;
                "
                @openAudioConference="
                  conferenceState.audioVisible = true;
                  conferenceState.audioIsMinimized = false;
                "
                @focusPerson="focusOnlinePerson"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- 圈选广播 -->
      <broadcastCircleModal
        v-if="modalEquipment.visible"
        v-model:isMinimized="modalEquipment.isMinimized"
        v-model:visible="modalEquipment.visible"
        @openBroadcast="openbroadcast"
        @closeBroadcastCircle="modalEquipment.visible = false"
        :boradcastCircleModal="modalEquipment"
      />
      <!-- 圈选人员弹窗 -->
      <selectCirclingPerson
        v-if="selectCirclePerson.visible"
        v-model:isMinimized="selectCirclePerson.isMinimized"
        v-model:visible="selectCirclePerson.visible"
        :circlingPersons="selectCirclePerson.circlePersons"
        @close="selectCirclePerson.visible = false"
        @openVideoConference="
          conferenceState.videoVisible = true;
          conferenceState.videoIsMinimized = false;
        "
        @openAudioConference="
          conferenceState.audioVisible = true;
          conferenceState.audioIsMinimized = false;
        "
      />
      <!-- 摄像机 -->
      <videoModal
        v-if="modalVideo.visible"
        v-model:isMinimized="modalVideo.isMinimized"
        v-model:visible="modalVideo.visible"
        @closeVideoModal="modalVideo.visible = false"
        :videoData="modalVideo"
      />
      <!-- 广播喊话 -->
      <broadcastModal
        v-model:visible="broadcast.visible"
        v-model:isMinimized="broadcast.isMinimized"
        @closeBroadcastModal="broadcast.visible = false"
        :broadcastdevice="broadcastdevice"
        :currentDevice="currentDevice"
      />
      <!-- 来电话弹窗 -->
      <comingCallModal
        v-model:visible="incomingCallState.comingCallVisible"
        v-model:isMinimized="incomingCallState.isMinimized"
        @openVideoConference="
          conferenceState.videoVisible = true;
          conferenceState.videoIsMinimized = false;
        "
        @openAudioConference="
          conferenceState.audioVisible = true;
          conferenceState.audioIsMinimized = false;
        "
        :callInfo="incomingCallState.callInfo"
        @close="closeComingCallModal"
      />
      <!-- 来会议弹窗 -->
      <comingConferenceModal
        v-model:visible="incomingConferenceState.comingConferenceVisible"
        v-model:isMinimized="incomingConferenceState.isMinimized"
        @close="incomingConferenceState.comingConferenceVisible = false"
        @openVideoConference="
          conferenceState.videoVisible = true;
          conferenceState.videoIsMinimized = false;
        "
        @openAudioConference="
          conferenceState.audioVisible = true;
          conferenceState.audioIsMinimized = false;
        "
        :conferenceInfo="incomingConferenceState.conferenceInfo"
      />
      <!-- 对讲通知弹窗 -->
      <div v-show="intercomNotice.visible">
        <interGroupNotice :stateInfo="intercomNotice" />
      </div>
      <!-- 会议视频弹窗 -->
      <videoConferenceModal
        v-model:visible="conferenceState.videoVisible"
        v-model:isMinimized="conferenceState.videoIsMinimized"
        @close="conferenceState.videoVisible = false"
      />
      <!-- 会议通话弹窗 -->
      <callConferenceModal
        v-model:visible="conferenceState.audioVisible"
        v-model:isMinimized="conferenceState.audioIsMinimized"
        @close="conferenceState.audioVisible = false"
      />
      <!-- 主动通话弹窗 -->
      <MakeCallModal
        v-model:isMinimized="makeCallModal.isMinimized"
        v-model:visible="makeCallModal.visible"
        :callInfo="makeCallModal.callInfo"
        @close="makeCallModal.visible = false"
        @openVideoConference="
          conferenceState.videoVisible = true;
          conferenceState.videoIsMinimized = false;
        "
        @openAudioConference="
          conferenceState.audioVisible = true;
          conferenceState.audioIsMinimized = false;
        "
      />
      <taskBarTools />
      <filePreviewModal
        v-model:visible="filePreview.visible"
        v-model:isMinimized="filePreview.isMinimized"
        v-model:fileInfo="filePreview.fileInfo"
        :planInfo="filePreview.planInfo"
        @closeFilePreview="filePreview.visible = false"
      />
    </div>
  </a-spin>
</template>

<script>
const CD = "/resource/v1/command-dispatch-migrate";
const CDI = `${CD}/commandDispatch/images`;
const CDA = `${CD}/images`;
const personMarket = `${CDI}/person.png`;
const serious = `${CDI}/serious.png`;
const normal = `${CDI}/normal.png`;
const broadcast = `${CDI}/broadcast.png`;
const sybroadcast = `${CDI}/sy.png`;
const patroledIcon = `${CDI}/patroled-icon.png`;
const noPatrolIcon = `${CDI}/no-patrol-icon.png`;
const patrolAbnormalIcon = `${CDI}/patrol-abnormal-icon.png`;
const fireHydrantIcon = `${CDI}/fire-hydrant.png`;
const fireExtinguisherIcon = `${CDI}/fire-extinguisher.png`;
const afImg = `${CDA}/af.png`;
const dqImg = `${CDA}/dq.png`;
const dhImg = `${CDA}/dh.png`;
const jkImg = `${CDA}/jk.png`;
const xfImg = `${CDA}/xf.png`;

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
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons-vue";
import { transformWGS84ToGCJ02, transformGCJ02ToWGS84 } from "@isvend/coord-transform";
import { cloneDeep } from "lodash-es";
import moment from "moment";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onUnmounted,
  onMounted,
  reactive,
  ref,
  shallowReactive,
  shallowRef,
  toRefs,
} from "vue";
import { CountTo } from "vue3-count-to";
import { useStore } from "vuex";

import { initMap } from "../../../cube-map-plugin/init-map";
import { GeometryUtil } from "../../../cube-map-plugin/t-map-plugins/t-geometry-util.js";
import { isInRadius } from "../../../utils/common";
import alarmListItem from "./components/alarm-list-item/index.vue";
import alarmMapWindow from "./components/alarm-map-window/index.vue";
import broadcastCircleModal from "./components/broadcast-circle-modal/index.vue";
import broadcastModal from "./components/broadcast-modal/index.vue";
import carSearch from "./components/car-search/car-search.vue";
import comingCallModal from "./components/coming-modal/call.vue";
import comingConferenceModal from "./components/coming-modal/conference.vue";
import customPersonWindow from "./components/custom-person-window/index.vue";
import filePreviewModal from "./components/file-preview-modal/index.vue";
import interGroupNotice from "./components/intercom-group-notice/index.vue";
import MakeCallModal from "./components/make-call-modal/index.vue";
import onlinePersonModal from "./components/online-person-modal/online-person-modal.vue";
import patrolListItem from "./components/patrol-list-item/index.vue";
import patrolMapWindow from "./components/patrol-map-window/index.vue";
import planListItem from "./components/plan-list-item/index.vue";
import riskDeviceWindow from "./components/risk-device-window/index.vue";
import selectCirclingPerson from "./components/select-circling-person-modal";
import taskBarTools from "./components/task-bar-tools/index.vue";
import callConferenceModal from "./components/telephone-modal/call-modal.vue";
import videoConferenceModal from "./components/telephone-modal/video-modal.vue";
import { showToast } from "./components/toast/index";
import videoModal from "./components/video-modal/index.vue";
import { CircleShow } from "./js/mapCircleLayer";
import { TCircleShow } from "./js/t-map-circleLayer";
import PersonList from "./person.vue";
import sceneMonitor from "./sceneMonitor";
import selectCircle from "./selectCircle";
import SubPanelTemplate from "./SubPanelTemplate";
import { treeLevelArray, kkFilePreview } from "@/utils/common";

import "animate.css";
import "../../../cube-map-plugin/map-leaflet/style.css";
export default defineComponent({
  components: {
    riskDeviceWindow,
    videoModal,
    taskBarTools,
    broadcastCircleModal,
    patrolMapWindow,
    comingConferenceModal,
    alarmMapWindow,
    CountTo,
    SearchOutlined,
    SubPanelTemplate,
    MakeCallModal,
    alarmListItem,
    onlinePersonModal,
    CloseOutlined,
    RightOutlined,
    customPersonWindow,
    FullscreenOutlined,
    FullscreenExitOutlined,
    DownOutlined,
    interGroupNotice,
    RetweetOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    selectCirclingPerson,
    ReloadOutlined,
    SyncOutlined,
    CarOutlined,
    selectCircle,
    comingCallModal,
    planListItem,
    PersonList,
    sceneMonitor,
    carSearch,
    broadcastModal,
    patrolListItem,
    // intercomGroupModalModal,
    videoConferenceModal,
    callConferenceModal,
    filePreviewModal,
  },
  setup() {
    const showstatistics = ref(false);
    const store = useStore();
    const customRef = ref();
    const alarmRef = ref();
    const riskDeviceWindowRef = ref();
    const customBroadcast = ref();
    const alarmitemRef = ref(null);
    const personWindow = ref();
    const { proxy } = getCurrentInstance();
    const map = shallowRef(null);
    const shallowState = shallowReactive({
      circles: null,
      polyLine: null,
      marketList: [],
      alarmInfoWindow: null,
      alarmMarker: null,
      areaPolygon: null, // 区域范围多边形
    });
    const state = reactive({
      incomingCallState: {
        comingCallVisible: false,
        isMinimized: false,
        callInfo: {},
      },
      onlinePersonModal: {
        visible: false,
        isMinimized: false,
      },
      panelOnlineCount: 0,
      incomingConferenceState: {
        conferenceInfo: {},
        isMinimized: false,
        comingConferenceVisible: false,
      },
      conferenceState: {
        videoVisible: false,
        videoIsMinimized: false,
        audioVisible: false,
        audioIsMinimized: false,
      },
      selectCirclePerson: {
        visible: false,
        isMinimized: false,
        circlePersons: [],
      },
      alarmState: null,
      deviceDataVideos: [],
      patrolListLoading: false,
      activePatrolId: "",
      type: "",
      seriousAlarm: false,
      loadingAlarm: false,
      emergencyPlan: {
        list: [],
        loading: false,
        emergencyEventTypeOptions: [],
        totalPage: 0,
        params: {
          pageNumber: 1,
          pageSize: 10,
          keyword: "",
          emergencyEventTypeCode: null,
        },
      },
      timer: null,
      activeAlarmType: "alarm",
      mouseTool: null,
      videoList: [],
      carSearchConfig: {
        visible: false,
        isMinimized: false,
      },
      makeCallModal: {
        visible: false,
        isMinimized: false,
        callInfo: {},
      },
      modalVideo: {
        visible: false,
        isMinimized: false,
        curEnlargeVideo: {},
      },
      intercomNotice: {
        visible: false,
        name: "",
        speaker: "",
      },
      original: {
        lnglat: [116.397428, 39.90923],
        zoom: 14,
        rotation: 0,
        radius: 200,
        background: "",
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
      currentDevice: {},
      alarmMarkerInfo: {},
      modalEquipment: {
        visible: false,
        isMinimized: false,
        selectedEq: [],
      },
      broadcast: {
        visible: false,
        isMinimized: false,
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
      activePatrolType: "UN_CONFIRMED",
      ALARM_PROGRESS_CONFIRMED: 0,
      ALARM_HANDLER: 0,
      currentPersonInfo: {},
      ALARM_HANDLER_NUM: 0,
      ALARM_SUSPEND: 0,
      TIME_OUT_UN_HANDLER: 0,
      ALARM_UN_CONFIRMED: 0,
      selectedAlarm: null,
      currentFireFighting: {},
      videoFull: false,
      checkedArea: [],
      currentArea: [],
      index: 0,
      areaOptions: [],
      areaList: [],
      swiperAreaList: [],
      patrolList: [],
      patrolListParams: {
        pageSize: 15,
        pageNumber: 1,
        totalPage: 0,
      },
      viewFull: true,
      currentPatrolPoint: {},
      filePreview: {
        visible: false,
        isMinimized: false,
        fileInfo: {},
        planInfo: null,
      },
    });
    const checkAlarmType = (type) => {
      state.activeAlarmType = type;
      if (type === "patrol") {
        state.patrolList = [];
        state.patrolListParams.pageNumber = 1;
        getPatrolList();
        state.selectedAlarm = null;
        if (shallowState.circles) {
          shallowState.circles.remove(map.value);
          map.value.remove(shallowState.alarmMarker);
          shallowState.circles = null;
          shallowState.alarmMarker = null;
        }
        // 取消选中的报警时恢复轮播
        onChangeArea(state.currentArea);
      } else {
        state.alarmList = [];
        page.value.pageNumber = 1;
        getAlarm();
        // 清除点线标记 选中巡更点
        state.activePatrolId = "";
        removePatrolMarkers();
        clearMapPoly();
      }
    };
    let patrolMarkers = [];
    let patrolPoly = [];
    // 转换
    const handlePatrolForPolyLineLocation = (data = []) => {
      const patrolPolyPath = {
        patroledPath: [],
        unPathrol: [],
      };
      const findPatroledIndex = data.findLastIndex((item) => item.patrolDate);
      if (findPatroledIndex > -1) {
        patrolPolyPath.patroledPath = data.slice(0, findPatroledIndex + 1);
        patrolPolyPath.unPathrol = data.slice(findPatroledIndex);
      } else {
        patrolPolyPath.patroledPath = [];
        patrolPolyPath.unPathrol = data;
      }
      return patrolPolyPath;
    };
    const handleClickPatrol = (item) => {
      const { locations = [], id } = item;
      // 清除当前的巡更点位及线条及窗体
      removePatrolMarkers();
      closeInfoWindow();
      clearMapPoly();
      if (state.activePatrolId === id) {
        state.activePatrolId = "";
      } else {
        state.activePatrolId = id;
        const polyPath = handlePatrolForPolyLineLocation(locations);
        const solidPath = polyPath.patroledPath.map((item) => {
          return [+item.patrolDimension, +item.patrolLongitude];
        });
        const dashedPath = polyPath.unPathrol.map((item) => {
          return [+item.patrolDimension, +item.patrolLongitude];
        });

        // 画点位
        locations.forEach((item) => {
          let icon = patroledIcon;
          if (!item.patrolDate) {
            icon = noPatrolIcon;
          }
          if (item.result === "ABNORMAL" && item.patrolDate) {
            icon = patrolAbnormalIcon;
          }
          if (item.result === "NORMAL" && item.patrolDate) {
            let icon = patroledIcon;
          }

          const lngLat = [+item.patrolDimension, +item.patrolLongitude];
          addMarkToMap(lngLat, icon, item);
        });
        // // 画实线
        // paintSolidPolyForMap(solidPath)
        // // 画虚线
        // paintDashedPolyForMap(dashedPath)
      }
    };
    const handleNotVideo = () => {
      // 轮播下一个区域
      carousel();
    };
    const handleMakeCall = (data) => {
      state.makeCallModal.callInfo = data;
      state.makeCallModal.visible = true;
      state.makeCallModal.isMinimized = false;
    };
    const handleOnlineCountChange = (count) => {
      state.panelOnlineCount = count;
    };
    const openOnlinePersonQuery = () => {
      state.onlinePersonModal.visible = true;
      state.onlinePersonModal.isMinimized = false;
    };
    const patrolWindowRef = ref();
    // 清除线
    const clearMapPoly = () => {
      map.value.remove(patrolPoly);
    };
    // 清除巡更点标记
    const removePatrolMarkers = () => {
      if (!map.value) return;
      if (!patrolMarkers.length) return;
      patrolMarkers.forEach((item) => {
        map.value.remove(item);
      });
      patrolMarkers = [];
    };
    // 新增巡更点标记
    const addMarkToMap = (lngLat, icon, patrolPoint) => {
      const mapIcon = new AMap.Icon({
        size: new AMap.Size(36, 52),
        // 图标尺寸
        image: icon ?? broadcast, // Icon的图像
        imageSize: new AMap.Size(39, 55), // 根据所设置的大小拉伸或压缩图片
      });
      const marker = new AMap.Marker({
        position: new AMap.LngLat(lngLat[0], lngLat[1]),
        // 将一张图片的地址设置为 icon
        icon: mapIcon,
        // 设置了 icon 以后，设置 icon 的偏移量，以 icon 的 [center bottom] 为原点
        offset: new AMap.Pixel(-13, -30),
      });
      if (!map.value) return;
      map.value.add(marker);
      patrolMarkers.push(marker);
      marker.on("click", function () {
        state.currentPatrolPoint = patrolPoint;
        state.currentPatrolPoint.patrolTime = patrolPoint.patrolDate ? moment(patrolPoint.patrolDate).format("YYYY-MM-DD hh:mm") : "";
        let infoWindow = new AMap.InfoWindow({
          isCustom: true, //使用自定义窗体
          content: patrolWindowRef.value,
          offset: new AMap.Pixel(0, -26),
        });
        infoWindow.open(map.value, marker.getPosition());
      });
      map.value.setFitView([marker]);
    };
    // 获取巡更列表并清空标记点
    const getPatrolListClearActiveId = () => {
      getPatrolList();
      removePatrolMarkers();
      clearMapPoly();
      state.activePatrolId = "";
    };
    // 获取巡更列表
    const getPatrolList = async () => {
      try {
        state.patrolListLoading = true;
        const params = {
          ...state.patrolListParams,
          affirm: state.activePatrolType === "UN_CONFIRMED" ? false : true,
        };
        const res = await proxy.$api.getPatrolAbnormalList(params);
        const patrolList = res.records.map((item) => {
          return {
            ...item,
            startTime: moment(item.startDate).format("MM.DD hh:mm"),
            endTime: moment(item.endDate).format("MM.DD hh:mm"),
          };
        });
        state.patrolListParams.totalPage = res.pages;
        state.patrolList = state.patrolListParams.pageNumber > 1 ? [...state.patrolList, ...patrolList] : [...patrolList];
      } catch (error) {
      } finally {
        state.patrolListLoading = false;
      }
    };
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

    let markArray = ref([]);
    const setmark = () => {
      if (markArray.value.length > 0) {
        for (let i = 0; i < markArray.value.length; i++) {
          map.value.remove(markArray.value[i]);
        }
        markArray.value = [];
      }
    };
    const handlePreviewPlanFile = async (item) => {
      const result = await proxy.$api.planDocumentDetail(item.id);
      if (result.generated) {
        state.filePreview.fileInfo = {};
        state.filePreview.planInfo = result;
        state.filePreview.visible = true;
        return;
      }
      if (!(result.documentFileVOS || []).length) return proxy.$message.error("未找到文件");
      state.filePreview.planInfo = null;
      state.filePreview.fileInfo = result.documentFileVOS[0];
      state.filePreview.visible = true;
      // let fileUrl = result.documentFileVOS[0].path
      // const fileName = result.documentFileVOS[0].name
      // const type = result.documentFileVOS[0].type
      // if (type) {
      //   kkFilePreview(result.documentFileVOS[0])
      // } else {
      //   proxy.$message.error('文件格式不支持预览')
      // }
    };
    const openCarModal = () => {
      state.carSearchConfig.visible = true;
      state.carSearchConfig.isMinimized = false;
    };
    const closeCarSearch = () => {
      state.carSearchConfig.visible = false;
    };
    // 获取广播设备
    const getDeviceByModel = () => {
      proxy.$api.getbroadcastDeviceInfo({ applicationCode: "BROADCAST_CENTER" }).then((res) => {
        setmark();
        const deviceList = res.filter((item) => item.deviceStatus);
        deviceList.forEach((item) => {
          if (item.lntAndLat) {
            let lngLat = item.lntAndLat.split(",");
            if (window.AMap || map.value) {
              var icon = new AMap.Icon({
                size: new AMap.Size(36, 52),
                // 图标尺寸
                image: !item.deviceStatus ? sybroadcast : broadcast, // Icon的图像
                imageSize: new AMap.Size(39, 55), // 根据所设置的大小拉伸或压缩图片
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
          }
        });
      });
    };
    const settime = ref(null);
    const timer = ref(null);
    settime.value = setInterval(() => {
      getDeviceByModel();
    }, 600000);
    const getDispatchMapConfigDict = async () => {
      window.updateAppSplashProgress?.(42, "正在加载地图配置", "data");
      const result = await proxy.$api.getDictionaryByItem();
      const config = result.reduce(
        (pre, cur) => {
          if (cur.code === "lnglat") {
            cur.variable = cur.variable ? cur.variable.split(",") : "";
          } else {
            cur.variable = cur.variable;
          }
          return {
            ...pre,
            [cur.code]: cur.variable ? cur.variable : pre[cur.code],
          };
        },
        {
          ...state.original,
        },
      );
      state.original = config;
      store.commit("commandDispatch/SET_MAP_CONFIG", config);
    };
    const loadBackground = () => {
      const mapContainer = document.getElementById("commandDispatch");
      mapContainer.style.backgroundImage = `url(${config.background})`;
      mapContainer.style.backgroundSize = "100% 100%";
      mapContainer.style.backgroundRepeat = "no-repeat";
      mapContainer.style.backgroundPosition = "center";
    };
    //高德地图初始化
    const initAMap = async () => {
      return new Promise(async (resolve, reject) => {
        window.updateAppSplashProgress?.(50, "正在初始化地图引擎", "map");
        if (!window.AMap) {
          await initMap();
        }
        if (!window.AMap) {
          loadBackground();
        }
        // 创建地图实例
        map.value = new AMap.Map("commandDispatch", {
          center: store.getters.mapConfig.lnglat,
          zoom: 11.2,
          expandZoomRange: true,
          resizeEnable: true, //是否监控地图容器尺寸变化
          mapStyle: "amap://styles/darkblue",
        });
        state.mouseTool = new AMap.MouseTool(map.value);
        map.value.setZoom(store.getters.mapConfig.zoom);
        map.value.setRotation(store.getters.mapConfig.rotation);
        const id = store.getters.nowEnterprise?.code ?? "58197260";
        id === 13587423 && map.value.setRotation(30, true);
        let overlays = [];
        state.mouseTool.on("draw", function (e) {
          map.value.remove(overlays);
          overlays = [];
          overlays.push(e.obj);
          if (e.obj._opts.center.lng && e.obj._opts.radius) {
            if (state.mapEditgb) {
              getDispatchCircleDevice(e.obj._opts.center.lng, e.obj._opts.center.lat, e.obj._opts.radius);
            } else {
              getDispatchCirclePerson(e.obj);
            }
          }
        });

        // 标记是否已经绘制过区域
        let areaDrawn = false;
        const drawAreaAfterRotation = () => {
          if (!areaDrawn) {
            areaDrawn = true;
            drawTenantArea(); // 绘制区域范围
          }
        };

        // 高德地图：在设置旋转后，等待旋转完成事件
        const isAMap = window.mapType === "gdMap" && window.AMap;
        if (isAMap && map.value) {
          // 监听 rotateend 事件，确保在旋转完成后绘制
          const initialRotateEndHandler = () => {
            drawAreaAfterRotation();
            map.value.off("rotateend", initialRotateEndHandler);
          };
          map.value.on("rotateend", initialRotateEndHandler);
          // 如果旋转已经完成或不需要旋转，延迟后绘制（作为备选方案）
          setTimeout(() => {
            drawAreaAfterRotation();
          }, 500);
        }

        const revealMap = () => {
          if (revealMap.done) return;
          revealMap.done = true;
          const mapEl = document.getElementById("commandDispatch");
          if (mapEl) {
            mapEl.style.backgroundImage = "none";
            mapEl.classList.add("is-map-ready");
          }
          requestAnimationFrame(() => {
            window.hideAppSplash?.();
          });
        };

        map.value.on("complete", () => {
          getDispatchDeviceList();
          // Leaflet 地图：直接绘制，polygon 会自动跟随旋转
          if (!isAMap) {
            drawAreaAfterRotation();
          }
          resolve(map.value);

          const leafletMap = map.value?.mapInstance;
          if (leafletMap && typeof leafletMap.isLoading === "function" && leafletMap.isLoading()) {
            leafletMap.once("load", revealMap);
            setTimeout(revealMap, 2000);
            return;
          }
          revealMap();
        });

        // 监听地图旋转变化事件，重新绘制区域高亮
        const actualMapInstance = map.value?.mapInstance || map.value;
        const isLeafletMap = window.mapType === "TD_MAP" || window.mapType === "cube-map" || (!window.mapType && window.L);
        const isAMapCheck = window.mapType === "gdMap" && window.AMap;

        if (isAMapCheck && map.value) {
          // 高德地图：监听 rotateend 事件，在旋转后重新绘制
          map.value.on("rotateend", () => {
            // 当地图旋转结束时，重新绘制区域高亮以确保正确对齐
            if (shallowState.areaPolygon) {
              // 先清除旧的 polygon
              if (map.value && map.value.remove) {
                map.value.remove(shallowState.areaPolygon);
                if (shallowState.areaPolygon._labelMarker) {
                  map.value.remove(shallowState.areaPolygon._labelMarker);
                }
              }
              shallowState.areaPolygon = null;
              // 重新绘制
              drawTenantArea();
            }
          });
        } else if (isLeafletMap && actualMapInstance && window.L) {
          // Leaflet 地图：polygon 在 overlayPane 中，overlayPane 在 rotatePane 中，应该会自动跟随旋转
          // 监听 rotate 事件，确保 polygon 正确更新
          actualMapInstance.on("rotate", () => {
            // Leaflet 的 polygon 应该会自动跟随旋转
            // 但如果 polygon 没有正确跟随，可能需要强制刷新
            if (shallowState.areaPolygon && shallowState.areaPolygon.redraw) {
              // 强制重绘 polygon，确保它正确跟随旋转
              shallowState.areaPolygon.redraw();
            }
          });
        }
      });
    };
    /**
     * 获取圈选范围内的人员设备
     * 将GPS坐标系转换为高德地图坐标系进行圈选判断
     */
    const getDispatchCirclePerson = async (obj) => {
      // 将圈选中心点从GPS坐标系转换为高德地图坐标系
      const centerGcj02 = transformWGS84ToGCJ02(obj._opts.center.lng, obj._opts.center.lat);

      // 创建转换后的圆形对象用于判断
      const gcj02Circle = new AMap.Circle({
        center: new AMap.LngLat(centerGcj02[0], centerGcj02[1]),
        radius: obj._opts.radius,
      });

      if (window.mapType === "TD_MAP") {
        state.selectCirclePerson.circlePersons = state.deviceList.filter((item) => {
          const distance = GeometryUtil.distanceOfLine([
            { lng: item.gps.lng, lat: item.gps.lat },
            { lng: centerGcj02[0], lat: centerGcj02[1] },
          ]);
          return distance <= obj._opts.radius;
        });
      } else {
        state.selectCirclePerson.circlePersons = state.deviceList.filter((item) => {
          return gcj02Circle.contains(new AMap.LngLat(item.gps.lng, item.gps.lat));
        });
      }
      state.selectCirclePerson.visible = true;
      state.selectCirclePerson.isMinimized = false;
      closeMouseTool();
    };
    //是否有调度中心配置
    const getDispatchConfig = async () => {
      const config = await proxy.$api.getCorrespondServiceDict();
      if (!config) {
        store.commit("commandDispatch/SET_HAS_CONFIG", false);
        return;
      }
    };
    // 复原
    const restore = () => {
      map.value.setCenter(store.getters.mapConfig.lnglat);
      map.value.setRotation(store.getters.mapConfig.rotation);
      map.value.setZoom(store.getters.mapConfig.zoom);
      personWindow.value.clearHistoryTrail();
      if (shallowState.polyLine) {
        map.value.remove(shallowState.polyLine);
        shallowState.polyLine = null;
      }
    };
    const focusOnlinePerson = (item) => {
      if (!item.gps) {
        proxy.$message.error("未获取到坐标信息");
        return;
      }
      if (!item.gps.lng || !item.gps.lat) {
        proxy.$message.error("坐标无效");
        return;
      }
      map.value && map.value.setZoomAndCenter(22, [item.gps.lng, item.gps.lat]);
    };
    // 绘制租户区域范围
    const drawTenantArea = async () => {
      try {
        // 获取当前租户信息
        const tenantCode = store.getters.nowEnterprise?.code;
        if (!tenantCode) {
          return;
        }

        const tenantData = await proxy.$api.getTenantInfo({ id: tenantCode });

        if (!tenantData || !tenantData.lntAndLatScope) {
          return;
        }

        // 清除之前的区域多边形
        if (shallowState.areaPolygon) {
          const actualMapInstance = map.value?.mapInstance || map.value;
          if (window.L && actualMapInstance && actualMapInstance.removeLayer) {
            // Leaflet 地图
            actualMapInstance.removeLayer(shallowState.areaPolygon);
          } else if (map.value && map.value.remove) {
            // 高德地图
            map.value.remove(shallowState.areaPolygon);
          }
          shallowState.areaPolygon = null;
        }

        // 解析区域范围数据：格式为 "lng,lat,address;lng,lat,address"
        // 注意：lntAndLatScope 数据来自高德地图，使用 GCJ-02 坐标系
        let areaPoints = tenantData.lntAndLatScope
          .split(";")
          .map((item) => {
            const [lng, lat] = item.split(",");
            return {
              lng: Number(lng),
              lat: Number(lat),
            };
          })
          .filter((point) => !isNaN(point.lng) && !isNaN(point.lat));

        // 根据地图类型进行坐标系转换
        // 如果地图是 TD_MAP（天地图/Leaflet），需要将 GCJ-02 转换为 WGS-84
        if (window.mapType === "TD_MAP" || window.mapType === "cube-map") {
          areaPoints = areaPoints.map((point) => {
            const wgs84 = transformGCJ02ToWGS84(point.lng, point.lat);
            return {
              lng: wgs84[0],
              lat: wgs84[1],
            };
          });
        }

        // 至少需要3个点才能绘制多边形
        if (areaPoints.length < 3) {
          return;
        }

        // 获取实际的地图实例
        // 如果 map.value 有 mapInstance 属性，说明是 TMap 包装器，需要使用 mapInstance
        // 否则直接使用 map.value
        const actualMapInstance = map.value?.mapInstance || map.value;

        // 判断地图类型并创建多边形
        const isLeafletMap = window.mapType === "TD_MAP" || window.mapType === "cube-map" || (!window.mapType && window.L);
        const isAMap = window.mapType === "gdMap" && window.AMap && window.AMap.Polygon;

        if (isLeafletMap && window.L && L.polygon && actualMapInstance) {
          // 对于支持旋转的 Leaflet 地图，必须使用 overlayPane 确保 polygon 能跟随地图旋转
          // overlayPane 在 rotatePane 中，所以 polygon 会自动跟随旋转
          // 注意：不要使用自定义 pane，因为自定义 pane 默认在 mapPane 中，不会跟随旋转

          // Leaflet 地图
          const leafletPoints = areaPoints.map((point) => [point.lat, point.lng]);

          // 创建多边形，直接使用 overlayPane 确保能跟随地图旋转
          // overlayPane 在 rotatePane 中，所以 polygon 会自动跟随地图旋转
          shallowState.areaPolygon = L.polygon(leafletPoints, {
            color: "#1890ff", // 边框颜色
            weight: 2, // 边框宽度
            opacity: 1, // 边框透明度
            fillColor: "#1890ff", // 填充颜色
            fillOpacity: 0.3, // 填充透明度
            pane: "overlayPane", // 必须使用 overlayPane，它在 rotatePane 中，会自动跟随旋转
            interactive: false, // 设置为非交互式，允许点击事件穿透到下层点位
          });

          // 确保 polygon 正确添加到地图
          shallowState.areaPolygon.addTo(actualMapInstance);

          // 验证 polygon 是否在正确的 pane 中
          if (shallowState.areaPolygon._renderer && shallowState.areaPolygon._renderer._container) {
            const pane = shallowState.areaPolygon._renderer._container.parentElement;
            // 确保 polygon 的容器在 overlayPane 中
            const overlayPane = actualMapInstance.getPane("overlayPane");
            if (overlayPane && pane && pane !== overlayPane && !overlayPane.contains(pane)) {
            }
          }

          // 直接在 polygon 上绑定文字标签，文字会跟随 polygon 一起缩放
          if (tenantData.lntAndLatScopeName) {
            // 计算多边形中心点（用于定位文字）
            const centerLat = areaPoints.reduce((sum, point) => sum + point.lat, 0) / areaPoints.length;
            const centerLng = areaPoints.reduce((sum, point) => sum + point.lng, 0) / areaPoints.length;

            // 使用 bindTooltip 在 polygon 上添加永久显示的标签
            shallowState.areaPolygon
              .bindTooltip(tenantData.lntAndLatScopeName, {
                permanent: true, // 永久显示
                direction: "center", // 居中显示
                className: "area-polygon-label", // 自定义样式类
                offset: [0, 0], // 偏移量
                interactive: false, // 不响应鼠标事件
              })
              .setTooltipContent(tenantData.lntAndLatScopeName);

            // 设置 tooltip 的位置到多边形中心
            shallowState.areaPolygon.openTooltip([centerLat, centerLng]);
          }

          // 调整地图视野以包含整个区域
          actualMapInstance.fitBounds(shallowState.areaPolygon.getBounds(), {
            padding: [50, 50],
          });
        } else if (isAMap && window.AMap && window.AMap.Polygon && map.value) {
          // 高德地图
          const amapPoints = areaPoints.map((point) => new window.AMap.LngLat(point.lng, point.lat));

          // 计算多边形中心点（用于定位文字）
          const centerLng = areaPoints.reduce((sum, point) => sum + point.lng, 0) / areaPoints.length;
          const centerLat = areaPoints.reduce((sum, point) => sum + point.lat, 0) / areaPoints.length;

          // 创建多边形，使用 text 属性直接在 polygon 上添加文字
          const polygonOptions = {
            path: amapPoints,
            strokeColor: "#1890ff", // 边框颜色
            strokeWeight: 2, // 边框宽度
            strokeOpacity: 1, // 边框透明度
            fillColor: "#1890ff", // 填充颜色
            fillOpacity: 0.3, // 填充透明度
            zIndex: 450,
            clickable: false, // 设置为不可点击，允许点击事件穿透到下层点位
          };

          // 如果高德地图支持 text 属性，直接在 polygon 上添加文字
          if (tenantData.lntAndLatScopeName) {
            // 高德地图的 Polygon 可以使用 text 属性添加文字标签
            polygonOptions.text = {
              content: tenantData.lntAndLatScopeName,
              direction: "center",
              style: {
                fontSize: "14px",
                fontWeight: "500",
                fillColor: "#ffffff",
                strokeColor: "rgba(0, 0, 0, 0.7)",
                strokeWidth: 3,
              },
            };
          }

          shallowState.areaPolygon = new window.AMap.Polygon(polygonOptions);
          map.value.add(shallowState.areaPolygon);

          // 确保 polygon 正确显示在地图上
          // 高德地图的 Polygon 会自动跟随地图旋转，但需要确保在正确的时机创建
          // 调用 setMap 方法确保 polygon 正确关联到地图
          if (shallowState.areaPolygon.setMap) {
            shallowState.areaPolygon.setMap(map.value);
          }

          // 如果 text 属性不支持，使用 Marker 作为备选方案，但将其添加到 polygon 的同一图层
          if (tenantData.lntAndLatScopeName && !polygonOptions.text) {
            const labelContent = document.createElement("div");
            labelContent.textContent = tenantData.lntAndLatScopeName;
            labelContent.style.cssText = `
              background: rgba(0, 0, 0, 0.7);
              color: #ffffff;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              white-space: nowrap;
              border: 1px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              pointer-events: none;
            `;

            const labelMarker = new window.AMap.Marker({
              position: new window.AMap.LngLat(centerLng, centerLat),
              content: labelContent,
              offset: new window.AMap.Pixel(0, 0),
              zIndex: 451,
            });
            map.value.add(labelMarker);
            // 将 labelMarker 存储到 polygon 对象上，便于后续清理
            shallowState.areaPolygon._labelMarker = labelMarker;
          }

          // 调整地图视野以包含整个区域
          map.value.setFitView([shallowState.areaPolygon], false, [50, 50, 50, 50]);
        } else {
        }
      } catch (error) {}
    };

    // 指挥调度设备列表
    const getDispatchDeviceList = async () => {
      if (!store.getters.hasConfig) return;
      if (shallowState.marketList.length) {
        map.value.remove(shallowState.marketList);
      }
      const personList = await proxy.$api.getOnlineUserList();
      const currentUserId = store.getters.userInfo?.id;
      const remoteDeviceList = (personList || []).filter((item) => item.id !== currentUserId);

      state.deviceList = remoteDeviceList
        .filter((item) => item.account && item.gps?.lng && item.gps?.lat && isInRadius(item))
        .map((item) => ({ ...item, isOnline: true }));
      shallowState.marketList = [];
      const personIcon = new AMap.Icon({
        size: new AMap.Size(30, 46),
        // 图标尺寸
        image: personMarket, // Icon的图像
        imageSize: new AMap.Size(30, 46), // 根据所设置的大小拉伸或压缩图片
      });
      state.deviceList.forEach((item) => {
        let marker = new AMap.Marker({
          position: new AMap.LngLat(item.gps.lng, item.gps.lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          title: item.name,
          icon: personIcon,
        });
        marker.on("click", () => {
          if (personWindow.value.isCalling) {
            proxy.$message.error("地图信息窗体正在通话中，无法打开其他窗体!");
            return;
          }

          state.currentPersonInfo = {
            ...item,
            organizationName: item.organization ? item.organization.name : "--",
            positionName: Array.isArray(item.positions) && item.positions.length ? item.positions.map((pos) => pos.name).join(",") : "--",
            uploadTime: moment(item.uploadTime).format("YYYY-MM-DD HH:mm:ss"),
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
      map.value && map.value.add(shallowState.marketList);
    };
    const intervalTimer = setInterval(() => {
      getDispatchDeviceList();
    }, 1000 * 60);
    const closeAlarmInfoWindow = () => {
      if (shallowState.alarmInfoWindow) {
        shallowState.alarmInfoWindow.close();
        shallowState.alarmInfoWindow = null;
      }
    };
    //关闭窗体信息
    const closeInfoWindow = () => {
      map.value.clearInfoWindow();
    };
    //关闭圈选效果
    const closeMouseTool = () => {
      state.mapEdit = false;
      state.mapEditgb = false;
      state.mouseTool.close(true);
    };
    //打开圈选效果
    const openMouseTool = () => {
      state.mouseTool.circle({
        fillColor: "#00b0ff",
        strokeColor: "#80d8ff",
      });
      state.mapEdit = true;
      state.mapEditgb = false;
    };
    const openMouseToolgb = () => {
      state.mouseTool.circle({
        fillColor: "#00b0ff",
        strokeColor: "#80d8ff",
      });
      state.mapEditgb = true;
      state.mapEdit = false;
    };
    /**
     * 圈选查询设备
     * 将GPS坐标系转换为高德地图坐标系后查询
     */
    const getDispatchCircleDevice = (lng, lat, radius) => {
      // 将GPS坐标系转换为高德地图坐标系
      const gcj02Coords = transformWGS84ToGCJ02(lng, lat);

      proxy.$api
        .getDispatchCircleBroadcast({
          lng: gcj02Coords[0],
          lat: gcj02Coords[1],
          radius,
        })
        .then((res) => {
          state.modalEquipment.visible = true;
          state.modalEquipment.isMinimized = false;
          state.modalEquipment.selectedEq = res;
          closeMouseTool();
        });
    };
    //点击报警类型
    const clickType = (item) => {
      state.activeType = item.value;
      state.selectedAlarm = null;
      state.timer = null;
      state.alarmList = [];
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
      state.activePatrolType = item.value;
      state.patrolList = [];
      state.patrolListParams.pageNumber = 1;
      getPatrolList();
    };
    //点击消息
    const alarmLevelId = ref("");
    const levelList = ref([]);
    const alarmTypeId = ref("");
    const alarmLevelChange = (value) => {
      state.alarmList = [];
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    };
    const alarmTypeChange = (value) => {
      state.alarmList = [];
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
      pages: 0,
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
          alarmStatus: state.activeType == "TIMED_OUT" ? null : state.activeType,
          alarmHandlerTimeoutStatus: alarmHandlerTimeoutStatus,
          businessType: "EMERGENCY_CENTER_ALARM",
        })
        .then((res) => {
          const alarmList = res.records.map((item) => {
            return {
              ...item,
              alarmTime: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
            };
          });
          state.alarmList = page.value.pageNumber !== 1 ? [...state.alarmList, ...alarmList] : [...alarmList];
          page.value.pages = res.pages;
        })
        .finally(() => {
          state.loadingAlarm = false;
        });
    };
    const refreshCurrentAlarmList = async (alarmInfo) => {
      if (state.selectedAlarm?.id === alarmInfo?.id) {
        state.selectedAlarm = null;
        closeAlarmInfoWindow();
        if (shallowState.alarmMarker) {
          map.value?.remove(shallowState.alarmMarker);
          shallowState.alarmMarker = null;
        }
        if (shallowState.circles) {
          shallowState.circles.remove(map.value);
          shallowState.circles = null;
        }
      }
      state.activeType = "ALARM_UN_CONFIRMED";
      page.value.pageNumber = 1;
      await getAlarm("", "");
      getAlarmStatistics();
    };

    //获取报警统计
    const getAlarmStatistics = () => {
      state.loadingAlarm = true;
      proxy.$api
        .getAlarmStatistics({
          businessType: "EMERGENCY_CENTER_ALARM",
          period: [moment(new Date()).format("YYYY-MM-DD 00:00:00"), moment(new Date()).format("YYYY-MM-DD 23:59:59")].join(","),
        })
        .then((res) => {
          state.ALARM_TOTAL = res.alarmNum;
          state.ALARM_HANDLER_NUM = res.alarmHandlerNum;
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
        })
        .finally(() => {
          state.loadingAlarm = false;
        });
    };
    let starttime = moment(new Date()).format("YYYY-MM-DD ") + "00:00:00";
    let enttime = moment(new Date()).format("YYYY-MM-DD ") + "23:59:59";

    // 关闭弹窗
    const closeComingCallModal = () => {
      state.incomingCallState.comingCallVisible = false;
    };
    // 选择报警
    const changeAlarmItem = (item) => {
      state.seriousAlarm = false;
      state.emergencyPlan.params.emergencyEventTypeCode = item.alarmEventTypeCode;
      handleEmergencyPlanSearch();
      if (state.selectedAlarm && state.selectedAlarm.id === item.id) {
        state.selectedAlarm = null;
        if (shallowState.circles) {
          shallowState.circles.remove(map.value);
          map.value.remove(shallowState.alarmMarker);
        }
        shallowState.circles = null;
        shallowState.alarmMarker = null;
        if (shallowState.alarmInfoWindow) {
          shallowState.alarmInfoWindow.close();
          shallowState.alarmInfoWindow = null;
        }
        restore();
        // 取消选中的报警时恢复轮播
        onChangeArea(state.currentArea);
        state.timer = setInterval(
          () => {
            carousel();
          },
          1000 * 60 * 10,
        );
      } else {
        state.selectedAlarm = item;
        if (item.alarmTypeCode == "ELECTRONIC_PATROL") {
          addPatrolMarket(item);
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
          state.videoList = res.map((item) => {
            return {
              ...item,
              id: item.deviceId,
              thirdPartyId: item.token,
            };
          });
        }
      });
    };
    // 创建环形动画
    const createCirclesAnimation = (lngLat, fillColor) => {
      shallowState.circles =
        map.value.mapType === "cube-map"
          ? new TCircleShow(map.value, 5, 4, lngLat, { fillColor: fillColor, fillOpacity: 0.5 }, serious)
          : new CircleShow(map.value, 5, 4, lngLat, { fillColor: fillColor, fillOpacity: 0.5 }, serious);
      shallowState.circles.start(500, 2000);
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
      let TargetLongitudeList = JSON.parse(data.snapshot).data;
      TargetLongitudeList.forEach((ele) => {
        let lngLat = [ele.nfcDimension, ele.nfcLongitude];
        let fillColor = data.alarmLevelCode == "one_level" ? "#FF4D50" : "#387af2";
        createCirclesAnimation(lngLat, fillColor);
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
      });
      shallowState.alarmMarker.on("click", () => {
        state.alarmMarkerInfo = {
          ...data,
          alarmTime: moment(data.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        };
        nextTick(() => {
          let infoWindow = new AMap.InfoWindow({
            isCustom: true, //使用自定义窗体
            content: alarmRef.value,
            offset: new AMap.Pixel(106, -80),
          });
          infoWindow.open(map.value, shallowState.alarmMarker.getPosition());
        });
      });
      shallowState.alarmMarker.setMap(map.value);
    };
    // 添加报警图标
    const addAlarmMarket = (data) => {
      if (shallowState.alarmMarker) {
        // shallowState.alarmMarker.setMap(null);
        map.value.remove(shallowState.alarmMarker);
        shallowState.alarmMarker = null;
      }

      if (shallowState.alarmInfoWindow) {
        shallowState.alarmInfoWindow.close();
        shallowState.alarmInfoWindow = null;
      }
      if (shallowState.circles) {
        shallowState.circles.remove(map.value);
        shallowState.circles = null;
      }
      if (data.alarmTargetLongitude) {
        let lngLat = data.alarmTargetLongitude.split(",");
        if (lngLat.length < 2) return;
        let fillColor = data.alarmLevelCode == "one_level" ? "#FF4D50" : "#387af2";
        createCirclesAnimation(lngLat, fillColor);
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
        state.alarmMarkerInfo = {
          ...data,
          alarmTime: moment(data.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        };
        map.value.add(shallowState.alarmMarker);
        shallowState.alarmInfoWindow = new AMap.InfoWindow({
          isCustom: true, //使用自定义窗体
          content: alarmRef.value,
          offset: new AMap.Pixel(0, -50),
        });
        shallowState.alarmInfoWindow.open(map.value, shallowState.alarmMarker.getPosition());
        nextTick(() => {
          map.value.setFitView([shallowState.alarmMarker]);
        });
      }
    };
    // 摄像机放大
    const enlargeVideo = (item) => {
      state.modalVideo.visible = true;
      state.modalVideo.curEnlargeVideo = item;
      state.modalVideo.isMinimized = false;
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
      proxy.$api.getAreaTreeList().then((res) => {
        state.areaOptions = cloneDeep(res);
        state.areaList = treeLevelArray(cloneDeep(res));
        state.swiperAreaList = res.filter((item) => item.deviceCount > 0);
        if (state.swiperAreaList.length) {
          state.currentArea = state.swiperAreaList[state.index];
          onChangeArea(state.currentArea);
          state.timer = setInterval(
            () => {
              carousel();
            },
            1000 * 60 * 10,
          );
        }
      });
    };
    const carousel = () => {
      if (state.selectedAlarm) return;
      state.index++;
      if (state.index > state.swiperAreaList.length - 1) {
        state.index = 0;
        //10分钟后重新请求
        clearInterval(timer.value);
        timer.value = setInterval(() => {
          getAreaList();
          clearInterval(timer.value);
        }, 1000 * 10);
        return;
      }
      state.currentArea = state.swiperAreaList[state.index];
      onChangeArea(state.currentArea);
    };
    // 选择区域
    const onChangeArea = async (value, selectedOptions) => {
      function getAllThirdIdItems(tree, result) {
        //遍历树  获取id数组
        for (const i in tree) {
          if (tree[i].thirdPartyId) {
            result.push(tree[i]); // 遍历项目满足条件后的操作
          }
          if (tree[i].children.length) {
            //存在子节点就递归
            getAllThirdIdItems(tree[i].children, result);
          }
        }
        return result;
      }
      //如果是 手动选择的
      if (selectedOptions && Array.isArray(selectedOptions)) {
        const option = selectedOptions.at(-1);
        const result = [];
        getAllThirdIdItems([option], result);
        state.videoList = [...result];
        clearInterval(state.timer);
        state.timer = setInterval(
          () => {
            carousel();
          },
          1000 * 60 * 10,
        );
      } else {
        const result = [];
        state.checkedArea = [value.id];
        getAllThirdIdItems([value], result);
        state.videoList = [...result];
      }
    };
    // 点击广播喊话
    const clickShout = () => {
      closeInfoWindow();
      broadcastdevice.value = [];
      state.broadcast.visible = true;
      state.broadcast.isMinimized = false;
    };
    //点击停止喊话
    const clickStop = () => {
      proxy.$api.stopBroadcast({
        deviceId: state.currentDevice.deviceId,
      });
      proxy.$message.success("操作成功");
      closeInfoWindow();
    };
    // 点击全屏
    const clickFull = () => {
      state.viewFull = !state.viewFull;
    };
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

    let currentTime = ref(0);
    const initWebrtc = async () => {
      // 保活时间修改
      setInterval(() => {
        proxy.$api.keepAliveAccount();
      }, 60 * 1000);
      await proxy.$api.keepAliveAccount();
      await proxy.$api.registerAccount([store.getters.userInfo.id]);
      // 来电事件
      const webrtc = store.getters.webrtcInstance;
      webrtc.on("incomingCall", (callInfo) => {
        state.incomingCallState.comingCallVisible = true;
        state.incomingCallState.isMinimized = false;
        state.incomingCallState.callInfo = callInfo;
      });
      // 本地通话结束
      webrtc.on("overCalled", (data) => {
        state.incomingCallState.comingCallVisible = false;
      });
      // 有人讲话通知
      webrtc.on("changeSpeaker", (data) => {
        if (!state.intercomNotice.visible && data.speaker !== "") {
          state.intercomNotice.visible = true;
        }
        if (data.speaker) {
          state.intercomNotice.speaker = data.speaker;
          state.intercomNotice.name = data.sender.name;
        } else {
          // 延迟五秒关闭弹窗
          window.setTimeout(() => {
            state.intercomNotice.visible = false;
          }, 5000);
        }
      });
      webrtc.on("changeConference", (data) => {
        state.conferenceState.videoVisible = true;
        state.conferenceState.videoIsMinimized = false;
        state.makeCallModal.visible = false;
        state.makeCallModal.isMinimized = false;
        proxy.$emitter.emit("startConference", "video");
      });
      // 来会议事件
      webrtc.on("incomingConference", async (data) => {
        const { conference, members } = data;
        let startUser = state.deviceList.find((item) => item.id === conference.caller);
        if (!startUser) {
          startUser = await proxy.$api.getUser({ id: conference.caller });
        }
        const meetingName = `${startUser.name}发起的${conference.isVideo ? "视频" : "语音"}通话`;
        const startMember = {
          userId: startUser.id,
          file: startUser.file,
          name: startUser.name,
          id: startUser.id,
          number: conference.caller,
          allowListen: true,
          allowSpeak: true,
          openVideo: true,
          organizationName: startUser.organization ? startUser.organization.name : "--",
          positionName:
            Array.isArray(startUser.positions) && startUser.positions.length
              ? startUser.positions.map((item) => item.name).join(",")
              : "--",
        };
        store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", [startMember]);
        store.commit("commandDispatch/SET_MEETING_TITLE", meetingName);

        state.incomingConferenceState.conferenceInfo = {
          name: startUser.name,
          number: conference.caller,
          mobile: startUser.mobile,
          file: startUser.file,
          isVideo: conference.isVideo,
          organizationName: startUser.organization ? startUser.organization.name : "--",
          positionName:
            Array.isArray(startUser.positions) && startUser.positions.length
              ? startUser.positions.map((item) => item.name).join(",")
              : "--",
        };
        state.incomingConferenceState.comingConferenceVisible = true;
        state.incomingConferenceState.isMinimized = false;
      });
      // 会议结束
      webrtc.on("endConference", () => {
        state.incomingConferenceState.comingConferenceVisible = false;
        state.conferenceState.audioVisible = false;
        state.conferenceState.videoVisible = false;
      });
    };
    const openWebRtc = () => {
      // if (process.env.VUE_APP_OPEN_WEBRTC === 'false') return;
      if (!store.getters.hasConfig) return;
      initWebrtc();
    };
    onMounted(async () => {
      try {
        setTimeout(() => {
          state.viewFull = false;
        }, 300);
        state.alarmState = setInterval(() => {
          if (page.value.pageNumber <= 0) return;
          getAlarmStatistics();
          if (state.activeType == "TIMED_OUT") {
            getAlarm("TIMED_OUT", "");
          } else if (state.activeType == "ALARM_HANDLER") {
            getAlarm("", `${starttime},${enttime}`);
          } else {
            getAlarm("", "");
          }
        }, 10000);
        getAlarmLevelsList();
        getAlarm("", "");
        getAlarmStatistics();
        getAreaList();
        initEventBusListen();
        window.updateAppSplashProgress?.(36, "正在获取调度中心配置", "data");
        await getDispatchConfig();
        openWebRtc();
        await getDispatchMapConfigDict();
        await initAMap();
        getDeviceByModel();
        getFireHydrants();
      } catch (error) {
        window.hideAppSplash?.();
      }
    });
    const getFireHydrants = async () => {
      const result = await proxy.$api.getRiskDeviceList();
      result.forEach((item) => {
        if (item.latAndLon) {
          let lngLat = item.latAndLon.split(",");
          if (window.AMap || map.value) {
            var icon = new AMap.Icon({
              size: new AMap.Size(36, 52),
              // 图标尺寸
              image: item.typeCode === 'FIRE_HYDRANT"' ? fireHydrantIcon : fireExtinguisherIcon, // Icon的图像
              imageSize: new AMap.Size(39, 55), // 根据所设置的大小拉伸或压缩图片
            });
            let marker = new AMap.Marker({
              position: new AMap.LngLat(lngLat[0], lngLat[1]), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
              icon: icon,
              offset: new AMap.Pixel(-18, -26),
            });
            marker.on("click", function () {
              Object.assign(state.currentFireFighting, {
                ...item,
                usageTime: item.usageDate ? moment(item.usageDate).format("YYYY-MM-DD") : "无限期",
                icon: item.typeCode === 'FIRE_HYDRANT"' ? fireHydrantIcon : fireExtinguisherIcon,
              });
              let infoWindow = new AMap.InfoWindow({
                isCustom: true, //使用自定义窗体
                content: riskDeviceWindowRef.value,
                offset: new AMap.Pixel(0, -26),
              });
              infoWindow.open(map.value, marker.getPosition());
            });
            map.value.add(marker);
          }
        }
      });
    };
    // 初始化监听事件
    const initEventBusListen = () => {
      proxy.$emitter.on("refreshAlarmList", (data) => {
        getAlarm("", "");
      });
      // 超时事件
      proxy.$emitter.on("timeoutEvent", (data) => {
        const { msgContent, msgType, businessPrincipal } = data;
        if (!msgContent || !msgType || !businessPrincipal) return;
        const handleTimeOutFun = async () => {
          alarmLevelId.value = "";
          alarmTypeId.value = "";
          state.activeType = data.businessPrincipal.alarmStatus;
          const params = {
            alarmStatus: data.businessPrincipal.alarmStatus,
            id: data.businessPrincipal.id,
            businessType: "EMERGENCY_CENTER_ALARM",
            pageSize: 10,
          };
          const result = await proxy.$api.getAlarmPageNum(params);
          if (result !== page.value.pageNumber && result > 0) {
            page.value.pageNumber = result;
            await getAlarm("", "");
          }
          const index = state.alarmList.findIndex((item) => item.id === data.businessPrincipal.id);
          // 选中并滚动到可视区域
          nextTick(() => {
            document.getElementById("alarm-" + index).scrollIntoView();
            changeAlarmItem(state.alarmList[index]);
          });
        };
        const handleMessage = {
          ALARM_TIMEOUT_UN_CONFIRMED_NOTICE: handleTimeOutFun,
          ALARM_IMMEDIATELY_TIMEOUT_NOTICE: handleTimeOutFun,
          ALARM_TIMEOUT_UN_HANDLER_NOTICE: handleTimeOutFun,
          PATROL_TASK_ABNORMAL_MESSAGE: () => {},
        };
        showToast(msgContent, { duration: 10000 }, handleMessage[msgType]);
      });
      // 报警事件
      proxy.$emitter.on("alarmMessagePush", (data) => {
        if (currentTime.value == 0) {
          currentTime.value = +new Date() - data.alarmTime;
        }
        // 选中报警事件
        if (data.businessType === "EMERGENCY_CENTER_ALARM") {
          if (data.alarmTargetLongitude) {
            state.viewFull = false;
            addAlarmMarket(data);
          }
          if (data.alarmLevelCode === "one_level") {
            state.seriousAlarm = true;
          }
          getAlarm("", "");
          getAlarmStatistics();
        }
      });
      // 设备打开？？？
      proxy.$emitter.on("openDevice", (data) => {
        state.modalData.visible = true;
        state.modalData.title = data.alarmTargetName + "-" + data.alarmTypeName;
        state.modalData.businessKey = data.businessKey;
        state.modalData.id = data.id;
      });
      // 关闭报警弹窗
      proxy.$emitter.on("closeAlarmModal", () => {
        state.seriousAlarm = false;
      });
    };
    const handleEmergencyPlanSearch = () => {
      state.emergencyPlan.params.pageNumber = 1;
      state.emergencyPlan.list = [];
      getEmergencyFileList();
    };
    const getEmergencyFileList = async () => {
      state.emergencyPlan.loading = true;
      const params = {
        ...state.emergencyPlan.params,
      };
      const result = await proxy.$api.planDocumentList(params);
      state.emergencyPlan.list = result.records;
      state.emergencyPlan.totalPage = result.pages;
      state.emergencyPlan.loading = false;
    };
    const handleEmerencyScroll = (e) => {
      let clientHeight = e.target.clientHeight;
      let scrollTop = e.target.scrollTop;
      let scrollHeight = e.target.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight) {
        if (state.emergencyPlan.totalPage === state.emergencyPlan.params.pageNumber) return;
        if (state.emergencyPlan.loading) return;
        ++state.emergencyPlan.params.pageNumber;
        getEmergencyFileList();
      }
    };
    const getEmergencyEventType = async () => {
      const result = await proxy.$api.planEventTypesOptions();
      state.emergencyPlan.emergencyEventTypeOptions = result;
    };
    const handlePatrolListScroll = (e) => {
      let clientHeight = e.target.clientHeight;
      let scrollTop = e.target.scrollTop;
      let scrollHeight = e.target.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight) {
        if (state.patrolListParams.totalPage === state.patrolListParams.pageNumber) return;
        if (state.patrolListLoading) return;
        ++state.patrolListParams.pageNumber;
        getPatrolList();
      }
    };

    const scrool = (e) => {
      let clientHeight = e.target.clientHeight;
      let scrollTop = e.target.scrollTop;
      let scrollHeight = e.target.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight) {
        if (state.loadingAlarm) return;
        if (page.value.pages === page.value.pageNumber) return;
        ++page.value.pageNumber;
        if (state.activeType == "TIMED_OUT") {
          getAlarm("TIMED_OUT", "");
        } else if (state.activeType == "ALARM_HANDLER") {
          getAlarm("", `${starttime},${enttime}`);
        } else {
          getAlarm("", "");
        }
      }
    };
    onUnmounted(() => {
      clearInterval(state.timer);
      clearInterval(state.alarmState);
      state.timer = null;
      clearInterval(intervalTimer);
      clearInterval(settime.value);
      // 清理区域多边形和标签
      if (shallowState.areaPolygon && map.value) {
        const actualMapInstance = map.value?.mapInstance || map.value;
        if (window.L && actualMapInstance && actualMapInstance.removeLayer) {
          // Leaflet 地图
          actualMapInstance.removeLayer(shallowState.areaPolygon);
        } else if (map.value && map.value.remove) {
          // 高德地图
          map.value.remove(shallowState.areaPolygon);
        }
        shallowState.areaPolygon = null;
      }
      // 清理高德地图的 labelMarker（如果存在）
      if (shallowState.areaPolygon && shallowState.areaPolygon._labelMarker && map.value) {
        map.value.remove(shallowState.areaPolygon._labelMarker);
        shallowState.areaPolygon._labelMarker = null;
      }
      // 退出webrtc登录
      if (store.getters.webrtcInstance) {
        store.getters.webrtcInstance.exitClient();
      }
    });
    const IMAGE_MAP = {
      SECURITY_MONITORING: afImg,
      ELECTRICMANAGE: dqImg,
      ROTATINGMANAGE: dhImg,
      AIRCONDITIONER: jkImg,
      FIRECONTROL: xfImg,
    };
    const getImg = (type) => IMAGE_MAP[type] || afImg;

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
      state.broadcast.visible = true;
      state.broadcast.isMinimized = false;
    };

    const getJson = (item, key) => {
      if (item == "") {
        return "";
      } else {
        let data = JSON.parse(item)[key];
        return data;
      }
    };
    const handleMapZoom = (type) => {
      if (!map.value) return;
      let currentZoom = map.value.getZoom();
      if (type === "amplify") {
        map.value.setZoom(currentZoom + 0.5);
      } else {
        map.value.setZoom(currentZoom - 0.5);
      }
    };
    const taskclose = () => {
      state.PatrolData.visible = false;
      if (state.activeType == "TIMED_OUT") {
        getAlarm("TIMED_OUT", "");
      } else if (state.activeType == "ALARM_HANDLER") {
        getAlarm("", `${starttime},${enttime}`);
      } else {
        getAlarm("", "");
      }
    };
    return {
      CDA,
      CDI,
      taskclose,
      getJson,
      clickStop,
      broadcastdevice,
      map,
      handleMapZoom,
      openbroadcast,
      openMouseToolgb,
      handleEmergencyPlanSearch,
      refList,
      fullScreen1,
      setRef,
      page,
      closeComingCallModal,
      scrool,
      focusOnlinePerson,
      alarmitemRef,
      personWindow,
      getImg,
      alarmLevelId,
      alarmTypeId,
      showstatistics,
      levelList,
      getAlarmLevelsList,
      ...toRefs(state),
      closeMouseTool,
      openMouseTool,
      clickType,
      verifyResult,
      loginResult,
      clickPatrolType,
      tip,
      markArray,
      customRef,
      alarmRef,
      customBroadcast,
      closeInfoWindow,
      closeAlarmInfoWindow,
      clickShout,
      getDispatchDeviceList,
      changeAlarmItem,
      restore,
      closeModalVideo,
      handleNotVideo,
      enlargeVideo,
      fullScreen,
      onChangeArea,
      handleMakeCall,
      handleOnlineCountChange,
      openOnlinePersonQuery,
      clickFull,
      prosonPosition,
      alarmLevelChange,
      alarmTypeChange,
      refreshCurrentAlarmList,
      currentTime,
      openCarModal,
      closeCarSearch,
      checkAlarmType,
      handleClickPatrol,
      patrolWindowRef,
      riskDeviceWindowRef,
      handlePatrolListScroll,
      getPatrolListClearActiveId,
      handleEmerencyScroll,
      handlePreviewPlanFile,
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
  background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/bg.svg");
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
    background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/bg.png");
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
    background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/title.svg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    font-size: 40px;
    font-family: YouSheBiaoTiHei, YouSheBiaoTiHei-Regular;
    font-weight: 400;
    color: #ffffff;
    text-shadow:
      0px 0px 8px #388ef3,
      0px 4px 4px #215a9d,
      0px 0px 4px rgba(56, 142, 243, 0.4);
    text-align: center;
    line-height: 60px;

    &.serious_alarm {
      background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/title.png");
    }
  }

  .commandDispatch-left {
    position: absolute;
    top: 70px;
    width: 350px;
    height: calc(100% - 80px);
    background: rgba(2, 13, 41, 0.94);
    // z-index: 9;

    &.open {
      left: 25px;
      transition: all 1s ease-in;
      overflow: hidden;
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
      overflow: hidden;
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
    width: 100vw;
    height: 100vh;
    z-index: -1;
    position: fixed !important;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 0.45s ease;
  }

  #commandDispatch.is-map-ready {
    opacity: 1;
  }

  .alarm-container {
    width: 334px;
    margin-left: 10px;
    height: 100%;
    position: relative;

    .alarm-type-tab {
      background: rgba(2, 13, 41, 0.94);
      position: absolute;
      display: flex;
      flex-direction: column;
      right: -46px;
      border-radius: 10px;
      top: -10px;
      width: 40px;
      color: #fff;
      text-align: center;
      line-height: 22px;
      z-index: 1;

      & > div {
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
      > div {
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

      > div {
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
      height: 100%;
      overflow-y: auto;
    }

    .alarm-list {
      padding-top: 16px;
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
          background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/normalBg.png");
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }

        &.serious {
          border: 1px solid rgba(231, 31, 31, 0.3);
          background: rgba(255, 61, 61, 0.2);

          &.selected {
            background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/alarmItem.png");
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

            > span {
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

          > div {
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

      .patrol-item {
      }
    }
  }

  .site-conditions {
    width: 330px;
    height: 100%;
    margin-left: 10px;
    display: grid;
    grid-template-rows: minmax(240px, 380px) minmax(0, 1fr);
    min-height: 0;
    overflow: hidden;

    .scene-panel,
    .person-panel {
      height: auto;
      min-height: 0;
    }

    .live-video {
      height: 320px;
      width: 100%;
    }

    .personnel {
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .online-person-title {
      margin-left: 8px;
      padding: 0;
      border: 0;
      outline: none;
      color: #ffffff;
      background: transparent;
      font-family: PingFang SC-Semibold;
      font-size: 18px;
      text-shadow: 0 0 4px #2989ff;
      cursor: pointer;

      strong {
        margin: 0 2px;
        color: #42a2ff;
        font-size: 20px;
      }
    }

    .header-btn {
      background-color: #1e4690;
      border-color: #216bc3;
      color: #fff;
    }
  }

  .personnel {
    .personnel-list {
      padding: 12px 0;
      height: 650px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: auto;

      .loading {
        padding: 0 0 16px;
        text-align: center;
      }

      .personnel-item {
        height: 87px;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        padding-left: 10px;
        cursor: pointer;

        &:hover {
          background: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/personnelItem.svg");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        > div {
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
              > div {
                > span {
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

            > div {
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
          font-family:
            DIN Alternate-Bold,
            DIN Alternate;
          font-weight: bold;
          color: #388ef3;
        }
      }
    }
  }
}

.bottom-btn {
  position: absolute;
  bottom: 50px;
  left: 390px;
  display: flex;
  z-index: 8;
  user-select: none;

  &.stow {
    left: 25px;
    transition: all 1s ease-in;
  }

  &.open {
    left: 390px;
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
      position: relative;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      img {
        width: 18px;
        height: 18px;
      }

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
    background: linear-gradient(90deg, rgba(168, 24, 11, 0) 0%, rgba(168, 24, 11, 0.62) 100%);
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(90deg, rgba(168, 24, 11, 0) 0%, rgba(168, 24, 11, 0.62) 100%);
  }
}

@keyframes leftColorAnimation {
  0% {
    background: linear-gradient(90deg, rgba(168, 24, 11, 0.62) 0%, rgba(168, 24, 11, 0) 100%);
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(90deg, rgba(168, 24, 11, 0.62) 0%, rgba(168, 24, 11, 0) 100%);
  }
}
</style>

<style lang="less">
.input-search {
  display: flex;
  align-items: center;
  margin-right: 6px;
  border-radius: 2px 2px 2px 2px;
  border: 1px solid rgba(183, 197, 211, 0.3);

  .search-icon {
    padding: 2px 4px;
    border-right: 1px solid rgba(183, 197, 211, 0.3);
  }

  .ant-input {
    border: none;
  }
}

#commandDispatch {
  width: 100%;
  height: calc(100% - 70px);

  .ant-message-notice-content {
    margin-top: 130px !important;
    padding: 0 !important;
    background: transparent !important;
  }
}

.atabs {
  .ant-tabs-tab {
    color: #fff;
  }
}

.amap-logo,
.amap-copyright {
  display: none !important;
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  background-color: transparent !important;
  padding: 0 !important;
}

.leaflet-popup-content {
  margin: 0 !important;
}

.custom-info {
  width: 300px;
  height: 260px;
  background: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/marketBg.png");
  background-size: contain;
  background-repeat: no-repeat;
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
    background: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/customPerson.svg");
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

        > span {
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

    > div {
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
    background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/contentBg.png");
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

    > div {
      padding: 0 12px;
      height: 26px;
      background: #1f4790;
      border-radius: 4px 4px 4px 4px;
      opacity: 1;
      border: 1px solid #216cc3;
      font-size: 12px;
      font-family:
        PingFang SC-Regular,
        PingFang SC;
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
  display: flex;
  align-items: center;

  .button-search {
    background: #2989ff;
    border-radius: 2px 2px 2px 2px;
    padding: 5px 8px;
    color: #fff;
    cursor: pointer;
    font-size: 12px;
    font-family:
      Source Han Sans-Regular,
      Source Han Sans;
    font-weight: 400;
    color: #ffffff;
    flex-shrink: 0;
    margin-left: 10px;
  }

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

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  .ant-select {
    color: rgba(183, 197, 211, 1);
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent;
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

/* Leaflet: 区域名称标签居中显示（与区域高亮同 pane 跟随缩放/拖动） */
.area-label-marker {
  background: transparent !important;
  border: none !important;
}
.area-label-marker > div {
  transform: translate(-50%, -50%);
}

/* 去除地图上文字的白边 */
.leaflet-tooltip {
  text-shadow: none !important;
  -webkit-text-stroke: none !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  border: none !important;
  color: #ffffff !important;
  font-weight: 500 !important;
}

/* 去除地图标签文字的白边 */
.leaflet-tooltip-top:before,
.leaflet-tooltip-bottom:before,
.leaflet-tooltip-left:before,
.leaflet-tooltip-right:before {
  border-color: rgba(0, 0, 0, 0.7) transparent !important;
}

/* 如果地图使用了其他文字元素，也去除白边 */
#commandDispatch .leaflet-container * {
  text-shadow: none !important;
  -webkit-text-stroke: none !important;
}

/* 显示地图标注图层（文字标签图层），并将文字转换为白色 */
#commandDispatch .cube-map-text-tile,
#commandDispatch .leaflet-tile-pane .cube-map-text-tile {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  /* 使用滤镜将文字转换为白色 */
  // filter: brightness(0) invert(1) !important;
  /* brightness(0) 将文字变为黑色，invert(1) 将黑色反转为白色 */
}

/* 地图底图瓦片滤镜（不影响文字图层） */
#commandDispatch .leaflet-tile-pane .leaflet-layer:not(.cube-map-text-tile) img {
  // filter: brightness(0.55) contrast(1.4) saturate(0.6) !important;
  /* 暗色模式：降低亮度、增强对比度、降低饱和度 */
  image-rendering: -webkit-optimize-contrast !important;
  image-rendering: crisp-edges !important;
  /* 使用清晰的图像渲染模式 */
}

/* 去除地图上所有文字元素的描边效果 */
#commandDispatch .leaflet-container canvas,
#commandDispatch .leaflet-container svg text {
  text-shadow: none !important;
  -webkit-text-stroke: none !important;
  paint-order: fill !important;
}

/* 尝试通过混合模式去除白边 */
#commandDispatch .leaflet-tile-pane img {
  mix-blend-mode: normal !important;
}

/* 暗色模式效果 - 匹配图片中的暗色主题 */
#commandDispatch .leaflet-container {
  background-color: #0a0e1a !important;
  /* 深蓝黑色背景，匹配图片中的暗色效果 */
  /* 不使用容器级别的滤镜，避免影响文字清晰度 */
  filter: none !important;
}

/* 暗色模式下的地图底图瓦片 - 深蓝灰色陆地，浅蓝灰色水体 */
#commandDispatch .leaflet-tile-pane .leaflet-layer:not(.cube-map-text-tile) {
  // filter: brightness(0.55) contrast(1.4) saturate(0.6) hue-rotate(0deg) !important;
  /* 大幅降低亮度，增强对比度，降低饱和度，营造深蓝灰色效果 */
}

/* 文字标签图层 - 将文字转换为白色，增强清晰度 */
#commandDispatch .leaflet-tile-pane .cube-map-text-tile img {
  filter: brightness(0.5) invert(1) hue-rotate(0) contrast(2) !important;
  /* brightness(0) 将文字变为黑色，invert(1) 将黑色反转为白色，contrast(1.2) 增强对比度 */
  mix-blend-mode: normal !important;
  image-rendering: -webkit-optimize-contrast !important;
  image-rendering: crisp-edges !important;
  /* 使用清晰的图像渲染模式 */
}

/* 确保地图容器在暗色模式下正确显示 */
#commandDispatch {
  background-color: #0a0e1a !important;
}

/* 区域多边形标签样式 - 文字直接显示在 polygon 上，跟随区域缩放 */
.area-polygon-label {
  background: rgba(0, 0, 0, 0.7) !important;
  color: #ffffff !important;
  padding: 6px 12px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  pointer-events: none !important;
  text-shadow: none !important;
  -webkit-text-stroke: none !important;
}

/* 区域多边形样式 - 允许点击事件穿透到下层点位 */
/* 注意：Leaflet 通过 interactive: false 已禁用交互，高德地图通过 clickable: false 已禁用点击 */
/* 以下 CSS 作为额外保障，确保点击事件能够穿透 */
/* Leaflet 地图：polygon 在 overlayPane 中，通过 interactive: false 已禁用交互 */
/* 高德地图：通过 clickable: false 已禁用点击，如果仍有问题可以通过 CSS 进一步处理 */
</style>
