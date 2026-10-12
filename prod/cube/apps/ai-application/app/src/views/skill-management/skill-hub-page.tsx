import { computed, defineComponent, nextTick, ref, onMounted } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Empty, Input, Select, Spin, Tabs, TabPane, message } from "@ghcloud/cube-ui";
import { PlusCircleOutlined, SearchOutlined, ReloadOutlined } from "@ghcloud/cube-ui";

import { SkillCard } from "./skill-card";
import { SkillCreateModal } from "./skill-create-modal";
import type { SkillCardItem, SkillCategoryCode, SkillFormState } from "./skill-data";
import { CATEGORY_OPTIONS, createInitialSkillForm, fetchSkillCardDetail, fetchSkillHubSnapshot, skillToForm } from "./skill-data";
import { SkillDetailModal } from "./skill-detail-modal";
import { SkillEditModal } from "./skill-edit-modal";
import { agentConsoleClient, unlistTenantSkill } from "@/api/agent-console-client";
import { purgeSkillRefFromAuthoredAgents } from "@/views/agent-management/agent-skill-binding";
import { DescriptorDocumentImportModal } from "@/views/descriptor-document-import-modal";

import styles from "./skill-management.module.less";

export const SkillHubPage = defineComponent({
  name: "SkillHubPage",
  setup() {
    const activeTab = ref<"library" | "mine">("mine");
    const keyword = ref("");
    const category = ref<SkillCategoryCode | undefined>(undefined);

    const librarySkills = ref<SkillCardItem[]>([]);
    const mySkills = ref<SkillCardItem[]>([]);
    const loading = ref(false);
    const loadError = ref("");

    const detailModalVisible = ref(false);
    const detailSkillId = ref<string | null>(null);
    const detailMode = ref<"library" | "mine">("library");
    const detailSkill = ref<SkillCardItem | null>(null);

    const createModalVisible = ref(false);
    const importModalVisible = ref(false);
    const editModalVisible = ref(false);
    const editingSkill = ref<SkillFormState | null>(null);

    const filteredLibrarySkills = computed(() => {
      const q = keyword.value.trim().toLowerCase();
      return librarySkills.value.filter((skill) => {
        if (category.value && skill.categoryCode !== category.value) {
          return false;
        }
        if (q) {
          const match = skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });
    });

    const filteredMySkills = computed(() => {
      const q = keyword.value.trim().toLowerCase();
      return mySkills.value.filter((skill) => {
        if (category.value && skill.categoryCode !== category.value) {
          return false;
        }
        if (q) {
          const match = skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });
    });

    const libraryCount = computed(() => filteredLibrarySkills.value.length);
    const mySkillsCount = computed(() => filteredMySkills.value.length);
    const activeTabCount = computed(() => (activeTab.value === "library" ? libraryCount.value : mySkillsCount.value));

    /** 一次拉齐两 tab，避免 mySkills / browseLibrary 各打两遍 */
    const loadData = async (): Promise<void> => {
      loading.value = true;
      loadError.value = "";
      try {
        const snapshot = await fetchSkillHubSnapshot();
        librarySkills.value = snapshot.librarySkills;
        mySkills.value = snapshot.mySkills;
      } catch (error) {
        loadError.value = `加载失败：${String(error)}`;
        message.error(loadError.value);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const handleTabChange = (key: string) => {
      activeTab.value = key as "library" | "mine";
      keyword.value = "";
      category.value = undefined;
    };

    const handleReset = () => {
      keyword.value = "";
      category.value = undefined;
    };

    const handleRefresh = () => {
      void loadData();
    };

    const handleSearch = () => {
      // 关键词/分类已由 filtered* computed 前端过滤，无需再打接口
    };

    const findSkillById = (id: string): SkillCardItem | undefined => {
      return mySkills.value.find((skill) => skill.id === id) ?? librarySkills.value.find((skill) => skill.id === id);
    };

    const handleViewSkill = (id: string) => {
      detailSkillId.value = id;
      detailMode.value = activeTab.value;
      detailSkill.value = findSkillById(id) ?? null;
      detailModalVisible.value = true;
    };

    const handleAddSkill = async (id: string) => {
      const skill = librarySkills.value.find((item) => item.id === id);
      const ref = skill?.libraryRef ?? id;
      try {
        await agentConsoleClient.installSkill({ ref });
        message.success("添加成功");
        await loadData();
      } catch (error) {
        message.error(`添加失败：${String(error)}`);
      }
    };

    const handleUpdateSkill = async (id: string) => {
      const skill = mySkills.value.find((item) => item.id === id) ?? findSkillById(id);
      if (!skill?.shelfId) {
        message.error("未找到可更新的技能条目");
        return;
      }
      const ref = skill.libraryRef ?? skill.id;
      try {
        await agentConsoleClient.removeShelfSkill(skill.shelfId);
        await agentConsoleClient.installSkill({ ref, pin: true });
        message.success("更新成功");
        await loadData();
      } catch (error) {
        message.error(`更新失败：${String(error)}`);
      }
    };

    const openEditModal = async (id: string): Promise<void> => {
      const skill = findSkillById(id);
      if (!skill) {
        message.error("未找到技能数据，请刷新后重试");
        return;
      }
      if (skill.fromLibrary) {
        message.info("从技能库下载的技能不支持编辑");
        return;
      }
      if (!skill.id.startsWith("skl_")) {
        message.info("该技能不支持编辑");
        return;
      }
      try {
        const detail = await fetchSkillCardDetail(id, "mine");
        editingSkill.value = skillToForm(detail ?? skill);
        editModalVisible.value = true;
      } catch (error) {
        message.error(`加载技能失败：${String(error)}`);
      }
    };

    const handleEditSkill = (id: string) => {
      void openEditModal(id);
    };

    const handleDeleteSkill = async (id: string) => {
      const skill = mySkills.value.find((item) => item.id === id);
      if (!skill) {
        return;
      }
      try {
        if (skill.shelfId) {
          await agentConsoleClient.removeShelfSkill(skill.shelfId);
        }

        if (skill.fromLibrary) {
          message.success("已从我的技能移除");
        } else if (skill.listedInLibrary) {
          message.success("已从我的技能移除，技能仍保留在技能库");
        } else if (skill.id.startsWith("skl_")) {
          await agentConsoleClient.deleteSkill(skill.id);
          message.success("删除成功");
        } else if (!skill.shelfId) {
          message.error("无法删除该技能");
          return;
        } else {
          message.success("移除成功");
        }

        // 级联清理：本人智能体 content.skillRefs 中的该技能一并移除（一次 listAgents）
        const purged = await purgeSkillRefFromAuthoredAgents(skill.id).catch(() => 0);
        if (purged > 0) {
          message.info(`已同步清除 ${purged} 个智能体上的该技能绑定`);
        }

        await loadData();
      } catch (error) {
        message.error(`操作失败：${String(error)}`);
      }
    };

    const handleUnlistSkill = async (id: string) => {
      const skill = librarySkills.value.find((item) => item.id === id) ?? findSkillById(id);
      if (!skill?.canUnlist || !skill.id.startsWith("skl_")) {
        return;
      }
      try {
        await unlistTenantSkill(skill.id);
        message.success("已从技能库下架，已下载用户可继续使用");
        await loadData();
      } catch (error) {
        message.error(`下架失败：${String(error)}`);
      }
    };

    const handleCreate = () => {
      createModalVisible.value = true;
    };

    const handleImportSuccess = async () => {
      importModalVisible.value = false;
      await loadData();
      activeTab.value = "mine";
    };

    const handleCreateSuccess = async () => {
      createModalVisible.value = false;
      await loadData();
      activeTab.value = "mine";
    };

    const handleEditSuccess = async () => {
      editModalVisible.value = false;
      editingSkill.value = null;
      await loadData();
    };

    const handleDetailAdd = async (id: string) => {
      await handleAddSkill(id);
      detailModalVisible.value = false;
    };

    const handleDetailUpdate = async (id: string) => {
      await handleUpdateSkill(id);
      detailModalVisible.value = false;
    };

    const handleDetailEdit = (id: string) => {
      detailModalVisible.value = false;
      nextTick(() => {
        void openEditModal(id);
      });
    };

    return () => (
      <CubeLayout
        title="技能中心"
        showFooter={false}
        v-slots={{
          "layout-header": () => (
            <div class={styles.headerActions}>
              <Input
                class={styles.searchInput}
                value={keyword.value}
                placeholder="搜索技能名称、描述..."
                allowClear
                suffix={<SearchOutlined />}
                onPressEnter={handleSearch}
                onUpdate:value={(v: string) => {
                  keyword.value = v ?? "";
                }}
              />
              <Select
                class={styles.categorySelect}
                value={category.value}
                placeholder="全部分类"
                allowClear
                options={CATEGORY_OPTIONS.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
                onChange={(v: SkillCategoryCode | undefined) => {
                  category.value = v;
                }}
              />
              <Button class={styles.queryButton} type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button onClick={handleRefresh} icon={<ReloadOutlined />}>
                刷新
              </Button>
              <Button
                onClick={() => {
                  importModalVisible.value = true;
                }}
              >
                导入 Markdown
              </Button>
              <Button type="primary" class={styles.createButton} onClick={handleCreate}>
                <PlusCircleOutlined />
                创建
              </Button>
            </div>
          ),
          "layout-content": () => (
            <div class={styles.skillHubPage}>
              <div class={styles.skillHubMain}>
                <Spin spinning={loading.value}>
                  <Tabs class={styles.skillTabs} activeKey={activeTab.value} onChange={handleTabChange}>
                    <TabPane key="mine" tab="我的技能">
                      <div class={styles.cardGrid}>
                        {filteredMySkills.value.map((skill) => (
                          <SkillCard
                            key={skill.shelfId ?? skill.id}
                            item={skill}
                            mode="mine"
                            onView={handleViewSkill}
                            onEdit={handleEditSkill}
                            onDelete={handleDeleteSkill}
                          />
                        ))}
                      </div>
                      {filteredMySkills.value.length === 0 && (
                        <div class={styles.emptyState}>
                          <Empty
                            description={
                              loadError.value || (keyword.value.trim() || category.value ? "未找到匹配的技能" : "您还没有添加技能")
                            }
                          />
                        </div>
                      )}
                    </TabPane>
                    <TabPane key="library" tab="技能库">
                      <div class={styles.cardGrid}>
                        {filteredLibrarySkills.value.map((skill) => (
                          <SkillCard
                            key={skill.id}
                            item={skill}
                            mode="library"
                            onView={handleViewSkill}
                            onAdd={handleAddSkill}
                            onUpdate={handleUpdateSkill}
                            onUnlist={handleUnlistSkill}
                          />
                        ))}
                      </div>
                      {filteredLibrarySkills.value.length === 0 && (
                        <div class={styles.emptyState}>
                          <Empty
                            description={loadError.value || (keyword.value.trim() || category.value ? "未找到匹配的技能" : "暂无技能")}
                          />
                        </div>
                      )}
                    </TabPane>
                  </Tabs>
                </Spin>
              </div>
              <div class={styles.skillHubStatsRow}>
                <span class={styles.skillHubStatsText}>
                  共 <strong>{activeTabCount.value}</strong> 个技能
                </span>
              </div>
            </div>
          ),
        }}
      >
        <SkillDetailModal
          v-model:visible={detailModalVisible.value}
          skillId={detailSkillId.value}
          mode={detailMode.value}
          skill={detailSkill.value}
          librarySkills={librarySkills.value}
          mySkills={mySkills.value}
          onAdd={handleDetailAdd}
          onUpdate={handleDetailUpdate}
          onEdit={handleDetailEdit}
          onUnlist={handleUnlistSkill}
        />

        <SkillCreateModal v-model:visible={createModalVisible.value} onSuccess={handleCreateSuccess} />

        <DescriptorDocumentImportModal v-model:visible={importModalVisible.value} kind="skill" onSuccess={handleImportSuccess} />

        <SkillEditModal v-model:visible={editModalVisible.value} initialData={editingSkill.value} onSuccess={handleEditSuccess} />
      </CubeLayout>
    );
  },
});
