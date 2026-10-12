<template>
  <div class="NavTopLink primary-color" v-show="!inDesktopClient">
    <div class="layout-1-left">
      <TenantLogo />
      <ApplicationEntry />
    </div>
    <div class="layout-1-right" v-show="!inDesktopClient">
      <!-- <AIAgentEntry v-if="aiAbilty" /> -->
      <AIChatDrawerEntry v-if="aiAbilty" />
      <SearchApplication />
      <ChangeSkinModal />
      <span class="border"></span>
      <ChooseTerminalDropdown />

      <span class="border"></span>
      <UserDropdown />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

import AIAgentEntry from "./components/ai-agent-entry/ai-agent-entry.vue";
import AIChatDrawerEntry from "./components/ai-chat-drawer-entry/ai-chat-drawer-entry.vue";
import ApplicationEntry from "./components/application-entry/application-entry.vue";
import ChangeSkinModal from "./components/change-skin-modal/change-skin-modal.vue";
import ChooseTerminalDropdown from "./components/choose-terminal-dropdown/choose-terminal-dropdown.vue";
import SearchApplication from "./components/search-application/search-application.vue";
import TenantLogo from "./components/tenant-logo/tenant-logo.vue";
import UserDropdown from "./components/user-dropdown/user-dropdown.vue";
import { inDesktopClient } from "@/hooks/use-environment";
const aiAbilty = ref(false);

const getAiAgent = async () => {
  const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
    itemCode: "AI_ABILTY",
    code: "AI_ABILTY",
  });
  if (res.variable === "true") {
    aiAbilty.value = true;
  }
};
onMounted(() => {
  getAiAgent();
});
</script>
<style lang="less" scoped>
.NavTopLink {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layout-1-left,
.layout-1-right {
  display: flex;
  height: 100%;
  align-items: center;
  color: #fff;
}
.layout-1-left {
  flex: 1;
}

.layout-1-right {
  .person_info {
    display: flex;
    align-items: center;
    height: 50px;
    line-height: 50px;

    > div {
      text-align: center;

      &.msg-icon {
        width: 60px;
      }

      &:last-child {
        width: 120px;
      }
    }

    > .flex {
      height: 50px;
      position: relative;
      padding-right: 10px;
    }

    .hide {
      display: none;
    }

    .appear {
      width: 100%;
      display: inline-block;
      position: absolute;
      top: 50px;
      left: 0;
      background-color: @white;
      z-index: 10;
      color: black;

      > div {
        cursor: pointer;
        border-bottom: 1px solid white;

        &:last-child {
          border: none;
        }
      }
    }
  }
}

:deep(.ant-menu-item.ant-menu-item-only-child) {
  width: 30%;
}

.link {
  &::after {
    content: "";
    width: 1px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.75);
    margin: 0 16px;
  }
}
.border {
  width: 1px;
  height: 16px;
  background: rgba(173, 207, 255, 0.6);
  margin: 0 16px;
  transform: scaleX(0.2);
}
</style>
