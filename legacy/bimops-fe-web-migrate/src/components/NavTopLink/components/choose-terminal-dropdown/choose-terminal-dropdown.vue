<template>
  <a-dropdown placement="bottomRight" v-if="terminalEntry.filter((e) => e.visible === true).length > 1">
    <div class="linkEnterprise">
      <span>访问端</span>
      <CaretDownFilled />
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item v-for="item in terminalEntry.filter((e) => e.visible === true)" :key="item.code" @click="item.onClick">
          {{ item.aliasName || item.name() }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <span
    class="linkEnterprise pl2"
    v-if="terminalEntry.filter((e) => e.visible === true).length === 1"
    @click="terminalEntry.filter((e) => e.visible === true)[0].onClick"
  >
    {{ displayName }}
  </span>
</template>
<script setup>
import { CaretDownFilled } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { onMounted, computed, ref } from "vue";

import { CubeAuthService } from "@ghcloud/cube-auth-service";
import { initAliasManagePluginAuth, getAliasConfigForTerminal } from "@ghcloud/cube-business-alias-manage-plugin";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import * as api from "@/api";
import request from "@/utils/request";

const DRONE_TERMINAL_CODE = "three-party-twinning-dron";

const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();

const terminalEntry = ref([
  {
    visible: false,
    code: "two-dimensional-configuration",
    aliasName: "",
    name: () => {
      const res = "二维组态";
      if (window.config?.feature) {
        return window.config.feature?.configureEntryName || res;
      }
      return res;
    },
    onClick: async () => {
      openUrlInNewWindow(window.config.Twoconfiguration, {
        token: cubeMfRootGlobalState.mfRootState.authInfo.token,
        tenant: cubeMfRootGlobalState.mfRootState.authInfo.tenant,
      });
    },
  },
  {
    visible: false,
    code: "command-dispatch-app",
    aliasName: "",
    name: () => {
      const res = "调度中心";
      // if (window.config?.feature) {
      //   return window.config.feature?.commandEntryName || res
      // }
      return res;
    },
    onClick: async () => {
      const cubeSecret = await getShortSecret("command-dispatch-app");
      openUrlInNewWindow(window.config.commandEntry ?? "/command-dispatch", { "cube-secret": cubeSecret });
    },
  },
  {
    visible: false,
    code: "inspection-command-screen-app",
    aliasName: "",
    name: () => {
      const res = "智慧巡检指挥";
      // if (window.config?.feature) {
      //   return window.config.feature?.commandEntryName || res
      // }
      return res;
    },
    onClick: async () => {
      const cubeSecret = await getShortSecret("inspection-command-screen-app");
      openUrlInNewWindow("/inspection-command-screen", { "cube-secret": cubeSecret });
    },
  },
  {
    visible: false,
    code: "grain-storage-cockpit-app",
    aliasName: "",
    name: () => {
      const res = "储粮驾驶舱";
      return res;
    },
    onClick: async () => {
      const cubeSecret = await getShortSecret("grain-storage-cockpit-app");
      openUrlInNewWindow("/grain-storage-cockpit", { "cube-secret": cubeSecret });
    },
  },
  {
    visible: false,
    code: "three-dimensional-visualization",
    aliasName: "",
    aliasPath: "",
    name: () => {
      const res = "孪生可视";
      if (window.config?.feature) {
        return window.config.feature?.ue5EntryName || res;
      }
      return res;
    },
    onClick: async () => {
      const cubeSecret = await getShortSecret("three-dimensional-visualization");
      const aliasPath = terminalEntry.value.find((e) => e.code === "three-dimensional-visualization")?.aliasPath ?? "";
      if (aliasPath) {
        openUrlInNewWindow(aliasPath, { "cube-secret": cubeSecret });
        return;
      }
      openUrlInNewWindow("/apps-legacy/ue5", { "cube-secret": cubeSecret });
    },
  },
]);
const displayName = computed(() => {
  return (
    terminalEntry.value.filter((e) => e.visible === true)[0].aliasName || terminalEntry.value.filter((e) => e.visible === true)[0].name()
  );
});
const getShortSecret = async (code) => {
  message.loading("正在获取授权");
  const authService = new CubeAuthService(
    code || "bimops-manage-web",
    cubeMfRootGlobalState.mfRootState.authInfo.tenant,
    cubeMfRootGlobalState.mfRootState.authInfo.token,
  );
  message.destroy();
  return await authService.getSecretByToken();
};

const normalizeAliasParams = (rawParams) => {
  if (rawParams === null || rawParams === undefined || rawParams === "" || rawParams === "null") {
    return {};
  }
  if (typeof rawParams === "object") {
    return rawParams;
  }
  if (typeof rawParams !== "string") {
    return {};
  }
  try {
    const parsed = JSON.parse(rawParams);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    return {};
  } catch (_ignore) {
    return {};
  }
};

const normalizeAliasText = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const resolveAliasPath = async (alias = {}, options = {}) => {
  const { silent = false } = options;
  const path = normalizeAliasText(alias.path);
  if (path) {
    return path;
  }
  const url = normalizeAliasText(alias.url);
  if (!url) {
    if (!silent) {
      message.warning("未配置可跳转地址");
    }
    return "";
  }
  const params = normalizeAliasParams(alias.params);
  try {
    const resolvedPath = await request({
      url,
      method: "get",
      params,
    });
    if (typeof resolvedPath === "string" && resolvedPath.trim()) {
      return resolvedPath.trim();
    }
    if (!silent) {
      message.error("获取跳转地址失败");
    }
    return "";
  } catch (_ignore) {
    if (!silent) {
      message.error("获取跳转地址失败");
    }
    return "";
  }
};

const getTerminals = async () => {
  const terminalList = await api.getUserTerminals();

  terminalList.forEach((item) => {
    item.aliasName = JSON.parse(item.alias || "{}")?.name;
    item.aliasPath = JSON.parse(item.alias || "{}")?.path;
    const findItem = terminalEntry.value.find((e) => e.code === item.code);
    if (findItem) {
      findItem.visible = true;
      findItem.aliasName = item.aliasName;
      findItem.aliasPath = item.aliasPath;
    }
  });
  // 获取额外配置的外链
  initAliasManagePluginAuth({
    token: cubeMfRootGlobalState.mfRootState.authInfo.token,
    tenant: cubeMfRootGlobalState.mfRootState.authInfo.tenant,
  });
  const aliasOrigin = await getAliasConfigForTerminal();
  const ignoreList = [
    "bimops-manage-web",
    "bimops-manage-app",
    "command-dispatch-app",
    "two-dimensional-configuration",
    "three-dimensional-visualization",
  ];
  const appendAliasEntries = await Promise.all(
    aliasOrigin
      .filter((e) => !ignoreList.includes(e.code))
      .map(async (e) => {
        const target = terminalEntry.value.find((f) => f.code === e.code);
        if (target) {
          return null;
        }
        const hasAddressConfig = Boolean(normalizeAliasText(e.alias?.path) || normalizeAliasText(e.alias?.url));
        const resolveOnClick = e.code === DRONE_TERMINAL_CODE;
        let finalPath = resolveOnClick ? "" : await resolveAliasPath(e.alias, { silent: true });
        return {
          visible: true,
          code: e.code,
          aliasName: e.alias?.name ?? "未知外链",
          onClick: async () => {
            if (resolveOnClick) {
              finalPath = await resolveAliasPath(e.alias);
              if (!finalPath) {
                return;
              }
            }
            // 兜底重试：初始化预取失败时，点击时再尝试一次，避免网络抖动导致一直不可用
            if (!finalPath && hasAddressConfig) {
              finalPath = await resolveAliasPath(e.alias);
            }
            if (!finalPath) {
              message.warning(hasAddressConfig ? "跳转地址不可用，请检查配置" : "未配置可跳转地址");
              return;
            }
            if (finalPath.startsWith("/apps/@ghcloud") || finalPath.startsWith("/apps-legacy")) {
              const cubeSecret = await getShortSecret();
              openUrlInNewWindow(finalPath, { "cube-secret": cubeSecret });
              return;
            }
            openUrlInNewWindow(finalPath);
          },
        };
      }),
  );
  appendAliasEntries.filter(Boolean).forEach((entry) => {
    terminalEntry.value.push(entry);
  });
};

const openUrlInNewWindow = (url, params = {}) => {
  const query = new URLSearchParams(params);
  if (!query.toString()) {
    window.open(url);
    return;
  }

  const urlObj = new URL(url, window.location.origin);
  urlObj.search = urlObj.search ? `${urlObj.search}&${query}` : `?${query}`;

  window.open(urlObj.toString());
};

onMounted(() => {
  getTerminals();
});
</script>
<style lang="less" scoped>
.linkEnterprise {
  cursor: pointer;
  display: flex;
  align-items: center;

  .anticon {
    margin-left: 2px;
    margin-top: 1px;
  }
}
</style>
