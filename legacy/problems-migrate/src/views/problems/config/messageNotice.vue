<template>
  <g-layout :title="pageTitle">
    <template #content-table>
      <div class="detail-form">
        <div class="item-title">隐患通知</div>
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
<script lang="jsx">
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
import { usePageName } from '@ghcloud/cube-utils'

import { cubeMessageCenterService } from "@/api/service";
export default defineComponent({
  components: {
    satMsgConfigCheckBox,
  },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy, ctx } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const satMsgConfigCheckBox = ref();

    const state = reactive({
      model: {
        // id: "",
      },
      method: "",
      activeKey: "MAINTAIN_HIDDENDANGER_MSG_CONFIRM",
      panelList: [
        { key: "MAINTAIN_HIDDENDANGER_MSG_CONFIRM", tab: "隐患待确认" },
        { key: "MAINTAIN_HIDDENDANGER_MSG_CLOSE", tab: "隐患待关闭" },
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
    const getSceneNotificationMethod = async (code) => {
     return await cubeMessageCenterService.sceneNotificationMethod(code)
    }
    const getData = async () => {
      state.activeKey = "MAINTAIN_HIDDENDANGER_MSG_CONFIRM";
      const result = await proxy.$api.batchSatMsgConfigList("get", {
        codes:
          "MAINTAIN_HIDDENDANGER_MSG_CONFIRM,MAINTAIN_HIDDENDANGER_MSG_CLOSE",
      });
      if (!result.length) {
        state.method = "post";
        for (let i of state.panelList) {
          if (i.key === "MAINTAIN_HIDDENDANGER_MSG_CONFIRM") {
            let merchantContent =
              await "您有一条来源于${hiddenDangerEvent}${hiddenDangerName}的确认事项，请及时处理";
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
                noticeMethod: await getSceneNotificationMethod(i.key),
              },
            ];
          } else if (i.key === "MAINTAIN_HIDDENDANGER_MSG_CLOSE") {
            let merchantContent =
              await "您有一条来源于${hiddenDangerEvent}${hiddenDangerName}的关闭事项，请及时处理";
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
                noticeMethod: await getSceneNotificationMethod(i.key),
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
              noticeMethod: await getSceneNotificationMethod(i),
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
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
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
