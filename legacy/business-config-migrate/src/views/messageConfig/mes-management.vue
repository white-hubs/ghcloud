<template>
  <gLayout :title="pageTitle">
    <template #content-search>
      <div class="flexContent">
        <a-form :model="queryState.state" layout="inline">
          <a-form-item label="应用名称">
            <a-select allowClear show-search style="width: 180px" v-model:value="queryState.state.applicationCode" placeholder="请选择应用">
              <a-select-option :value="item.applicationCode + '|' + item.applicationName" v-for="item in applyList">
                {{ item.applicationName }}
              </a-select-option>
            </a-select>
            <a-input placeholder="场景名称" v-model:value="queryState.state.keyword" style="width: 180px; margin-left: 10px" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="search">查询</a-button>
            <a-button style="margin-left: 10px" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
        <a-button type="primary" @click="updateApplication" :loading="loading">更新应用</a-button>
      </div>
    </template>
    <template #content-table>
      <a-table
        :scroll="{ y: tableScrollY }"
        :pagination="false"
        :dataSource="tableConfig.dataSource"
        :columns="tableConfig.columns"
        :loading="tableConfig.loading"
      >
        <template #receiveMode="{ record }">
          <a-button type="link" @click="changeReceiveType(record)">{{ record === "SPECIFY_USER" ? "指定用户" : "应用获取" }}</a-button>
        </template>
        <template v-for="(item, index) in msgChannelsList" #[item.dataIndex]="{ record }">
          <a-checkbox
            @change="(value) => sceneChannelSet(record.id, item.dataIndex, value)"
            v-model:checked="record.selectArr[index]"
          ></a-checkbox>
        </template>
      </a-table>
    </template>
    <template #footer-page>
      <a-pagination
        v-model:current="queryState.state.pageNumber"
        :total="queryState.state.total"
        show-less-items
        :show-total="(total: number) => `共 ${total} 条数据`"
        @change="handlePageChange"
      />
    </template>
  </gLayout>
  <a-modal v-model:visible="messageVisible" title="消息接收人" @ok="messageOk" @cancel="messageCamcel">
    <a-spin :spinning="userLoading">
      <a-radio-group v-model:value="messageValue">
        <a-radio value="DYNAMIC_APPLICATION">自动获取</a-radio>
        <a-radio value="SPECIFY_USER">指定用户</a-radio>
      </a-radio-group>
      <div style="margin: 10px" v-if="messageValue === 'SPECIFY_USER'">
        <span>选择用户: </span>
        <a-select ref="select" mode="multiple" show-search v-model:value="messageRecipient" style="width: 120px">
          <a-select-option v-for="item in userData" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { message } from "ant-design-vue";
import { ref, onMounted, reactive } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { usePageName } from "@ghcloud/cube-utils";

import {
  msgApplications,
  msgReceives,
  msgChannels,
  sceneReceive,
  refreshApplication,
  settingChannel,
  deleteChannel,
  getAuthenticatedUserPage,
  settingMode,
} from "@/api/message";
import type { MsgApplicationsType, MsgReceivesType } from "@/api/model/message";

const { pageTitle } = usePageName();
const tableScrollY = ref(500);
const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    applicationCode: undefined as string | undefined,
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  },
  cacheFields: ["applicationCode", "keyword", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize") return Number(raw);
    return raw;
  },
});
const messageVisible = ref(false);
const loading = ref(false);
const userLoading = ref(false);
const messageValue = ref("");
const messageRecipient = ref([]);
const applyList = ref<MsgApplicationsType[]>([]);
const msgChannelsList = ref<any[]>([]);
const selectId = ref("");
const userData = ref<{ id: string; name: string }[]>([]);
const tableConfig = reactive<{ columns: any; dataSource: MsgReceivesType[]; loading: boolean }>({
  columns: [
    {
      title: "应用名称",
      dataIndex: "applicationName",
      ellipsis: true,
      align: "center",
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "场景名称",
      dataIndex: "msgSceneName",
      ellipsis: true,
      align: "center",
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "消息接收方式",
      dataIndex: "receiveMode",
      ellipsis: true,
      align: "center",
      slots: { customRender: "receiveMode" },
    },
  ],
  dataSource: [],
  loading: false,
});
const getApplicationData = async () => {
  let res = await msgApplications();
  applyList.value = res.data;
};
const MessageAcceptanceList = async () => {
  tableConfig.loading = true;
  const params = {
    pageSize: queryState.state.pageSize,
    pageNumber: queryState.state.pageNumber,
    keyword: queryState.state.keyword,
    applicationCode: queryState.state.applicationCode ? (queryState.state.applicationCode as string).split("|")[0] : "",
  };
  let res = await msgReceives(params);
  tableConfig.dataSource = res.data.records;
  queryState.update({ total: res.data.total });
  queryState.writeCache();
  // 处理接收渠道回显
  tableConfig.dataSource.forEach((item) => {
    // 初始化选中数组
    item.selectArr = new Array(msgChannelsList.value.length);
    for (let i = 0; i < item.selectArr.length; i++) {
      item.selectArr[i] = false;
    }
    // 给选中数组加上选中的值
    msgChannelsList.value.forEach((data, index) => {
      for (let i = 0; i < item.channelCodes.length; i++) {
        if (data.dataIndex === item.channelCodes[i]) {
          item.selectArr[index] = true;
          break;
        }
      }
    });
  });
  tableConfig.loading = false;
};
const search = () => {
  queryState.resetPage();
  queryState.writeCache();
  MessageAcceptanceList();
};
// 消息场景接收通道设置
const sceneChannelSet = async (id, code, value) => {
  if (value.target.checked) {
    await settingChannel(id, code);
  } else {
    await deleteChannel(id, code);
  }
  await MessageAcceptanceList();
  message.success("消息场景接受通道修改成功");
};
const handlePageChange = (page: number, pageSize: number): void => {
  queryState.setPage(page, pageSize);
  MessageAcceptanceList();
};
const reset = () => {
  queryState.update({
    applicationCode: undefined,
    keyword: "",
  });
  queryState.resetPage();
  queryState.clearCache();
  MessageAcceptanceList();
};
const getUserList = async () => {
  userLoading.value = true;
  let res = await getAuthenticatedUserPage({ pageNumber: 1, pageSize: 1000 });
  userData.value = res.data.records;
  userLoading.value = false;
};
// 消息接受方式详情
const changeReceiveType = async (value) => {
  messageVisible.value = true;
  selectId.value = value.id;
  let res = await sceneReceive(value.msgSceneCode);
  messageValue.value = res.data.receiveMode;
  messageRecipient.value = res.data.users.map((item) => {
    return item.userId;
  });
};
const messageOk = async () => {
  let params: { users: { userId: string; userName: string }[]; receiveMode: string } = {
    receiveMode: messageValue.value,
    users: [],
  };
  if (messageValue.value === "SPECIFY_USER") {
    let arr: { userId: string; userName: string }[] = [];
    userData.value.forEach((item) => {
      messageRecipient.value.forEach((data) => {
        if (item.id === data) {
          arr.push({
            userId: item.id,
            userName: item.name,
          });
        }
      });
    });
    params.users = arr;
  }
  await settingMode(selectId.value, params);
  messageVisible.value = false;
};
const messageCamcel = () => {
  messageVisible.value = false;
};
// 更新应用
const updateApplication = async () => {
  loading.value = true;
  await refreshApplication();
  await MessageAcceptanceList();
  message.success("场景信息获取成功");
  loading.value = false;
};
const getChannelData = async () => {
  let res = await msgChannels();
  msgChannelsList.value = res.data;
  msgChannelsList.value = msgChannelsList.value.map((item) => {
    return {
      title: item.channelName,
      dataIndex: item.channelCode,
      ellipsis: true,
      align: "center",
      slots: { customRender: item.channelCode },
    };
  });
  tableConfig.columns.splice(2, 0, ...msgChannelsList.value);
};
onMounted(async () => {
  try {
    tableScrollY.value = document.querySelector(".content-right")!.clientHeight - 115;
  } catch (error) {}
  await getApplicationData();
  await getChannelData();
  await MessageAcceptanceList();
  await getUserList();
});
</script>
<style scoped lang="less">
.flexContent {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
</style>
