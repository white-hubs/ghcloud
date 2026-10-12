<template>
  <div class="sub">
    <div class="add-row">
      <span>消息通知：</span>
      <a-button type="primary" @click="addMessageNotifyConfig">
        添加
        <PlusOutlined />
      </a-button>
    </div>
    <div
      class="config-row flex-between"
      v-for="(item, index) in messageNotifyConfig.actionConfig"
      :key="index"
    >
      <div class="left">
        <div class="config-box">
          <div class="box-header">
            <a-form layout="inline" style="margin-bottom: 16px">
              <a-form-item label="通知时间点">
                <g-select
                  :options="timeModeList"
                  :field="null"
                  v-model:value="item.notifyType"
                  style="width: 200px"
                ></g-select>
              </a-form-item>
              <a-form-item v-if="item.notifyType == 'DELAY_NOTIFY'">
                <a-input
                  v-model:value="item.duration"
                  placeholder="填写数值"
                  addonAfter="分钟"
                ></a-input>
              </a-form-item>
            </a-form>
            <div class="add-row">
              <span>通知方式：</span>
              <a-button type="primary" @click="addnotifyChannel(index)">
                添加
                <PlusOutlined />
              </a-button>
            </div>
            <div
              class="config-row flex-between"
              v-for="(element, j) in item.channelModifyParams"
              :key="j"
            >
              <div class="left">
                <notify-method-config
                  v-model:notifyMethod="
                    messageNotifyConfig.actionConfig[index].channelModifyParams[
                      j
                    ]
                  "
                ></notify-method-config>
              </div>
              <div class="right">
                <a-button
                  type="link"
                  danger
                  @click="deletenotifyChannel(index, j)"
                >
                  删除
                </a-button>
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
            <div
              class="config-row flex-between"
              v-for="(element, j) in item.targetModifyParams"
              :key="j"
            >
              <div class="left">
                <!-- <a-space :size="16">
                                    <g-select :options="[]" :field="null" v-model:value="element.department" placeholder="请选择部门" style="width:200px"></g-select>
                                    <g-select :options="[]" :field="null" v-model:value="element.post" placeholder="请选择岗位" style="width:200px"></g-select>
                                </a-space> -->
                <notify-object-config
                  v-model:configData="
                    messageNotifyConfig.actionConfig[index].targetModifyParams[
                      j
                    ]
                  "
                  :notifyOject="element"
                ></notify-object-config>
              </div>
              <div class="right">
                <a-button
                  type="link"
                  danger
                  @click="deletenotifyPersonnel(index, j)"
                >
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <a-button type="link" danger @click="deleteMessageConfig(index)">
          删除
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, toRefs, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { notifyTypeList, timeModeList } from "@/utils/enumerate";
export default defineComponent({
  components: {
    PlusOutlined,
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
      value => {
        state.messageNotifyConfig.actionConfig = value;
      },
      { deep: true },
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
        notifyType: null,
        delayTime: null,
        delayTimeUnit: "MINUTE",
        channelModifyParams: [],
        targetModifyParams: [],
      });
    };
    const deleteMessageConfig = index => {
      state.messageNotifyConfig.actionConfig.splice(index, 1);
    };
    const addnotifyPersonnel = index => {
      state.messageNotifyConfig.actionConfig[index].targetModifyParams.push({
        departmentId: null,
        postId: null,
      });
    };
    const deletenotifyPersonnel = (index, j) => {
      state.messageNotifyConfig.actionConfig[index].targetModifyParams.splice(
        j,
        1,
      );
    };
    // 添加通知方式
    const addnotifyChannel = index => {
      state.messageNotifyConfig.actionConfig[index].channelModifyParams.push({
        channelType: null,
        terminal: [],
      });
    };
    const deletenotifyChannel = (index, j) => {
      state.messageNotifyConfig.actionConfig[index].channelModifyParams.splice(
        j,
        1,
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
  > .config-row {
    margin-left: 64px;
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
