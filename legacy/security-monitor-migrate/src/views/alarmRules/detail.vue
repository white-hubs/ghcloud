<template>
  <g-layout :title="'报警规则-' + title">
    <template #content-table>
      <g-detail-form :formList="formList" :api="api" :afterGet="afterGet" ref="formData" :rules="rules">
        <template #repeatTime="{ record }">
          <a-input :maxlength="2" :min="0" :max="60" oninput="value=value.replace(/[^\d]/g,'')" addon-after="分钟"
            v-model:value="record.repeatTime" placeholder="请输入去重周期" />
        </template>
        <template #estimatedHandlerTime="{ record }">
          <a-input :maxlength="2" :max="60" oninput="value=value.replace(/[^\d]/g,'')"
            v-model:value="record.estimatedHandlerTime" placeholder="请输入处理时限">
            <template #addonAfter>
              <g-select :options="timeUnit" :field="{ value: 'value', label: 'label' }"
                v-model:value="record.estimatedHandlerUnit" style="width: 90px"></g-select>
            </template>
          </a-input>
        </template>
        <template #edit-item="{ record }">
          <div class="item-title">报警规则</div>
          <alarm-rules ref="alarmRules" applicationCode="SECURITY_MONITORING"
            :actionConfig="actionConfig('RESERVE_PLAN_RULES')"></alarm-rules>
          <div class="item-title">报警通知</div>
          <g-alarm-notice ref="alarmNotice" :actionConfig="actionConfig('ALARM_NOTIFY_ACTION')"></g-alarm-notice>
          <message-notice ref="messageNotice" :actionConfig="actionConfig('MESSAGE_NOTIFY_ACTION')"></message-notice>
          <g-device-linkage ref="deviceLinkage" :actionConfig="actionConfig('IOT_DEVICE_ACTION')"></g-device-linkage>
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" @click="saveRecord" :loading="loading" v-if="type && type !== 'detail'">
        保存
      </a-button>
    </template>
  </g-layout>
</template>

<script lang="jsx">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import replaceObjectKeys from "@pansy/replace-object-keys";
import { timeUnit } from "@/utils/enumerate";
import { useRoute, useRouter } from "vue-router";
import alarmRules from "./components/alarmRules.vue";
import messageNotice from "./components/messageNotice.vue";
import deviceLinkage from "./components/deviceLinkage.vue";


export default defineComponent({
  components: { alarmRules, messageNotice, deviceLinkage },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { type, id } = route.query;
    const formData = ref(null);
    const alarmRules = ref(null);
    const alarmRulesBuss = ref(null);
    const alarmNotice = ref(null);
    const messageNotice = ref(null);
    const deviceLinkage = ref(null);
    const { proxy } = getCurrentInstance();
    const state = reactive({
      title: "新增",
      formList: [
        {
          title: "基本信息",
          form: [
            {
              label: "规则名称",
              value: "name",
              placeholder: "请输入规则名称",
            },
            {
              label: "报警级别",
              value: "alarmLevelId",
              detailValue: "alarmLevelName",
              component: "gSelect",
              url: "getAlarmLevels",
              field: { name: "label", id: "value" },
              placeholder: "请选择报警级别",
            },
            {
              label: "事件分类",
              value: "emergencyEventTypeCode",
              detailValue: "emergencyEventTypeName",
              component: "gSelect",
              url: "geteventtypes",
              field: { name: "label", code: "value" },
              placeholder: "请选择事件分类",
            },
            {
              label: "去重周期",
              value: "repeatTime",
              detailFun: value => {
                return value + "分钟";
              },
              placeholder: "去重周期",
              slot: true,
            },
            {
              label: "处理时限",
              value: "estimatedHandlerTime",
              placeholder: "请输入处理时限",
              detailValue: "estimatedHandlerTimeName",
              slot: true,
            },
            {
              label: "说明",
              value: "remark",
              component: "a-textarea",
              placeholder: "请输入备注信息,最多200字",
              maxlength: 200,
            },
          ],
        },
      ],
      rules: {
        emergencyEventTypeCode: [{ required: true, message: "请选择事件分类" }],

        name: [{ required: true, message: "请输入预案名称" }],
        alarmLevelId: [{ required: true, message: "请选择报警级别" }],
        repeatTime: [{ required: true, message: "请输入去重周期" }],
        estimatedHandlerTime: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback("请输入处理时限");
              } else if (!formData.value.form.estimatedHandlerUnit) {
                callback("请选择处理时限单位");
              } else {
                callback();
              }
            },
          },
        ],
        estimatedHandlerUnit: [
          { required: true, message: "请选择处理时限单位" },
        ],
        applicationCode: [{ required: true, message: "请选择类型" }],
      },
      api: {
        add: "",
        detail: "planRulesDetail",
        edit: "",
      },
      configDetail: null,
    });
    onMounted(() => {
      if (type == "detail") {
        state.title = "详情";
      } else if (type == "edit") {
        state.title = "编辑";
      } else {
        state.title = "新增";
      }
    });
    const afterGet = res => {
      state.configDetail = res;
      const {
        id,
        name,
        alarmLevelId,
        alarmLevelName,
        repeatTime,
        estimatedHandlerTime,
        estimatedHandlerTimeName,
        applicationCode,
        remark,
        emergencyEventTypeCode,
        enabled,
        estimatedHandlerUnit,
        emergencyEventTypeName
      } = res;
      return {
        emergencyEventTypeName,
        id: id,
        name: name,
        emergencyEventTypeCode,
        alarmLevelId: alarmLevelId,
        alarmLevelName: alarmLevelName,
        repeatTime: repeatTime,
        estimatedHandlerTime: estimatedHandlerTime,
        estimatedHandlerTimeName: estimatedHandlerTimeName,
        estimatedHandlerUnit: estimatedHandlerUnit,
        applicationCode: applicationCode,
        remark: remark,
        enabled: enabled,
      };
    };
    const actionConfig = computed(() => key => {
      if (!state.configDetail) return false;
      let params;
      switch (key) {
        case "ALARM_NOTIFY_ACTION": //报警联动

          params = state.configDetail.emergencyActionVOS.find(
            item => item.actionType === key,
          );
          break;
        case "MESSAGE_NOTIFY_ACTION": //消息联动
          params = state.configDetail.emergencyActionVOS.find(
            item => item.actionType === key,
          );
          break;
        case "IOT_DEVICE_ACTION": //设备联动
          params = state.configDetail.emergencyActionVOS.find(
            item => item.actionType === key,
          );
          break;
        case "RESERVE_PLAN_RULES": //预案规则
          params = {
            emergencyRuleConditionCommands: replaceObjectKeys(
              state.configDetail.emergencyRuleConditionCollectionVOS,
              {
                conditionType: "conditionType",
                deviceEventCode: "deviceEventCode",
                deviceEventName: "deviceEventName",
                deviceEventType: "deviceEventType",
                deviceGenreId: "deviceGenreId",
                deviceGenreName: "deviceGenreName",
                deviceModelId: "deviceModelId",
                deviceModelName: "deviceModelName",
                emergencyRuleConditionExpCollectionVOS:
                  "emergencyRuleConditionExpCommands",
              },
            ),
            rulePeriodTimed: state.configDetail.rulePeriodTimed,
            emergencyRuleTimeCommands: state.configDetail.emergencyRuleTimes.length == 0 ? [{
              startTime: '',
              endTime: ''
            }] : state.configDetail.emergencyRuleTimes,
            emergencyRuleConditionDeviceCommands:
              state.configDetail.emergencyRuleConditionDeviceCollectionVOS,
          };
          break;
      }

      return params;
    });
    const goBack = () => {
      history.go(-1);
    };
    let loading = ref(false);
    let flag = ref(true)
    const saveRecord = async () => {
      let alarmLength = alarmNotice.value.alarmNoticeConfig.actionConfig.targetModifyParams.map(item => {
        return item.targetConfig.length
      })
     let arr= messageNotice.value.messageNoticeConfig.actionConfig.map(item=>{
       return item.targetModifyParams.map(data=>{
          return data.targetConfig.length
        })
      })
      alarmLength = [...alarmLength,...arr.flat(Infinity)]
      formData.value.formRef.validate().then(async res => {
        loading.value = true;
        alarmRules.value.alarmRulesConfig.emergencyRuleConditionCommands.forEach(resd => {
          if (resd.conditionType == 'CUSTOM_RULE_CONDITION') {
            flag.value = false
          }
        })
        let params = {
          ...formData.value.form,
          // 安防应用code
          applicationCode: "SECURITY_MONITORING",
          // 去重单位（默认分钟）
          repeatTimeUnit: "MINUTE",
          // 是否启用
          enabled: true,
          enabled: true,
          rulePeriodTimed: alarmRules.value.alarmRulesConfig.rulePeriodTimed == null ? false : alarmRules.value.alarmRulesConfig.rulePeriodTimed,
          emergencyRuleTimeCommands: alarmRules.value.alarmRulesConfig.emergencyRuleTimeCommands,
          // 预案条件列表
          emergencyRuleConditionCommands:
            alarmRules.value.alarmRulesConfig.emergencyRuleConditionCommands,
          // 预案设备列表
          emergencyRuleConditionDeviceCommands:
            alarmRules.value.alarmRulesConfig
              .emergencyRuleConditionDeviceCommands,
          // 预案动作
          emergencyActionCommands: [
            alarmNotice.value.alarmNoticeConfig,
            messageNotice.value.messageNoticeConfig,
            deviceLinkage.value.deviceLinkageConfig,
            {
              actionType: "VIDEO_DEVICE_ACTION",
              enabled: true,
              actionConfig: [

                {
                  linkageVideoStrategyType: "REF_VIDEO",
                  code: "",
                  name: "",
                  token: "",
                  type: "VIDEOTAPE",
                  time: 30,
                  timeUnit: "SECOND",
                  executeMode: "AUTOMATIC",
                },
              ],
            },
          ],
        };

        let flagctrue = true
        for (let i = 0; i < params.emergencyRuleConditionCommands.length; i++) {
          if (params.emergencyRuleConditionCommands[i].emergencyRuleConditionExpCommands[0].startDelayTime !== null) {
            if (params.emergencyRuleConditionCommands[i].emergencyRuleConditionExpCommands[0].endDelayTime == null) {
              flagctrue = false
            }
          }
          if (params.emergencyRuleConditionCommands[i].emergencyRuleConditionExpCommands[0].endDelayTime !== null) {
            if (params.emergencyRuleConditionCommands[i].emergencyRuleConditionExpCommands[0].startDelayTime == null) {
              flagctrue = false
            }
          }


        }
        if (!flagctrue) {
          proxy.$message.error("延迟报警时间不能为空");
          flagctrue = true
          loading.value = false
          return
        }

        if (params.rulePeriodTimed) {
          let flag = true
          let timelist = params.emergencyRuleTimeCommands
          for (let i = 0; i < timelist.length; i++) {
            if (timelist[i].startTime == '' || timelist[i].endTime == '' || timelist[i].startTime == null || timelist[i].endTime == null) {
              flag = false
            }

          }
          if (!flag) {
            loading.value = false
            flag = true
            proxy.$message.error("请完整填写配置生效时段");
            return
          }
        }
        if (!flag.value && alarmRules.value.alarmRulesConfig
          .emergencyRuleConditionDeviceCommands.length == 0) {
          loading.value = false
          proxy.$message.error("请选择设备");
          return
        }
        if (alarmLength.indexOf(0) == -1) {
          if (params.id) {
            try {
              const data = await proxy.$api.editPlanRules(params);
              loading.value = false;
              proxy.$message.success("修改成功");
              goBack();
            } catch (error) {
              loading.value = false;
            }
          } else {
            try {
              const data = await proxy.$api.addPlanRules(params);
              loading.value = false;
              proxy.$message.success("设置成功");
              goBack();
            } catch (error) {
              loading.value = false;
            }
          }
        }else{
          proxy.$message.warning("请选择通知人员");
          loading.value = false;
        }
      });
    };
    return {
      ...toRefs(state),
      afterGet,
      loading,
      timeUnit: [
        {
          label: "分钟",
          value: "MINUTE",
        },
        {
          label: "小时",
          value: "HOUR",
        },
      ],
      alarmRulesBuss,
      flag,
      goBack,
      saveRecord,
      actionConfig,
      type,
      formData,
      alarmRules,
      alarmNotice,
      messageNotice,
      deviceLinkage,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-form-item-control-input) {
  width: 300px;
}

.item-title {
  width: 100%;
  padding-top: 16px;
  font-family: "PingFang SC-Medium";
  font-weight: 500;
  font-size: 16px;
}
</style>
