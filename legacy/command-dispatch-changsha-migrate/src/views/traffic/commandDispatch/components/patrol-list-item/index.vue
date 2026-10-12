<template>
  <div :class="[activeId === partolInfo.id && 'active', 'patrol-list-item']">
    <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/patrol-icon.png" alt="" />
    <div class="item-content">
      <div class="patrol-title">{{ partolInfo.taskName }}</div>
      <div class="patrol-info">
        <div class="patrol-time">
          <label>巡更时间: </label>
          <span>{{ partolInfo.startTime }}-{{ partolInfo.endTime }}</span>
        </div>
        <div class="info-bottom">
          <div class="patrol-count">
            <label>巡更点数: </label>
            <span>{{ partolInfo.locationNum }}</span>
          </div>
          <div class="patrol-count">
            <label>负责人: </label>
            <span>{{ partolInfo.userName || "--" }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="item-status-info">
      <div class="status">异常</div>
      <div class="info" @click.stop="handleInfo">详情</div>
    </div>
    <patrol-info
      v-if="visible"
      v-model:visible="visible"
      v-model:isMinimized="isMinimized"
      :info="infoState"
      @close="handleInfoClose"
      @getList="getList"
    />
  </div>
</template>

<script>
import moment from "moment";
import { defineComponent, reactive, toRefs, getCurrentInstance } from "vue";

import patrolInfo from "../patrol-info/index.vue";
const STATUS_ENUM = {
  IN_EXECUTION: "执行中",
  TO_BE_RECEIVED: "待接收",
  FINISHED: "已结束",
};
const PATROL_POINT_RES_ENUM = {
  ABNORMAL: "异常",
  NORMAL: "正常",
};
export default defineComponent({
  components: {
    patrolInfo,
  },
  props: {
    partolInfo: {
      type: Object,
      default: () => {},
    },
    activeId: {
      type: String,
      default: () => "",
    },
  },
  name: "patrolListItem",
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      visible: false,
      isMinimized: false,
      infoState: {},
    });
    const handleInfoClose = () => {
      state.visible = false;
    };
    const getList = () => {
      emit("getList");
    };
    const handleInfo = async () => {
      proxy.$message.loading("加载中...");
      const result = await proxy.$api.getPatrolTaskById({ id: props.partolInfo.id ?? "" });
      state.infoState = result;
      state.infoState.statusName = STATUS_ENUM[result.status];
      state.infoState.startTime = moment(result.startDate).format("YYYY-MM-DD");
      state.infoState.endTime = moment(result.endDate).format("YYYY-MM-DD ");
      state.infoState.data = result.data.map((item) => {
        return {
          ...item,
          areaName: item.arae.map((item) => item.name).join("/"),
          patrolTime: item.patrolDate ? moment(item.patrolDate).format("YYYY-MM-DD hh:mm:ss") : "--",
          resulStatusName: item.patrolDate ? PATROL_POINT_RES_ENUM[item.patrolResult] : "--",
        };
      });
      proxy.$message.destroy();
      state.visible = true;
      state.isMinimized = false;
    };
    return {
      ...toRefs(state),
      handleInfo,
      handleInfoClose,
      getList,
    };
  },
});
</script>
<style scoped lang="less">
.active {
  background: var(--dispatch-panel-bg-active, #e6f2ff) !important;
}

.patrol-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 8px;
  background: var(--dispatch-card-bg, #ffffff);
  border-radius: 4px;
  border: 1px solid var(--dispatch-border-soft, #e7eff8);

  img {
    width: 64px;
    height: 56px;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    width: 200px;
    flex-shrink: 0;

    .patrol-title {
      white-space: nowrap;
      width: 95%;
      text-indent: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 15px;
      font-family:
        Source Han Sans-Medium,
        Source Han Sans;
      font-weight: 500;
      color: var(--dispatch-text, #26384d);
      background: var(--dispatch-map-blue-soft, #e8f3ff);
    }

    .patrol-info {
      font-size: 12px;
      font-family:
        Source Han Sans-Regular,
        Source Han Sans;
      font-weight: 400;
      color: var(--dispatch-text-secondary, #68798d);

      .patrol-time {
        // white-space: nowrap;
        // overflow: hidden;
        // text-overflow: ellipsis;
        gap: 3px;
        margin-bottom: 4px;
      }

      .info-bottom {
        display: flex;
        margin-right: 10px;
        align-items: center;
        justify-content: space-between;
      }
    }
  }

  .item-status-info {
    display: flex;
    flex-direction: column;
    gap: 17px;

    .status {
      border-radius: 2px;
      width: 40px;
      height: 22px;
      background: rgba(255, 61, 61, 0.302);
      line-height: 22px;
      font-size: 12px;
      text-align: center;
      font-family:
        Source Han Sans-Regular,
        Source Han Sans;
      font-weight: 400;
      color: #ff3d3d;
    }

    .info {
      padding: 4px 11px;
      background: #216cc3;
      border-radius: 2px;
      font-size: 12px;
      font-family:
        Source Han Sans-Regular,
        Source Han Sans;
      font-weight: 400;
      color: #ffffff;
      cursor: pointer;
    }
  }
}
</style>
