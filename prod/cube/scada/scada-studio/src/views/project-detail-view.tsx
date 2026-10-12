import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons-vue";
import { Button, Input, Card, Empty, Spin, message, Modal, Dropdown, Menu, Breadcrumb } from "ant-design-vue";
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  updated_at: string;
}

interface PageSummary {
  id: string;
  name: string;
  project_id: string | null;
  thumbnail: string | null;
  updated_at: string;
}

export default defineComponent({
  name: "ProjectDetailView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const projectId = computed(() => route.params.projectId as string);

    const project = ref<ProjectRecord | null>(null);
    const pages = ref<PageSummary[]>([]);
    const loading = ref(false);
    const searchText = ref("");
    const creating = ref(false);

    // Rename modal state
    const renameModalVisible = ref(false);
    const currentRenamePage = ref<PageSummary | null>(null);
    const newName = ref("");

    const filteredPages = computed(() => pages.value.filter((p) => p.name.toLowerCase().includes(searchText.value.toLowerCase())));

    async function loadData() {
      loading.value = true;
      try {
        const [projResp, pagesResp] = await Promise.all([
          fetch(`/scada/api/projects/${projectId.value}`),
          fetch(`/scada/api/projects/${projectId.value}/pages`),
        ]);
        if (!projResp.ok) {
          await router.push("/projects");
          return;
        }
        project.value = (await projResp.json()) as ProjectRecord;
        pages.value = pagesResp.ok ? ((await pagesResp.json()) as PageSummary[]) : [];
      } catch (err) {
        console.error("[ProjectDetailView] load failed:", err);
        message.error("加载失败");
      } finally {
        loading.value = false;
      }
    }

    async function createPage() {
      creating.value = true;
      try {
        const resp = await fetch("/scada/api/pages/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "未命名画面", content: "{}", project_id: projectId.value }),
        });
        if (!resp.ok) throw new Error(`${resp.status}`);
        const created = (await resp.json()) as { id: string };

        // Assign to this project
        await fetch(`/scada/api/projects/${projectId.value}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId: created.id }),
        }).catch(() => {
          /* non-fatal */
        });

        message.success("画面已创建");
        await router.push(`/projects/${projectId.value}/pages/${created.id}`);
      } catch {
        message.error("创建失败，请重试");
      } finally {
        creating.value = false;
      }
    }

    async function copyPage(page: PageSummary) {
      try {
        const resp = await fetch(`/scada/api/pages/${page.id}/copy`, { method: "POST" });
        if (!resp.ok) {
          let detail = `复制失败（${resp.status}）`;
          try {
            const body = (await resp.json()) as { message?: string };
            if (typeof body.message === "string" && body.message.trim()) {
              detail = body.message;
            }
          } catch {
            /* ignore */
          }
          message.error(detail);
          return;
        }
        message.success("画面已复制");
        await loadData();
      } catch {
        message.error("复制失败");
      }
    }

    async function renamePage(page: PageSummary) {
      currentRenamePage.value = page;
      newName.value = page.name;
      renameModalVisible.value = true;
    }

    function handleRenameConfirm() {
      const trimmed = newName.value.trim();
      if (!trimmed || !currentRenamePage.value || trimmed === currentRenamePage.value.name) {
        renameModalVisible.value = false;
        return;
      }

      const page = currentRenamePage.value;
      fetch(`/scada/api/pages/${page.id}`)
        .then((res) => res.json())
        .then(async (rec: { content: string }) => {
          const resp = await fetch(`/scada/api/pages/${page.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed, content: rec.content }),
          });

          if (!resp.ok) throw new Error(`${resp.status}`);

          message.success("重命名成功");
          await loadData();
          renameModalVisible.value = false;
          currentRenamePage.value = null;
          newName.value = "";
        })
        .catch(() => {
          message.error("重命名失败");
          renameModalVisible.value = false;
        });
    }

    function handleRenameCancel() {
      renameModalVisible.value = false;
      currentRenamePage.value = null;
      newName.value = "";
    }

    async function deletePage(page: PageSummary) {
      Modal.confirm({
        title: `确认删除「${page.name}」？`,
        content: "删除后无法恢复",
        okText: "删除",
        okButtonProps: { danger: true },
        cancelText: "取消",
        async onOk() {
          try {
            const resp = await fetch(`/scada/api/pages/${page.id}`, { method: "DELETE" });
            if (!resp.ok) throw new Error(`${resp.status}`);
            message.success("已删除");
            await loadData();
          } catch {
            message.error("删除失败");
          }
        },
      });
    }

    function formatDate(dateStr: string) {
      try {
        return new Date(dateStr).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dateStr;
      }
    }

    onMounted(loadData);

    return () => (
      <div style={{ padding: "24px 32px", height: "100%", overflowY: "auto", background: "#f5f5f5" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => router.push("/projects")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#888",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: "12px" }} />
          </button>
          <Breadcrumb>
            <Breadcrumb.Item>
              <span style={{ cursor: "pointer", color: "#888", fontSize: "13px" }} onClick={() => router.push("/projects")}>
                所有项目
              </span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ fontSize: "13px", color: "#333" }}>{project.value?.name ?? "加载中…"}</span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#141414", margin: 0 }}>{project.value?.name ?? ""}</h1>
            {project.value?.description && (
              <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>{project.value.description}</p>
            )}
          </div>
          <Button type="primary" icon={<PlusOutlined />} loading={creating.value} onClick={createPage}>
            新建画面
          </Button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "20px", maxWidth: "320px" }}>
          <Input
            v-model:value={searchText.value}
            placeholder="搜索画面名称..."
            prefix={<SearchOutlined style={{ color: "#bbb" }} />}
            allowClear
          />
        </div>

        {/* Pages grid */}
        <Spin spinning={loading.value}>
          {filteredPages.value.length === 0 && !loading.value ? (
            <Empty description={searchText.value ? "没有匹配的画面" : "暂无画面，点击「新建画面」开始"} style={{ marginTop: "80px" }}>
              {!searchText.value && (
                <Button type="primary" onClick={createPage} loading={creating.value}>
                  新建画面
                </Button>
              )}
            </Empty>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {filteredPages.value.map((page) => (
                <Card
                  key={page.id}
                  hoverable
                  style={{ cursor: "pointer", borderRadius: "8px" }}
                  bodyStyle={{ padding: "16px 20px" }}
                  onClick={() => router.push(`/projects/${projectId.value}/pages/${page.id}`)}
                  extra={
                    <Dropdown
                      trigger={["click"]}
                      overlay={
                        <Menu
                          onClick={({ domEvent }: { domEvent: Event }) => domEvent.stopPropagation()}
                          items={[
                            {
                              key: "open",
                              label: "打开编辑器",
                              icon: <EditOutlined />,
                              onClick: () => router.push(`/projects/${projectId.value}/pages/${page.id}`),
                            },
                            { key: "copy", label: "复制画面", icon: <CopyOutlined />, onClick: () => copyPage(page) },
                            { key: "rename", label: "重命名", icon: <EditOutlined />, onClick: () => renamePage(page) },
                            { type: "divider" },
                            { key: "delete", label: "删除", icon: <DeleteOutlined />, danger: true, onClick: () => deletePage(page) },
                          ]}
                        />
                      }
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                        style={{ color: "#888" }}
                      />
                    </Dropdown>
                  }
                >
                  <div
                    style={{
                      width: "100%",
                      height: "120px",
                      background: "#f0f2f5",
                      borderRadius: "6px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ccc",
                      fontSize: "28px",
                      overflow: "hidden",
                    }}
                  >
                    {page.thumbnail ? (
                      <img src={page.thumbnail} alt={page.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <FileTextOutlined />
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#141414", marginBottom: "6px" }}>{page.name}</div>
                  <div style={{ fontSize: "12px", color: "#aaa" }}>修改于 {formatDate(page.updated_at)}</div>
                </Card>
              ))}
            </div>
          )}
        </Spin>

        {/* Rename Modal */}
        <Modal
          v-model:open={renameModalVisible.value}
          title="重命名画面"
          okText="确认"
          cancelText="取消"
          onOk={handleRenameConfirm}
          onCancel={handleRenameCancel}
        >
          <Input v-model:value={newName.value} placeholder="请输入新名称" autofocus />
        </Modal>
      </div>
    );
  },
});
