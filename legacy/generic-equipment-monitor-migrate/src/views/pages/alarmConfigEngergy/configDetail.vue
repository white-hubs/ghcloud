<template>
  <div class="ctr">
    <g-layout
      :title="
        type == 'edit'
          ? '报警配置-编辑'
          : type == 'detail'
          ? '报警配置-详情'
          : '报警配置-新增'
      "
    >
      <template #content-table>
        <g-detail-form
          ref="detailRef"
          :api="api"
          :formList="formList"
          :rules="rules"
          :afterGet="afterGet"
        >
          <template #alarmRule="{ record }">
            <!-- <div class="flex" :style="{ width: '100%', maxWidth: '300px' }"> -->
            <!-- minWidth: '180px', -->
            <g-select
              id="rulesSelector"
              :style="{
                width: '60% !important',
                maxWidth: '180px',
              }"
              v-model:value="record.alarmRule"
              :placeholder="'报警事件'"
              :options="options"
            ></g-select>
            <a-input
              :style="{ width: '40% !important', maxWidth: '120px' }"
              v-model:value="record.alarmValue"
              placeholder="数值"
              :maxlength="6"
              :suffix="
                record.alarmRule === 'zero_dosage_duration'
                  ? '小时'
                  : record.alarmRule === 'floating_toplimit'
                  ? '%'
                  : record.alarmRule==='rated_consumption'?dw
                  :''
              "
              @change="inputChange"
            ></a-input>
            <!-- <g-select
              id="rulesSelector"
              :style="{
                width: '20% !important',
                maxWidth: '180px',
              }"
              v-model:value="typeData"
              :placeholder="'类型'"
              :options="typeoptions"
              @change="typechange"
            ></g-select> -->
        
    
          </template>
          <template #edit-item>
            <div class="item-title flex-between">
              <span>报警仪表</span>
              <a-button type="primary" @click="addNoticeMode">
                添加能源仪表
              </a-button>
            </div>

            <div :style="{ width: '100%', padding: '0 16px' }">
              <a-table
                :columns="columns"
                :dataSource="energyTable"
                :pagination="true"
                :rowkey="'id'"
              >
                <template #action="{ record }">
                  <a-popconfirm
                    title="是否删除当前仪表？"
                    @confirm="delItem(record)"
                  >
                    <a class="abnormal">删除</a>
                  </a-popconfirm>
                </template>
              </a-table>
            </div>
            <div class="item-title">报警通知</div>
            <g-alarm-notice
              ref="alarmNotice"
              :actionConfig="actionConfig('ALARM_NOTIFY_ACTION')"
            ></g-alarm-notice>
            <!-- <div class="item-title">消息抄送</div> -->
            <g-message-notice
              ref="messageNotice"
              :actionConfig="actionConfig('MESSAGE_NOTIFY_ACTION')"
            ></g-message-notice>
          </template>
        </g-detail-form>
      </template>
      <template #footer-page>
        <a-button @click="goBack">返回</a-button>
        <a-button type="primary" @click="submit">保存</a-button>
      </template>
    </g-layout>
    <a-modal
      v-model:visible="visible"
      centered
      title="添加报警仪表"
      :width="900"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <s-table
        ref="tableRef"
        :api="modalApi"
        :columns="columnsModel"
        :search="searchInfo"
        :allowSelect="true"
        :btns="[]"
        :scrollX="600"
        :size="'small'"
        :showPage="true"
        :beforeGet="beforeGet"
      ></s-table>
    </a-modal>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  createVNode,
  onMounted,
  computed,
  reactive,
  nextTick,
  toRefs,
  watch,
  ref,
} from "vue";
import { useRouter, useRoute } from "vue-router";
// import alarmNotice from "./components/alarmNotice.vue";
// import messageNotice from "./components/messageNotice.vue";
import _ from "lodash";
export default defineComponent({
  components: {
    // alarmNotice,
    // messageNotice,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const searchInfo=ref([
        {
          label: "仪表类型",
          value: "instrumentType",
          component: "g-select",
          placeholder: "请选择",
          url: "meterType",
          field: {
            code: "value",
            name: "label",
          },
        },
        {
          label: "区域",
          value: "deviceAreaId",
          component: "g-cascader",
          placeholder: "请选择",
          url: "getAreaList",
          field: {
            code: "value",
            areaName: "label",
          },
        },
        {
          label: "",
          placeholder: "请输入名称",
          value: "keyword",
        },
      ])
    const { id, type } = route.query;
    const tableRef = ref();
    const typeData = ref('');
    const detailRef = ref();
    const alarmNotice = ref();
    const messageNotice = ref();
    const reg = /^((0{1}\.\d{1,2})|([1-9]\d*\.{1}\d{1,2})|([1-9]+\d*)|0)$/;
    const formRefList = ref([]);
    const setRefs = (el, index) => {
      formRefList.value[index] = el;
    };

    const state = reactive({
      configDetail: null,
      api: {
        detail: "alarmConfigId",
      },
      formList: [
        {
          title: "基础信息",
          form: [
            {
              label: "报警名称",
              value: "alarmName",
              placeholder: "报警名称",
              maxlength: 50,
            },
            {
              label: "报警级别",
              value: "levelConfig",
              placeholder: "报警级别",
              component: "g-select",
              url: "getAlarmLevels",
              field: {
                id: "value",
                name: "label",
              },
              labelInValue: true,
            },
            {
              label: "报警开关",
              value: "enabled",
              component: "a-switch",
              defaultValue: true,
            },
            { label: "报警事件", value: "alarmRule", slot: true },
          ],
        },
      ],
      options: [
        { name: "周期浮动上限超标", id: "floating_toplimit" },
        { name: "周期额定用量超标", id: "rated_consumption" },
        { name: "零用量持续时间过长", id: "zero_dosage_duration" },
      ],
      typeoptions: [
        { name: "电表", id: "kwh" },
        { name: "水表", id: "t" },
        { name: "气表", id: "m³" },
      ],
      columns: [
        {
          title: "编号",
          dataIndex: "code",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "名称",
          dataIndex: "deviceName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "类型",
          dataIndex: "instrumentName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "所属区域",
          dataIndex: "deviceArea",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },

        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      visible: false,
      //弹框表格属性
      columnsModel: [
        {
          title: "编号",
          dataIndex: "code",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "名称",
          dataIndex: "deviceName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "类型",
          dataIndex: "instrumentName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "所属区域",
          dataIndex: "deviceArea",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      search: [
        {
          label: "仪表类型",
          value: "instrumentType",
          component: "g-select",
          placeholder: "请选择",
          defaultValue:'',
          url: "meterType",
          field: {
            code: "value",
            name: "label",
          },
        },
        {
          label: "区域",
          value: "deviceAreaId",
          component: "g-cascader",
          placeholder: "请选择",
          url: "getAreaList",
          field: {
            code: "value",
            areaName: "label",
          },
        },
        {
          label: "",
          placeholder: "请输入名称",
          value: "keyword",
        },
      ],
      modalApi: {
        list: "meter",
      },
      energyTable: [],
      alarmList: [],
      noticeList: [],
      rules: {
        alarmName: [{ required: true, message: "请输入报警名称" }],
        levelConfig: [{ required: true, message: "请选择报警级别" }],
        enabled: [{ required: true, message: "请选择报警开关" }],
        alarmRule: [
          { required: true, message: "" },
          {
            validator(rule, value) {
              if (value && detailRef.value.form?.alarmValue) {
                if (!reg.test(detailRef.value.form?.alarmValue)) {
                  return Promise.reject("请输入正确数值(保留两位小数)");
                } else {
                  return Promise.resolve();
                }
              } else {
                if (!value) {
                  return Promise.reject("请选择报警事件");
                } else if (value && !detailRef.value.form?.alarmValue) {
                  return Promise.reject("请输入数值");
                }
              }
            },
          },
        ],
      },
      config: {
        basicModify: {
          id: "",
          code: "",
          name: "",
          applicationCode: "ENERGY_MANAGE", //应用编号
          applicationName: "能耗管理", //应用名称
          type: "ALARM_RULE",
          businessType: "ENERGY_ALARM",
          reiterated: false,
          repeatTime: "",
          repeatTimeUnit: "MINUTE",
          triggerLevelId: "",
          triggerTypeId: "",
          enabled: true,
        },
        linkageEmergencyActionModifies: [],
      },
      noticeLength: 0,
      model: {},
    });

    const goBack = () => {
      router.back(-1);
    };
    const afterGet = form => {
      state.energyTable = [];
      state.energyTable = form.meterDeviceList.map(item => {
        return { ...item, instrumentName: item.deviceType };
      });
      state.model = form;
      state.configDetail = form;
      return {
        ...form,
        levelConfig: {
          label: form.alarmLevelName,
          value: form.alarmLevel,
          key: form.alarmLevel,
        },
      };
    };
    const beforeGet = form => {
      return {
        ...form,
        deviceAreaId: form.deviceAreaId ? form.deviceAreaId.join("-") : "",
      };
    };
    const handleOk = () => {
      if (tableRef.value.selectedItems.length) {
        state.energyTable = _.cloneDeep(tableRef.value.selectedItems);
        handleCancel();
      } else {
        proxy.$message.success("请选择报警仪表");
      }
    };

    const handleCancel = async () => {
      tableRef.value.selectedKeys = [];
      state.visible = false;
    };

    const delItem = record => {
      state.energyTable = state.energyTable.filter(
        item => item.id !== record.id,
      );
      tableRef.value.selectedItems = state.energyTable;
      tableRef.value.selectedKeys = tableRef.value.selectedKeys.filter(
        item => item !== record.id,
      );
    };

    const submit = async () => {
      const res = await detailRef.value.formValidate();
      if (res) {
        const params = {
          alarmRulesBasicParam: {
            ...detailRef.value.form,
            alarmLevel: detailRef.value?.form?.levelConfig?.value,
            alarmLevelName: detailRef.value?.form?.levelConfig?.label,
            deviceIds: state.energyTable.map(item => item.id),
            messageId: state.model.messageId,
          },

          linkageEmergencyActionModifies: [
            alarmNotice.value.alarmNoticeConfig,
            messageNotice.value.messageNoticeConfig,
          ],
          basicModify: state.config.basicModify,
        };
        delete params.alarmRulesBasicParam.levelConfig;
        state.model?.id
          ? proxy.$api.alarmConfigId({ id: id, ...params }, "put").then(() => {
              proxy.$message.success("操作成功");
              goBack();
            })
          : proxy.$api.alarmConfigAdd(params, "post").then(() => {
              proxy.$message.success("操作成功");
              goBack();
            });
      }
    };

    const inputChange = () => {
      if (detailRef.value.form?.alarmRule) {
        detailRef.value.formValItem("alarmRule");
      }
    };
    const actionConfig = computed(() => key => {
      if (!state.configDetail) return false;
      let params;
      switch (key) {
        case "ALARM_NOTIFY_ACTION": //报警联动
          params = state.configDetail.emergencyActionVOS?.find(
            item => item.actionType === key,
          );
          break;
        case "MESSAGE_NOTIFY_ACTION": //消息联动
          params = state.configDetail.emergencyActionVOS?.find(
            item => item.actionType === key,
          );
          break;
        case "IOT_DEVICE_ACTION": //设备联动
          params = state.configDetail.emergencyActionVOS?.find(
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
            emergencyRuleConditionDeviceCommands:
              state.configDetail.emergencyRuleConditionDeviceCollectionVOS,
          };
          break;
      }
      return params;
    });
    onMounted(function(){});
    //点击新增的时候 增加一栏
    const addNoticeMode = () => {
      state.visible = true;
      nextTick(() => {
        tableRef.value.selectedKeys = state.energyTable.map(item => item.id);
        // tableRef.value.setSearch()
      });
    };

    watch(
      () => detailRef.value?.form,
      n => {
        state.config.basicModify.name = detailRef.value.form.alarmName;
        state.config.basicModify.triggerLevelId =
          detailRef.value.form.levelConfig?.value;
        state.config.basicModify.enabled = detailRef.value.form.enabled;
      },
      { deep: true },
    );
    const dw=ref()
const typechange=(value)=>{
  dw.value=value

  searchInfo.value=[
        {
          label: "仪表类型",
          value: "instrumentType",
          component: "g-select",
          placeholder: "请选择",
          defaultValue:dw.value=='t'?'water_meter':dw.value=='kwh'?'electricity_meter':'gas_meter',
          url: "meterType",
          field: {
            code: "value",
            name: "label",
          },
        },
        {
          label: "区域",
          value: "deviceAreaId",
          component: "g-cascader",
          placeholder: "请选择",
          url: "getAreaList",
          field: {
            code: "value",
            areaName: "label",
          },
        },
        {
          label: "",
          placeholder: "请输入名称",
          value: "keyword",
        },
      ]
    
     
}
    return {
      type,
      tableRef,
      detailRef,
      alarmNotice,
      actionConfig,
      messageNotice,
      ...toRefs(state),
      addNoticeMode,
      handleCancel,
      inputChange,
      handleOk,
      afterGet,
      delItem,
      setRefs,
      submit,
      goBack,
      beforeGet,
      typeData,
      dw,
      typechange,
      searchInfo
    };
  },
});
</script>

<style lang="less" scoped>
.item-title {
  width: 100%;
  padding-top: 16px;
  font-size: 16px;
  font-weight: 500;
  padding-right: 16px;
  font-family: "PingFang SC-Medium";
}
.ctr {
  width: 100%;
  height: 100%;
}
:deep(.detail-form) {
  .topLine {
    width: 100%;
    border-bottom: 1px solid #e8e8e88c;
  }
  .sub > .add-row > span {
    font-size: 16px;
    font-weight: 500;
  }
}
</style>
