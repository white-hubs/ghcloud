<template>
  <a-space :size="8" align="start" v-if="show">
    <g-select :disabled="type == 'detail' ? true : false" url="getDeviceTypsList" :showSearch="true" :allowClear="false"
      v-model:value="initConfig.deviceGenreId" placeholder="请选择设备类型" style="width: 160px"
      @changeCheck="changeDeviceType"></g-select>
    <g-select :disabled="type == 'detail' ? true : false" :options="deviceModelList" :allowClear="false"
      v-model:value="initConfig.deviceModelId" placeholder="请选择设备型号" style="width: 160px"
      @changeCheck="changeDeviceModel"></g-select>
    <g-select :disabled="type == 'detail' ? true : false" :options="attributeType" :allowClear="false"
      :field="{ value: 'value', label: 'label' }" v-model:value="initConfig.conditionType" placeholder="请选择条件类型"
      style="width: 160px"></g-select>
    <div v-if="initConfig.conditionType === 'CUSTOM_RULE_CONDITION'">
      <a-space :size="8" direction="vertical">
        <div class="flex-start" v-for="(element, j) in initConfig.emergencyRuleConditionExpCommands" :key="j">
          <a-space :size="8">
            <g-select :disabled="type == 'detail' ? true : false" :options="deviceAttribute"
              :field="{ code: 'value', name: 'label' }" :allowClear="false" v-model:value="element.propCode"
              placeholder="请选择设备属性" style="width: 160px" @changeCheck="
                (value, option) => changeDeviceAttribute(value, option, j)
              "></g-select>
            <g-select :disabled="type == 'detail' ? true : false" :options="comparator"
              :field="{ value: 'value', label: 'label' }" :allowClear="false" v-model:value="element.op"
              placeholder="比较操作" style="width: 160px"></g-select>
            <a-input :disabled="type == 'detail' ? true : false" v-model:value="element.oprand" placeholder="请输入属性值"
              style="width: 160px"></a-input>
            <a-input :disabled="type == 'detail' ? true : false" v-model:value="element.delayTime" placeholder="状态持续时延"
              addon-after="秒" style="width: 160px"></a-input>
            <a-button v-if="j > 0 && type !== 'detail'" type="link" danger :key="'element_' + j"
              @click="removeAttribute(j)">
              删除
            </a-button>
          </a-space>
          <a-button v-if="j == 0 && type !== 'detail'" type="link" @click="addAttribute(item)">
            添加
          </a-button>
        </div>
      </a-space>
    </div>
    <div style="display: flex" v-if="initConfig.conditionType === 'DEVICE_EVENT_CONDITION'">
      <a-select :disabled="type == 'detail' ? true : false" :options="deviceModelEvent" :allowClear="false"
        v-model:value="initConfig.deviceEventCode" placeholder="请选择设备事件" @change="changeEvent"
        style="width: 160px; height: 32px"></a-select>
       
      <div style="display:flex;align-items:center">
        <div style="width:160px;margin-left:5px">延时报警:</div>
      <a-input-number  style="width:80px;" placeholder='延时报警开始' v-model:value="initConfig.emergencyRuleConditionExpCommands[0].startDelayTime"></a-input-number>
      -<a-input-number style="width:80px;" placeholder='延时报警结束' v-model:value="initConfig.emergencyRuleConditionExpCommands[0].endDelayTime"
      :min='initConfig.emergencyRuleConditionExpCommands[0].startDelayTime+1'
      ></a-input-number>
      <div style="width:80px;margin-left:5px">分钟</div>
      </div>
  
      <div v-if="initConfig.deviceEventType == 'WRITE_ABLE'">
        <div class="flex-start attrabuit-item" v-for="(item, index) in initConfig.emergencyRuleConditionExpCommands"
          :key="index">
          <div style="width: 120px">{{ item.propName }}：</div>
          <a-input :disabled="type == 'detail' ? true : false" v-model:value="item.oprand" placeholder="请输入写入值"></a-input>
        </div>
      </div>
    </div>
  </a-space>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { attributeType, comparator } from "@/utils/enumerate";
import { useRoute } from "vue-router";
export default defineComponent({
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const { type } = route.query;
    const show = ref(false);
    const state = reactive({
      deviceModelList: [],
      deviceAttribute: [],
      deviceModelEvent: [],
      initConfig: {},
    });
    onMounted(async () => {
      state.initConfig = props.config;
      //   show.value = false;
      if (state.initConfig.deviceGenreId) {
        await getDeviceModel(state.initConfig.deviceGenreId);

        if (!state.initConfig.deviceModelId) {
          show.value = true;
        }
      } else {
        show.value = true;
      }
      if (state.initConfig.deviceModelId) {
        await getModelAttribute(state.initConfig.deviceModelId);
        await deviceModelEventList(state.initConfig.deviceModelId);
        show.value = true;
      } else {
        show.value = true;
      }
    });
    // 选择设备类型
    const changeDeviceType = (value, option) => {
      getDeviceModel(value);
      state.initConfig.deviceGenreName = option.label;
      state.initConfig.deviceModelId = null;
      state.initConfig.deviceModelName = null;
      state.initConfig.conditionType = null;
      state.initConfig.deviceEventCode = null;
      state.initConfig.deviceEventName = null;
      state.initConfig.emergencyRuleConditionExpCommands = [
        {
          propCode: null,
          propName: null,
          propUnit: null,
          op: null,
          oprand: null,
          delayTime: null,
          startDelayTime: null,
          endDelayTime: null
        },
      ];
    };
    // 获取设备型号

    const getDeviceModel = value => {
      return new Promise(async resove => {
        const data = await proxy.$api.getDeviceModelList({ genreId: value });

        resove(true);
        if (data) {
          state.deviceModelList = data;
        }
      });
    };
    // 选择设备型号
    const changeDeviceModel = (value, option) => {
      getModelAttribute(value);
      deviceModelEventList(value);
      state.initConfig.deviceModelName = option.label;
      state.initConfig.conditionType = null;
      state.initConfig.deviceEventCode = null;
      state.initConfig.deviceEventName = null;
      state.initConfig.deviceEventType = null;
      state.initConfig.emergencyRuleConditionExpCommands = [
        {
          propCode: null,
          propName: null,
          propUnit: null,
          op: null,
          oprand: null,
          delayTime: null,
          startDelayTime: null,
          endDelayTime: null
        },
      ];
    };
    // 获取设备型号下的属性
    const getModelAttribute = async value => {
      return new Promise(async resove => {
        const data = await proxy.$api.getModelAttribute({ modelId: value });
        resove();
        if (data) {
          state.deviceAttribute = data;
        }
      });
    };
    // 获取物联设备事件下面属性
    const deviceModelEventList = async value => {
      return new Promise(async resove => {
        const data = await proxy.$api.deviceModelEventList({ modelId: value });
        resove();
        if (data) {
          state.deviceModelEvent = data.map(item => {
            return { ...item, label: item.name, value: item.code };
          });
        }
      });
    };
    // 选择设备属性
    const changeDeviceAttribute = (value, option, j) => {
      state.initConfig.emergencyRuleConditionExpCommands[j] = {
        propCode: value,
        propName: option.label,
        propUnit: null,
        op: null,
        oprand: null,
        delayTime: null,
        startDelayTime:null,
          endDelayTime:null
      };
    };
    const changeEvent = (value, option) => {
      state.initConfig.deviceEventName = option.name;
      state.initConfig.deviceEventType = option.eventType;
      if (option.eventType == "WRITE_ABLE") {
        state.initConfig.emergencyRuleConditionExpCommands =
          option.relatedProps.map(item => {
            return {
              propCode: item.propCode,
              propName: item.propName,
              propUnit: null,
              op: null,
              oprand: item.propValue,
              delayTime: null,
              startDelayTime: item.startDelayTime,
              endDelayTime: item.endDelayTime
            };
          });
      }
    };
    const addAttribute = () => {
      state.initConfig.emergencyRuleConditionExpCommands.push({
        propCode: null,
        propName: null,
        propUnit: null,
        op: null,
        oprand: null,
        delayTime: null,
        startDelayTime:null,
          endDelayTime:null
      });
    };
    const removeAttribute = j => {
      state.initConfig.emergencyRuleConditionExpCommands.splice(j, 1);
    };
    return {
      show,
      ...toRefs(state),
      changeDeviceType,
      changeDeviceModel,
      changeDeviceAttribute,
      removeAttribute,
      addAttribute,
      changeEvent,
      attributeType: attributeType,
      comparator: comparator,
      type,
    };
  },
});
</script>

<style>
.attrabuit-item {
  margin-bottom: 8px;
  margin-left: 8px;
}
</style>
