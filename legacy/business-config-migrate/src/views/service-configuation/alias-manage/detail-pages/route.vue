<template>
  <gLayout :title="`菜单别名配置`">
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" @click="save" :loading="submitLoading">保存</a-button>
    </template>
    <template #content-table>
      <a-row :gutter="16">
        <a-col :span="4" class="terminal-area">
          <div
            :class="{ 'select-item': true, active: terminalSelect === item.code }"
            v-for="item in terminalList"
            :key="item.code"
            @click="handleSelectTerminal(item.code)"
          >
            {{ item.name }}
          </div>
        </a-col>
        <a-col :span="4" class="app-area">
          <template v-if="!applicationLoading">
            <div
              :class="{ 'select-item': true, active: applicationSelect === item.code }"
              v-for="item in applicationList"
              :key="item.code"
              @click="handleSelectApplication(item.code)"
            >
              {{ item.name }}
            </div>
            <a-empty v-if="!applicationList.length" description="暂无数据"></a-empty>
          </template>
          <a-spin v-else />
        </a-col>
        <a-col :span="16" class="menu-area">
          <template v-if="!menuLoading">
            <a-empty v-if="!menus.length" description="当前应用未分配菜单"></a-empty>
            <template v-else>
              <div class="menu-col">
                <span style="box-sizing: border-box; padding-left: 50px">菜单初始名称</span>
                <span>菜单图标</span>
                <span>菜单别名</span>
                <span>操作</span>
              </div>
              <DragMenu :menuData="menus" :terminal="terminalSelect" ref="dragMenuRef" />
            </template>
          </template>
          <a-spin v-else />
        </a-col>
      </a-row>
    </template>
  </gLayout>
</template>

<script setup lang="ts">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { message } from "ant-design-vue";
import _ from "lodash";
import { onMounted, ref } from "vue";

import { saveAliasConfigForRoute } from "@ghcloud/cube-business-alias-manage-plugin";
import type { Menu } from "@ghcloud/cube-ouaa-service";

import DragMenu from "./components/menu.vue";
import { cubeOuaaService } from "@/api/service";

const submitLoading = ref(false);
const applicationLoading = ref(false);
const menuLoading = ref(false);
const terminalList = [
  { name: "业务PC", code: "bimops-manage-web" },
  { name: "业务APP", code: "bimops-manage-app" },
];
const terminalSelect = ref("bimops-manage-web");
const applicationList = ref<
  {
    code: string;
    name: string;
    icon: string;
  }[]
>([]);
const applicationSelect = ref("");
const menus = ref<Menu[]>([]);
const dragMenuRef = ref();

onMounted(async () => {
  handleSelectTerminal();
});

function goBack() {
  window.history.back();
}

async function handleSelectTerminal(code?: string) {
  if (applicationLoading.value || menuLoading.value) {
    message.warning("请稍后");
    return;
  }
  if (code) {
    terminalSelect.value = code;
    applicationList.value.length = 0;
  }
  try {
    menuLoading.value = true;
    applicationLoading.value = true;
    const appGroup = await cubeOuaaService.getApplicationGroups(terminalSelect.value);
    appGroup
      .map((group) => group.applicationPageVOS)
      .map((e) => {
        applicationList.value.push(...e);
      });
  } catch (error) {
    message.error("获取应用列表失败");
  } finally {
    applicationLoading.value = false;
  }
  if (applicationList.value.length) {
    handleSelectApplication(applicationList.value[0].code);
  }
}

async function handleSelectApplication(code?: string) {
  if (code) {
    applicationSelect.value = code;
  }
  if (!applicationSelect.value) {
    menuLoading.value = false;
    return;
  }
  try {
    menuLoading.value = true;
    menus.value = await cubeOuaaService.getAppMenuInfo(applicationSelect.value, terminalSelect.value, false);
  } catch (error) {
    message.error("获取菜单失败");
  } finally {
    menuLoading.value = false;
  }
}

async function save() {
  const menuAliasData = dragMenuRef.value?.getMenuInfo();
  try {
    if (menuAliasData) {
      submitLoading.value = true;
      await saveAliasConfigForRoute({
        terminalCode: terminalSelect.value,
        applicationCode: applicationSelect.value,
        alias: menuAliasData,
      });
    }
  } catch (error) {
    message.error("保存别名失败");
  } finally {
    message.success("保存成功");
    submitLoading.value = false;
  }
}
</script>
<style lang="less" scoped>
.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

:deep(.ant-row) {
  height: 100%;
}

:deep(.ant-col) {
  overflow-y: auto;
  height: 100%;
}

:deep(.ant-spin, .ant-empty) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.terminal-area,
.app-area {
  box-shadow: 1px 0 10px rgb(0 0 0 / 6%);
}

.select-item {
  width: 100%;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  text-align: left;
  overflow: hidden;
  display: flex;
  cursor: pointer;
  transition: all 0.1s ease-in-out;

  &.active {
    background-color: var(--cube-theme-var--primary-color);
    color: white;
  }
}

.menu-col {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 16px;

  span {
    display: inline-block;
    width: 25%;
    text-align: left;
  }

  height: 50px;
  border-bottom: 1px solid #e5e5e5;
}
</style>
