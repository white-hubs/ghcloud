import { computed, ref, type ComputedRef, type Ref } from "vue";

import {
  filterComposerReferences,
  findActiveReferenceTrigger,
  type ActiveReferenceTrigger,
  type AssistantComposerReference,
  type AssistantReferenceMenuType,
} from "./assistant-chat-ui";

type ReferenceMenuOpenSource = "button" | "trigger";

export function useComposerReferenceMenu(input: {
  references: ComputedRef<readonly AssistantComposerReference[]>;
  /** 为 false 时禁用 @ / 知识库 pill 触发的 KB 菜单（默认 true，由调用方按开关传入）。 */
  kbRefsUiEnabled?: boolean | (() => boolean);
}): {
  showReferenceMenu: Ref<boolean>;
  referenceMenuQuery: Ref<string>;
  referenceMenuType: Ref<AssistantReferenceMenuType>;
  activeReferenceTrigger: Ref<ActiveReferenceTrigger | null>;
  filteredReferenceList: ComputedRef<AssistantComposerReference[]>;
  closeReferenceMenu: () => void;
  toggleForKb: (event: MouseEvent) => void;
  toggleForSkill: (event: MouseEvent) => void;
  syncFromTextarea: (inputText: string, caret: number) => void;
} {
  const showReferenceMenu = ref(false);
  const referenceMenuQuery = ref("");
  const referenceMenuType = ref<AssistantReferenceMenuType>("kb");
  const activeReferenceTrigger = ref<ActiveReferenceTrigger | null>(null);
  const menuOpenSource = ref<ReferenceMenuOpenSource | null>(null);

  const isKbUiEnabled = (): boolean => {
    const flag = input.kbRefsUiEnabled;
    if (typeof flag === "function") {
      return flag();
    }
    return flag !== false;
  };

  const filteredReferenceList = computed(() =>
    filterComposerReferences(input.references.value, referenceMenuQuery.value, referenceMenuType.value),
  );

  const closeReferenceMenu = (): void => {
    showReferenceMenu.value = false;
    referenceMenuQuery.value = "";
    activeReferenceTrigger.value = null;
    menuOpenSource.value = null;
  };

  const toggleForType = (type: AssistantReferenceMenuType): void => {
    if (type === "kb" && !isKbUiEnabled()) {
      return;
    }
    const shouldOpen = !showReferenceMenu.value || referenceMenuType.value !== type;
    referenceMenuType.value = type;
    menuOpenSource.value = "button";
    activeReferenceTrigger.value = null;
    showReferenceMenu.value = shouldOpen;
    if (!shouldOpen) {
      referenceMenuQuery.value = "";
      menuOpenSource.value = null;
    }
  };

  const toggleForKb = (event: MouseEvent): void => {
    event.stopPropagation();
    toggleForType("kb");
  };

  const toggleForSkill = (event: MouseEvent): void => {
    event.stopPropagation();
    toggleForType("skill");
  };

  const syncFromTextarea = (text: string, caret: number): void => {
    const trigger = findActiveReferenceTrigger(text, caret);
    if (trigger?.menuType === "kb" && !isKbUiEnabled()) {
      activeReferenceTrigger.value = null;
      if (menuOpenSource.value === "trigger") {
        closeReferenceMenu();
      }
      return;
    }
    activeReferenceTrigger.value = trigger;
    if (trigger == null) {
      if (menuOpenSource.value === "trigger") {
        closeReferenceMenu();
      }
      return;
    }
    menuOpenSource.value = "trigger";
    referenceMenuType.value = trigger.menuType;
    referenceMenuQuery.value = trigger.query;
    showReferenceMenu.value = true;
  };

  return {
    showReferenceMenu,
    referenceMenuQuery,
    referenceMenuType,
    activeReferenceTrigger,
    filteredReferenceList,
    closeReferenceMenu,
    toggleForKb,
    toggleForSkill,
    syncFromTextarea,
  };
}
