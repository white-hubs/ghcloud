<template lang="pug">
app-modal(v-model="visible" :width="1200" :confirm-loading="loading" :destroyOnClose="true" @cancel="close")
  div.bold(slot="title") {{eventData | filterName}}
  div
    //- AlarmVoice(ref="alarmVoice" v-if="visible && !muted" :muted="muted" @update:muted="(v) => $emit('update:muted', v)")
    component(v-if="visible" :is="event" :eventData="eventData" ref="alarm" id='kkkkk')
  template(slot="footer")
    a-button(type="default" @click="close") 关闭
    a-button(type="primary" @click="handleMuted") {{ muted ? '打开声音' : '关闭声音'}}
    a-button(type="primary" @click="handleDetail") 查看详情
</template>

<script>
import AlarmVoice from '../AlarmVoice'; // 报警声音

import Emergency from './Emergency'; // 事件快报
import ElectricalAlarmCamEject from './ElectricalAlarmCamEject'; // 视频弹窗报警
import ElectricalSafeAlarm from './ElectricalSafeAlarm'; // 电气报警
import LinkAlarm from './LinkAlarm'; // 电气报警
import DeviceOfflineAlarm from './DeviceOfflineAlarm'; // 设备离线
import UpsAlarm from './UpsAlarm'; // ups报警
import appeal from './appeal';
import ticketinst from './ticketinst';
export default {
  components: {
    AlarmVoice,
    Emergency,
    ElectricalAlarmCamEject,
    ElectricalSafeAlarm,
    LinkAlarm,
    DeviceOfflineAlarm,
    UpsAlarm,
    appeal,
    ticketinst,
  },
  filters: {
    filterName(data) {
      //处理的报警的标题
      if (data.type == 'appeal' && data.timeOut > 0) {
        return '诉求超时通知';
      } else if (data.type == 'appeal' && data.timeOut <= 0) {
        return '新诉求通知';
      } else if (data.type == 'ticketinst' && data.timeOut > 0) {
        return '工单超时通知';
      } else if (data.type == 'ticketinst' && data.timeOut <= 0) {
        return '新工单通知';
      } else {
        return data.name || data.iotEventName || data.eventName || '报警';
      }
    },
  },

  props: {
    muted: Boolean,
  },
  data() {
    return {
      visible: false,
      loading: false,
      eventData: {},
      event: 'DeviceOfflineAlarm',
      eventName: '电气报警',
      alarmStack: [], // 报警堆栈
    };
  },
  mounted() {
    // 报警视频弹窗
    this.$socket.on('electricalAlarmCamEject', (data) => {
      this.event = 'electricalAlarmCamEject';
      this.eventName = '设备报警';
      this.open(data);
    });
    // 报警视频弹窗
    this.$socket.on('emergency', (data) => {
      this.event = 'emergency';
      this.eventName = '事件快报';
      this.open(data);
    });
    // 电气报警弹窗 走通知
    this.$socket.on('notice', (data) => {
      if (data.popup) {
        this.alarmStack.push(data);
        this.handlePopup();
      }
    });
    // TEST
    // this.open({
    //   id: '1412985085634490370',
    //   projectId: '1323508406576840706',
    //   sourceId: '',
    //   deviceId: '1326091420737527809',
    //   deviceName: '7号楼1号',
    //   beginTime: '2021-07-08 12:01:10',
    //   endTime: '2021-07-08 12:01:10',
    //   triggerCount: 1,
    //   name: '办公室6号离线',
    //   type: 'DeviceOfflineAlarm',
    //   subType: 'OverVoltageAlarm',
    //   level: '3',
    //   status: 'alarmStatus_not_handled',
    //   address: '成都市天府新谷10号楼701号',
    //   ticketinstId: null,
    //   handleTime: null,
    //   handleUserId: null,
    //   handleUserName: null,
    //   handleUserNickname: null,
    //   handleUserDeptId: null,
    //   handleUserDeptName: null,
    //   handleResult: null,
    //   noticeLevel: null,
    //   noticeTime: null,
    //   eventDTOS: null,
    // });
  },
  beforeDestroy() {
    this.$socket.off('notice');
  },
  methods: {
    //触发报警时候，触发的事件，包括弹框的显示，以及数据的展示
    handlePopup() {
      const data = this.alarmStack.pop();
      if (data) {
        this.event = data.type || 'ElectricalSafeAlarm';
        // this.event ='ElectricalSafeAlarm';
        if (this.event === 'link_alarm') {
          this.event = 'LinkAlarm';
        }
        //所有的报警都走 ElectricalSafeAlarm 这个组件
        if (data.businessType.includes('Alarm')) {
          this.event = 'ElectricalSafeAlarm';
        }
        this.eventName = data.name || '电气报警';

        this.open(data);
      }
    },
    open(eventData) {
      if (!this.visible) {
        this.eventData = eventData;
        this.visible = true;
      }
      this.$emit('new-alert');
    },
    close(notUseStack) {
      this.visible = false;
      this.$emit('alert-close');
      if (!notUseStack) {
        setTimeout(() => {
          this.handlePopup();
        }, 2000);
      }
    },
    // 消音
    handleMuted() {
      this.$emit('update:muted', !this.muted);
    },
    // 查看详情
    handleDetail() {
      const urlMap = {
        ticketinst: `/my-ticket/detail/${this.eventData.id}/pending`,
        appeal: `/appeal/detail/${this.eventData.id}`,
      };
      if (urlMap[this.eventData.type]) {
        this.$router.push({
          path: urlMap[this.eventData.type],
        });
      } else {
        this.$refs.alarm?.handleDetail();
      }
      this.close(true);
    },
  },
};
</script>

<style lang="less" scoped>
.alarm-modal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(16, 16, 16, 0.2);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  cursor: default;
  .alarm-modal-content {
    width: 1200px;
    // &.emergency {
    //   width: 500px;
    // }
    min-height: 470px;
    max-height: 600px;
    box-shadow: 0px 0px 10px rgba(245, 42, 42, 1);
    background: rgba(16, 16, 26, 0.8);
    padding: 0 20px 20px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 201;
    // color: #fff;
    .alarm-model-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .alarm-model-title {
        padding: 12px 0;
        font-size: 18px;
      }
      .alarm-model-close {
        height: 24px;
        width: 24px;
        cursor: pointer;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
