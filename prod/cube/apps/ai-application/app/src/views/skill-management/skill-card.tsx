import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from "vue";

import { Button, MoreOutlined, message } from "@ghcloud/cube-ui";

import type { SkillCardItem } from "./skill-data";

import styles from "./skill-management.module.less";

export const SkillCard = defineComponent({
  name: "SkillCard",
  props: {
    item: {
      type: Object as PropType<SkillCardItem>,
      required: true,
    },
    mode: {
      type: String as PropType<"library" | "mine">,
      required: true,
    },
  },
  emits: ["view", "add", "update", "edit", "delete", "unlist"],
  setup(props, { emit }) {
    const menuVisible = ref(false);
    const moreWrapRef = ref<HTMLDivElement | null>(null);

    const isBuiltin = computed(() => props.item.isBuiltin);
    const isAdded = computed(() => props.item.added);
    const hasUpdate = computed(() => props.item.hasUpdate);
    const canEdit = computed(() => props.mode === "mine" && !props.item.fromLibrary && props.item.id.startsWith("skl_"));
    const canUnlist = computed(() => props.mode === "library" && props.item.canUnlist === true);

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

    const handleView = () => {
      emit("view", props.item.id);
    };

    const handleAdd = (e?: MouseEvent) => {
      e?.stopPropagation();
      if (isAdded.value && !hasUpdate.value) {
        message.info("该技能已添加");
        return;
      }
      if (hasUpdate.value) {
        emit("update", props.item.id);
      } else {
        emit("add", props.item.id);
      }
    };

    const handleEdit = (event?: MouseEvent) => {
      event?.stopPropagation();
      closeMenu();
      if (!canEdit.value) return;
      emit("edit", props.item.id);
    };

    const handleDelete = (event?: MouseEvent) => {
      event?.stopPropagation();
      closeMenu();
      emit("delete", props.item.id);
    };

    const handleUnlist = (event?: MouseEvent) => {
      event?.stopPropagation();
      emit("unlist", props.item.id);
    };

    return () => {
      const Icon = props.item.icon;
      const isAddedValue = isAdded.value;
      const hasUpdateValue = hasUpdate.value;
      const canEditValue = canEdit.value;
      const canUnlistValue = canUnlist.value;

      return (
        <article
          class={[styles.skillCard, hasUpdateValue ? styles.hasUpdate : undefined, canEditValue ? styles.skillCardEditable : undefined]}
          onClick={handleView}
        >
          <div class={styles.cardTop}>
            <div class={[styles.skillIcon, styles[props.item.iconClass]]}>
              <Icon />
            </div>
            <div class={styles.cardTopRight}>
              {hasUpdateValue && <span class={styles.updateBadge}>有新版本</span>}
              <span class={styles.categoryTag}>{props.item.category}</span>
              {props.mode === "mine" && (
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
                      {canEditValue && (
                        <button type="button" onClick={handleEdit}>
                          编辑
                        </button>
                      )}
                      <button type="button" onClick={handleDelete}>
                        {isBuiltin.value ? "移除" : "删除"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <h3 class={styles.cardTitle}>{props.item.name}</h3>
          <p class={styles.cardDesc}>{props.item.description}</p>

          {props.mode === "library" ? (
            <div class={styles.cardActions} onClick={(e: MouseEvent) => e.stopPropagation()}>
              {canUnlistValue ? (
                <Button class={[styles.cardAction, styles.cardListButtonListed]} onClick={handleUnlist}>
                  下架
                </Button>
              ) : (
                <Button
                  class={[styles.cardAction, isAddedValue && !hasUpdateValue ? styles.cardActionInstalled : undefined]}
                  type={isAddedValue ? "default" : "primary"}
                  disabled={isAddedValue && !hasUpdateValue}
                  onClick={handleAdd}
                >
                  {isAddedValue ? (hasUpdateValue ? "更新" : "已添加") : "一键添加"}
                </Button>
              )}
            </div>
          ) : null}
        </article>
      );
    };
  },
});
