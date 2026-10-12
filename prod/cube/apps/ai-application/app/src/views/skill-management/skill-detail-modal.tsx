import { computed, defineComponent, ref, watch, type PropType } from "vue";

import { Button, Modal, Spin, Tag } from "@ghcloud/cube-ui";
import { ThunderboltOutlined, FileSearchOutlined, BarChartOutlined, BookOutlined, BellOutlined } from "@ghcloud/cube-ui";

import type { SkillCardItem } from "./skill-data";
import { SIX_CONFIG_LABELS, fetchSkillCardDetail } from "./skill-data";
import { SkillReferenceDisplay } from "./skill-reference-display";

import styles from "./skill-management.module.less";

const CATEGORY_ICONS: Record<string, any> = {
  数据查询: FileSearchOutlined,
  工作执行: ThunderboltOutlined,
  分析汇报: BarChartOutlined,
  知识咨询: BookOutlined,
  智能提醒: BellOutlined,
};

export const SkillDetailModal = defineComponent({
  name: "SkillDetailModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    skillId: {
      type: String as PropType<string | null>,
      default: null,
    },
    mode: {
      type: String as PropType<"library" | "mine">,
      default: "library",
    },
    librarySkills: {
      type: Array as PropType<SkillCardItem[]>,
      default: () => [],
    },
    mySkills: {
      type: Array as PropType<SkillCardItem[]>,
      default: () => [],
    },
    skill: {
      type: Object as PropType<SkillCardItem | null>,
      default: null,
    },
  },
  emits: ["update:visible", "add", "update", "edit", "unlist"],
  setup(props, { emit }) {
    const sixConfigExpanded = ref(false);
    const introExpanded = ref(false);
    const loadedSkill = ref<SkillCardItem | null>(null);
    const loading = ref(false);

    const resetDetailPanelState = (): void => {
      sixConfigExpanded.value = false;
      introExpanded.value = false;
    };

    watch(
      () => [props.visible, props.skillId, props.mode] as const,
      ([visible, skillId, mode]) => {
        if (!visible || !skillId) {
          loadedSkill.value = null;
          return;
        }
        resetDetailPanelState();
        loadedSkill.value = props.skill;
        loading.value = true;
        void fetchSkillCardDetail(skillId, mode)
          .then((detail) => {
            if (detail) {
              loadedSkill.value = detail;
            }
          })
          .finally(() => {
            loading.value = false;
          });
      },
      { immediate: true },
    );

    const skill = computed(() => {
      if (loadedSkill.value) {
        return loadedSkill.value;
      }
      const source = props.mode === "library" ? props.librarySkills : props.mySkills;
      return source.find((s) => s.id === props.skillId) || null;
    });

    const isBuiltin = computed(() => skill.value?.isBuiltin ?? false);
    const isAdded = computed(() => {
      return props.mySkills.some((s) => s.id === props.skillId);
    });
    const hasUpdate = computed(() => {
      const mySkill = props.mySkills.find((s) => s.id === props.skillId);
      return mySkill?.hasUpdate ?? false;
    });
    const canEdit = computed(() => {
      const s = skill.value;
      return props.mode === "mine" && Boolean(s) && !s!.fromLibrary && s!.id.startsWith("skl_");
    });
    const canUnlist = computed(() => {
      const s = skill.value;
      return props.mode === "library" && s?.canUnlist === true;
    });

    const CategoryIcon = computed(() => {
      if (!skill.value) return null;
      return CATEGORY_ICONS[skill.value.category] || ThunderboltOutlined;
    });

    const sixConfigItems = computed(() => {
      if (!skill.value) return [];
      const config = skill.value.config;
      return [
        { key: "usageExample", label: SIX_CONFIG_LABELS.usageExample, value: config.usageExample },
        { key: "outputSpec", label: SIX_CONFIG_LABELS.outputSpec, value: config.outputSpec },
        { key: "inputReq", label: SIX_CONFIG_LABELS.inputReq, value: config.inputReq },
        { key: "pitfallGuide", label: SIX_CONFIG_LABELS.pitfallGuide, value: config.pitfallGuide },
        { key: "checklist", label: SIX_CONFIG_LABELS.checklist, value: config.checklist },
        { key: "reference", label: SIX_CONFIG_LABELS.reference, value: config.reference },
      ];
    });

    const handleClose = () => {
      emit("update:visible", false);
    };

    const handleAdd = () => {
      if (skill.value) {
        emit("add", skill.value.id);
      }
    };

    const handleUpdate = () => {
      if (skill.value) {
        emit("update", skill.value.id);
      }
    };

    const handleEdit = () => {
      if (skill.value) {
        emit("edit", skill.value.id);
      }
    };

    const handleUnlist = () => {
      if (skill.value) {
        emit("unlist", skill.value.id);
      }
    };

    return () => {
      const s = skill.value;
      if (!s) return null;

      const Icon = CategoryIcon.value;
      const added = isAdded.value;
      const hasUpdateFlag = hasUpdate.value;
      const editable = canEdit.value;
      const showUnlist = canUnlist.value;

      return (
        <Modal
          title="技能详情"
          visible={props.visible}
          onCancel={handleClose}
          width={600}
          centered
          class={styles.detailModal}
          bodyStyle={{ padding: "16px 24px", overflow: "hidden" }}
          footer={
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <Button onClick={handleClose}>关闭</Button>
              {showUnlist && <Button onClick={handleUnlist}>下架</Button>}
              {editable && (
                <Button type="primary" onClick={handleEdit}>
                  编辑
                </Button>
              )}
              {props.mode === "library" && !showUnlist && (
                <Button
                  type={added && !hasUpdateFlag ? "default" : "primary"}
                  disabled={added && !hasUpdateFlag}
                  onClick={hasUpdateFlag ? handleUpdate : handleAdd}
                >
                  {added ? (hasUpdateFlag ? "更新到最新版本" : "已添加") : "一键添加"}
                </Button>
              )}
            </div>
          }
        >
          <div class={styles.detailModalSpin}>
            <Spin spinning={loading.value}>
              <div class={styles.detailModalBody}>
                <div class={styles.detailHeader}>
                  <div class={[styles.detailIcon, styles[s.iconClass]]}>{Icon && <Icon />}</div>
                  <div class={styles.detailInfo}>
                    <h3 class={styles.detailName}>{s.name}</h3>
                    <div class={styles.detailMeta}>
                      <Tag color="blue">{s.category}</Tag>
                      {s.isBuiltin && <Tag color="green">内置</Tag>}
                      {added && <Tag color="success">已添加</Tag>}
                      {hasUpdateFlag && <Tag color="warning">有新版本</Tag>}
                      <span style="color: #9ca3af; font-size: 12px;">版本 {s.version}</span>
                    </div>
                  </div>
                </div>

                <div class={[styles.detailSection, styles.detailSectionFixed]}>
                  <h4 class={styles.detailSectionTitle}>技能介绍</h4>
                  <div class={[styles.detailContent, styles.detailScrollBox]}>{s.description || "暂无介绍"}</div>
                </div>

                {s.intro ? (
                  <div class={[styles.detailSection, styles.detailSectionFixed]}>
                    <div
                      class={styles.detailCollapseHeader}
                      onClick={() => {
                        introExpanded.value = !introExpanded.value;
                      }}
                    >
                      <h4 class={styles.detailSectionTitle}>
                        技能详情
                        <span class={styles.detailSectionSubtitle}>（原始描述信息）</span>
                      </h4>
                      <span class={styles.detailCollapseAction}>{introExpanded.value ? "收起" : "展开"}</span>
                    </div>
                    {introExpanded.value ? <div class={[styles.detailContent, styles.detailScrollBoxTall]}>{s.intro}</div> : null}
                  </div>
                ) : null}

                <div class={[styles.detailSection, styles.detailSectionFixed]}>
                  <div
                    class={styles.detailCollapseHeader}
                    onClick={() => {
                      sixConfigExpanded.value = !sixConfigExpanded.value;
                    }}
                  >
                    <h4 class={styles.detailSectionTitle}>
                      六项配置
                      <span class={styles.detailSectionSubtitle}>（使用示例 / 输出规范 / 输入要求 / 避坑指南 / 自检清单 / 参考资源）</span>
                    </h4>
                    <span class={styles.detailCollapseAction}>{sixConfigExpanded.value ? "收起" : "展开"}</span>
                  </div>

                  {sixConfigExpanded.value ? (
                    <div class={[styles.sixConfigSection, styles.detailScrollBoxTall]}>
                      {sixConfigItems.value.map((item) => (
                        <div key={item.key} class={styles.configItem}>
                          <h5 class={styles.configItemTitle}>{item.label}</h5>
                          {item.key === "reference" ? (
                            <SkillReferenceDisplay value={item.value ?? ""} />
                          ) : (
                            <div class={item.value ? styles.configItemContent : styles.configItemEmpty}>{item.value || "暂无配置"}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Spin>
          </div>
        </Modal>
      );
    };
  },
});
