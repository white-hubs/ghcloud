<template>
  <div class="flow-box">
    <div class="alarmDetail-flow">
      <div class="alarmDetail-flow-item" v-for="item in flowList" :key="item.id">
        <div class="flow-time">
          <div class="flow-icon"></div>
          <div>{{ item.operatorTime }}</div>
        </div>
        <div class="flow-content">
          <div>操作人：{{ item?.operatorByName ?? "--" }}</div>
        </div>
        <div class="flow-content">
          <div>处理内容：{{ item?.operatorContent ?? "--" }}</div>
        </div>
      </div>
      <div v-if="flowList.length === 0">暂无流程</div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
  computed,
  watch,
  nextTick,
} from "vue";
import { getOperatorLogs } from "../../api/alarm.ts";
import moment from "moment";
export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      flowList: [],
    });
    const getData = () => {
      getOperatorLogs(props.id).then((res) => {
        state.flowList = res.map((item) => {
          return {
            ...item,
            operatorTime: moment(item.operatorTime).format("YYYY-MM-DD HH:mm:ss"),
          };
        });
      });
    };
    onMounted(() => {
      getData();
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.flow-box {
  height: 100%;
  padding-bottom: 16px;
  overflow: hidden;
}
.alarmDetail-flow {
  height: 100%;
  overflow-y: auto;
  .alarmDetail-flow-item {
    position: relative;
    padding-bottom: 40px;
    &:last-child {
      &::before {
        display: none;
      }
    }
    &::before {
      content: "";
      position: absolute;
      width: 1px;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      top: 15px;
      left: 5px;
    }
    .flow-time {
      height: 22px;
      font-size: 16px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.85);
      line-height: 22px;
      text-align: left;
      > div {
        display: inline-block;
        &.flow-icon {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 10px;
          background: #0e407b;
        }
      }
    }
    .flow-content {
      padding-left: 20px;
      padding-top: 6px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-bottom: 6px;
      > div {
        width: 33.33%;
        font-size: 14px;
        font-weight: 400;
        color: #e4e4e4;
      }
    }
  }
}
</style>
