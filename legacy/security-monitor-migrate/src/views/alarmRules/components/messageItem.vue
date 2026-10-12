<template>
  <div class="notice-item">
    <div class="notice-item-header">
      <a-space :size="0" align="center"> 
        <a-form-item label="通知方式">
          <a-select
            v-if="!message2"
              ref="select"
              :disabled="type == 'detail' ? true : false"
              v-model:value="initConfig.channelTypes" mode="multiple"
              :allowClear="false"
              style="width: 218px"
              :field="{ label: 'label', value: 'value' }" 
              :options="msgChannel"
            ></a-select>
          <g-select
             v-else
            :disabled="type == 'detail' ? true : false"
            :allowClear="false"
            v-model:value="initConfig.channelTypes"
            mode="multiple"
            url="getMsgChannelConfigs"
            :params="{ satMsgDefineCode: 'EMERGENCY_ALARM' }"
            :field="{ channelTypeName: 'label', channelType: 'value' }"
            style="width: 218px"
          ></g-select> 
        </a-form-item>
        <a-form-item label="通知时间点">
          <a-space :size="8" align="center">
            <g-select :disabled="type == 'detail' ? true : false" :allowClear="false"
              v-model:value="initConfig.notifyType" :options="notifyTypeList" :field="{ label: 'label', value: 'value' }"
              placeholder="请选择通知时间点" style="width: 160px"></g-select>
            <a-input :disabled="type == 'detail' ? true : false" v-if="
                initConfig.notifyType == 'DELAY_NOTIFY' ||
                initConfig.notifyType == 'TIMEOUT_NOTIFY'
              " v-model:value="initConfig.duration" addon-after="分钟" placeholder="请输入延时时长"></a-input>
          </a-space>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" size="small" shape="circle" @click="addNoticeTag" v-if="type !== 'detail'">
            <template #icon>
              <PlusOutlined />
            </template>
          </a-button>
        </a-form-item>
      </a-space>
    </div>
    <div class="notice-item-content">
      <a-form-item label="通知人员" v-for="(item, index) in initConfig.targetModifyParams" :key="index">
        <a-space :size="16">
          <g-notice-select v-model:value="initConfig.targetModifyParams[index]" :config="item"></g-notice-select>
          <a-button type="primary" size="small" shape="circle" @click="removeSelect(index)" v-if="type !== 'detail'">
            <template #icon>
              <MinusOutlined />
            </template>
          </a-button>
        </a-space>
      </a-form-item>
    </div>
  </div>
</template>

<script lang="jsx">
import { defineComponent,computed, onMounted, reactive, toRefs, getCurrentInstance } from "vue";
import { notifyTypeList } from "@/utils/enumerate";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons-vue";
import { useRoute } from "vue-router";
export default defineComponent({
  components: { PlusOutlined, MinusOutlined },
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  setup(props, { emit }) {
    const noticeMethod = [
      {
        value: "CHANNEL_SMS",
        label: "短信",
        terminal: "",
        terminalName: "",
      },
      {
        value: "CHANNEL_SITE",
        label: "站内消息",
        terminal: "bimops-manage-web",
        terminalName: "常德高铁站web",
      },
      // {
      //   value: "CHANNEL_SITE",
      //   label: "APP站内",
      //   terminal: "bimops-manage-app",
      //   terminalName: "常德高铁站app",
      // },
      {
        value: "CHANNEL_APP",
        label: "APP推送",
        terminal: "bimops-manage-app",
        terminalName: "常德高铁站app",
      },
      {
        value: "CHANNEL_VOICE",
        label: "语音通知",
        terminal: "bimops-manage-app",
        terminalName: "常德高铁站app",
      }
    ]
    const route = useRoute();
    const { type } = route.query;
    const { proxy } = getCurrentInstance();
    const state = reactive({
      notifyTypeList: notifyTypeList.filter(
        item => item.value !== "DELAY_NOTIFY",
      ),
      initConfig: {},
      msgChannel: []
    });
    const message2 = computed(() => {
      return window.config.feature?.message
    })
    const getMsgSceneData = () => {
      proxy.$api.getSceneReceive(`${JSON.parse(sessionStorage.getItem('GH-currentApplication')).code}_EMERGENCY_ALARM`).then(res => {
        state.msgChannel =  noticeMethod.filter(item => res.channelCodes.some(channel => channel === item.value));
      state.initConfig = props.config;
      })
    }
    onMounted(() => {
      if (message2.value) {
       state.initConfig = props.config;
      }else{
        getMsgSceneData()
      }
    });
    const addNoticeTag = () => {
      state.initConfig.targetModifyParams.push({
        messageTargetNotify: null,
        targetConfig: [],
      });
    };
    const removeSelect = index => {
      state.initConfig.targetModifyParams.splice(index, 1);
    };
    return {
      ...toRefs(state),
      addNoticeTag,
      removeSelect,
      message2,
      type,
    };
  },
});
</script>

<style lang="less" scoped>
.notice-item {
  border: 1px solid #f0f0f0;
  padding: 0 8px;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 4px 0 4px;
    border-bottom: 1px solid #f0f0f0;
  }

  &-content {
    padding-top: 16px;
  }
}
</style>
