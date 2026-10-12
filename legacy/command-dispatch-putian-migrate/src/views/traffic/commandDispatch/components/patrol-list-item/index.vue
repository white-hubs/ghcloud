<template>
  <div :class="[activeId===partolInfo.id&&'active','patrol-list-item']">
    <img src="../../images/patrol-icon.png" alt="" />
    <div class="item-content">
      <div class="patrol-title">{{ partolInfo.taskName }}</div>
      <div class="patrol-info">
        <div class="patrol-time">
          <label>巡更时间: </label>
          <span>{{partolInfo.startTime}}-{{partolInfo.endTime}}</span>
        </div>
        <div class="info-bottom">
          <div class="patrol-count">
            <label>巡更点数: </label>
            <span>{{partolInfo.locationNum}}</span>
          </div>
          <div class="patrol-count">
            <label>负责人: </label>
            <span>{{ partolInfo.userName||'--' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="item-status-info">
      <div class="status">异常</div>
      <div class="info" @click.stop="handleInfo">详情</div>
    </div>
    <div v-if="visible">
      <patrol-info :info="infoState" @close="handleInfoClose" @getList="getList" />
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance } from "vue";
import patrolInfo from '../patrol-info/index.vue'
import moment from "moment";
const STATUS_ENUM = {
  IN_EXECUTION: '执行中',
  TO_BE_RECEIVED: '待接收',
  FINISHED: '已结束'
}

export default defineComponent({
  components: {
    patrolInfo
  },
  props: {
    partolInfo: {
      type: Object,
      default: () => { }
    },
    activeId: {
      type: String,
      default: () => ''
    }
  },
  name: 'patrolListItem',
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      visible: false,
      infoState: {}
    })
    const handleInfoClose = () => {
      state.visible = false
    }
    const getList = () => {
      emit('getList')
    }
    const handleInfo = async () => {
      const result = await proxy.$api.getPatrolTaskById({ id: props.partolInfo.id ?? '' })
      state.infoState = result
      state.infoState.statusName = STATUS_ENUM[result.status]
      state.infoState.startTime = moment(result.startDate).format('YYYY-MM-DD')
      state.infoState.endTime = moment(result.endDate).format('YYYY-MM-DD')
      state.visible = true
    }
    return {
      ...toRefs(state),
      handleInfo,
      handleInfoClose,
      getList
    }
  }
})
</script>
<style scoped lang="less">
.active {
  background: rgba(28, 103, 196, 0.5) !important;
}

.patrol-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 8px;
  background: rgba(28, 103, 196, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(41, 137, 255, 0.3);

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
      font-family: Source Han Sans-Medium, Source Han Sans;
      font-weight: 500;
      color: #F4F4F4;
      background: linear-gradient(270deg, rgba(43, 138, 255, 0) 0%, rgba(43, 138, 255, 0.6) 35%, rgba(43, 138, 255, 0) 100%);
    }

    .patrol-info {
      font-size: 12px;
      font-family: Source Han Sans-Regular, Source Han Sans;
      font-weight: 400;
      color: #AFC8E5;

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
      font-family: Source Han Sans-Regular, Source Han Sans;
      font-weight: 400;
      color: #FF3D3D
    }

    .info {
      padding: 4px 11px;
      background: #2989FF;
      border-radius: 2px;
      font-size: 12px;
      font-family: Source Han Sans-Regular, Source Han Sans;
      font-weight: 400;
      color: #FFFFFF;
      cursor: pointer;
    }
  }
}
</style>