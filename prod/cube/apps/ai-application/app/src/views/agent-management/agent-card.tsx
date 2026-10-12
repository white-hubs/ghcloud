import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from "vue";

import { Button, MoreOutlined, message } from "@ghcloud/cube-ui";

import type { AgentCardItem } from "./agent-data";
import { formatAgentStatusLabel } from "./agent-data";
import { writeDefaultAgentId } from "@/views/assistant/assistant-default-agent";

import styles from "./agent-management.module.less";

export const AgentCard = defineComponent({
  name: "AgentCard",
  props: {
    item: {
      type: Object as PropType<AgentCardItem>,
      required: true,
    },
    mode: {
      type: String as PropType<"mine" | "library">,
      required: true,
    },
    defaultAgentId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["view", "edit", "delete", "install", "update", "defaultChange", "list", "unlist"],
  setup(props, { emit }) {
    const menuVisible = ref(false);
    const moreWrapRef = ref<HTMLDivElement | null>(null);

    const isDefault = computed(() => props.defaultAgentId === props.item.id);
    const isInstalled = computed(() => props.item.installed === true);
    const hasUpdate = computed(() => props.item.hasUpdate === true);
    const canEdit = computed(() => props.mode === "mine" && !props.item.fromLibrary && props.item.id.startsWith("agt_"));
    const canUnlist = computed(() => props.mode === "library" && props.item.canUnlist === true);
    const canList = computed(
      () =>
        canEdit.value &&
        props.item.status === "published" &&
        props.item.publishedVersionNo != null &&
        !(props.item.listedInLibrary ?? props.item.listed),
    );

    const closeMenu = (): void => {
      menuVisible.value = false;
    };

    const handleDocumentClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (moreWrapRef.value?.contains(target)) {
        return;
      }
      closeMenu();
    };

    onMounted(() => {
      document.addEventListener("click", handleDocumentClick);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleDocumentClick);
    });

    const handleView = (): void => {
      emit("view", props.item.id);
    };

    const handleEdit = (event?: MouseEvent): void => {
      event?.stopPropagation();
      closeMenu();
      if (!canEdit.value) {
        return;
      }
      emit("edit", props.item.id);
    };

    const handleDelete = (event?: MouseEvent): void => {
      event?.stopPropagation();
      closeMenu();
      emit("delete", props.item.id);
    };

    const handleInstall = (event?: MouseEvent): void => {
      event?.stopPropagation();
      if (isInstalled.value && !hasUpdate.value) {
        message.info("该智能体已添加");
        return;
      }
      if (hasUpdate.value) {
        emit("update", props.item.libraryRef ?? props.item.id);
        return;
      }
      emit("install", props.item.libraryRef ?? props.item.id);
    };

    const handleUnlist = (event?: MouseEvent): void => {
      event?.stopPropagation();
      emit("unlist", props.item.id);
    };

    const handleList = (event?: MouseEvent): void => {
      event?.stopPropagation();
      if (!canList.value || props.item.publishedVersionNo == null) {
        return;
      }
      emit("list", props.item.id, props.item.publishedVersionNo);
    };

    const handleSetDefault = (event?: MouseEvent): void => {
      event?.stopPropagation();
      if (props.item.status !== "published") {
        message.warning("请先发布后再设为默认");
        return;
      }
      writeDefaultAgentId(props.item.id);
      emit("defaultChange", props.item.id);
      message.success(isDefault.value ? "已是默认智能体" : "已设为助手默认智能体");
    };

    return () => {
      const Icon = props.item.icon;
      const isPublished = props.item.status === "published";
      const avatarUrl = props.item.avatarUrl?.trim() ?? "";
      return (
        <article class={[styles.agentCard, hasUpdate.value ? styles.hasUpdate : undefined, styles.agentCardEditable]} onClick={handleView}>
          <div class={styles.cardTop}>
            <div class={[styles.agentIcon, !avatarUrl && styles[props.item.iconClass], avatarUrl && styles.agentIconImage]}>
              {avatarUrl ? <img src={avatarUrl} alt="" /> : <Icon />}
            </div>
            {props.mode === "mine" && (
              <div class={styles.cardTopRight}>
                {hasUpdate.value ? <span class={styles.updateBadge}>有新版本</span> : null}
                <span
                  class={[
                    styles.statusTag,
                    (props.item.listedInLibrary ?? props.item.listed)
                      ? styles.statusListed
                      : isPublished
                        ? styles.statusPublished
                        : styles.statusDraft,
                  ]}
                >
                  {formatAgentStatusLabel(props.item)}
                  {isDefault.value ? " · 默认" : ""}
                </span>
                <div class={[styles.moreWrap, menuVisible.value ? styles.moreWrapOpen : undefined]} ref={moreWrapRef}>
                  <button
                    type="button"
                    class={styles.moreButton}
                    aria-label="更多操作"
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                      menuVisible.value = !menuVisible.value;
                    }}
                  >
                    <MoreOutlined />
                  </button>
                  {menuVisible.value && (
                    <div
                      class={styles.cardMenu}
                      onClick={(event: MouseEvent) => {
                        event.stopPropagation();
                      }}
                    >
                      {canEdit.value ? (
                        <button type="button" onClick={handleEdit}>
                          编辑
                        </button>
                      ) : null}
                      <button type="button" onClick={handleDelete}>
                        {props.item.fromLibrary ? "移除" : "删除"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <h3 class={styles.cardTitle}>{props.item.name}</h3>
          <p class={styles.cardDesc}>{props.item.description}</p>
          <div
            class={styles.cardActions}
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
            }}
          >
            {props.mode === "library" ? (
              canUnlist.value ? (
                <Button class={[styles.cardAction, styles.cardListButtonListed]} onClick={handleUnlist}>
                  下架
                </Button>
              ) : (
                <Button
                  class={[styles.cardAction, isInstalled.value && !hasUpdate.value ? styles.cardActionInstalled : undefined]}
                  type={isInstalled.value && !hasUpdate.value ? "default" : "primary"}
                  disabled={isInstalled.value && !hasUpdate.value}
                  onClick={handleInstall}
                >
                  {isInstalled.value ? (hasUpdate.value ? "更新" : "已添加") : "一键添加"}
                </Button>
              )
            ) : (
              <>
                {canList.value ? (
                  <Button
                    class={styles.cardListButton}
                    onClick={(event: MouseEvent) => {
                      handleList(event);
                    }}
                  >
                    上架
                  </Button>
                ) : null}
                <Button
                  class={[styles.cardAction, canList.value ? styles.cardActionCompact : undefined]}
                  onClick={(event: MouseEvent) => {
                    handleSetDefault(event);
                  }}
                >
                  {isDefault.value ? "默认智能体" : "设为默认"}
                </Button>
              </>
            )}
          </div>
        </article>
      );
    };
  },
});
