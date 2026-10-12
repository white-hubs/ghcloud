import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";
import { Button, Input, Card, Empty, Spin, message, Modal, Dropdown, Menu } from "ant-design-vue";
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default defineComponent({
  name: "ProjectListView",
  setup() {
    const router = useRouter();
    const projects = ref<ProjectRecord[]>([]);
    const loading = ref(false);
    const searchText = ref("");
    const creating = ref(false);

    // Project rename modal state
    const renameProjectModalVisible = ref(false);
    const currentRenameProject = ref<ProjectRecord | null>(null);
    const newProjectName = ref("");

    const filteredProjects = () => projects.value.filter((p) => p.name.toLowerCase().includes(searchText.value.toLowerCase()));

    async function loadProjects() {
      loading.value = true;
      try {
        const resp = await fetch("/scada/api/projects/");
        if (!resp.ok) throw new Error(`${resp.status}`);
        projects.value = (await resp.json()) as ProjectRecord[];
      } catch (err) {
        console.error("[ProjectListView] load failed:", err);
        message.error("加载项目列表失败，请确认服务已启动");
      } finally {
        loading.value = false;
      }
    }

    async function createProject() {
      Modal.confirm({
        title: "创建新项目",
        content: <Input id="new-project-name" placeholder="输入项目名称" onPressEnter={() => Modal.destroyAll()} />,
        okText: "创建",
        cancelText: "取消",
        async onOk() {
          const input = document.getElementById("new-project-name") as HTMLInputElement | null;
          const name = input?.value?.trim() || "未命名项目";
          creating.value = true;
          try {
            const resp = await fetch("/scada/api/projects/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
            if (!resp.ok) throw new Error(`${resp.status}`);
            const created = (await resp.json()) as ProjectRecord;
            message.success("项目已创建");
            await router.push(`/projects/${created.id}`);
          } catch {
            message.error("创建失败，请重试");
          } finally {
            creating.value = false;
          }
        },
      });
    }

    async function renameProject(project: ProjectRecord) {
      currentRenameProject.value = project;
      newProjectName.value = project.name;
      renameProjectModalVisible.value = true;
    }

    function handleRenameProjectConfirm() {
      const trimmed = newProjectName.value.trim();
      if (!trimmed || !currentRenameProject.value || trimmed === currentRenameProject.value.name) {
        renameProjectModalVisible.value = false;
        return;
      }

      const project = currentRenameProject.value;
      fetch(`/scada/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
        .then(async (resp) => {
          if (!resp.ok) throw new Error(`${resp.status}`);
          message.success("重命名成功");
          await loadProjects();
          renameProjectModalVisible.value = false;
          currentRenameProject.value = null;
          newProjectName.value = "";
        })
        .catch(() => {
          message.error("重命名失败");
          renameProjectModalVisible.value = false;
        });
    }

    function handleRenameProjectCancel() {
      renameProjectModalVisible.value = false;
      currentRenameProject.value = null;
      newProjectName.value = "";
    }

    async function deleteProject(project: ProjectRecord) {
      Modal.confirm({
        title: `确认删除「${project.name}」？`,
        content: "项目将被删除；其下画面会保留为历史数据，但不会在组态 Demo 中显示",
        okText: "删除",
        okButtonProps: { danger: true },
        cancelText: "取消",
        async onOk() {
          try {
            const resp = await fetch(`/scada/api/projects/${project.id}`, { method: "DELETE" });
            if (!resp.ok) throw new Error(`${resp.status}`);
            message.success("已删除");
            await loadProjects();
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

    onMounted(loadProjects);

    return () => (
      <div style={{ padding: "32px", height: "100%", overflowY: "auto", background: "#f5f5f5" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#141414", margin: 0 }}>项目概览</h1>
            <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>管理所有组态项目，每个项目包含多张画面</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} loading={creating.value} onClick={createProject}>
            创建新项目
          </Button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "20px", maxWidth: "320px" }}>
          <Input
            v-model:value={searchText.value}
            placeholder="搜索项目名称..."
            prefix={<SearchOutlined style={{ color: "#bbb" }} />}
            allowClear
          />
        </div>

        {/* Content */}
        <Spin spinning={loading.value}>
          {filteredProjects().length === 0 && !loading.value ? (
            <Empty description={searchText.value ? "没有匹配的项目" : "暂无项目，点击「创建新项目」开始"} style={{ marginTop: "80px" }}>
              {!searchText.value && (
                <Button type="primary" onClick={createProject} loading={creating.value}>
                  创建新项目
                </Button>
              )}
            </Empty>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {filteredProjects().map((project) => (
                <Card
                  key={project.id}
                  hoverable
                  style={{ cursor: "pointer", borderRadius: "8px" }}
                  bodyStyle={{ padding: "16px 20px" }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  extra={
                    <Dropdown
                      trigger={["click"]}
                      overlay={
                        <Menu
                          onClick={({ domEvent }: { domEvent: Event }) => domEvent.stopPropagation()}
                          items={[
                            {
                              key: "open",
                              label: "打开",
                              icon: <RightOutlined />,
                              onClick: () => router.push(`/projects/${project.id}`),
                            },
                            {
                              key: "rename",
                              label: "重命名",
                              icon: <EditOutlined />,
                              onClick: () => renameProject(project),
                            },
                            { type: "divider" },
                            {
                              key: "delete",
                              label: "删除",
                              icon: <DeleteOutlined />,
                              danger: true,
                              onClick: () => deleteProject(project),
                            },
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
                  {/* Thumbnail */}
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
                    }}
                  >
                    <AppstoreOutlined />
                  </div>

                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#141414", marginBottom: "4px" }}>{project.name}</div>
                  {project.description && <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{project.description}</div>}
                  <div style={{ fontSize: "12px", color: "#aaa" }}>修改于 {formatDate(project.updated_at)}</div>
                </Card>
              ))}
            </div>
          )}
        </Spin>

        {/* Project Rename Modal */}
        <Modal
          v-model:open={renameProjectModalVisible.value}
          title="重命名项目"
          okText="确认"
          cancelText="取消"
          onOk={handleRenameProjectConfirm}
          onCancel={handleRenameProjectCancel}
        >
          <Input v-model:value={newProjectName.value} placeholder="请输入新项目名称" autofocus />
        </Modal>
      </div>
    );
  },
});
