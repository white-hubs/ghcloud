<template>
  <div class="sub">
    <div class="add-row">
      <!-- <span>消息通知：</span> -->
      <a-button type="primary" @click="addMessageNotifyConfig">
        添加
        <PlusOutlined />
      </a-button>
    </div>
    <div class="config-row flex-between" v-for="(item, index) in messageNotifyConfig.actionConfig" :key="index">
      <div class="left">
        <div class="config-box">
          <div class="box-header">
            <div class="add-row">
              <span>通知方式：</span>
            </div>
            <div class="config-row flex-between">
              <div class="left">
                <SNotifyMethodConfig v-model:notifyMethod="messageNotifyConfig.actionConfig[index].channelModifyParams[0]"></SNotifyMethodConfig>
              </div>
            </div>
          </div>
          <div class="box-center">
            <div class="add-row">
              <span>通知人员：</span>
              <a-button type="primary" @click="addnotifyPersonnel(index)">
                添加
                <PlusOutlined />
              </a-button>
            </div>
            <div class="config-row flex-between" v-for="(element, j) in item.targetModifyParams" :key="j">
              <div class="left">
                <SNotifyObjectConfig v-model:configData="
                        messageNotifyConfig.actionConfig[index].targetModifyParams[
                          j
                        ]
                      " :notifyOject="element"></SNotifyObjectConfig>
              </div>
              <div class="right">
                <a-button type="link" danger @click="deletenotifyPersonnel(index, j)">删除</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <a-button type="link" danger @click="deleteMessageConfig(index)">删除</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, toRefs, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { notifyTypeList, timeModeList } from "@/utils/enumerate";
import SNotifyMethodConfig from "./notifyMethodConfig.vue";
import SNotifyObjectConfig from "./notifyObjectConfig.vue";
export default defineComponent({
  components: {
    PlusOutlined,
    SNotifyMethodConfig,
    SNotifyObjectConfig,
  },
  props: {
    actionConfig: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    watch(
      () => props.actionConfig,
      (value) => {
        state.messageNotifyConfig.actionConfig = value;
      },
      { deep: true }
    );
    const state = reactive({
      notifyTypeList: notifyTypeList,
      timeModeList: timeModeList,
      messageNotifyConfig: {
        actionType: "MESSAGE_NOTIFY_ACTION",
        actionConfig: [],
      },
    });
    const addMessageNotifyConfig = () => {
      state.messageNotifyConfig.actionConfig.push({
        channelModifyParams: [
          {
            channelType: null,
            terminal: [],
          },
        ],
        targetModifyParams: [],
      });
    };
    const deleteMessageConfig = (index) => {
      state.messageNotifyConfig.actionConfig.splice(index, 1);
    };
    const addnotifyPersonnel = (index) => {
      state.messageNotifyConfig.actionConfig[index].targetModifyParams.push({
        departmentId: null,
        postId: null,
      });
    };
    const deletenotifyPersonnel = (index, j) => {
      state.messageNotifyConfig.actionConfig[index].targetModifyParams.splice(
        j,
        1
      );
    };
    // 添加通知方式
    const addnotifyChannel = (index) => {
      state.messageNotifyConfig.actionConfig[index].channelModifyParams.push({
        channelType: null,
        terminal: [],
      });
    };
    const deletenotifyChannel = (index, j) => {
      state.messageNotifyConfig.actionConfig[index].channelModifyParams.splice(
        j,
        1
      );
    };
    return {
      ...toRefs(state),
      addMessageNotifyConfig,
      deleteMessageConfig,
      addnotifyPersonnel,
      deletenotifyPersonnel,
      addnotifyChannel,
      deletenotifyChannel,
    };
  },
});
</script>

<style lang="less" scoped>
.sub {
  >.config-row {
    // margin-left: 64px;
  }

  .add-row,
  .config-row {
    margin-bottom: 10px;

    // border-bottom: solid 1px #aaa;
    .left {
      flex: 1;
    }
  }

  .config-box {
    border: 1px solid #aaa;
    padding: 0 16px;

    .box-header {
      padding: 8px 16px;
      border-bottom: 1px solid #aaa;
    }

    .box-center {
      padding: 8px 16px;
    }
  }
}
</style>
