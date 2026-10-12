<template>
  <div class="select-circle">
    <div class="select-circle-content">
      <div class="left-list" v-if="!type">
        <div class="list-title">
          <a-checkbox v-model:checked="checkAll" @change="onCheckAllChange" :indeterminate="indeterminate">全部在线人员</a-checkbox>
        </div>
        <div class="list" v-if="onLineDevice.length">
          <div class="list-item">
            <a-checkbox-group v-model:value="checkedList">
              <div v-for="item in onLineDevice" :key="item.id" class="checked-item">
                <label>
                  <a-checkbox :value="item.code">{{ item.name }}</a-checkbox>
                </label>
              </div>
            </a-checkbox-group>
          </div>
        </div>
        <a-empty v-else />
      </div>
      <div class="center-btn" @click="handleOk" v-if="!type">
        <RightOutlined :style="{ fontSize: '18px' }" />
      </div>
      <div class="right-list">
        <div class="list-title">{{ type ? "当前设备" : "当前选中人员" }}</div>
        <div class="list" v-if="selectedList.length">
          <div class="list-item" v-for="item in selectedList" :key="item.id">
            <div class="name">{{ type ? item.deviceName : item.name }}</div>
            <div class="btn" @click="remove(item)">
              <DeleteOutlined :style="{ color: '#DE1504', fontSize: '12px' }" />
              <span>删除</span>
            </div>
          </div>
        </div>
        <div class="no-data" v-else>
          <a-empty description="暂无数据或设备不在线" />
        </div>
        <div class="footer-btn">
          <div :class="{ disabled: !selectedList.length }" @click="tempGroupCall">
            <IconFont type="icon-yuyin" :style="{ fontSize: '18px', color: '#FFF' }" />{{ type ? "广播" : "对讲" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RightOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, watch } from "vue";

import { TempGroupCall } from "./js/voice";
export default defineComponent({
  components: { RightOutlined, DeleteOutlined },
  props: {
    selected: {
      type: Array,
      default: () => {
        return [];
      },
    },
    type: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      onLineDevice: [],
      checkAll: false,
      indeterminate: false,
      checkedList: [],
      selectedList: [],
    });
    onMounted(() => {
      getDispatchDeviceList();
      state.selectedList = props.selected;
    });
    const getDispatchDeviceList = () => {
      proxy.$api.getDispatchDeviceList({ onlineStatus: 1 }).then((res) => {
        state.onLineDevice = res;
        props.selected.forEach((item) => {
          let index = state.onLineDevice.findIndex((j) => j.code == item.code);
          console.log(index);
          if (index !== undefined) {
            state.onLineDevice.splice(index, 1);
          }
        });
      });
    };
    const onCheckAllChange = (e) => {
      state.checkedList = e.target.checked ? state.onLineDevice.map((item) => item.code) : [];
      state.indeterminate = false;
    };
    const handleOk = () => {
      state.checkedList.forEach((code) => {
        let index = state.onLineDevice.findIndex((item) => item.code == code);
        state.selectedList.push(state.onLineDevice[index]);
        state.onLineDevice.splice(index, 1);
      });
      state.checkedList = [];
      state.checkAll = false;
    };
    const remove = (record) => {
      state.selectedList = state.selectedList.filter((item) => item.code !== record.code);
      state.onLineDevice.push(record);
    };
    const tempGroupCall = () => {
      // emit("openbroadcast", state.selectedList);
      console.log(state.selectedList);

      if (!state.selectedList.length) {
        return false;
      }
      let codes = state.selectedList.map((item) => item.code);

      if (props.type) {
        let devices = state.selectedList.map((item) => {
          return {
            id: item.deviceId,
            code: item.code,
            name: item.deviceName,
            thirdPartyCode: item.thirdPartyId,
          };
        });
        emit("openbroadcast", devices);
      } else {
        TempGroupCall([codes.join("#")]);
      }
    };
    const SingleVideoCall = () => {};
    watch(
      () => state.checkedList,
      (val) => {
        state.indeterminate = !!val.length && val.length < state.onLineDevice.length;
        state.checkAll = val.length === state.onLineDevice.length;
      },
    );
    return {
      ...toRefs(state),
      onCheckAllChange,
      handleOk,
      remove,
      tempGroupCall,
      SingleVideoCall,
    };
  },
});
</script>

<style lang="less" scoped>
.select-circle {
  height: 100%;
  padding: 16px;
  &-content {
    font-size: 14px;
    color: #e2e2e2;
    height: 460px;
    display: flex;
    justify-content: space-between;
    .left-list {
      height: 100%;
      overflow: hidden;
      border: solid 1px var(--dispatch-border, #d7e5f4);
      padding: 16px;
      flex: 1;
    }
    .list {
      height: calc(100% - 30px);
      overflow: auto;
    }
    .list-title {
      margin-bottom: 16px;
      font-family: "PingFang SC-Medium, PingFang SC";
      font-weight: 500;
      color: #ffffff;
    }
    .list-item {
      font-size: 14px;
      color: #ffffff;
      .btn {
        color: #de1504;
      }
    }
    .checked-item {
      line-height: 30px;
    }
    .right-list {
      flex: 1;
      border: solid 1px var(--dispatch-border, #d7e5f4);
      padding: 16px;
      .list,
      .no-data {
        height: calc(100% - 80px);
        overflow: auto;
      }
      .list-item {
        height: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .btn {
        cursor: pointer;
        span {
          margin-left: 4px;
        }
      }
      .footer-btn {
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid var(--dispatch-border, #d7e5f4);
        > div {
          font-size: 12px;
          width: 78px;
          height: 30px;
          background: #1e3664;
          border-radius: 2px 2px 2px 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 10px;
        }
        .disabled {
          cursor: no-drop;
        }
      }
    }
  }
  .center-btn {
    width: 42px;
    height: 42px;
    background: var(--dispatch-panel-bg-soft, #f5f9ff);
    line-height: 42px;
    text-align: center;
    margin: 18px;
    margin-top: 180px;
    border-radius: 2px 2px 2px 2px;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.select-circle {
  .ant-checkbox-wrapper {
    font-size: 14px;
    font-family: "PingFang SC-Medium, PingFang SC";
    font-weight: 500;
    color: #ffffff;
  }
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #216cc3;
    border-color: #216cc3;
  }
  .ant-checkbox-wrapper:hover .ant-checkbox-inner,
  .ant-checkbox:hover .ant-checkbox-inner,
  .ant-checkbox-input:focus + .ant-checkbox-inner {
    border-color: #216cc3;
  }
  .ant-checkbox-indeterminate .ant-checkbox-inner::after {
    border-color: #216cc3;
    background-color: #216cc3;
  }
}
</style>
