<template>
  <g-layout title="消息配置">
    <template #content-table>
      <a-tabs default-active-key="TASK_BACKLOG">
        <a-tab-pane :key="item.key" :tab="item.tab" v-for="(item, index) in panelList">
          <div v-for="(ele, idx) in model[item.key]" :key="idx">
            <msgFormVue :model="ele" :ref="(el) => setRef(el, index, idx)"
              @changeItem="(e) => (ele.enabled = e.length ? true : false)" :noticeMethod="ele.noticeMethod"></msgFormVue>
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template #footer-page>
      <a-button type="primary" @click="submit" :loading="loading">保存</a-button>
    </template>
  </g-layout>
</template>

<script>
import _ from "lodash";
import msgFormVue from "./msgForm.vue";
export default {
  components: { msgFormVue },
  data() {
    return {
      model: {
        TASK_BACKLOG: [
          {
            "id": "1587325657543680003",
            "satMsgDefineId": null,
            "notifyExpression": "",
            "satMsgDefineCode": "TASK_BACKLOG",
            "effectiveDays": 30,
            "enabled": true,
            "msgTmpId": "1587325657543680002",
            "msgTmpContent": "（${startUser}）提交的（${formName}）审批信息，请及时处理",
            "satMsgChannelConfigVOS": [
              {
                "channelType": "CHANNEL_SITE",
                "terminal": "bimops-manage-web",
                "terminalName": "常德高铁站web",
                "channelTmpId": "",
                "content": ""
              }
            ],
            "name": "",
            "channelParams": [
              "bimops-manage-web&CHANNEL_SITE&常德高铁站web"
            ],
            "satMsgChannelConfigModifyParams": [],
            "noticeMethod": [
              {
                "value": "CHANNEL_SMS",
                "label": "短信",
                "terminal": "",
                "terminalName": ""
              },
              {
                "value": "CHANNEL_SITE",
                "label": "PC站内",
                "terminal": "bimops-manage-web",
                "terminalName": "常德高铁站web"
              },
              {
                "value": "CHANNEL_SITE",
                "label": "APP站内",
                "terminal": "bimops-manage-app",
                "terminalName": "常德高铁站app"
              },
              {
                "value": "CHANNEL_APP",
                "label": "APP推送",
                "terminal": "bimops-manage-app",
                "terminalName": "常德高铁站app"
              }
            ]
          }
        ]
      },
      method: "",
      activeKey: "TASK_BACKLOG",
      panelList: [
        { key: "TASK_BACKLOG", tab: "消息通知" },
      ],
      loading: false,
      itemForm: [],
    };
  },
  methods: {
    handleClick() { },
    onSubmit() { },
    setRef(el, index, idx) {
      this.$nextTick(() => {
        if (index === 0) {
          this.itemForm[idx] = el;
        } else {
          const num = Math.pow(2, index);
          this.itemForm[num + idx] = el;
        }
      });
    },

    async getData() {
      this.activeKey = "TASK_BACKLOG";
      let result = await this.$restful("GET:/project-merchant/queryMessget?businessType&moduleType");
    },
    async submit() {
      this.loading = true;
      const data = await _.flattenDepth(_.values(this.model));
      for (let i of data) {
        if (i.channelParams.length) {
          for (let j of i.channelParams) {
            if (j) {
              const res = _.zipObject(["terminal", "channelType", "terminalName"], j.split("&"));
              i.satMsgChannelConfigModifyParams.push(res);
            }
          }
        }
      }
      await this.$restful(`${this.method}:/project-merchant/messget/insert`, { ...data })
    },
  },
  mounted() {
    this.getData();
  },
};
</script>

<style lang="less" scoped></style>
