import { defineComponent, onMounted, reactive } from "vue";

import type { GetDictionaryByItem } from "@ghcloud/cube-dictionary-service";
import type { DeptList } from "@ghcloud/cube-ouaa-service";
import { Button, message, TreeSelect } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDictionaryService, cubeOuaaService } from "@/apis/service";
import { GLayout } from "@/components/common/layout";

import styles from "./index.module.less";

const dictCode = "COMMAND_DISPATCH_PRIORITY_DEPARTMENT";
const departmentDictCode = "departmentId";

const findDeptName = (tree: DeptList[], id: string): string => {
  for (const node of tree) {
    if (node.id === id) {
      return node.name;
    }
    if (node.children?.length) {
      const name = findDeptName(node.children, id);
      if (name) {
        return name;
      }
    }
  }
  return "";
};

export const PriorityDepartmentConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const state = reactive<{
      deptTree: DeptList[];
      selectedDeptId: string | undefined;
      departmentConfig: GetDictionaryByItem;
    }>({
      deptTree: [],
      selectedDeptId: undefined,
      departmentConfig: {
        code: departmentDictCode,
        name: "优先部门",
        id: "",
        remarks: "",
        version: "",
        flag: false,
        variable: "",
        itemCode: dictCode,
      },
    });

    const layoutSlots = {
      "content-search": (): JSX.Element => (
        <div class={styles.header}>
          <div class={styles.itemControl}>
            <div class={styles.label}>优先选择部门：</div>
            <TreeSelect
              v-model:value={state.selectedDeptId}
              treeData={state.deptTree}
              fieldNames={{ label: "name", value: "id", children: "children" }}
              placeholder="请选择部门"
              allowClear
              showSearch
              treeNodeFilterProp="name"
              dropdownClassName={styles.deptTreeDropdown}
              style={{ width: "320px" }}
            />
          </div>
        </div>
      ),
      "content-table": (): JSX.Element => {
        const deptName = state.selectedDeptId ? findDeptName(state.deptTree, state.selectedDeptId) : "";
        return (
          <div class={styles.content}>
            {state.selectedDeptId ? `当前已选部门：${deptName || state.selectedDeptId}` : "暂未选择优先部门"}
          </div>
        );
      },
      "footer-page": (): JSX.Element => (
        <div class={styles.footer}>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      ),
    };

    const initDepartmentConfig = (): GetDictionaryByItem => ({
      id: "",
      name: "优先部门",
      code: departmentDictCode,
      remarks: "",
      version: "0",
      flag: false,
      variable: "",
      itemCode: dictCode,
    });

    const loadDeptTree = async (): Promise<void> => {
      try {
        state.deptTree = await cubeOuaaService.getDept({ enabled: true });
      } catch {
        message.error("部门列表加载失败");
      }
    };

    const getDictionary = async (): Promise<void> => {
      try {
        const commandDict = await cubeDictionaryService.getDictionaryItemByCode({
          code: dictCode,
        });
        if (!commandDict) {
          await cubeDictionaryService.addDataDictionaryItem({
            code: dictCode,
            remarks: "调度中心优先选择部门",
          });
        }
        await initConfig();
      } catch {}
    };

    const initConfig = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({
        itemCode: dictCode,
      });
      const config = res.find((item) => item.code === departmentDictCode) ?? initDepartmentConfig();
      state.departmentConfig = config as GetDictionaryByItem;
      state.selectedDeptId = state.departmentConfig.variable || undefined;
    };

    const handleSave = async (): Promise<void> => {
      if (!state.selectedDeptId) {
        message.warning("请选择优先部门");
        return;
      }
      try {
        state.departmentConfig.variable = state.selectedDeptId;
        if (!state.departmentConfig.id) {
          await cubeDictionaryService.addDataDictionary({
            ...state.departmentConfig,
          });
        } else {
          await cubeDictionaryService.updateDataDictionary({
            ...state.departmentConfig,
          });
        }
        await initConfig();
        message.success("保存成功");
      } catch {
        message.error("保存失败");
      }
    };

    onMounted(async () => {
      await Promise.all([loadDeptTree(), getDictionary()]);
    });

    return (): JSX.Element => <GLayout title={pageTitle} v-slots={layoutSlots} />;
  },
});
