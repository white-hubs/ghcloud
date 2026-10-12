<template>
  <gLayout title="应用别名配置">
    <template #content-search>
      <a-form layout="inline">
        <a-form-item>
          <a-input v-model:value="keyword" placeholder="应用名称" allowClear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="getData" style="margin-right: 10px">查询</a-button>
          <a-button
            type=""
            @click="
              () => {
                keyword = '';
                getData();
              }
            "
            >重置</a-button
          >
        </a-form-item>
      </a-form>
    </template>
    <template #content-table>
      <a-table :dataSource="dataList" :columns="columns" :loading="loading" :scroll="{ y: scrollY }" :pagination="false" />
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
    </template>
    <a-modal v-model:visible="showModal" centered :title="'编辑'" @ok="handleConfirm" :confirmLoading="modalLoading">
      <a-form :model="formState">
        <a-form-item label="初始名称" name="code">
          {{ editRecord.name }}
        </a-form-item>
        <template v-if="formState.code">
          <a-form-item label="应用别名">
            <a-input v-model:value="formState.name" placeholder="请输入" :maxLength="10"></a-input>
          </a-form-item>
          <a-form-item label="应用图标">
            <g-upload
              :file="uploadIconList"
              :sceneCode="GLOBAL_SCENE_CODE.mData"
              :max="1"
              @update:value="uploadIcon"
              :size="500"
              businessKey="mdata"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </gLayout>
</template>
<script setup lang="ts">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { Button, Image, message } from "ant-design-vue";
import { h, onMounted, reactive, ref } from "vue";

import { saveAliasConfigForApplication } from "@ghcloud/cube-business-alias-manage-plugin";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { authStore } from "@/api/auth-store";
import { cubeFileService, cubeOuaaService } from "@/api/service";
const keyword = ref("");
const scrollY = ref(520);
const loading = ref(true);
const modalLoading = ref(false);
const showModal = ref(false);
const uploadIconList = ref<any[]>([]);
const dataList = ref<any[]>([]);
const columns = [
  {
    title: "应用图标",
    dataIndex: "icon",
    key: "icon",
    customRender: ({ record }) => {
      return [h(Image, { src: record.alias?.icon || record.icon, width: 50 })];
    },
  },
  {
    title: "应用初始名称",
    customRender: ({ record }) => {
      return record.name;
    },
  },
  {
    title: "应用别名",
    customRender: ({ record }) => {
      return record.alias.name || "--";
    },
  },
  {
    title: "操作",
    customRender: ({ record }) => {
      return [h(Button, { type: "link", onClick: () => editRow(record) }, { default: () => "编辑" })];
    },
  },
];
const editRecord = ref();
const formState = reactive({
  icon: "",
  name: "",
  code: undefined,
});

const getData = async () => {
  try {
    loading.value = true;
    const res = (await cubeOuaaService.productApplications(authStore.tenant, false)).map((e) => {
      return {
        ...e,
        alias: JSON.parse(e.alias || "{}"),
      };
    });
    if (keyword.value) {
      dataList.value = res.filter((e) => e.name.includes(keyword.value) || (e.alias?.name ?? "").includes(keyword.value));
    } else {
      dataList.value = res;
    }
  } catch (error) {
  } finally {
    loading.value = false;
    scrollY.value = document.querySelector(".content-table")!.clientHeight - 50;
  }
};

onMounted(async () => {
  getData();
});

function editRow(row) {
  editRecord.value = row;
  formState.icon = row.alias?.icon || row.icon;
  uploadIconList.value = [
    {
      uid: "",
      name: formState.icon,
      status: "done",
      url: formState.icon,
    },
  ];
  formState.name = row.alias?.name;
  formState.code = row.code;
  showModal.value = true;
}
function goBack() {
  window.history.back();
}

async function uploadIcon(fileId: string) {
  const res = await cubeFileService.getFileInfo(fileId);
  if (res.path) {
    formState.icon = res.path;
  }
}

async function handleConfirm() {
  if (!formState.code) {
    return;
  }
  try {
    modalLoading.value = true;
    await saveAliasConfigForApplication({
      code: formState.code,
      icon: formState.icon === editRecord.value.icon ? "" : formState.icon,
      name: formState.name || "",
    });
  } catch (error) {
    message.error("应用别名配置失败");
  } finally {
    modalLoading.value = false;
  }
  showModal.value = false;
  formState.code = undefined;
  getData();
}
</script>

<style scoped lang="less"></style>
