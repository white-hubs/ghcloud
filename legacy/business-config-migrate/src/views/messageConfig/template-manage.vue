<template>
  <gLayout :title="pageTitle">
    <template #content-search>
      <a-form :model="queryState.state" layout="inline">
        <a-form-item label="">
          <a-radio-group
            style="margin-top: 10px"
            @change="MessageAcceptanceList"
            v-model:value="queryState.state.channelCode"
            button-style="solid"
          >
            <a-radio-button v-for="item in msgChannelsList" :value="item.channelCode">{{ item.channelName }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="应用名称">
          <a-select allowClear style="width: 180px" v-model:value="queryState.state.applicationCode" show-search placeholder="请选择应用">
            <a-select-option :value="item.applicationCode + '|' + item.applicationName" v-for="item in applyList">
              {{ item.applicationName }}
            </a-select-option>
          </a-select>
          <a-input placeholder="模板名称查询" v-model:value="queryState.state.keyword" style="width: 180px; margin-left: 10px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="search">查询</a-button>
          <a-button style="margin-left: 10px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </template>
    <template #content-table>
      <a-table
        :scroll="{ y: tableScrollY }"
        :pagination="false"
        :dataSource="tableConfig.dataSource"
        :columns="tableConfig.columns"
        :loading="tableConfig.loading"
      >
        <template #operate="{ record }">
          <a-button
            :disabled="queryState.state.channelCode === 'CHANNEL_APP'"
            type="link"
            @click="association(record)"
            style="margin-left: 30px"
            >关联</a-button
          >
        </template>
      </a-table>
    </template>
    <template #footer-page>
      <a-pagination
        v-model:current="queryState.state.pageNumber"
        :total="queryState.state.total"
        show-less-items
        :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
  </gLayout>
  <!-- 其他通知关联弹窗 -->
  <a-modal centered v-model:visible="visible" title="关联模板ID" @ok="handleOk">
    第三方模板ID: <a-input style="width: 200px" v-model:value="templateID" placeholder="请输入" />
  </a-modal>
  <!-- 站内通知关联弹窗 -->
  <a-modal centered v-model:visible="stationVisible" title="关联访问端" @ok="handleOk">
    选择关联访问端: <a-checkbox-group v-model:value="templateID" :options="accessList" />
  </a-modal>
</template>

<script setup lang="ts">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { message } from "ant-design-vue";
import { ref, reactive, onMounted } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { usePageName } from "@ghcloud/cube-utils";

import { msgApplications, msgChannels, msgTmpPage, settingConfig, contextTerminals } from "@/api/message";
import type { MsgApplicationsType, MsgChannels, MsgTmpPageType } from "@/api/model/message";

const { pageTitle } = usePageName();

const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    applicationCode: undefined as string | undefined,
    keyword: "",
    channelCode: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  },
  cacheFields: ["applicationCode", "keyword", "channelCode", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize") {
      return Number(raw);
    }
    if (field === "applicationCode") {
      return raw || undefined;
    }
    return raw || "";
  },
});

const msgChannelsList = ref<MsgChannels[]>([]);
const visible = ref(false);
const stationVisible = ref(false);
const templateID = ref("");
const accessList = ref<{ label: string; value: string }[]>([]);
const tableScrollY = ref(500);

const associationData = reactive<MsgTmpPageType>({
  applicationCode: "",
  applicationName: "",
  channelCode: "",
  content: "",
  enabled: false,
  id: "",
  msgSceneCode: "",
  msgSceneName: "",
  name: "",
  config: "",
});

const tableConfig = reactive<{ columns: any; dataSource: MsgTmpPageType[]; loading: boolean }>({
  columns: [
    {
      title: "模板ID",
      dataIndex: "id",
      ellipsis: true,
      align: "center",
      width: 150,
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "模板名称",
      dataIndex: "name",
      ellipsis: true,
      align: "center",
      width: 180,
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "应用",
      dataIndex: "applicationName",
      ellipsis: true,
      align: "center",
      width: 150,
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "使用场景",
      dataIndex: "msgSceneName",
      ellipsis: true,
      align: "center",
      width: 150,
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "内容",
      dataIndex: "content",
      ellipsis: true,
      align: "center",
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "操作",
      dataIndex: "operate",
      ellipsis: true,
      align: "center",
      width: 100,
      slots: { customRender: "operate" },
    },
  ],
  dataSource: [],
  loading: false,
});

const applyList = ref<MsgApplicationsType[]>([]);

const getApplicationData = async () => {
  let res = await msgApplications();
  applyList.value = res.data;
};

const MessageAcceptanceList = async () => {
  tableConfig.loading = true;
  const params = {
    pageSize: queryState.state.pageSize,
    pageNumber: queryState.state.pageNumber,
    channelCode: queryState.state.channelCode,
    keyword: queryState.state.keyword,
    applicationCode: queryState.state.applicationCode ? (queryState.state.applicationCode as string).split("|")[0] : "",
  };
  let res = await msgTmpPage(params);
  tableConfig.dataSource = res.data.records;
  queryState.update({ total: res.data.total });
  tableConfig.loading = false;
  queryState.writeCache();
};

const search = () => {
  queryState.resetPage();
  queryState.writeCache();
  MessageAcceptanceList();
};

const pageChange = (page: number) => {
  queryState.setPage(page, queryState.state.pageSize);
  MessageAcceptanceList();
};

const handleOk = async () => {
  if (templateID.value !== "") {
    let config;
    if (
      associationData.channelCode === "CHANNEL_SMS" ||
      associationData.channelCode === "CHANNEL_VOICE" ||
      associationData.channelCode === "CHANNEL_WE_PUBLIC_SERVICE_ACCOUNT"
    ) {
      config = JSON.stringify({ tmpId: templateID.value });
    } else if (associationData.channelCode === "CHANNEL_SITE") {
      config = JSON.stringify({ terminals: templateID.value });
    }
    await settingConfig(associationData.id, { config });
    await MessageAcceptanceList();
    templateID.value = "";
    visible.value = false;
    stationVisible.value = false;
    message.success("关联成功");
  } else {
    message.warning(queryState.state.channelCode === "CHANNEL_SITE" ? "请选择访问端" : "请输入模板id");
  }
};

// 获取通道列表
const channelList = async () => {
  let res = await msgChannels();
  msgChannelsList.value = res.data;
  queryState.state.channelCode = msgChannelsList.value[0].channelCode;
};

// 获取当前用户所登录产品的访问端列表
const getAccessList = async () => {
  let res = await contextTerminals();
  accessList.value = res.data.map((item) => {
    return {
      label: item.name,
      value: item.code,
    };
  });
};

const association = (val: MsgTmpPageType) => {
  if (queryState.state.channelCode === "CHANNEL_SITE") {
    templateID.value = val.config ? JSON.parse(val.config).terminals : "";
    stationVisible.value = true;
  } else {
    templateID.value = val.config ? JSON.parse(val.config).tmpId : "";
    visible.value = true;
  }
  Object.assign(associationData, val);
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

onMounted(async () => {
  try {
    tableScrollY.value = document.querySelector(".content-right")!.clientHeight - 115;
  } catch (error) {}
  await channelList();
  await getApplicationData();
  await MessageAcceptanceList();
  await getAccessList();
});
</script>

<style scoped lang="less">
.ant-form-item-label {
  margin-right: 0 !important;
}

.ant-radio-group {
  margin-top: 0 !important;
}
</style>
