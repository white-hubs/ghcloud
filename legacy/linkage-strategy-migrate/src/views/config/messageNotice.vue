<template>
  <g-layout :title="pageTitle">
    <template #content-table>
      <div class="detail-form">
        <div class="item-title">监管通知</div>
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane
            class="pt2"
            v-for="(item, index) in panelList"
            :key="item.key"
            :tab="item.tab"
          >
            <template v-for="(ele, idx) in model[item.key]" :key="idx">
              <satMsgConfigCheckBox
                :model="ele"
                :ref="(el) => setRef(el, index, idx)"
                @changeItem="(e) => (ele.enabled = e.length ? true : false)"
                :noticeMethod="ele.noticeMethod"
              ></satMsgConfigCheckBox>
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <template #footer-page>
      <a-button type="primary" @click="submit" :loading="loading"
        >保存</a-button
      >
    </template>
  </g-layout>
</template>
<script>
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  ref,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import satMsgConfigCheckBox from "./satMsgConfigCheckBox.vue";
import _ from "lodash";
import { cubeMessageCenterService } from "@/api/service";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {
    satMsgConfigCheckBox,
  },
  setup() {
    const { proxy, ctx } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const { pageTitle } = usePageName()
    const satMsgConfigCheckBox = ref();

    const state = reactive({
      model: {
        // id: "",
      },
      method: "",
      activeKey: "LINKAGE_CONDITION_EVENT",
      panelList: [
        { key: "LINKAGE_CONDITION_EVENT", tab: "条件联动" },
        { key: "LINKAGE_SCENE_EVENT", tab: "场景控制" },
        { key: "LINKAGE_TIMING_EVENT", tab: "定时策略" },
        // { key: "ONE_DEVICE_ALARM", tab: "设备报警通知" },
      ],
      loading: false,
    });

    const form = ref();

    let itemForm = ref([]);
    // let itemForm = ref({});

    const setRef = (el, index, idx) => {
      if (index === 0) {
        itemForm.value[idx] = el;
      } else {
        const num = Math.pow(2, index);
        itemForm.value[num + idx] = el;
      }
    };

    const getData = async () => {
      state.activeKey = "LINKAGE_CONDITION_EVENT";
      const result = await proxy.$api.batchSatMsgConfigList("get", {
        codes:
          "LINKAGE_CONDITION_EVENT,LINKAGE_SCENE_EVENT,LINKAGE_TIMING_EVENT",
      });
      // const result = false;
      if (!result.length) {
        state.method = "post";
        for (let i of state.panelList) {
          if (i.key === "LINKAGE_CONDITION_EVENT") {
            let merchantContent =
              await "${triggerTime}系统检测条件联动策略${eventName}符合触发条件，系统自动执行";
            state.model[i.key] = [
              {
                satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                effectiveDays: 30, //有效天数
                name: "", // 通知方选项名称
                notifyExpression: "",
                enabled: false, //选中状态
                channelParams: [], //通知方式
                satMsgChannelConfigModifyParams: [], //通知方式
                msgTmpContent: merchantContent, //模板内容
                noticeMethod: await getReceive(i.key),
              },
            ];
          } else if (i.key === "LINKAGE_SCENE_EVENT") {
            let merchantContent =
              await "${triggerTime}场景控制策略${eventName}被${operatorName}手动执行";
            state.model[i.key] = [
              {
                satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                effectiveDays: 30, //有效天数
                name: "", // 通知方选项名称
                notifyExpression: "",
                enabled: false, //选中状态
                channelParams: [], //通知方式
                satMsgChannelConfigModifyParams: [], //通知方式
                msgTmpContent: merchantContent, //模板内容
                noticeMethod: await getReceive(i.key),
              },
            ];
          } else if (i.key === "LINKAGE_TIMING_EVENT") {
            let merchantContent =
              await "${triggerTime}系统检测定时控制策略${eventName}符合触发条件，系统自动执行";
            state.model[i.key] = [
              {
                satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                effectiveDays: 30, //有效天数
                name: "", // 通知方选项名称
                notifyExpression: "",
                enabled: false, //选中状态
                channelParams: [], //通知方式
                satMsgChannelConfigModifyParams: [], //通知方式
                msgTmpContent: merchantContent, //模板内容
                noticeMethod: await getReceive(i.key),
              },
            ];
          }
        }
      } else {
        state.method = "put";
        const data = _.groupBy(result, "satMsgDefineCode");
        for (let i in data) {
          for (let j of data[i]) {
            Object.assign(j, {
              name: "",
              channelParams: j.satMsgChannelConfigVOS.map((item) => {
                return `${item.terminal}&${item.channelType}&${item.terminalName}`;
              }),
              satMsgChannelConfigModifyParams: [],
              noticeMethod: await getReceive(i),
            });
          }
        }
        state.model = data;
      }
    };

    const submit = async () => {
      state.loading = true;
      const data = await _.flattenDepth(_.values(state.model));
      for (let i of data) {
        if (i.channelParams.length) {
          for (let j of i.channelParams) {
            if (j) {
              const res = _.zipObject(
                ["terminal", "channelType", "terminalName"],
                j.split("&")
              );
              i.satMsgChannelConfigModifyParams.push(res);
            }
          }
        }
      }
      proxy.$api
        .satMsgConfig(state.method, {
          params: data,
        })
        .then(() => {
          proxy.$message.success("操作成功");
          getData();
          state.loading = false;
        })
        .catch(() => {
          getData();
          state.loading = false;
        });
    };
    // 该通知下的通知方式
    const getReceive = async (activeKey) => {
      return cubeMessageCenterService.sceneNotificationMethod(activeKey)
    }
    onMounted(() => {
      getData();
    });

    return {
      form,
      setRef,
      itemForm,
      satMsgConfigCheckBox,
      ...toRefs(state),
      submit,
      pageTitle
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
.detail-form {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  :deep(.ant-tabs-line) {
    height: calc(100% - 45px);
    .ant-tabs-top-content {
      height: calc(100% - 45px);
      .ant-tabs-tabpane-active {
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
:deep(.ant-form) {
  width: 100%;
  text-align: left;
}
</style>
