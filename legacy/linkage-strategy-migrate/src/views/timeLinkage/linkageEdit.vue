<template>
  <div class="content">
    <g-layout title="新增定时任务">
      <template #content-table>
        <div class="config-box">
          <div class="tab-item">
            <g-vertical-line title="基础信息"></g-vertical-line>
            <div class="config-body">
              <a-form
                layout="inline"
                class="basic-form"
                :model="config.basicModify"
                :rules="rules"
                ref="basicForm"
              >
                <a-form-item label="任务名称" name="name">
                  <a-input
                    v-model:value="config.basicModify.name"
                    placeholder="请输入定时任务名称"
                  ></a-input>
                </a-form-item>
                <a-form-item label="是否启用">
                  <g-select
                    :options="strategyStatus"
                    :field="null"
                    v-model:value="config.basicModify.enabled"
                    :allowClear="false"
                    style="width: 100%"
                  ></g-select>
                </a-form-item>
              </a-form>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="定时周期"></g-vertical-line>
            <div class="config-body">
              <a-form
                layout="inline"
                class="basic-form"
                :model="config.ruleConfig"
                ref="ruleForm"
                :rules="ruleRules"
              >
                <a-form-item label="是否循环">
                  <a-select
                    :options="loopList"
                    :field="null"
                    v-model:value="config.ruleConfig.looped"
                    :allowClear="false"
                    style="width: 100%"
                  ></a-select>
                </a-form-item>
                <a-form-item
                  label="执行时间"
                  name="executeTime"
                  v-if="!config.ruleConfig.looped"
                >
                  <a-date-picker
                    :mode="modeType"
                    v-model:value="config.ruleConfig.executeTime"
                    show-time
                    @panelChange="handelPanelChange"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </a-form-item>
                <a-form-item label="循环周期" name="cron" v-else>
                  <a-input
                    v-model:value="config.ruleConfig.cron"
                    placeholder="请输入Cron表达式"
                  ></a-input>
                </a-form-item>
              </a-form>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="物联设备联动"></g-vertical-line>
            <div class="config-body">
              <g-device-linkage
                ref="equipmentAction"
                :actionConfig="actionConfig('IOT_DEVICE_ACTION')"
              ></g-device-linkage>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="监控联动"></g-vertical-line>
            <div class="config-body">
              <video-linkage-config
                ref="videoLinkage"
                :actionConfig="actionConfig('VIDEO_DEVICE_ACTION')"
              ></video-linkage-config>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="消息通知"></g-vertical-line>
            <div class="config-body">
              <message-notice
                :disabled="true"
                ref="messageNotify"
                :actionConfig="actionConfig('MESSAGE_NOTIFY_ACTION')"
              ></message-notice>
            </div>
          </div>
        </div>
      </template>
      <template #footer-btn>
        <div class="footer-body">
          <a-button @click="back">返回</a-button>
          <a-button type="primary" @click="save" :loading="loading">保存</a-button>
        </div>
      </template>
    </g-layout>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  computed,
  getCurrentInstance,
} from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { strategyStatus, loopList } from "@/utils/enumerate";
import messageNotice from "../conditionalLinkage/components/messageNotice.vue";
import { cloneDeep } from "lodash-es";
export default defineComponent({
  components: {
    PlusOutlined,
    messageNotice,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const modeType = ref("date");
    const { id } = route.query;
    const basicForm = ref(null);
    const ruleForm = ref(null);
    const equipmentAction = ref(null);
    const videoLinkage = ref(null);
    const messageNotify = ref(null);
    const state = reactive({
      loading: false,
      strategyStatus: strategyStatus,
      loopList: loopList,
      config: {
        basicModify: {
          id: "",
          code: "",
          applicationCode: "DEVICE",
          applicationName: "设备管理",
          type: "TIMING_RULE",
          businessType: "TIMING_CONTROL",
          name: "",
          enabled: true,
        },
        ruleConfig: {
          looped: false,
          executeTime: "",
          cron: "",
        },
        linkageEmergencyActionModifies: [],
      },
      initConfig: null,
      rules: {
        name: [{ required: true, message: "请输入定时任务名称" }],
      },
      ruleRules: {
        executeTime: [{ required: true, message: "请选择执行时间" }],
        cron: [{ required: true, message: "请输入Cro表达式" }],
      },
    });
    const actionConfig = computed(() => (key) => {
      let data = state.config.linkageEmergencyActionModifies.find(
        (res) => res.actionType == key
      );

      return data;
    });
    onMounted(() => {
      state.initConfig = cloneDeep(state.config);
      if (id) {
        getRuleDetail(id);
      }
    });
    const handelPanelChange = (val, mode) => {
      modeType.value = mode;
    };
    // 根据id获取规则详情
    const getRuleDetail = async (id) => {
      const data = await proxy.$api.getRuleDetail({ id: id });
      if (data) {
        state.config.basicModify = data.ruleBasicVO;
        state.config.ruleConfig = JSON.parse(data.ruleConfig);
        state.config.linkageEmergencyActionModifies = data.linkageActionVOS.map(
          (item) => {
            if (item.actionConfig) {
              item.actionConfig = item.actionConfig;
            } else {
              item.actionConfig = [];
            }
            return item;
          }
        );
      }
    };
    const save = () => {
      basicForm.value.validate().then(() => {
        ruleForm.value.validate().then(async () => {
          state.loading = true;
          const subConfig = cloneDeep(state.config);
          const equipmentActionConfig = cloneDeep(
            equipmentAction.value.deviceLinkageConfig
          );
          const videoLinkageConfig = cloneDeep(videoLinkage.value.videoConfig);
          const messageNotifyConfig = cloneDeep(messageNotify.value.messageNoticeConfig);
          // equipmentActionConfig.actionConfig = equipmentActionConfig.actionConfig.length?JSON.stringify(equipmentActionConfig.actionConfig):"";
          // videoLinkageConfig.actionConfig = videoLinkageConfig.actionConfig.length?JSON.stringify(videoLinkageConfig.actionConfig):"";
          // messageNotifyConfig.actionConfig = messageNotifyConfig.actionConfig.length?JSON.stringify(messageNotifyConfig.actionConfig):"";
          subConfig.linkageEmergencyActionModifies = [
            equipmentActionConfig,
            videoLinkageConfig,
            messageNotifyConfig,
          ];
          subConfig.ruleConfig = JSON.stringify(subConfig.ruleConfig);
          if (id) {
            const data = await proxy.$api.modifyUrle(subConfig);
            if (data) {
              proxy.$message.success("修改成功");
              back();
            }
          } else {
            const data = await proxy.$api.addLinkageRule(subConfig);
            if (data) {
              proxy.$message.success("新增成功");
              back();
              state.config = cloneDeep(state.initConfig);
            }
          }
          state.loading = false;
        });
      });
    };
    const back = () => {
      router.push("/timeLinkageList");
    };
    return {
      ...toRefs(state),
      actionConfig,
      equipmentAction,
      videoLinkage,
      messageNotify,
      basicForm,
      ruleForm,
      save,
      back,
      modeType,
      handelPanelChange,
    };
  },
});
</script>

<style lang="less" scoped>
.contet {
  height: 82vh;
  overflow: auto;
}
.config-box {
  height: 100%;
  overflow: auto;
}
.tab-item {
  padding: 0 16px;
  :deep(.verticalLine) {
    padding: 16px 0;
  }
  .config-body {
    padding: 0 16px;
    :deep(.ant-select-multiple) {
      width: 400px !important;
    }
  }
}
.basic-form {
  width: 100%;
  :deep(.ant-form-item) {
    width: 30%;
    margin-bottom: 16px;
    margin-right: 20%;
    text-align: center;
  }
}
:deep(.content-search) {
  padding-top: 0 !important;
}
:deep(.footer-btn) {
  width: 100%;
  .footer-body {
    width: 100%;
    text-align: right;
  }
}
</style>
<style>
.item-title {
  margin-bottom: 10px;
}
.content {
  height: 82vh;
  overflow-y: auto;
}
</style>
