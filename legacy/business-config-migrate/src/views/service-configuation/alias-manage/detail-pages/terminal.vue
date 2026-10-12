<template>
  <gLayout title="访问端别名配置">
    <template #header-btn>
      <a-button type="primary" @click="addRow">新增外链</a-button>
    </template>
    <template #content-table>
      <a-table :dataSource="dataList" :columns="columns" :loading="loading" :pagination="false" :scroll="{ y: tableHeight }" />
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
    </template>
    <a-modal v-model:visible="showModal" centered :title="modalTitle" @ok="handleConfirm" :confirmLoading="modalLoading">
      <a-form :model="formState">
        <a-form-item label="访问端别名">
          <a-input v-model:value="formState.name" placeholder="请输入" :maxLength="20"></a-input>
        </a-form-item>
        <a-form-item label="入口路由" v-if="!CAN_NOT_SET_PATH.includes(formState.code ?? '')">
          <a-input v-model:value="formState.path" placeholder="请输入" :maxLength="200"></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </gLayout>
</template>
<script setup lang="ts">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { Button, message, Popconfirm } from "ant-design-vue";
import { h, nextTick, onMounted, reactive, ref } from "vue";

import { saveAliasConfigForTerminal, getAliasConfigForTerminal } from "@ghcloud/cube-business-alias-manage-plugin";
import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";

import { cubeDictionaryService, cubeOuaaService } from "@/api/service";

const CAN_NOT_SET_PATH = ["two-dimensional-configuration", "bimops-manage-app", "bimops-manage-web", "command-dispatch-app"];

const loading = ref(true);
const modalLoading = ref(false);
const showModal = ref(false);
const modalTitle = ref("");
const dataList = ref<any[]>([]);
const columns = [
  {
    title: "访问端初始名称",
    customRender: ({ record }) => {
      return record.name || "--";
    },
  },
  {
    title: "访问端别名",
    dataIndex: "name",
    key: "name",
    customRender: ({ record }) => {
      return record.alias?.name || "--";
    },
  },
  {
    title: "操作",
    customRender: ({ record }) => {
      return [
        h(Button, { type: "link", onClick: () => editRow(record) }, { default: () => "编辑" }),
        h(
          Popconfirm,
          { title: "确定删除？", onConfirm: () => deleteRow(record) },
          h(Button, { type: "link", danger: true, disabled: !record.canDelete }, { default: () => "删除" }),
        ),
      ];
    },
  },
];
const formState = reactive({
  name: "",
  path: "",
  code: undefined,
});

const getData = async () => {
  try {
    loading.value = true;
    dataList.value = (await cubeOuaaService.getUserTerminals())
      .filter((e) => e.code !== "bimops-manage-app")
      .map((e) => {
        return {
          ...e,
          alias: JSON.parse(e.alias || "{}"),
        };
      });
    const aliasOrigin = await getAliasConfigForTerminal();
    aliasOrigin.forEach((e) => {
      const target = dataList.value.find((f) => f.code === e.code);
      if (!target) {
        dataList.value.push({ ...e, canDelete: true });
      }
    });
  } catch (error) {
  } finally {
    loading.value = false;
  }
};
const tableHeight = ref(0);
onMounted(async () => {
  getData();
  await nextTick();
  setTimeout(() => {
    const contentHei = document.querySelector(".content-table")?.clientHeight ?? 500;
    tableHeight.value = contentHei - 50;
  }, 100);
});

function editRow(row: { alias: { name: string; path: string }; code: undefined }) {
  formState.name = row.alias?.name;
  formState.path = row.alias?.path;
  formState.code = row.code;
  showModal.value = true;
  modalTitle.value = "编辑";
}
function addRow() {
  showModal.value = true;
  modalTitle.value = "新增";
  formState.name = "";
  formState.path = "";
  formState.code = generateRandomCode() as unknown as undefined;
}
async function deleteRow(row: { id: string }) {
  try {
    message.loading("正在删除");
    await cubeDictionaryService.deleteDataDictionary({ id: row.id });
    getData();
    message.destroy();
    message.success("操作成功");
  } catch (error) {
    message.destroy();
    message.error("删除错误");
  }
}
function goBack() {
  window.history.back();
}

function generateRandomCode(length = 10) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

async function handleConfirm() {
  if (!formState.code) {
    return;
  }
  try {
    modalLoading.value = true;
    await saveAliasConfigForTerminal({
      code: formState.code,
      name: formState.name,
      path: formState.path,
    });
    publisher.publish(MFRootEventNameEnum.MF_ROOT_CHANGE_TERMINAL_ALIAS, {
      code: formState.code,
      name: formState.name,
      path: formState.path,
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
