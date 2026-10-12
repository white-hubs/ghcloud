<template>
 <div class="config">
    <div class="row">
      <a-form-item label="报警通知">
        <a-button
          type="primary"
          @click="addAlarmNoticeConfig"
          v-if="type != 'detail'"
        >
          添加
          <PlusOutlined />
        </a-button>
      </a-form-item>
      <a-form-item
        v-for="(item, index) in alarmNoticeConfig.actionConfig
          .targetModifyParams"
        :key="item.id"
      >
        <a-space :size="8">
          <noticeSelect
            v-model:value="
              alarmNoticeConfig.actionConfig.targetModifyParams[index]
            "
            :config="item"
          ></noticeSelect>
          <a-button
            v-if="type != 'detail'"
            type="link"
            danger
            @click="remove(item)"
          >
            删除
          </a-button>
        </a-space>
      </a-form-item>
      <a-form-item v-if="feature?.usePersonal">
        <a-checkbox
          :disabled="type == 'detail' ? true : false"
          v-model:checked="alarmNoticeConfig.actionConfig.dutyUser"
        >
          是否仅指派给当班人员
        </a-checkbox>
      </a-form-item>
    </div>
  </div>

 
</template>

<script>
import { defineComponent, reactive, toRefs, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import noticeSelect from './gNoticeSelect.vue'
import { useRoute } from "vue-router";

export default defineComponent({
  components: { PlusOutlined , noticeSelect},
  props: ["actionConfig"],
  setup(props) {
    const route = useRoute();
    const { type } = route.query;
    const state = reactive({
      alarmNoticeConfig: {
        actionType: "ALARM_NOTIFY_ACTION",
        enabled: true,
        actionConfig: {
          dutyUser: false,
          targetModifyParams: [],
        },
      },
      feature:window.config.feature
    });
    watch(
      () => props.actionConfig,
      value => {
        if (value) {
          let newData = JSON.parse(JSON.stringify(props.actionConfig));
          let newArr = newData.actionConfig.targetModifyParams.map(res => {
            res.id = guid();
            return res;
          });

          state.alarmNoticeConfig = newData;
        }
      },
    );
    const addAlarmNoticeConfig = () => {
      state.alarmNoticeConfig.actionConfig.targetModifyParams.push({
        id: guid(),
        messageTargetNotify: null,
        targetConfig: [],
      });
    };
    const remove = index => {
      // delete state.alarmNoticeConfig.actionConfig.targetModifyParams[index];
      let inx =
        state.alarmNoticeConfig.actionConfig.targetModifyParams.findIndex(
          res => {
            return index.id == res.id;
          },
        );

      state.alarmNoticeConfig.actionConfig.targetModifyParams.splice(inx, 1);
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
      addAlarmNoticeConfig,
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