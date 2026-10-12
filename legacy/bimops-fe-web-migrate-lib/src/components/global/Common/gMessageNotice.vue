<template>
  <div class="config">
    <div class="item-title">
      <a-space :size="24">
        <span>消息抄送</span>
        <a-switch
          v-model:checked="messageNoticeConfig.enabled"
          :disabled="type == 'detail' ? true : false"
          checked-children="开"
          un-checked-children="关"
        />
      </a-space>
    </div>
    <div class="row">
      <a-form-item label="消息抄送">
        <a-button
          type="primary"
          @click="addMessageNoticeConfig"
          v-if="type !== 'detail'"
        >
          添加
          <PlusOutlined />
        </a-button>
      </a-form-item>
      <a-form-item
        v-for="(item, index) in messageNoticeConfig.actionConfig"
        :key="item.id"
      >
        <a-space :size="8">
          <message-item
            v-model:value="messageNoticeConfig.actionConfig[index]"
            :config="item"
          ></message-item>
          <a-button
            :disabled="type == 'detail' ? true : false"
            type="link"
            danger
            @click="remove(item)"
          >
            删除
          </a-button>
        </a-space>
      </a-form-item>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import messageItem from "./messageItem.vue";
import { useRoute } from "vue-router";
export default defineComponent({
  components: { PlusOutlined, messageItem },
  props: ["actionConfig"],
  setup(props) {
    const route = useRoute();
    const { type } = route.query;
    const state = reactive({
      messageNoticeConfig: {
        actionType: "MESSAGE_NOTIFY_ACTION",
        enabled: true,
        actionConfig: [],
      },
    });
    watch(
      () => props.actionConfig,
      value => {
        if (value) {
          let newData = JSON.parse(JSON.stringify(props.actionConfig));
          let newArr = newData.actionConfig.map(res => {
            res.id = guid();
            return res;
          });
          state.messageNoticeConfig = newData;
        }
      },
    );
    const addMessageNoticeConfig = () => {
      state.messageNoticeConfig.actionConfig.push({
        id: guid(),
        notifyType: null,
        duration: null,
        delayTimeUnit: "MINUTE",
        channelTypes: [],
        targetModifyParams: [],
      });
    };
    const remove = index => {
      let inx = state.messageNoticeConfig.actionConfig.findIndex(res => {
        return index.id == res.id;
      });
      state.messageNoticeConfig.actionConfig.splice(inx, 1);
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
    return {
      guid,
      ...toRefs(state),
      addMessageNoticeConfig,
      remove,
      type,
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
