import styles from "./report-template-editor.module.less";
import type { TemplateVariable, TemplateSection, ReportTemplate } from "@/hooks/useReportTemplate";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons-vue";
import { Button, Form, FormItem, Input, Select, SelectOption, Tabs, TabPane, Table, Modal, message } from "@ghcloud/cube-ui";
import { nanoid } from "nanoid";
import { defineComponent, ref, reactive, watch, onMounted } from "vue";

export const ReportTemplateEditor = defineComponent({
  name: "ReportTemplateEditor",
  props: {
    value: {
      type: Object as () => ReportTemplate | null,
      default: null,
    },
    variables: {
      type: Array as () => TemplateVariable[],
      default: () => [],
    },
  },
  emits: ["update:value", "update:variables"],
  setup(props, { emit }) {
    const formRef = ref();
    const activeTab = ref("basic");
    const variableModalVisible = ref(false);
    const sectionModalVisible = ref(false);
    const editingVariable = ref<TemplateVariable | null>(null);
    const editingSection = ref<TemplateSection | null>(null);
    const isEditingVariable = ref(false);
    const isEditingSection = ref(false);

    // 表单数据
    const formState = reactive<{
      template: ReportTemplate;
      newVariable: TemplateVariable;
      newSection: TemplateSection;
    }>({
      template: props.value
        ? { ...props.value }
        : {
            id: nanoid(),
            name: "新建报告模板",
            sections: [],
            watermark: {
              text: ["检测报告", "生成时间: " + new Date().toLocaleString()],
              opacity: 0.5,
            },
          },
      newVariable: {
        key: "",
        name: "",
        value: "",
        type: "text",
      },
      newSection: {
        id: nanoid(),
        type: "title",
        content: "",
      },
    });

    // 监听props变化
    watch(
      () => props.value,
      (newVal) => {
        if (newVal) {
          formState.template = { ...newVal };
        }
      },
    );

    // 更新模板
    const updateTemplate = (): void => {
      emit("update:value", { ...formState.template });
    };

    // 添加变量
    const addVariable = (): void => {
      if (!formState.newVariable.key || !formState.newVariable.name) {
        message.error("变量名和显示名称不能为空");
        return;
      }

      // 检查变量名是否已存在
      if (props.variables.some((v) => v.key === formState.newVariable.key) && !isEditingVariable.value) {
        message.error("变量名已存在");
        return;
      }

      const variable = { ...formState.newVariable };

      if (isEditingVariable.value && editingVariable.value) {
        // 更新变量
        const updatedVariables = props.variables.map((v) => (v.key === editingVariable.value?.key ? variable : v));
        emit("update:variables", updatedVariables);
      } else {
        // 添加新变量
        emit("update:variables", [...props.variables, variable]);
      }

      // 重置表单
      formState.newVariable = {
        key: "",
        name: "",
        value: "",
        type: "text",
      };
      variableModalVisible.value = false;
      isEditingVariable.value = false;
      editingVariable.value = null;
    };

    // 编辑变量
    const editVariable = (variable: TemplateVariable): void => {
      editingVariable.value = variable;
      formState.newVariable = { ...variable };
      isEditingVariable.value = true;
      variableModalVisible.value = true;
    };

    // 删除变量
    const deleteVariable = (key: string): void => {
      Modal.confirm({
        title: "确认删除",
        content: "确定要删除此变量吗？删除后模板中使用此变量的地方将无法正确显示。",
        onOk: () => {
          const updatedVariables = props.variables.filter((v) => v.key !== key);
          emit("update:variables", updatedVariables);
        },
      });
    };

    // 添加章节
    const addSection = (): void => {
      if (formState.newSection.type === "table" && typeof formState.newSection.content === "string") {
        formState.newSection.content = {
          columns: [
            { title: "列1", dataIndex: "col1" },
            { title: "列2", dataIndex: "col2" },
          ],
          dataSource: [{ col1: "示例数据1", col2: "示例数据2" }],
        };
      }

      if (isEditingSection.value && editingSection.value) {
        // 更新章节
        const index = formState.template.sections.findIndex((s) => s.id === editingSection.value?.id);
        if (index !== -1) {
          formState.template.sections[index] = { ...formState.newSection };
        }
      } else {
        // 添加新章节
        formState.template.sections.push({ ...formState.newSection });
      }

      updateTemplate();
      sectionModalVisible.value = false;
      isEditingSection.value = false;
      editingSection.value = null;

      // 重置表单
      formState.newSection = {
        id: nanoid(),
        type: "title",
        content: "",
      };
    };

    // 编辑章节
    const editSection = (section: TemplateSection): void => {
      editingSection.value = section;
      formState.newSection = { ...section };
      isEditingSection.value = true;
      sectionModalVisible.value = true;
    };

    // 删除章节
    const deleteSection = (id: string): void => {
      Modal.confirm({
        title: "确认删除",
        content: "确定要删除此章节吗？",
        onOk: () => {
          formState.template.sections = formState.template.sections.filter((s) => s.id !== id);
          updateTemplate();
        },
      });
    };

    // 移动章节位置
    const moveSection = (id: string, direction: "up" | "down"): void => {
      const index = formState.template.sections.findIndex((s) => s.id === id);
      if (index === -1) {
        return;
      }

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= formState.template.sections.length) {
        return;
      }

      // 交换位置
      const temp = formState.template.sections[index];
      formState.template.sections[index] = formState.template.sections[newIndex];
      formState.template.sections[newIndex] = temp;

      updateTemplate();
    };

    // 打开添加变量模态框
    const openAddVariableModal = (): void => {
      isEditingVariable.value = false;
      editingVariable.value = null;
      formState.newVariable = {
        key: "",
        name: "",
        value: "",
        type: "text",
      };
      variableModalVisible.value = true;
    };

    // 打开添加章节模态框
    const openAddSectionModal = (): void => {
      isEditingSection.value = false;
      editingSection.value = null;
      formState.newSection = {
        id: nanoid(),
        type: "title",
        content: "",
      };
      sectionModalVisible.value = true;
    };

    // 变量类型选项
    const variableTypeOptions = [
      { label: "文本", value: "text" },
      { label: "数字", value: "number" },
      { label: "日期", value: "date" },
      { label: "标签", value: "tag" },
    ];

    // 章节类型选项
    const sectionTypeOptions = [
      { label: "标题", value: "title" },
      { label: "文本", value: "text" },
      { label: "表格", value: "table" },
    ];

    // 变量表格列
    const variableColumns = [
      {
        title: "变量名",
        dataIndex: "key",
        key: "key",
      },
      {
        title: "显示名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        customRender: ({ text }: { text: string }) => {
          const option = variableTypeOptions.find((o) => o.value === text);
          return option ? option.label : text;
        },
      },
      {
        title: "操作",
        key: "action",
        width: 150,
        customRender: ({ record }: { record: TemplateVariable }) => (
          <div class={styles.actionButtons}>
            <Button type="link" onClick={() => editVariable(record)} icon={<EditOutlined />}>
              编辑
            </Button>
            <Button type="link" danger onClick={() => deleteVariable(record.key)} icon={<DeleteOutlined />}>
              删除
            </Button>
          </div>
        ),
      },
    ];

    // 章节表格列
    const sectionColumns = [
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        width: 100,
        customRender: ({ text }: { text: string }) => {
          const option = sectionTypeOptions.find((o) => o.value === text);
          return option ? option.label : text;
        },
      },
      {
        title: "内容预览",
        dataIndex: "content",
        key: "content",
        customRender: ({ text, record }: { text: string | any; record: TemplateSection }) => {
          if (record.type === "table") {
            return "表格数据 [" + (text.columns?.length || 0) + "列, " + (text.dataSource?.length || 0) + "行]";
          }
          return typeof text === "string" ? (text.length > 30 ? text.substring(0, 30) + "..." : text) : JSON.stringify(text);
        },
      },
      {
        title: "操作",
        key: "action",
        width: 200,
        customRender: ({ record }: { record: TemplateSection }) => {
          const index = formState.template.sections.findIndex((s) => s.id === record.id);
          const isFirst = index === 0;
          const isLast = index === formState.template.sections.length - 1;

          return (
            <div class={styles.actionButtons}>
              <Button type="link" disabled={isFirst} onClick={() => moveSection(record.id, "up")}>
                上移
              </Button>
              <Button type="link" disabled={isLast} onClick={() => moveSection(record.id, "down")}>
                下移
              </Button>
              <Button type="link" onClick={() => editSection(record)} icon={<EditOutlined />}>
                编辑
              </Button>
              <Button type="link" danger onClick={() => deleteSection(record.id)} icon={<DeleteOutlined />}>
                删除
              </Button>
            </div>
          );
        },
      },
    ];

    return () => (
      <div class={styles.templateEditor}>
        <Tabs v-model:activeKey={activeTab.value}>
          <TabPane key="basic" tab="基本信息">
            <Form layout="vertical" ref={formRef}>
              <FormItem label="模板名称" required>
                <Input v-model:value={formState.template.name} placeholder="请输入模板名称" onChange={updateTemplate} />
              </FormItem>

              <FormItem label="水印设置">
                <div class={styles.watermarkSettings}>
                  <FormItem label="水印文本" class={styles.nestedFormItem}>
                    <Input.TextArea
                      v-model:value={formState.template.watermark?.text.join("\n")}
                      placeholder="每行一个水印文本"
                      rows={3}
                      onChange={(e: any) => {
                        if (!formState.template.watermark) {
                          formState.template.watermark = {
                            text: [],
                            opacity: 0.5,
                          };
                        }
                        formState.template.watermark.text = e.target.value.split("\n");
                        updateTemplate();
                      }}
                    />
                  </FormItem>

                  <FormItem label="不透明度" class={styles.nestedFormItem}>
                    <Input
                      type="number"
                      v-model:value={formState.template.watermark?.opacity}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={updateTemplate}
                    />
                  </FormItem>
                </div>
              </FormItem>
            </Form>
          </TabPane>

          <TabPane key="variables" tab="变量管理">
            <div class={styles.tableActions}>
              <Button type="primary" onClick={openAddVariableModal} icon={<PlusOutlined />}>
                添加变量
              </Button>
            </div>

            <Table rowKey="key" columns={variableColumns} dataSource={props.variables} pagination={false} bordered />

            <Modal
              title={isEditingVariable.value ? "编辑变量" : "添加变量"}
              v-model:visible={variableModalVisible.value}
              onOk={addVariable}
              onCancel={() => {
                variableModalVisible.value = false;
                isEditingVariable.value = false;
                editingVariable.value = null;
              }}
            >
              <Form layout="vertical">
                <FormItem label="变量名" required>
                  <Input
                    v-model:value={formState.newVariable.key}
                    placeholder="请输入变量名，如: customerName"
                    disabled={isEditingVariable.value}
                  />
                </FormItem>

                <FormItem label="显示名称" required>
                  <Input v-model:value={formState.newVariable.name} placeholder="请输入显示名称，如: 客户名称" />
                </FormItem>

                <FormItem label="变量类型">
                  <Select v-model:value={formState.newVariable.type}>
                    {variableTypeOptions.map((option) => (
                      <SelectOption key={option.value} value={option.value}>
                        {option.label}
                      </SelectOption>
                    ))}
                  </Select>
                </FormItem>

                {formState.newVariable.type === "tag" && (
                  <div class={styles.tagSettings}>
                    <FormItem label="标签颜色">
                      <Input
                        type="color"
                        v-model:value={formState.newVariable.tagStyle?.color || "#ffffff"}
                        onChange={(e: any) => {
                          if (!formState.newVariable.tagStyle) {
                            formState.newVariable.tagStyle = {};
                          }
                          formState.newVariable.tagStyle.color = e.target.value;
                        }}
                      />
                    </FormItem>

                    <FormItem label="背景颜色">
                      <Input
                        type="color"
                        v-model:value={formState.newVariable.tagStyle?.backgroundColor || "#1890ff"}
                        onChange={(e: any) => {
                          if (!formState.newVariable.tagStyle) {
                            formState.newVariable.tagStyle = {};
                          }
                          formState.newVariable.tagStyle.backgroundColor = e.target.value;
                        }}
                      />
                    </FormItem>

                    <FormItem label="边框颜色">
                      <Input
                        type="color"
                        v-model:value={formState.newVariable.tagStyle?.borderColor || "transparent"}
                        onChange={(e: any) => {
                          if (!formState.newVariable.tagStyle) {
                            formState.newVariable.tagStyle = {};
                          }
                          formState.newVariable.tagStyle.borderColor = e.target.value;
                        }}
                      />
                    </FormItem>
                  </div>
                )}

                <FormItem label="默认值">
                  <Input v-model:value={formState.newVariable.value} placeholder="请输入默认值" />
                </FormItem>
              </Form>
            </Modal>
          </TabPane>

          <TabPane key="sections" tab="章节管理">
            <div class={styles.tableActions}>
              <Button type="primary" onClick={openAddSectionModal} icon={<PlusOutlined />}>
                添加章节
              </Button>
            </div>

            <Table rowKey="id" columns={sectionColumns} dataSource={formState.template.sections} pagination={false} bordered />

            <Modal
              title={isEditingSection.value ? "编辑章节" : "添加章节"}
              v-model:visible={sectionModalVisible.value}
              onOk={addSection}
              onCancel={() => {
                sectionModalVisible.value = false;
                isEditingSection.value = false;
                editingSection.value = null;
              }}
              width={700}
            >
              <Form layout="vertical">
                <FormItem label="章节类型" required>
                  <Select
                    v-model:value={formState.newSection.type}
                    onChange={() => {
                      // 重置内容
                      if (formState.newSection.type === "table") {
                        formState.newSection.content = {
                          columns: [
                            { title: "列1", dataIndex: "col1" },
                            { title: "列2", dataIndex: "col2" },
                          ],
                          dataSource: [{ col1: "示例数据1", col2: "示例数据2" }],
                        };
                      } else {
                        formState.newSection.content = "";
                      }
                    }}
                  >
                    {sectionTypeOptions.map((option) => (
                      <SelectOption key={option.value} value={option.value}>
                        {option.label}
                      </SelectOption>
                    ))}
                  </Select>
                </FormItem>

                {formState.newSection.type !== "table" && (
                  <FormItem label="内容" required>
                    <Input.TextArea
                      v-model:value={formState.newSection.content as string}
                      placeholder={`请输入${formState.newSection.type === "title" ? "标题" : "文本"}内容，可使用 {{变量名}} 引用变量`}
                      rows={6}
                    />
                    <div class={styles.variableTips}>
                      <p>可用变量：</p>
                      <div class={styles.variableList}>
                        {props.variables.map((variable) => (
                          <span
                            class={styles.variableTag}
                            onClick={() => {
                              const content = formState.newSection.content as string;
                              formState.newSection.content = content + `{{${variable.key}}}`;
                            }}
                          >
                            {`${variable.name} {{${variable.key}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </FormItem>
                )}

                {formState.newSection.type === "table" && (
                  <div class={styles.tableEditor}>
                    <p class={styles.tableEditorTip}>表格数据将在生成报告时动态获取，这里仅配置表格结构</p>
                    <FormItem label="表格列配置">
                      <div class={styles.tableColumns}>
                        {(formState.newSection.content as any).columns.map((column: any, index: number) => (
                          <div class={styles.tableColumn} key={index}>
                            <Input
                              v-model:value={(formState.newSection.content as any).columns[index].title}
                              placeholder="列标题"
                              class={styles.columnTitle}
                            />
                            <Input
                              v-model:value={(formState.newSection.content as any).columns[index].dataIndex}
                              placeholder="数据字段"
                              class={styles.columnDataIndex}
                            />
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                (formState.newSection.content as any).columns.splice(index, 1);
                              }}
                            />
                          </div>
                        ))}
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => {
                            (formState.newSection.content as any).columns.push({
                              title: `列${(formState.newSection.content as any).columns.length + 1}`,
                              dataIndex: `col${(formState.newSection.content as any).columns.length + 1}`,
                            });
                          }}
                        >
                          添加列
                        </Button>
                      </div>
                    </FormItem>
                  </div>
                )}
              </Form>
            </Modal>
          </TabPane>
        </Tabs>
      </div>
    );
  },
});
