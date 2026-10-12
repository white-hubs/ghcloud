<template>
  <div class="content">
    <g-layout title="新增场景控制">
      <template #content-table>
        <div class="config-box">
          <div class="tab-item">
            <g-vertical-line title="基础信息"></g-vertical-line>
            <div class="config-body">
              <a-form
                layout="inline"
                class="basic-form"
                ref="basicForm"
                :model="config.basicModify"
                :rules="rules"
              >
                <a-form-item label="场景名称" name="name">
                  <a-input
                    v-model:value="config.basicModify.name"
                    placeholder="请输入场景名称"
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
                <a-form-item label="控制密码">
                  <a-input
                    type="password"
                    v-model:value="config.ruleConfig.password"
                    placeholder="请输入控制密码"
                  ></a-input>
                </a-form-item>
                <a-form-item label="控制密码确认">
                  <a-input
                    type="password"
                    v-model:value="config.ruleConfig.againPassword"
                    placeholder="请确认控制密码"
                  ></a-input>
                </a-form-item>
              </a-form>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="物联设备联动"></g-vertical-line>
            <div class="config-body">
              <!-- <equipment-linkage-config :actionShow="false" ref="equipmentAction" :actionConfig="actionConfig('IOT_DEVICE_ACTION')"></equipment-linkage-config> -->
              <g-device-linkage
                :actionShow="false"
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
  onMounted,
  reactive,
  toRefs,
  ref,
  computed,
  getCurrentInstance,
} from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { strategyStatus } from "@/utils/enumerate";
import messageNotice from "../conditionalLinkage/components/messageNotice.vue";
// import aDeviceLinkage from "../../../bimops-fe-web-migrate-lib//src/components/global/Common/gDeviceLinkage.vue";

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
    const { id } = route.query;
    const basicForm = ref(null);
    const equipmentAction = ref(null);
    const videoLinkage = ref(null);
    const messageNotify = ref(null);
    const state = reactive({
      loading: false,
      strategyStatus: strategyStatus,
      config: {
        basicModify: {
          id: "",
          code: "",
          applicationCode: "DEVICE",
          applicationName: "设备管理",
          type: "SCENE_RULE",
          businessType: "SCENE_CONTROL",
          name: "",
          enabled: true,
        },
        ruleConfig: {
          password: "",
          againPassword: "",
        },
        linkageEmergencyActionModifies: [],
      },
      initConfig: null,
      rules: {
        name: [{ required: true, message: "请输入场景名称" }],
      },
    });

    const actionConfig = computed(() => (key) => {
      let actionConfig = [];
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
      basicForm.value.validate().then(async () => {
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
          state.loading = false;
          const data = await proxy.$api.modifyUrle(subConfig);
          if (data) {
            proxy.$message.success("修改成功");
            state.loading = false;
            back();
          }
        } else {
          state.loading = false;
          const data = await proxy.$api.addLinkageRule(subConfig);
          if (data) {
            proxy.$message.success("新增成功");
            state.loading = false;
            back();
            state.config = cloneDeep(state.initConfig);
          }
        }
      });
    };
    const back = () => {
      router.push("/sceneLinkageList");
    };
    return {
      ...toRefs(state),
      actionConfig,
      equipmentAction,
      videoLinkage,
      messageNotify,
      basicForm,
      back,
      save,
    };
  },
});
</script>

<style lang="less" scoped>
.content {
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
</style>
