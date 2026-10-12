import { Table, Button, Input, Spin, Popover } from "ant-design-vue";
import type { ColumnsType } from "ant-design-vue/es/table";
import { defineComponent, ref, onMounted } from "vue";

import type { DisinfectionUserInfoVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { DeptSelect } from "../../../dept-select/dept-select";
import { ProjectSelect } from "../../../project-select/project-select";
import { projectStore } from "@/features/cards/zhongda-heshun/store/project";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import NoData from "@/shared-ui/panel/noData";

import styles from "./person-list.module.less";

interface Props {
  info: Record<string, unknown>;
}

export const PersonList = defineComponent({
  props: ["info"],
  emits: ["locate"],
  setup: (props: Props, { emit }) => {
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
      {
        title: "操作",
        dataIndex: "action",
        width: "100px",
        customRender: ({ record }: { record: unknown }): JSX.Element => {
          return (
            <Button type="link" size="small" onClick={() => handleViewLocation(record)}>
              定位
            </Button>
          );
        },
      },
    ];

    const store = projectStore();
    // 数据源
    const dataSource = ref<DisinfectionUserInfoVO[]>([]);
    const loading = ref<boolean>(false);
    const searchForm = ref({
      keyword: "",
      deptId: (props.info?.deptId as string) || "",
      postId: (props.info?.postId as string) || "",
      projectId: (store.currentProject?.id as string) || "",
    });
    // 查看定位
    const handleViewLocation = (record: DisinfectionUserInfoVO): void => {
      emit("locate", record);
    };

    // 搜索
    const handleSearch = (): void => {
      getGroupData();
    };

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        deptId: "",
        postId: "",
        keyword: "",
        projectId: "",
      };
      getGroupData();
    };
    const getGroupData = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await cubeZDDataVizService.getPersonnelPageList({
          keyword: searchForm.value.keyword,
          projectId: searchForm.value.projectId,
          organizationId: searchForm.value.deptId,
          positionId: searchForm.value.postId,
        });
        dataSource.value = res || [];
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };
    onMounted(() => {
      getGroupData();
    });

    return (): JSX.Element => (
      <div class={styles["person-container"]}>
        <div class={styles["person-content"]}>
          <div class={styles["search-form"]}>
            <div class={styles["form-item"]}>
              <span class={styles["label"]}>部门</span>
              <DeptSelect v-model:value={searchForm.value.deptId} class={styles["select"]} />
            </div>
            <div class={styles["form-item"]}>
              <span class={styles["label"]}>所属项目</span>
              <ProjectSelect v-model:value={searchForm.value.projectId} class={styles["select"]} />
            </div>
            <div class={styles["form-item"]}>
              <span class={styles["label"]}>人员姓名</span>
              <Input v-model:value={searchForm.value.keyword} placeholder="请输入人员名称" class={styles["input"]} />
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
