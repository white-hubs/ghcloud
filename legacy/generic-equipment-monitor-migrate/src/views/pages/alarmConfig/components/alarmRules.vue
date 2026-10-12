<template>
  <div class="config">
    <div class="row">
      <a-form-item label="触发条件">
        <a-button type="primary" @click="addAlarmRulesConfig" v-if="type !== 'detail'">
          添加
          <PlusOutlined />
        </a-button>
      </a-form-item>
      <a-form-item label="报警规则" v-for="(item, index) in alarmRulesConfig.emergencyRuleConditionCommands" :key="item.id">
        <rules-item v-model:value="alarmRulesConfig.emergencyRuleConditionCommands[index]" :config="item"></rules-item>
        <a-button v-if="type !== 'detail'" type="link" danger @click="remove(item,index)" :key="item.id">
          删除
        </a-button>
      </a-form-item>
      <a-form-item label="配置生效时段">
        <a-switch :disabled="type == 'detail' ? true : false" v-model:checked="alarmRulesConfig.rulePeriodTimed"></a-switch>

      </a-form-item>
      <div v-for="(item,index) in alarmRulesConfig.emergencyRuleTimeCommands">
        <div style="margin-top:10px;margin-bottom:10px">
          <a-time-picker :disabled="type == 'detail' ? true : false" v-model:value="item.startTime" format='HH:ss' value-format='HH:ss'
            @change="changestart($event,index)"></a-time-picker>
          -
          <a-time-picker :disabled="type == 'detail' ? true : false" v-model:value="item.endTime" format='HH:ss' value-format='HH:ss'
            @change="changeend($event,index)"></a-time-picker>
          <PlusCircleOutlined v-if="index==0" style='color:#ccc;margin-left:10px;cursor: pointer;' @click="addtime" />
          <DeleteOutlined v-if="index!=0" style='color:red;margin-left:10px;cursor: pointer;'
            @click="deletetime(index)" />

        </div>


      </div>
      <a-form-item label="报警设备">
        <a-button type="primary" @click="addDevice" v-if="type !== 'detail'">
          添加
          <PlusOutlined />
        </a-button>
      </a-form-item>
      <a-table :columns="columns" :data-source="selectedRows" size="small">
        <template #action="{ record }" v-if="type !== 'detail'">
          <a-button type="link" danger @click="removeDevice(record)">
            删除
          </a-button>
        </template>
      </a-table>
    </div>
    <modal-table :title="modal.title" :columns="modal.columns" :searchLength="2" :search="modal.search" :url="modal.url"
      :params="{applicationCode:applicationCode}" rowKey="deviceId" :beforeGet="beforeGet" selectType="checkbox"
      :selectedKeys="selectedKeys" :selectedRows="selectedRows" v-model:value="modal.visible" :width="modal.width"
      @modal-save="modalSave"></modal-table>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import replaceObjectKeys from "@pansy/replace-object-keys";
import { PlusOutlined, PlusCircleOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import rulesItem from "./rulesItem.vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
export default defineComponent({
  components: { PlusOutlined, rulesItem, DeleteOutlined, PlusCircleOutlined },
  props: ["actionConfig", "applicationCode"],
  setup(props) {
    const route = useRoute();
 
    const { type } = route.query;
    const state = reactive({
      alarmRulesConfig: {
        rulePeriodTimed: false,
        emergencyRuleTimeCommands: [{
          startTime: '',
          endTime: ''
        }
        ],
        emergencyRuleConditionCommands: [],
        emergencyRuleConditionDeviceCommands: [],
      },
      columns: [
        {
          dataIndex: "name",
          title: "序号",
          slots: {
            customRender: "name",
          },
          customRender: ({ text, record, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "genreName",
          title: "设备类型",
        },
        {
          dataIndex: "modelName",
          title: "设备型号",
        },
        {
          dataIndex: "area",
          title: "所属区域",
        },
      ],
      modal: {
        title: "选择设备",
        columns: [
          {
            dataIndex: "code",
            title: "设备编码",
          },
          {
            dataIndex: "deviceName",
            title: "设备名称",
          },
          {
            dataIndex: "brandName",
            title: "设备品牌",
          },
          {
            dataIndex: "modelName",
            title: "设备型号",
          },
        ],
        search: [
          {
            label: "区域",
            value: "areaId",
            component: "g-cascader",
            url: "getAreaList",
            field: { id: "value", name: "label", children: "children" },
          },
          { label: "", value: "keyword", placeholder: "设备名称" },
        ],
        url: "getSecurityDevicePage",
        visible: false,
        width: 1060,
      },
      selectedKeys: [],
      selectedRows: [],
    });
    onMounted(() => {
      if (type !== "detail") {
        state.columns.push({
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        });
      }
    });
    watch(
      () => props.actionConfig,
      value => {
        if (value) {
          state.alarmRulesConfig = value;
          state.selectedKeys = value.emergencyRuleConditionDeviceCommands.map(
            item => item.deviceId,
          );
          state.selectedRows = replaceObjectKeys(
            value.emergencyRuleConditionDeviceCommands,
            {
              id: guid(),
              deviceName: "deviceName",
              deviceId: "deviceId",
              deviceGenreId: "genreId",
              deviceGenreName: "genreName",
              deviceModelId: "modelId",
              deviceModelName: "modelName",
              deviceAreaId: "areaId",
              deviceAreaName: "area",
            },
          );
        }
      },
    );
    const beforeGet = record => {
      if (record.areaId instanceof Array && record.areaId.length) {
        record.areaId = record.areaId[record.areaId.length - 1];
      }
      return record;
    };
    // 添加条件组
    const addAlarmRulesConfig = () => {
      state.alarmRulesConfig.emergencyRuleConditionCommands.push({
        id: guid(),
        deviceGenreId: null,
        deviceGenreName: null,
        deviceModelId: null,
        deviceModelName: null,
        conditionType: null,
        deviceEventCode: null,
        deviceEventName: null,
        deviceEventType: null,
        emergencyRuleConditionExpCommands: [
          {
            propCode: null,
            propName: null,
            propUnit: null,
            op: null,
            oprand: null,
            delayTime: null,
          },
        ],
      });
    };
    // 删除条件组
    const remove = (item, index) => {
      let inx = state.alarmRulesConfig.emergencyRuleConditionCommands.findIndex(res => {
        return item.id == res.id;
      });

      // state.messageNoticeConfig.actionConfig.splice(inx, 1);
      state.alarmRulesConfig.emergencyRuleConditionCommands.splice(inx, 1);
    };

    // 添加设备
    const addDevice = () => {
      state.modal.visible = true;
    };
    // 移除设备
    const removeDevice = record => {
      state.alarmRulesConfig.emergencyRuleConditionDeviceCommands =
        state.alarmRulesConfig.emergencyRuleConditionDeviceCommands.filter(
          item => item.deviceId !== record.deviceId,
        );
      state.selectedKeys = state.selectedKeys.filter(
        item => item !== record.deviceId,
      );
      state.selectedRows = state.selectedRows.filter(
        item => item.deviceId !== record.deviceId,
      );
    };
    const modalSave = (selectedIds, selectItems) => {
      state.modal.visible = false;
      state.selectedKeys = selectedIds;
      state.selectedRows = selectItems;
      state.alarmRulesConfig.emergencyRuleConditionDeviceCommands =
        selectItems.map(item => {
          return {
            deviceGenreId: item.genreId,
            deviceGenreName: item.genreName,
            deviceModelId: item.modelId,
            deviceModelName: item.modelName,
            deviceId: item.deviceId,
            deviceName: item.deviceName,
            deviceAreaId: item.areaId,
            deviceAreaName: item.area,
          };
        });
    };
    const guid = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        },
      );
    };
    const addtime = () => {
      state.alarmRulesConfig.emergencyRuleTimeCommands.push({
        startTime: '',
        endTime: ''
      })
    }
    const deletetime = (index) => {
      state.alarmRulesConfig.emergencyRuleTimeCommands.splice(index, 1)
    }
    const changestart = (value, index) => {
      let datatime = value.split(':')[0] + value.split(':')[1]
      let endtime = state.alarmRulesConfig.emergencyRuleTimeCommands[index].endTime
      if (endtime !== '') {
        if (datatime > endtime.split(':')[0] + endtime.split(':')[1]) {
          message.error('开始时间不能大于结束时间')
          state.alarmRulesConfig.emergencyRuleTimeCommands[index].startTime=''
        }
      }



    }
    const changeend = (value,index) => {
      let datatime = value.split(':')[0] + value.split(':')[1]
      let startTime = state.alarmRulesConfig.emergencyRuleTimeCommands[index].startTime
      if (startTime !== '') {
        if (datatime < startTime.split(':')[0] + startTime.split(':')[1]) {
          message.error('结束时间不能小于开始时间')
          state.alarmRulesConfig.emergencyRuleTimeCommands[index].endTime=''
        }
      }
    }
    return {
      changeend,
      changestart,
      guid,
      ...toRefs(state),
      addAlarmRulesConfig,
      remove,
      addDevice,
      deletetime,
      addtime,
      removeDevice,
      modalSave,
      type,
      beforeGet,
    };
  },
});
</script>

<style lang="less" scoped>
.config {
  width: 100%;
}

.row {
  width: 100%;

  :deep(.ant-form-item) {
    width: 100% !important;
  }

  :deep(.ant-form-item-control-input) {
    width: 100%;
  }
}
</style>
