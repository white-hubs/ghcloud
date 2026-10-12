<template>
  <g-layout :title="pageTitle">
    <template #content-table>
      <div class="detail-form">
        <div class="item-title">委外维修单</div>
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
      activeKey: "MAINTAIN_OUTSOURCE_REPAIR_DISTRIBUTED",
      panelList: [
        {
          key: "MAINTAIN_OUTSOURCE_REPAIR_DISTRIBUTED",
          tab: "接收工单",
        },
        { key: "MAINTAIN_OUTSOURCE_REPAIR_SOLVE", tab: "处理工单" },
        { key: "MAINTAIN_OUTSOURCE_REPAIR_CONFIRM", tab: "待确认" },
        { key: "MAINTAIN_OUTSOURCE_REPAIR_RECEIVED", tab: "已接收" },
        { key: "MAINTAIN_OUTSOURCE_REPAIR_HANDLED", tab: "已处理" },
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
      state.activeKey = "MAINTAIN_OUTSOURCE_REPAIR_DISTRIBUTED";
      const result = await proxy.$api.batchSatMsgConfigList("get", {
        codes:
          "MAINTAIN_OUTSOURCE_REPAIR_DISTRIBUTED,MAINTAIN_OUTSOURCE_REPAIR_SOLVE,MAINTAIN_OUTSOURCE_REPAIR_CONFIRM,MAINTAIN_OUTSOURCE_REPAIR_RECEIVED,MAINTAIN_OUTSOURCE_REPAIR_HANDLED",
      });
      // const result = false;
      if (!result.length) {
        state.method = "post";
        for (let i of state.panelList) {
          if (i.key === "MAINTAIN_OUTSOURCE_REPAIR_DISTRIBUTED") {
            let merchantContent =
              await "${userName}您好，您有一条来自${tenantName}的委外维修工单，请点击下面的链接确认接收该工单：${address}";
            state.model[i.key] = [
              {
                satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                effectiveDays: 30, //有效天数
                name: "通知委外公司责任人", // 通知方选项名称
                notifyExpression: "",
                enabled: false, //选中状态
                channelParams: [], //通知方式
                satMsgChannelConfigModifyParams: [], //通知方式
                msgTmpContent: merchantContent, //模板内容
                noticeMethod: await getSceneNotificationMethod(i.key),
              },
            ];
          } else if (i.key === "MAINTAIN_OUTSOURCE_REPAIR_SOLVE") {
            let merchantContent =
              await "${userName}您好，您有一条来自${tenantName}的委外维修工单，请点击下面的链接进行处理结果提交：${address}";
            state.model[i.key] = [
              {
                satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                effectiveDays: 30, //有效天数
                name: "通知工单处理人", // 通知方选项名称
                notifyExpression: "",
                enabled: false, //选中状态
                channelParams: [], //通知方式
                satMsgChannelConfigModifyParams: [], //通知方式
                msgTmpContent: merchantContent, //模板内容
                noticeMethod: await getSceneNotificationMethod(i.key),
              },
            ];
          } else if (i.key === "MAINTAIN_OUTSOURCE_REPAIR_CONFIRM") {
            let merchantContent =
              await "您有一条来自${outsourceEvent}${outsourceName}的确认事项，请及时处理";
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
          } else if (i.key === "MAINTAIN_OUTSOURCE_REPAIR_RECEIVED") {
            let merchantContent =
              await "您好，来源于${outsourceEvent}，名称为：${outsourceName}已被${userName}接受，处理结果为：${handleResult}";
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
          } else if (i.key === "MAINTAIN_OUTSOURCE_REPAIR_HANDLED") {
            let merchantContent =
              await "您好，来源于${outsourceEvent}，名称为：${outsourceName}已被${userName}处理完成，处理结果为：${handleResult}";
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
              name: "通知委外公司责任人",
              channelParams: j.satMsgChannelConfigVOS.map((item) => {
                return `${item.terminal}&${item.channelType}&${item.terminalName}`;
              }),
              satMsgChannelConfigModifyParams: [],
              noticeMethod:await getSceneNotificationMethod(i),
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
