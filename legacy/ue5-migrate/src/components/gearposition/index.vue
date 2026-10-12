<template>
  <div class="alarmDetail-wrap">
    <div class="alarmDetail-modal">
      <div class="alarmDetail-modal-header">
        <div class="header-title">
          <IconFont
            type="icon-offline"
            :style="{ fontSize: '24px', color: 'rgba(41, 137, 255, 1)' }"
          />
          <span>{{ modalData.title }}</span
          ><a-tag color="#529ea6">已出租</a-tag>
        </div>
        <div class="header-close" @click="closeModal">
          <CloseOutlined />
        </div>
      </div>
      <div class="alarmDetail-modal-content flex-column">
        <div style="margin: 0 auto; color: #fff">
          <div class="area">300m³</div>
          <div class="area_address">空间面积</div>
        </div>
        <div class="conent-body">
          <div class="currentinfo">当前租赁信息</div>
          <div style="border: 1px solid #529ea6"></div>
          <div class="lease_info">
            <div class="item">
              档主姓名/手机号
              <span>郑少绵</span>
            </div>
            <div class="item">
              租金
              <span>31546.2</span>
            </div>
          </div>
          <div
            style="
              display: flex;
              justify-content: space-between;
              padding: 0 30px;
              margin-top: 15px;
            "
          >
            <div class="item">
              租赁起止时间
              <span>2020-08-24~2023-08-23</span>
            </div>
            <div class="item">
              管理费
              <span> 1648.5</span>
            </div>
          </div>
          <div class="currentinfo" style="margin-top: 15px">租赁历史信息</div>
          <div style="border: 1px solid #529ea6"></div>
          <div style="display: flex; flex-flow: row wrap">
            <div v-for="(item, index) in history" class="history_lease">
              <div
                :style="
                  index % 2 == 0 ? 'border-right: 1px solid hsla(0,0%,100%,.7);' : ''
                "
              >
                <div style="color: #fff">{{ item.time }}</div>
                <div class="history_lease_name">{{ item.name }}</div>
              </div>
            </div>
          </div>
          <div class="currentinfo" style="margin-top: 15px">从业人员信息</div>
          <div style="border: 1px solid #529ea6"></div>
          <div style="display: flex; flex-flow: row wrap">
            <div v-for="(item, index) in workuesr" class="history_lease">
              <div
                :style="
                  index % 2 == 0 ? 'border-right: 1px solid hsla(0,0%,100%,.7);' : ''
                "
              >
                <div style="color: #fff">{{ item.time }}</div>
                <div class="history_lease_name">{{ item.name }}</div>
              </div>
            </div>
          </div>

          <div class="currentinfo" style="margin-top: 15px">消防巡查</div>
          <div style="border: 1px solid #529ea6"></div>
          <div class="patrol_num">
            <div class="patrol_con">
              <div>累计巡查除数</div>
              <div style="color: #81a523">30</div>
            </div>
            <div class="patrol_con">
              <div>累计巡查合格率</div>
              <div style="color: #81a523">45.1%</div>
            </div>
          </div>
          <div style="display: flex; flex-flow: row wrap">
            <div v-for="(item, index) in check" class="history_lease">
              <div
                :style="
                  index % 2 == 0 ? 'border-right: 1px solid hsla(0,0%,100%,.7);' : ''
                "
              >
                <div style="color: #fff">{{ item.time }}</div>
                <div class="history_lease_name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { CloseOutlined, RightOutlined } from "@ant-design/icons-vue";

import { getDeviceInfo } from "@/api/equipment";
import { associatedVideos } from "@/api/device";

const emit = defineEmits(["close"]);
const currenttype = ref("租赁档案");
// const typeclick = (item) => {
//     currenttype.value = item
// }
// const typelist = ref(['租赁档案', '巡查巡检', '食品安全', '疫情防控', '征信管理'])
const history = [
  {
    name: "郑少绵",
    time: "2019-08-24~2020-08-23",
  },
  {
    name: "郑少绵",
    time: "2018-08-24~2019-08-23",
  },
  {
    name: "郑少绵",
    time: "2017-08-24~2018-08-23",
  },
  {
    name: "郑少绵",
    time: "2015-08-24~2017-08-23",
  },
];
const workuesr = [
  {
    name: "李冠鑫 (男)",
    time: "电话:13612833261",
  },
  {
    name: "温珠谋 (男)",
    time: "电话:13902474437",
  },
  {
    name: "郑晓杰 (男)",
    time: "电话:13025330729",
  },
  {
    name: "陈宝秋 (男)",
    time: "电话:13418612653",
  },
  {
    name: "郑超杰 (男)",
    time: "电话:15999581867",
  },
  {
    name: "陈露然 (男)",
    time: "电话:13416612653",
  },
];
const check = [
  {
    name: "2023-04-24 15:00:45",
    time: "朱新章(合格:15 不合格:1)",
  },
  {
    name: "2023-04-24 09:42:33",
    time: "朱新章(合格:16 不合格:0)",
  },
  {
    name: "2023-04-11 09:39:38",
    time: "朱新章(合格:16 不合格:0)",
  },
  {
    name: "2023-03-05 10:52:45",
    time: "朱新章(合格:16 不合格:0)",
  },
  {
    name: "2023-02-06 15:00:08",
    time: "朱新章(合格:16 不合格:0)",
  },
  {
    name: "2023-01-11 10:05:26",
    time: "朱新章(合格:16 不合格:0)",
  },
];

const props = defineProps({
  title: {
    type: [String],
    default: "南区13号档位",
  },
  id: {
    type: [String],
    default: "1649953388495978497",
  },
});
const modalData = reactive(props);
const infodata = reactive({});
const readData = ref([]);
const readAndWritData = ref([]);
const cameraList = ref([]);
const closeModal = () => {
  getDeviceInfo(modalData.id).then((res) => {
  });

  emit("close");
};

const getData = () => {
  getDeviceInfo(modalData.id).then((res) => {
    Object.assign(infodata, res.detail);
    readData.value = res.deviceAttributes.filter((item) => item.permission === "READ");
    readAndWritData.value = res.deviceAttributes.filter(
      (item) => item.permission === "READ_WRITE"
    );
  });
  associatedVideos(modalData.id as any).then((res) => {
    cameraList.value = res;
  });
};
onMounted(() => {
  getData();
});
</script>

<style lang="less" scoped>
.item {
  color: #fff;
}

.item > span {
  margin-left: 30px;
  color: #85aa22;
}

.videInfo {
  width: 1439px !important;
  padding: 0 10px !important;
  overflow-y: hidden !important;
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
  width: 800px;
  height: 700px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(11, 21, 33, 0.6);
  border: 1px solid rgba(41, 137, 255, 1);
  font-size: 16px;

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

      > span {
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
      span{
        font-size: 12px;
      }
    }
  }

  .alarmDetail-modal-content {
    height: 600px;
    width: 100%;
    padding: 0 16px;
    overflow: hidden;

    .area {
      text-align: center;
      font-size: 20px;
      font-weight: 600;
    }

    .area_address {
      margin-top: 5px;
    }

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      > div {
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

        > span {
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

          > span {
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
      padding-bottom: 10px;
      margin-top: 10px;

      .lease_info {
        display: flex;
        justify-content: space-between;
        padding: 0 30px;
        margin-top: 15px;
      }

      .history_lease {
        width: 50%;
        margin-top: 10px;
        border-bottom: 1px solid hsla(0, 0%, 100%, 0.7);
        padding-bottom: 10px;
        padding-left: 5px;

        .history_lease_name {
          color: hsla(0, 0%, 100%, 0.7);
          margin-top: 10px;
        }
      }

      .patrol_num {
        background: rgba(52, 52, 52, 0.5490196078431373);
        height: 40px;
        display: flex;

        align-items: center;
      }
      .patrol_con {
        width: 50%;
        display: flex;
        justify-content: space-between;
        padding: 0 10px;
        color: #fff;
      }
      .currentinfo {
        width: 100px;
        height: 30px;
        background-color: #529ea6;
        text-align: center;
        line-height: 30px;
        color: #fff;
      }
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
    background: linear-gradient(
      90deg,
      rgba(168, 24, 11, 0) 0%,
      rgba(168, 24, 11, 0.62) 100%
    );
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(
      90deg,
      rgba(168, 24, 11, 0) 0%,
      rgba(168, 24, 11, 0.62) 100%
    );
  }
}

@keyframes leftColorAnimation {
  0% {
    background: linear-gradient(
      90deg,
      rgba(168, 24, 11, 0.62) 0%,
      rgba(168, 24, 11, 0) 100%
    );
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(
      90deg,
      rgba(168, 24, 11, 0.62) 0%,
      rgba(168, 24, 11, 0) 100%
    );
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
  height: 160px;
  background-size: contain;
  background-repeat: no-repeat;
  // position: fixed;
  // top: 50px;
  // left: 500px;
  z-index: 100;

  &.serious {
    background: url("/resource/v1/ue5-migrate/components/gearposition/images/alarmBg.svg");
  }

  &.normal {
    background: url("/resource/v1/ue5-migrate/components/gearposition/images/marketBg.svg");
  }

  .alarm-market-close {
    top: 6px;
    right: 20px;
    color: white;
    cursor: pointer;
    position: absolute;
  }

  .alarm-title {
    position: absolute;
    top: 30px;
    left: 30px;
    font-size: 18px;
    font-family: PingFang SC-Medium, PingFang SC;
    font-weight: 500;
    color: #ffffff;
    text-shadow: 0px 0px 4px #ff2e00;
  }

  .alarm-detail {
    position: absolute;
    top: 65px;
    left: 30px;
    width: 210px;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
    color: #e4e4e4;
  }
}

.custom-info {
  width: 300px;
  height: 260px;
  background: url("/resource/v1/ue5-migrate/components/gearposition/images/marketBg.svg");
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
    background: url("/resource/v1/ue5-migrate/components/gearposition/images/customPerson.svg");
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
    background-image: url("/resource/v1/ue5-migrate/components/gearposition/images/contentBg.png");
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

// .alarm {
//   position: absolute;
//   right: 0;
//   top: 0;
//   width: 88px;
//   color: #fff;
//   border-radius: 0 0 0 30px;
//   text-align: center;
//   font-size: 12px;
// }

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
