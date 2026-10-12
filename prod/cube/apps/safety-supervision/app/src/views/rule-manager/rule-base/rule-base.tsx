import { message, Tree } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { debounce } from "lodash";
import { defineComponent, nextTick, onMounted, ref, watch } from "vue";

import type { addRuleLibraries, Libraries, RuleLibraries } from "@ghcloud/cube-safety-management-service";
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Table, type EventDataNode } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { RuleAddBase } from "./rule-add-base";
import { cubeSafetyManagementAnalysisService } from "@/api/server";
import { useTableScroll } from "@/hook/use-table-scroll";

import style from "./rule-base.module.less";

interface TreeDataItemNode {
  id?: string;
  title: string;
  key: string;
  parentId?: string;
  level?: number;
  itemCode?: string;
  itemType?: string;
  weightAllot?: string;
  itemCodeConcat?: string;
  computeMetric?: string;
  ruleContentTemplate?: string;
  ruleContentTemplateEnabled?: boolean;
  templateMetricVariables?: string;
  displayMetricsEnabled?: boolean;
  displayMetrics?: string;
  children?: TreeDataItemNode[];
  childCount?: number;
  coefficients?: { greaterThan: string; lessThanOrEqual: string; scoreRatio: string }[];
}
export interface TableData {
  id?: string;
  requestId: string;
  name: string;
  content: string;
  weight: string;
  formula: string; // 根据实际数据结构调整
  coefficients?: { greaterThan: string; lessThanOrEqual: string; scoreRatio: string }[] | undefined;
  computeMetric?: string;
  parentId?: string;
  type: string;
  templateMetricVariables?: string;
  ruleContentTemplateEnabled?: boolean;
  displayMetricsEnabled?: boolean;
  displayMetrics?: string;
}
export interface MetricOption {
  value: string;
  label: string;
  computeType: string;
  resultJsonSchema: string | undefined;
}

interface JsonSchemaNode {
  type?: string | string[];
}

export const RuleBase = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();

    const searchValue = ref("");
    // 左侧树形数据
    const showData = ref<TreeDataItemNode[]>([
      {
        title: "全部",
        key: "all",
        children: [],
      },
    ]);

    const treeData = ref<RuleLibraries[]>([]);
    const expandedKey = ref<Key[]>([]);

    const selectOption = ref<MetricOption[]>([]);
    const selectLoading = ref(false);
    const selectedKeys = ref<Key[]>(["all"]);
    const addKay = ref<string>("");
    const weightChange = debounce((e: Event, record: TableData): void => {
      const params = {
        id: record.id ?? "",
        itemName: record.name,
        itemType: record.type,
        coefficients: record.coefficients ?? [],
        weightAllot: Number((e.target as HTMLInputElement).value ?? 0),
        ruleContentTemplate: record.ruleContentTemplateEnabled === false || record.content === "--" ? "" : (record.content ?? ""),
        ruleContentTemplateEnabled: record.ruleContentTemplateEnabled ?? true,
        parentId: record.parentId ?? "",
        computeMetric: record.computeMetric ?? "",
        templateMetricVariables: record.templateMetricVariables ?? "",
        displayMetricsEnabled: record.displayMetricsEnabled ?? false,
        displayMetrics: record.displayMetrics ?? "",
      };
      editLibraries(params);
    }, 500);
    const columns = [
      {
        title: "规则名称",
        align: "center",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "规则内容",
        align: "center",
        dataIndex: "content",
        ellipsis: true,
        width: 380,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={renderFormula(text) || "--"}>{renderFormula(text) || "--"}</PopOver>
        ),
      },
      {
        title: "计分权重",
        align: "center",
        dataIndex: "weight",
        ellipsis: true,
        width: 120,
        customRender: ({ record }: { record: TableData }): JSX.Element => (
          <Input
            v-model:value={record.weight}
            type="number"
            onChange={(e: Event) => weightChange(e, record)}
            showCount={false}
            allowClear={false}
          ></Input>
        ),
      },
      {
        title: "取分条件",
        align: "center",
        width: 260,
        dataIndex: "coefficients",
        ellipsis: true,
        customRender: ({
          text,
          record,
        }: {
          text: { greaterThan: string; lessThanOrEqual: string; scoreRatio: string }[];
          record: TableData;
        }): JSX.Element => (
          <div>
            {text?.map((item, index) => {
              const min = item.greaterThan ? item.greaterThan + "<" : "";
              const max = item.lessThanOrEqual ? "<=" + item.lessThanOrEqual : "";
              return (
                <p key={index}>
                  {min}
                  {record.name}
                  {max}：得分系数{item.scoreRatio};
                </p>
              );
            })}
          </div>
        ),
      },
      {
        title: "操作",
        align: "center",
        dataIndex: "action",
        customRender: ({ record }: { record: TableData }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                preview(record);
              }}
            >
              编辑
            </Button>
            <PopConfirm title="确定要删除这条规则吗?" onConfirm={async () => handleDelete(record.id ?? "")}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    const step = ref(1);
    const screenHeight = ref<number>(window.innerHeight);
    const viewReportData = ref<TableData>();
    const loading = ref(false);
    const treeLoading = ref(false);
    const viewTitle = ref();
    const dataSource = ref<TableData[]>([]);
    const showAddButton = ref<boolean>(false);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const restoredSelectedKey = ref<string>("");

    const queryCache = useListQueryCache({
      defaults: {
        selectedKey: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => {
        const raw = selectedKeys.value[0];
        const key = typeof raw === "string" ? raw : typeof raw === "number" ? String(raw) : "";
        return {
          selectedKey: key && key !== "all" ? key : "",
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
        };
      },
      setState: (next) => {
        const key = typeof next.selectedKey === "string" ? next.selectedKey : "";
        if (key) {
          restoredSelectedKey.value = key;
        }
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });

    const updateHeight = (): void => {
      screenHeight.value = window.innerHeight;
    };

    const getTableData = (): void => {
      let tableData: TreeDataItemNode[] = [];

      // 递归查找节点并返回其完整路径
      const findNodeWithPath = (
        nodes: RuleLibraries[],
        targetKey: string,
        parentPath: string[] = [],
      ): { node: TreeDataItemNode; path: string[] } | null => {
        for (const node of nodes) {
          const currentPath = [...parentPath, node.itemName];

          if (node.id === targetKey) {
            const result = { ...node, key: node.id, title: node.itemName } as unknown as TreeDataItemNode;

            return { node: result, path: currentPath };
          }

          if (node.children && node.children.length > 0) {
            const found = findNodeWithPath(node.children, targetKey, currentPath);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      // 递归收集所有最后一级节点，并记录其完整路径
      const collectLeafNodesWithPath = (
        nodes: TreeDataItemNode[],
        parentPath: string[] = [],
      ): (TreeDataItemNode & { fullPath: string[] })[] => {
        let leafNodes: (TreeDataItemNode & { fullPath: string[] })[] = [];

        for (const node of nodes) {
          const currentPath = [...parentPath, node.title];

          if (node.level === 3) {
            // 这是最后一级节点
            const item = {
              ...node,
            };
            if (!item.key) {
              const newNode = { ...node } as unknown as RuleLibraries;
              item.key = newNode.id;
              item.title = newNode.itemName;
            }
            leafNodes.push({
              ...item,
              fullPath: currentPath,
            });
          } else {
            // 递归收集子节点中的最后一级节点
            if (node.children) {
              leafNodes = leafNodes.concat(collectLeafNodesWithPath(node.children, currentPath));
            }
          }
        }

        return leafNodes;
      };

      if (selectedKeys.value && selectedKeys.value.length > 0) {
        const selectedKey = selectedKeys.value[0] as string;

        // 查找选中的节点及其路径
        const selectedNodeWithPath = findNodeWithPath(treeData.value, selectedKey);

        if (selectedNodeWithPath) {
          const { node: selectedNode, path: selectedPath } = selectedNodeWithPath;
          if (selectedNode.level === 3) {
            // 如果选中的就是最后一级节点
            tableData = [{ ...selectedNode }];
          } else {
            // 如果选中的不是最后一级节点，收集其所有最后一级子节点
            // 传入选中节点的路径作为父级路径
            tableData = collectLeafNodesWithPath(selectedNode.children || [], selectedPath);
          }
        }
      }

      // 更新表格数据源
      dataSource.value = tableData.map((item) => ({
        id: item.id ?? "",
        requestId: item.key,
        name: item.title,
        content: item.ruleContentTemplate || "--",
        weight: item.weightAllot || "0",
        formula: "--", // 根据实际数据结构调整
        coefficients: item.coefficients,
        computeMetric: item.computeMetric ?? "--",
        parentId: item.parentId ?? "",
        type: item.itemType ?? "",
        templateMetricVariables: item.templateMetricVariables ?? "",
        ruleContentTemplateEnabled: item.ruleContentTemplateEnabled ?? true,
        displayMetricsEnabled: item.displayMetricsEnabled ?? false,
        displayMetrics: item.displayMetrics ?? "",
      }));
      // 更新分页信息
      pagination.value.total = tableData.length;
      const maxPage = Math.max(1, Math.ceil(tableData.length / pagination.value.pageSize));
      if (pagination.value.pageNumber > maxPage) {
        pagination.value.pageNumber = maxPage;
      }
    };
    const getSelectData = async (): Promise<void> => {
      if (selectLoading.value) {
        return;
      }
      selectLoading.value = true;
      try {
        const records = await cubeSafetyManagementAnalysisService.getLibrariesAllList();
        selectOption.value = records.map((item: Libraries) => ({
          value: item.id,
          label: item.name,
          computeType: item.computeType,
          resultJsonSchema: item.resultJsonSchema,
        }));
      } catch {
      } finally {
        selectLoading.value = false;
      }
    };
    /**
     * 获取树形数据并设置默认展开和选中状态
     * @param preserveSelection 为 true 时保留当前树选中项（增删改后刷新用）
     */
    const getTreeData = async (preserveSelection = false): Promise<void> => {
      try {
        treeLoading.value = true;
        const data = await cubeSafetyManagementAnalysisService.getRuleLibrariesList();
        if (data && data.length) {
          const keyToRestore = preserveSelection ? (selectedKeys.value[0] as string | undefined) : restoredSelectedKey.value || undefined;

          changeTreeData(data);

          if (keyToRestore && keyToRestore !== "all") {
            const node = findNodeInTree(showData.value, keyToRestore);
            if (node) {
              applyTreeSelection([keyToRestore]);
            } else {
              setDefaultExpandAndSelect();
              await nextTick();
              getTableData();
            }
          } else {
            setDefaultExpandAndSelect();
            await nextTick();
            getTableData();
          }

          restoredSelectedKey.value = "";
        } else {
          treeData.value = [];
          showData.value = [];
          dataSource.value = [];
          pagination.value.total = 0;
        }
      } catch {
      } finally {
        treeLoading.value = false;
      }
    };

    const collectBranchExpandKeys = (nodes: TreeDataItemNode[]): Key[] => {
      const keys: Key[] = [];
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          keys.push(node.key);
        }
      }
      return keys;
    };

    const findAncestorKeys = (nodes: TreeDataItemNode[], targetKey: string, ancestors: Key[] = []): Key[] | null => {
      for (const node of nodes) {
        if (node.key === targetKey) {
          return ancestors;
        }
        if (node.children?.length) {
          const found = findAncestorKeys(node.children, targetKey, [...ancestors, node.key]);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    /**
     * 初次进入：展开「全部 → 首个业务分类 → 其下各分组」，并选中第一个分组（如图默认选中「设备情况」）
     */
    const setDefaultExpandAndSelect = (): void => {
      if (!showData.value.length) {
        return;
      }

      const rootNode = showData.value[0];
      const firstCategory = rootNode.children?.[0];
      const firstGroup = firstCategory?.children?.[0];

      if (!firstCategory || !firstGroup) {
        selectedKeys.value = ["all"];
        expandedKey.value = [rootNode.key];
        showAddButton.value = false;
        addKay.value = "";
        return;
      }

      expandedKey.value = [rootNode.key, firstCategory.key, ...collectBranchExpandKeys(firstCategory.children ?? [])];
      selectedKeys.value = [firstGroup.key];
      showAddButton.value = true;
      addKay.value = firstGroup.key as string;
    };

    const deleteLibraries = async (params: { id: string }): Promise<void> => {
      loading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.deleteRuleLibrariesList(params);
        message.success("删除成功");
      } catch {
        message.error("删除失败");
      } finally {
        loading.value = false;
      }
    };
    const handleDelete = async (id: string): Promise<void> => {
      await deleteLibraries({ id });
      pagination.value.pageNumber = 1;
      await getTreeData(true);
      await queryCache.sync();
    };
    const changeTreeData = (data: RuleLibraries[]): void => {
      const addTreeData = [
        {
          itemName: "全部",
          id: "all",
          children: data,
        },
      ];
      treeData.value = addTreeData;
      showData.value = removeLeafNodes(treeData.value);
      // 移除这行：expandedKey.value = treeData.value.map(node => node.id);
    };

    const hasChildren = (node: RuleLibraries): boolean => (node.children && node.children.length > 0) ?? false;
    const countLevel3LeafNodes = (node: RuleLibraries): number => {
      let count = 0;

      // 如果当前节点是 level 3 且没有子节点，计数加 1
      if (node.level === 3 && !hasChildren(node)) {
        count = 1;
      }

      // 递归统计所有子节点
      if (hasChildren(node)) {
        count += node.children?.reduce((sum, child) => sum + countLevel3LeafNodes(child), 0) ?? 0;
      }

      return count;
    };

    const removeLeafNodes = (nodes: RuleLibraries[]): TreeDataItemNode[] =>
      nodes.map((node) => {
        const newNode = { ...node, key: node.id, title: node.itemName } as unknown as TreeDataItemNode;

        if (hasChildren(node)) {
          // 递归处理子节点
          const filteredChildren = removeLeafNodes(node.children ?? []);
          newNode.children = filteredChildren;

          // 计算所有 level 3 且没有子节点的后代节点数量
          const childCount = countLevel3LeafNodes(node);
          newNode.title = `${node.itemName} (${childCount})`;
          newNode.childCount = childCount;
        }

        return newNode;
      });

    const preview = async (record: TableData): Promise<void> => {
      addKay.value = record.parentId ?? "";
      viewReportData.value = record;
      viewTitle.value = record.name;
      step.value = 2;
    };
    const hasSchemaType = (schema: JsonSchemaNode | undefined, expectedTypes: string[]): boolean => {
      const type = schema?.type;
      if (!type) {
        return false;
      }
      return Array.isArray(type) ? type.some((item) => expectedTypes.includes(item)) : expectedTypes.includes(type);
    };
    const isRuleContentMetricOption = (option: MetricOption): boolean => {
      try {
        return !hasSchemaType(JSON.parse(option.resultJsonSchema ?? "{}") as JsonSchemaNode, ["object"]);
      } catch {
        return true;
      }
    };
    const renderFormula = (name: string): string => {
      // Const labelToValueMap = new Map(selectOption.value.map(opt => [opt.label, opt.value]));
      let formula = name;
      selectOption.value
        .filter((item) => !isRuleContentMetricOption(item))
        .forEach((item) => {
          formula = formula.split(`[${item.value}]`).join("");
          formula = formula.split(`[${item.label}]`).join("");
        });
      selectOption.value.filter(isRuleContentMetricOption).forEach((item) => {
        const searchValue = `[${item.value}]`;
        const replaceValue = `[${item.label}]`;
        formula = formula.split(searchValue).join(replaceValue);
      });
      return formula;
    };
    // Const deleteRule = async (record: TableData): Promise<void> => {
    //   // 删除规则逻辑
    // }

    // Const pageChange = (pageNumber: number, pageSize: number): void => {
    //   Pagination.value.pageNumber = pageNumber || 1
    //   Pagination.value.pageSize = pageSize
    //   GetTableData()
    // }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
      queryCache.sync();
    };
    const onTreeSelect = (keys: Key[], info: { selected: boolean; node: EventDataNode }): void => {
      showAddButton.value = (info?.node?.level === 2 || info.node.level === 3) && info?.selected;
      if (info.node.level === 2) {
        addKay.value = info.node.key as string;
      } else if (info.node.level === 3) {
        addKay.value = info.node.parentId as string;
      } else {
        addKay.value = "";
      }
      selectedKeys.value = keys;
      // 根据选中的分类过滤数据
      pagination.value.pageNumber = 1;
      getTableData();
      queryCache.sync();
    };
    const onExpand = (expandedKeys: Key[]): void => {
      expandedKey.value = expandedKeys;
    };

    const findNodeInTree = (nodes: TreeDataItemNode[], key: string): TreeDataItemNode | undefined => {
      for (const node of nodes) {
        if (node.key === key) {
          return node;
        }
        if (node.children) {
          const found = findNodeInTree(node.children, key);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };

    const applyTreeSelection = (keys: Key[]): void => {
      selectedKeys.value = keys;
      const key = keys[0] as string | undefined;
      const node = key ? findNodeInTree(showData.value, key) : undefined;
      if (node) {
        showAddButton.value = node.level === 2 || node.level === 3;
        if (node.level === 2) {
          addKay.value = node.key as string;
        } else if (node.level === 3) {
          addKay.value = node.parentId ?? "";
        } else {
          addKay.value = "";
        }
        const ancestorKeys = findAncestorKeys(showData.value, key!);
        if (ancestorKeys) {
          expandedKey.value = [...new Set([...expandedKey.value, ...ancestorKeys])];
        }
      } else {
        showAddButton.value = false;
        addKay.value = "";
      }
      getTableData();
    };

    const searchTreeData = (nodes: RuleLibraries[], keyword: string): TreeDataItemNode[] => {
      const result: TreeDataItemNode[] = [];
      for (const node of nodes) {
        const newNode = { ...node, key: node.id, title: node.itemName } as unknown as TreeDataItemNode;
        const hasKeyword = node.itemName.toLowerCase().includes(keyword.toLowerCase());

        if (node.children && node.children.length > 0) {
          newNode.children = searchTreeData(node.children, keyword);
        }

        if (hasKeyword || (newNode.children && newNode.children.length > 0)) {
          result.push(newNode);
        }
      }
      return result;
    };

    watch(searchValue, (newValue: string) => {
      if (newValue) {
        showData.value = searchTreeData(treeData.value, newValue);
        // 搜索时展开所有匹配的节点
        const keys: Key[] = [];
        const findKeys = (nodes: TreeDataItemNode[]): void => {
          for (const node of nodes) {
            keys.push(node.key);
            if (node.children) {
              findKeys(node.children);
            }
          }
        };
        findKeys(showData.value);
        expandedKey.value = keys;
        getTableData();
      } else {
        // 搜索框清空时恢复原始数据和默认展开选中状态
        showData.value = removeLeafNodes(treeData.value);
        setDefaultExpandAndSelect(); // 重新设置默认状态
        pagination.value.pageNumber = 1;
        getTableData();
        queryCache.sync();
      }
    });

    const { scorllY } = useTableScroll();

    onMounted(async () => {
      window.addEventListener("resize", updateHeight);
      await queryCache.hydrateAndQuery(getTreeData);
      getSelectData();
    });
    const addRule = (): void => {
      viewReportData.value = undefined;
      step.value = 2;
      viewTitle.value = "新增规则";
    };
    const editLibraries = async (params: addRuleLibraries): Promise<void> => {
      loading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.editRuleLibrariesList(params);
      } catch {
        message.error("保存失败");
      } finally {
        loading.value = false;
        await getTreeData(true);
      }
    };
    const onSubmit = async (): Promise<void> => {
      step.value = 1;
      pagination.value.pageNumber = 1;
      await getTreeData(true);
      await queryCache.sync();
    };
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <div style={{ display: "flex", height: "100%" }}>
            {/* 左侧分类树 */}
            <div
              style={{
                width: "238px",
                borderRight: "1px solid #f0f0f0",
                padding: "16px",
              }}
            >
              {/* 搜索表单 */}
              <Form layout="inline" style={{ marginBottom: "16px" }}>
                <FormItem>
                  <Input
                    v-model:value={searchValue.value}
                    placeholder="输入应用名称/业务分类"
                    showCount={false}
                    style={{ width: "200px" }}
                    search={true}
                  />
                </FormItem>
              </Form>
              <Tree
                class={style["rule-tree-container"]}
                treeData={showData.value}
                selectedKeys={selectedKeys.value}
                expandedKeys={expandedKey.value}
                autoExpandParent
                onSelect={onTreeSelect}
                onExpand={onExpand}
                showLine={false}
              />
            </div>

            {/* 右侧内容区 */}
            {/* 表格 */}
            <div style={{ flex: 1 }}>
              <Table
                rowKey="requestId"
                rowSelection={false}
                columns={columns}
                loading={loading.value}
                dataSource={dataSource.value.slice(
                  (pagination.value.pageNumber - 1) * pagination.value.pageSize,
                  (pagination.value.pageNumber - 1) * pagination.value.pageSize + pagination.value.pageSize,
                )}
                pagination={false}
                size="middle"
                scrollY={scorllY.value + 48}
              />
            </div>
          </div>
        </>
      ),
      "layout-header": (): JSX.Element => (
        <>
          {showAddButton.value && (
            <Button type="primary" onClick={addRule}>
              新增
            </Button>
          )}
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={pagination.value.pageNumber}
          v-model:pageSize={pagination.value.pageSize}
          v-model:total={pagination.value.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        {step.value === 1 && <Layout title={pageTitle ?? "规则库"} v-slots={layoutSlots}></Layout>}
        {step.value === 2 && (
          <RuleAddBase
            viewTitle={viewTitle.value}
            addKay={addKay.value}
            selectOption={selectOption.value}
            selectLoading={step.value === 2 && selectLoading.value}
            onCancel={() => {
              step.value = 1;
            }}
            onSubmit={onSubmit}
            viewReportData={viewReportData.value}
          />
        )}
      </>
    );
  },
});
