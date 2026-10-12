<template>
  <g-layout :title="pageTitle">
    <template #content-table>
      <div class="detail-form">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane class="pt2" v-for="(item, index) in panelList" :key="item.key" :tab="item.tab">
            <div class="addConfigBut">
              <span v-if="index===0">报警任务超时，提醒处理人员</span>
              <span v-else>预案文件到期后，发送消息提醒对应人员</span>
              <a-button type="primary" @click="addConfigEvent(item)" v-if="index===0">添加</a-button>
            </div>
            <div class="msgBox" v-for="(ele, idx) in model[item.key]" :key="idx">
              <satMsgConfigCheckBox :model="ele" :ref="(el) => setRef(el, index, idx)"
                v-if="item.key==='ALARM_TIMEOUT_NOTIFY'" @changeItem="(e) => (ele.enabled = e.length ? true : false)"
                :noticeMethod="ele.noticeMethod">
              </satMsgConfigCheckBox>
              <fileSatMsgConfigCheckBox v-model:model="model[item.key][idx]" :noticeMethod="ele.noticeMethod" v-else />
              <a-popconfirm title="确定要删除该条消息吗?" ok-text="是" cancel-text="否" @confirm="deleteConfigEvent(item.key,idx)">
                <a-button danger type="primary" v-show="idx!=0">删除</a-button>
              </a-popconfirm>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <template #footer-page>
      <a-button type="primary" @click="submit" :loading="loading">保存</a-button>
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
import { message } from 'ant-design-vue';
import satMsgConfigCheckBox from "./newSatMsgConfigCheckBox.vue";
import fileSatMsgConfigCheckBox from "./fileSatMsgConfigCheckBox.vue";
import _ from "lodash";
import { usePageName } from "@ghcloud/cube-utils"

import { cubeMessageCenterService } from "@/api/service";
export default defineComponent({
  components: {
    satMsgConfigCheckBox, fileSatMsgConfigCheckBox
  },
  setup() {
    const { proxy, ctx } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const businessType = ref('ALARM')
    const satMsgConfigCheckBox = ref();

    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      model: {},
      method: "",
      activeKey: "ALARM_TIMEOUT_NOTIFY",
      panelList: [
        { key: "ALARM_TIMEOUT_NOTIFY", tab: "报警任务超时" },
        { key: "EMERGENCY_FILE_EXPIRE_NOTIFY", tab: "文件到期提醒" },
      ],
      loading: false,
    });

    const form = ref();

    const flag = ref(true)
    let itemForm = ref([]);

    const setRef = (el, index, idx) => {
      if (index === 0) {
        itemForm.value[idx] = el;
      } else {
        const num = Math.pow(2, index);
        itemForm.value[num + idx] = el;
      }
    };
    const getData = async () => {
      state.model = {}
      let result = await proxy.$api.getConfigInfo("get", businessType.value);
      let merchantContent = "【报警时间】发生的【车辆违停】报警事件，将在【配置的通知条件（例：30分钟）】后超时，请及时处理";
      if (!result.length) {
        for (let i of state.panelList.filter(e => e.key === 'ALARM_TIMEOUT_NOTIFY')) {
          state.model[i.key] = [
            {
              satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
              effectiveDays: 30, //有效天数
              label: i.tab,
              name: "", // 通知方选项名称
              notifyExpression: "",
              notificationTime: 1,
              enabled: false, //选中状态
              channelParams: [], //通知方式
              msgTmpContent: merchantContent, //模板内容
              noticeMethod: await getReceive(i.key),
            },
          ];
        }
      } else {
        result.forEach(async (item, index) => {
          let obj = {
            satMsgDefineCode: item.sceneCode, //消息编号--待审核/已通过/不通过
            label: item.label,
            notificationTime: item.value,
            channelParams: item.noticeWays.map(item => item.noticeWay), //通知方式
            msgTmpContent: merchantContent, //模板内容
            noticeMethod: await getReceive(item.sceneCode),
          }
          if (state.model[item.sceneCode] instanceof Array) {
            state.model[item.sceneCode].push(obj)
          } else {
            state.model[item.sceneCode] = []
            state.model[item.sceneCode].push(obj)
          }
        })
      }

      // 文件过期消息
      let emergencyFileNoticeRes = await proxy.$api.emergencyFileNotice()
      if(!emergencyFileNoticeRes){
        emergencyFileNoticeRes = {
            noticeMethod: await getReceive('EMERGENCY_FILE_EXPIRE_NOTIFY'),
            noticeWays: [],
            emergencyFileNoticeObjs: [
              {
                emergencyFileTypeId: undefined,
                objType: null,
                objId: []
              }
            ]
          }
      }
      merchantContent = '【预案文件名称】已过期，请及时维护管理。'
      const emergencyFileNoticeObjs = []
      for (let index = 0; index < emergencyFileNoticeRes.emergencyFileNoticeObjs.length; index++) {
        const element = emergencyFileNoticeRes.emergencyFileNoticeObjs[index];
        const selectOption = await getUserOptions(element.objId)
        emergencyFileNoticeObjs.push({
          ...element,
          selectOption
        })
      }
      state.model['EMERGENCY_FILE_EXPIRE_NOTIFY'] = [
        {
          noticeMethod: await getReceive('EMERGENCY_FILE_EXPIRE_NOTIFY'),
          noticeWays: emergencyFileNoticeRes.noticeWays,
          emergencyFileNoticeObjs: emergencyFileNoticeObjs
        },
      ];
      state.loading = false
    };
    const addConfigEvent = async (item) => {
      let merchantContent = "【报警时间】发生的【车辆违停】报警事件，将在【配置的通知条件（例：30分钟）】后超时，请及时处理";
      let obj = {}
      if (item.key === "EMERGENCY_FILE_EXPIRE_NOTIFY") {
        obj = {
          noticeMethod: await getReceive(item.key),
          noticeWays: [],
          emergencyFileNoticeObjs: [
            {
              emergencyFileTypeId: undefined,
              objType: 'USER',
              objId: []
            }
          ],
        }
      } else {
        obj = {
          satMsgDefineCode: item.key, //消息编号--待审核/已通过/不通过
          effectiveDays: 30, //有效天数
          label: item.tab,
          name: "", // 通知方选项名称
          notifyExpression: "",
          notificationTime: 1,
          enabled: false, //选中状态
          channelParams: [], //通知方式
          msgTmpContent: merchantContent, //模板内容
          noticeMethod: await getReceive(item.key),
        }
      }
      state.model[item.key].push(obj)
    }
    const deleteConfigEvent = (key, index) => {
      if (state.model[key].length === 1) {
        message.warning('请至少保留一条消息通知！');
      } else {
        state.model[key].splice(index, 1)
      }
    }

    const getUserOptions = async (ids) => {
      const res = await proxy.$api.tenantUsersPost({ ids })
      const options = (res.records ?? []).map(e => {
        return {
          label: e.name,
          value: e.id
        }
      })
      return options
    }
    // 该通知下的通知方式
    const getReceive = async (activeKey) => {
     return cubeMessageCenterService.sceneNotificationMethod(activeKey)
    }
    const submit = async () => {
      if (state.activeKey === 'EMERGENCY_FILE_EXPIRE_NOTIFY') {
        const data = state.model['EMERGENCY_FILE_EXPIRE_NOTIFY'][0]
        const params = {
          noticeWays: data.noticeWays,
          emergencyFileNoticeObjs: data.emergencyFileNoticeObjs.map(e => {
            return {
              emergencyFileTypeId: e.emergencyFileTypeId ?? null,
              objType: e.objType,
              objId: e.objId
            }
          })
        }
        try {
          state.loading = true
          await proxy.$api.saveEmergencyFileNotice(params)
          message.success('保存成功');
        } catch (error) {
          message.success('保存失败');
        } finally {
          state.loading = false
        }
      } else {
        // 报警超时保存
        let data = await _.flattenDepth(_.values(state.model));
        data = data.filter(e=>e.satMsgDefineCode === "ALARM_TIMEOUT_NOTIFY")
        let arr = []
        
        for (let i of data) {
          const noticeWays = i.channelParams.map(item => {
            return {
              noticeWay: item
            }
          })
          let obj = {
            label: i.label,
            sceneCode: i.satMsgDefineCode,
            value: i.notificationTime,
            noticeWays
          }
          arr.push(obj)
        }
        state.loading = true
        proxy.$api.addConfig("post", {
          businessType: businessType.value,
          sceneConfigDTOS: arr
        }).then(async () => {
          await getData()
          message.success('保存成功');
        }).cath(() => {
          state.loading = false
          message.success('保存失败');
        })
      }
    };

    onMounted(async () => {
      await getData();
    });

    return {
      flag,
      form,
      setRef,
      itemForm,
      satMsgConfigCheckBox,
      ...toRefs(state),
      submit,
      addConfigEvent,
      deleteConfigEvent
    };
  },
});
</script>
<style lang="less" scoped>
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

.addConfigBut {
  color: #96981d;

  span {
    margin-right: 20px
  }
}

.msgBox {
  border: 1px solid #ccc;
  margin-top: 10px;
  display: flex;
  width: 1000px;
  padding: 20px;
}
</style>
