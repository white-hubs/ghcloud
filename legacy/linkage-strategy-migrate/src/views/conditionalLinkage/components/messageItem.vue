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
              v-model:value="initConfig.notifyType" :options="timeModeList" :field="{ label: 'label', value: 'value' }"
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
import { defineComponent, onMounted, reactive, toRefs, getCurrentInstance ,computed} from "vue";
import { timeModeList } from "@/utils/enumerate";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons-vue";
import { useRoute } from "vue-router";
import { cubeMessageCenterService } from "@/api/service";
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
    const route = useRoute();
    const { type } = route.query;
    const { proxy } = getCurrentInstance();
    const state = reactive({
      timeModeList: timeModeList,
      initConfig: {},
      msgChannel: []
    });
       // 该通知下的通知方式
    const getReceive = async (activeKey) => {
      return cubeMessageCenterService.sceneNotificationMethod(activeKey)
    }
    const getMsgSceneData = async () => {
      const path=route.path;
      const code =path==='/conditionalLinkageEdit'?'LINKAGE_CONDITION_EVENT':path==='/sceneLinkageEdit'?'LINKAGE_SCENE_EVENT':path==='/timeLinkageEdit'?'LINKAGE_TIMING_EVENT':''
      state.msgChannel = await getReceive(code)
      state.initConfig = props.config;
    }
    const message2 = computed(() => {
      return window.config.feature?.message
    })
    onMounted(async () => {
      if (message2.value) {
       state.initConfig = props.config;
      }else{
       await getMsgSceneData()
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
