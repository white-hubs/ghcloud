<script setup>
import { CaretDownFilled } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";

import { CubeAuthService } from "@/api/cube-auth-service-es/main.js";
import { getTerminalAliasConfigs } from "@/api/dict";
import { getUserTerminals } from "@/api/ouaa";
import { getEnterpriseCode, getToken } from "@/services/AccountService";
import request from "@/utils/request";

const DRONE_TERMINAL_CODE = "three-party-twinning-dron";

const terminalEntries = ref([
  {
    visible: false,
    code: "three-dimensional-visualization",
    aliasName: "",
    aliasPath: "",
    name: () => window.config?.feature?.ue5EntryName || "孪生可视",
    onClick: async () => {
      const cubeSecret = await getShortSecret("three-dimensional-visualization");
      const entry = terminalEntries.value.find((item) => item.code === "three-dimensional-visualization");
      openUrlInCurrentPage(entry?.aliasPath || "/apps-legacy/ue5", { "cube-secret": cubeSecret });
    },
  },
]);

const visibleEntries = computed(() => terminalEntries.value.filter((item) => item.visible));
const singleEntryName = computed(() => {
  const entry = visibleEntries.value[0];
  return entry ? entry.aliasName || entry.name() : "访问端";
});

const getAuthInfo = async () => {
  const [token, tenant] = await Promise.all([getToken(), getEnterpriseCode()]);
  return {
    token: token?.access_token || "",
    tenant: tenant || "",
  };
};

const getShortSecret = async (code = "bimops-manage-web") => {
  const hideLoading = message.loading("正在获取授权", 0);
  try {
    const auth = await getAuthInfo();
    const authService = new CubeAuthService(code, auth.tenant, auth.token);
    return await authService.getSecretByToken();
  } finally {
    hideLoading();
  }
};

const normalizeAliasParams = (rawParams) => {
  if (rawParams === null || rawParams === undefined || rawParams === "" || rawParams === "null") return {};
  if (typeof rawParams === "object") return rawParams;
  if (typeof rawParams !== "string") return {};

  try {
    const parsed = JSON.parse(rawParams);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_ignore) {
    return {};
  }
};

const normalizeAliasText = (value) => (typeof value === "string" ? value.trim() : "");

const resolveAliasPath = async (alias = {}, { silent = false } = {}) => {
  const path = normalizeAliasText(alias.path);
  if (path) return path;

  const url = normalizeAliasText(alias.url);
  if (!url) {
    if (!silent) message.warning("未配置可跳转地址");
    return "";
  }

  try {
    const resolvedPath = await request({
      url,
      method: "get",
      params: normalizeAliasParams(alias.params),
    });
    if (typeof resolvedPath === "string" && resolvedPath.trim()) return resolvedPath.trim();
  } catch (_ignore) {
    // 由下方统一提示，静默预取时不打扰用户。
  }

  if (!silent) message.error("获取跳转地址失败");
  return "";
};

const parseTerminalAlias = (rawAlias) => {
  try {
    return JSON.parse(rawAlias || "{}");
  } catch (_ignore) {
    return {};
  }
};

const getAliasConfigForTerminal = async () => {
  const configs = (await getTerminalAliasConfigs()) || [];
  return configs.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    alias: parseTerminalAlias(item.variable),
  }));
};

const appendAliasEntries = async (aliasOrigin) => {
  const ignoredCodes = [
    "bimops-manage-web",
    "bimops-manage-app",
    "command-dispatch-app",
    "two-dimensional-configuration",
    "three-dimensional-visualization",
  ];
  const entries = await Promise.all(
    aliasOrigin
      .filter((item) => !ignoredCodes.includes(item.code) && !terminalEntries.value.some((entry) => entry.code === item.code))
      .map(async (item) => {
        const hasAddressConfig = Boolean(normalizeAliasText(item.alias?.path) || normalizeAliasText(item.alias?.url));
        const resolveOnClick = item.code === DRONE_TERMINAL_CODE;
        let finalPath = resolveOnClick ? "" : await resolveAliasPath(item.alias, { silent: true });
        return {
          visible: true,
          code: item.code,
          aliasName: item.alias?.name ?? "未知外链",
          name: () => item.name || "未知外链",
          onClick: async () => {
            if (resolveOnClick) {
              finalPath = await resolveAliasPath(item.alias);
              if (!finalPath) return;
            }
            if (!finalPath && hasAddressConfig) finalPath = await resolveAliasPath(item.alias);
            if (!finalPath) {
              message.warning(hasAddressConfig ? "跳转地址不可用，请检查配置" : "未配置可跳转地址");
              return;
            }
            if (finalPath.startsWith("/apps/@ghcloud") || finalPath.startsWith("/apps-legacy")) {
              const cubeSecret = await getShortSecret();
              openUrlInCurrentPage(finalPath, { "cube-secret": cubeSecret });
              return;
            }
            openUrlInCurrentPage(finalPath);
          },
        };
      }),
  );
  terminalEntries.value.push(...entries);
};

const loadTerminalEntries = async () => {
  try {
    const terminalList = (await getUserTerminals()) || [];
    terminalList.forEach((item) => {
      const alias = parseTerminalAlias(item.alias);
      const entry = terminalEntries.value.find((candidate) => candidate.code === item.code);
      if (!entry) return;
      entry.visible = true;
      entry.aliasName = alias.name || "";
      entry.aliasPath = alias.path || "";
    });

    await appendAliasEntries(await getAliasConfigForTerminal());
  } catch (_error) {
    message.error("访问端列表加载失败");
  }
};

const openUrlInCurrentPage = (url, params = {}) => {
  if (!url) {
    message.warning("未配置可跳转地址");
    return;
  }

  const urlObject = new URL(url, window.location.origin);
  const query = new URLSearchParams(params);
  query.forEach((value, key) => urlObject.searchParams.set(key, value));
  window.location.assign(urlObject.toString());
};

onMounted(loadTerminalEntries);
</script>

<template>
  <a-dropdown v-if="visibleEntries.length > 1" placement="bottomRight" :trigger="['hover']">
    <div class="terminal-entry">
      <span>访问端</span>
      <CaretDownFilled />
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item v-for="item in visibleEntries" :key="item.code" @click="item.onClick">
          {{ item.aliasName || item.name() }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <button
    v-else-if="visibleEntries.length === 1"
    class="terminal-entry terminal-entry-single"
    type="button"
    @click="visibleEntries[0].onClick"
  >
    {{ singleEntryName }}
  </button>
</template>

<style lang="less" scoped>
.terminal-entry {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(185, 213, 244, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(34, 95, 158, 0.16);
  color: inherit;
  font-size: 16px;
  line-height: 20px;
  cursor: pointer;
  user-select: none;

  .anticon {
    margin-top: 1px;
    margin-left: 2px;
    font-size: 12px;
  }
}

.terminal-entry-single {
  font-family: inherit;
}
</style>
