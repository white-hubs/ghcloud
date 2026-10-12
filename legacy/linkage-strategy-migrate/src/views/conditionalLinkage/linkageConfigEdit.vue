<template>
  <div class="content">
    <g-layout :title="type!=='edit'?'新增联动':'编辑联动'">
      <template #content-table>
        <div class="config-box">
          <div class="tab-item">
            <g-vertical-line title="基础信息"></g-vertical-line>
            <div class="config-body">
              <a-form layout="inline" :model="conditionLinkage.basicModify" class="basic-form" ref="basicForm"
                :rules="rules">
                <a-form-item label="联动名称" name="name">
                  <a-input v-model:value="conditionLinkage.basicModify.name" placeholder="请输入条件联动名称"></a-input>
                </a-form-item>
                <a-form-item label="静默时长" name="repeatTime">
                  <a-input type="number" v-model:value="conditionLinkage.basicModify.repeatTime" placeholder="请输入静默分钟数"
                    addon-after="分钟"></a-input>
                </a-form-item>
                <a-form-item label="是否启用">
                  <g-select :options="strategyStatus" :field="null" v-model:value="conditionLinkage.basicModify.enabled"
                    :allowClear="false" style="width: 100%"></g-select>
                </a-form-item>
              </a-form>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="联动条件"></g-vertical-line>
            <div class="config-body">
              <condition-rule-config ref="ruleRef" :ruleConfig="conditionLinkage.ruleConfig"></condition-rule-config>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="物联设备联动"></g-vertical-line>
            <div class="config-body">
              <!-- <equipment-linkage-config
                ref="equipmentAction"
                :actionConfig="actionConfig('IOT_DEVICE_ACTION')"
              ></equipment-linkage-config> -->
              <g-device-linkage ref="equipmentAction"
                :actionConfig="actionConfig('IOT_DEVICE_ACTION')"></g-device-linkage>
            </div>
          </div>

          <div class="tab-item">
            <g-vertical-line title="监控联动"></g-vertical-line>

            <div class="config-body">
              <video-linkage-config ref="videoLinkage"
                :actionConfig="actionConfig('VIDEO_DEVICE_ACTION')"></video-linkage-config>
            </div>
          </div>
          <div class="tab-item">
            <g-vertical-line title="消息通知"></g-vertical-line>
            <div class="config-body">
              <message-notice :disabled="true" ref="messageNotify"
                :actionConfig="actionConfig('MESSAGE_NOTIFY_ACTION')"></message-notice>

              <!-- <g-message-notice
                :disabled="true"
                ref="messageNotify"
                :actionConfig="actionConfig('MESSAGE_NOTIFY_ACTION')"
              ></g-message-notice> -->
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
  ref,
  toRefs,
  getCurrentInstance,
  computed,
} from "vue";
import { strategyStatus } from "@/utils/enumerate";
import { useRoute, useRouter } from "vue-router";
import { cloneDeep } from "lodash-es";
import conditionRuleConfig from "./components/conditionRuleConfig.vue";
import messageNotice from "./components/messageNotice.vue";

export default defineComponent({
  components: { conditionRuleConfig,messageNotice },
  setup() {
    const valueValidator = (rule, val, callback) => {
      if (val) {
        if (val <= 0 || val > 60) {
          callback("请输入1~60之间的整数");
        }
      }
      callback();
    };
    const enabledvideo = ref(false);
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const { id, type } = route.query;
    const basicForm = ref(null);
    const equipmentAction = ref(null);
    const videoLinkage = ref(null);
    const messageNotify = ref(null);
    const ruleRef = ref(null);
    const state = reactive({
      loading: false,
      strategyStatus: strategyStatus,
      conditionLinkage: {
        basicModify: {
          id: "",
          code: "",
          name: "",
          applicationCode: "DEVICE", //应用编号
          applicationName: "设备管理", //应用名称
          type: "DEVICE_CONDITION_RULE",
          businessType: "DEVICE_CONDITION",
          reiterated: false,
          repeatTime: "",
          repeatTimeUnit: "MINUTE",
          enabled: true,
        },
        ruleConfig: [],
        linkageEmergencyActionModifies: [],
      },
      initConfig: null,
      rules: {
        name: [{ required: true, message: "请输入联动名称" }],
        repeatTime: [{ required: true, validator: valueValidator }],
      },
    });
    const actionConfig = computed(() => (key) => {
      let actionConfig = [];
      let data = state.conditionLinkage.linkageEmergencyActionModifies.find(
        (res) => res.actionType == key
      );
      // state.conditionLinkage.linkageEmergencyActionModifies.forEach(item =>{
      //     if(item.actionType === key){
      //         actionConfig = item.actionConfig
      //     }
      // })
      return data;
    });
    const getactionConfig = (key) => {
      let data = state.conditionLinkage.linkageEmergencyActionModifies.find(
        (res) => res.actionType == key
      );

      return data;
    };
    onMounted(async () => {
      state.initConfig = cloneDeep(state.conditionLinkage);
      if (id) {
        await getRuleDetail(id);
      }
    });
    // 根据id获取规则详情
    const getRuleDetail = async (id) => {
      const data = await proxy.$api.getRuleDetail({ id: id });
      if (data) {
        state.conditionLinkage.basicModify = data.ruleBasicVO;
        state.conditionLinkage.ruleConfig = JSON.parse(data.ruleConfig).map((item) => {
          item.deviceProdCategoryCodeConcat = item.deviceProdCategoryCodeConcat.split(
            "-"
          );
          return item;
        });
        state.conditionLinkage.linkageEmergencyActionModifies = data.linkageActionVOS.map(
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
        const subConfig = cloneDeep(state.conditionLinkage);
        const equipmentActionConfig = cloneDeep(
          equipmentAction.value.deviceLinkageConfig
        );
        const videoLinkageConfig = cloneDeep(videoLinkage.value.videoConfig);
        const messageNotifyConfig = cloneDeep(messageNotify.value.messageNoticeConfig);
        const ruleConfig = cloneDeep(ruleRef.value.configData).map((item) => {
          item.deviceProdCategoryCodeConcat =
            item.deviceProdCategoryCodeConcat.length > 0
              ? item.deviceProdCategoryCodeConcat.join("-")
              : "";
          return item;
        });

        // equipmentActionConfig.actionConfig = equipmentActionConfig.actionConfig.length?JSON.stringify(equipmentActionConfig.actionConfig):"";
        // videoLinkageConfig.actionConfig = videoLinkageConfig.actionConfig.length?videoLinkageConfig.actionConfig:[];

        // messageNotifyConfig.actionConfig = messageNotifyConfig.actionConfig.length?JSON.stringify(messageNotifyConfig.actionConfig):"";
        subConfig.linkageEmergencyActionModifies = [
          equipmentActionConfig,
          videoLinkageConfig,
          messageNotifyConfig,
        ];
        subConfig.ruleConfig = JSON.stringify(ruleConfig);
        if (id) {
          const data = await proxy.$api.modifyUrle(subConfig);
          if (data) {
            proxy.$message.success("修改成功");
            back();
          }
        } else {
          const data = await proxy.$api.addLinkageRule(subConfig);
          if (data) {
            state.conditionLinkage = cloneDeep(state.initConfig);
            proxy.$message.success("新增成功");
            back();
          }
        }
        state.loading = false;
      });
    };
    const back = () => {
      router.push("/conditionalLinkageList");
    };
    return {
      enabledvideo,
      ...toRefs(state),
      actionConfig,
      equipmentAction,
      videoLinkage,
      messageNotify,
      basicForm,
      ruleRef,
      save,
      back,
    };
  },
});
</script>

<style lang="less" scoped>
.config-box {
  height: 70vh;
  overflow: auto;
}

.tab-item {
  padding: 0 16px;

  :deep(.verticalLine) {
    padding: 16px 0;
  }

  .config-body {
    padding: 0 16px;
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
