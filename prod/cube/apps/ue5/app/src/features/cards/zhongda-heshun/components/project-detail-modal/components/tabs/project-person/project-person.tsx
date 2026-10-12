import { Table, Button, Input, Spin, Popover } from "ant-design-vue";
import type { ColumnsType } from "ant-design-vue/es/table";
import { defineComponent, ref, onMounted, computed } from "vue";

import type { DisinfectionUserInfoVO, GroupInfoVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { cubeZDDataVizService } from "@/infrastructure/api/service";
import NoData from "@/shared-ui/panel/noData";

import styles from "./project-person.module.less";

interface Props {
  info: Record<string, unknown>;
  projectId?: string | number;
}

export const ProjectPerson = defineComponent({
  props: ["info", "projectId"],
  setup: (props: Props) => {
    // 表格列定义
    const columns: ColumnsType = [
      {
        title: "序号",
        dataIndex: "index",
        width: "80px",
        customRender: ({ index }: { index: number }): number => index + 1,
      },
      {
        title: "姓名",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "部门",
        dataIndex: "department",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "岗位",
        dataIndex: "position",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "角色",
        dataIndex: "role",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "消杀小组",
        dataIndex: "groupName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "联系电话",
        dataIndex: "phone",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
    ];

    const groupDataSource = ref<GroupInfoVO[]>([]);
    const dataSource = ref<DisinfectionUserInfoVO[]>([]);
    const searchForm = ref({
      keyword: "",
    });

    const leftOptions = computed(() => {
      return groupDataSource.value?.map((item) => {
        return {
          id: item.id,
          name: item.groupName,
          count: item.count,
        };
      });
    });
    const activeLeft = ref("");
    // 搜索
    const handleSearch = (): void => {
      getGroupData(activeLeft.value);
    };

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        keyword: "",
      };
      getGroupData(activeLeft.value);
    };

    // 选择左侧选项
    const handleLeftOptionClick = (id: string): void => {
      activeLeft.value = id;
      getGroupData(id);
    };
    const loading = ref(false);
    const getGroupData = async (groupId: string): Promise<void> => {
      loading.value = true;
      try {
        const projectId = props.info?.id || "";
        const res = await cubeZDDataVizService.getPersonnelPageList({
          keyword: searchForm.value.keyword,
          projectId: projectId as string,
          disinfectionGroupId: groupId,
        });
        dataSource.value = res || [];
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };
    // 获取全部分组数据
    const getGroupAllData = async (): Promise<void> => {
      loading.value = true;
      try {
        const projectId = props.info?.id || "";
        const res = await cubeZDDataVizService.getProjectGroupsList(projectId as string, {
          keyword: searchForm.value.keyword,
        });
        groupDataSource.value = res;
        const users = await cubeZDDataVizService.getPersonnelPageList({
          keyword: searchForm.value.keyword,
          projectId: projectId as string,
        });
        dataSource.value = users || [];
        activeLeft.value = `${users[0].groupId ?? ""}`;
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };
    onMounted(() => {
      getGroupAllData();
    });

    return (): JSX.Element => (
      <div class={styles["person-container"]}>
        <div class={styles["left-options"]}>
          {leftOptions.value.length === 0 && <NoData />}
          {leftOptions.value.map((option, index) => (
            <div
              key={index}
              class={`${styles["option-item"]} ${option.id === activeLeft.value ? styles["active"] : ""}`}
              onClick={() => handleLeftOptionClick(option.id)}
            >
              <span class={styles["option-name"]}>{option.name}</span>
              <span class={styles["option-count"]}>{option.count}</span>
            </div>
          ))}
        </div>
        <div class={styles["person-content"]}>
          <div class={styles["search-form"]}>
            <div class={styles["form-item"]}>
              <span class={styles["label"]}>人员姓名</span>
              <Input v-model:value={searchForm.value.keyword} placeholder="请输入人员姓名" class={styles["input"]} />
            </div>
            <div class={styles["form-buttons"]}>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </div>

          <Spin spinning={loading.value}>
            <div class={styles["table-container"]}>
              <Table
                columns={columns}
                dataSource={dataSource.value}
                rowKey="id"
                scroll={{ y: 350 }}
                pagination={{
                  showSizeChanger: true,
                  total: dataSource.value.length,
                  showTotal: (total) => `共 ${total} 条`,
                  defaultCurrent: 1,
                  defaultPageSize: 10,
                  locale: {
                    jump_to: "跳转到",
                    page: "页",
                    items_per_page: "条/页",
                  },
                }}
                locale={{ emptyText: <NoData /> }}
                class={styles["person-table"]}
              />
            </div>
          </Spin>
        </div>
      </div>
    );
  },
});
