<template lang="pug">
div
  //- a-badge(:count="alarms.length" dot @click="toAlarmCenter")
    a-icon.blink(type="alert")
  a-popover(placement="bottom" overlayClassName="navigation-user-popover")
    a-badge(:count="alarms.length" dot @click="toAlarmCenter")
      a-icon(type="alert" :class="{blink: blink}") 
      //- span {{ alarmMuted }}
    div.alarm-popover-body(slot="content")    
      div.msg-popover-item.p2(v-if="!muted" @click="muted = true")
        span 关闭报警声音
        span
          a-icon.px1(type="sound")
      div.msg-popover-item.p2(v-else @click="muted = false")
        span 打开报警声音
        a-icon.px1(type="sound")
  AlarmVoice(v-if="blink && !muted" :muted.sync="muted" :alarmMuted="alarmMuted")
  AlarmModalManger(ref="alarmModalManager" :muted.sync="alarmMuted" @new-alert="blink = true; alarmMuted = false;" @alert-close="blink = false; alarmMuted = false;")
</template>
<script>
import AlarmModalManger from './AlarmModal/AlarmModalManger';
import AlarmVoice from './AlarmVoice';

import { GETTER_USER, GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    AlarmModalManger,
    AlarmVoice,
  },
  data() {
    return {
      loading: false,
      alarms: [],
      muted: false,
      alarmMuted: false,
      blink: false,
      blinkAlarmType: [
        'ElectricalSafeAlarm',
        'link_alarm',
        'DeviceOfflineAlarm',
      ],
    };
  },
  computed: {
    ...mapGetters({
      user: GETTER_USER,
      project: GETTER_PROJECT,
    }),
  },
  mounted() {
    this.$socket.on('notice', (data) => {
      if (this.blinkAlarmType.includes(data.type)) {
        this.blink = true;
      }
    });
  },
  methods: {
    toAlarmCenter() {
      // this.$closeTab('AlarmCenter');
      this.$openMenu('AlarmCenter', { forceF5: true });
      this.blink = false;
    },
  },
};
</script>
<style lang="less" scoped>
@keyframes blink {
  0% {
    color: #fff;
    // box-shadow: 0 0 15px 0 #fff, inset 0 0 15px 0 #fff;
  }
  100% {
    color: #f5222d;
    box-shadow: 0 0 40px 0 #f5222d, inset 0 0 5px 0 #f5222d80;
    // filter: blur(1px);
  }
}
.blink {
  background: transparent;
  animation: blink 0.75s ease infinite;
}
.alarm-popover {
  &-head {
    width: 320px;
    margin: -5px -16px -6px;
    background-color: #99d3fc;
    // color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    .msg-tab {
      padding: 5px 16px 6px;
      cursor: pointer;
      color: #222223;
      &.active {
        color: #222223;
        background-color: #8abee3;
      }
    }
  }
  &-body {
    margin: -16px;
    margin-top: -12px;
    background-color: #99d3fc;
    color: #222223;
    .msg-popover-box {
      padding: 1rem 0;
    }
    .msg-popover-item {
      font-size: 12px;
      // width: 320px;
      // padding: 0.75rem 2rem;
      cursor: pointer;
      .flex-between {
        // display: flex;
        // justify-content: space-between;
      }
      .gray {
        color: #383839;
      }
      .gray2 {
        color: #4e4e4f;
      }
      &:hover {
        background-color: fade(#222223, 10%);
      }
    }
    .msg-popover-nodata {
      padding: 4rem 2rem;
      text-align: center;
    }
    .msg-popover-footer {
      padding: 1rem 2rem;
      border-top: 1px solid fade(#222223, 10%);
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
<style lang="less">
.navigation-user-popover {
  .ant-popover-arrow {
    display: none;
  }
}
</style>
