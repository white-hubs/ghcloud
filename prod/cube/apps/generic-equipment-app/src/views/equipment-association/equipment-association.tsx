import { ConditionDrawer } from "./components/condition-drawer/condition-drawer";
import styles from "./equipment-association.module.less";
import { cubeDeviceCenter } from "@/api/service";
import { CubeLayout, useCubeTable } from "@ghcloud/cube-app-design";
import type { DeviceInstancePage, EquipmentAssociationRuleField } from "@ghcloud/cube-iot-center-service";
import { Button, message, Page, PopOver, Space } from "@ghcloud/cube-ui";
import { useApplicationInfo, usePageName } from "@ghcloud/cube-utils";
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

/** 设备关联 */
export const EquipmentAssociation = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const pagination = ref<{
      pageSize: number;
      pageNumber: number;
      total?: number;
    }>({
      pageSize: 20,
      pageNumber: 1,
      total: 0,
    });
    const { getCurrentApplicationStore } = useApplicationInfo();
    const tagCode = "builtin.app::" + getCurrentApplicationStore().code;

    const saveLoading = ref(false);
    const expendStatus = ref(false);
    let conditionGroupBackup: EquipmentAssociationRuleField[][] = [];
    const conditionGroup = ref<EquipmentAssociationRuleField[][]>([]);
    let lastQueryParams: typeof conditionGroup.value = [];
    const columns = [
      {
        title: "设备编码",
        dataIndex: "code",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text || "--"}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "产品品类",
        dataIndex: "productInfo",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = record.productInfo?.productCategory?.name || "--";
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "产品名称",
        dataIndex: "productInfo",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = record.productInfo?.name || "--";
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "设备品牌",
        dataIndex: "productInfo",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = record.productInfo?.brandName || "--";
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "所属区域",
        dataIndex: "area",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = record.area?.pathName || record.area?.name || "--";
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      autoFetch: false,
      columns,
      fetchApi: async () => {
        const params = {
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
          rules: getConditionGroupFilter(),
        };
        lastQueryParams = params.rules;
        if (params.rules.length === 0) {
          return {
            total: 0,
            records: [],
            pages: 0,
          };
        }
        return cubeDeviceCenter.getEquipmentAssociationPage(params);
      },
      fetchLoaded: (data) => {
        pagination.value.total = data.total;
      },
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button
            class={styles["condition-btn"]}
            onClick={() => {
              expendStatus.value = !expendStatus.value;
            }}
            type="primary"
            v-slots={{
              icon: () => (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="none"
                  viewBox="0 0 16 16"
                  stroke-width="2"
                  style={{ transform: `rotate(${expendStatus.value ? 0 : 180}deg)` }}
                >
                  <path stroke="currentColor" d="M3.757 7.444 7.999 3.2l4.242 4.244M3.757 12.757l4.242-4.242 4.242 4.243"></path>
                </svg>
              ),
            }}
          >
            筛选
          </Button>
          <Button type="primary" onClick={save}>
            保存
          </Button>
          <Button
            v-show={JSON.stringify(conditionGroupBackup) !== JSON.stringify(conditionGroup.value)}
            loading={saveLoading.value}
            onClick={() => {
              conditionGroup.value = JSON.parse(JSON.stringify(conditionGroupBackup));
            }}
          >
            还原
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <ConditionDrawer
            v-model:visible={expendStatus.value}
            v-model:value={conditionGroup.value}
            onUpdate:value={() => {
              setTimeout(() => {
                if (JSON.stringify(getConditionGroupFilter()) === JSON.stringify(lastQueryParams)) {
                  return;
                }
                tableApi.query();
              }, 0);
            }}
          />
          <CubeTable />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={pagination.value.pageNumber}
          pageSize={pagination.value.pageSize}
          total={pagination.value.total}
          onPageChange={(pageNumber: number, pageSize: number): void => {
            pagination.value.pageNumber = pageNumber;
            pagination.value.pageSize = pageSize;
            tableApi.query();
          }}
        />
      ),
    };

    onMounted(async () => {
      try {
        await cubeDeviceCenter.getTagRule(tagCode).then((res) => {
          const groups = res.rule.rules.map((e) => e.ruleFields);
          conditionGroupBackup = groups;
          conditionGroup.value = groups;
        });
      } catch (error) {
        message.error("获取规则失败");
      }
      tableApi.query();
      setScrollY();
      window.addEventListener("resize", () => {
        setScrollY();
      });
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", () => {
        setScrollY();
      });
    });

    return (): JSX.Element => <CubeLayout title={pageTitle ?? "设备关联"} v-slots={layoutSlots} />;

    function getConditionGroupFilter(): typeof conditionGroup.value {
      let res = JSON.parse(JSON.stringify(conditionGroup.value)) as typeof conditionGroup.value;
      res = res.map((group) => {
        return group.filter((ele) => {
          const val = ele.value as any;
          if (!ele.field || !ele.operator) {
            return false;
          }
          if (val === null || val === undefined) {
            return false;
          }
          if (typeof val === 'string' && val.trim() === '') {
            return false;
          }
          if (Array.isArray(val)) {
            return val.some((item: any) => {
              if (item === null || item === undefined) return false;
              if (typeof item === 'string' && item.trim() === '') return false;
              return true;
            });
          }
          if (typeof val === 'object' && Object.keys(val).length === 0) {
            return false;
          }
          return true;
        });
      });
      res = res.filter((e) => e.length);
      return res;
    }

    /** 保存 */
    async function save(): Promise<void> {
      // 过滤掉未通过数据验证的数据
      const rules = getConditionGroupFilter();
      saveLoading.value = true;
      await cubeDeviceCenter
        .saveTagRule({
          code: tagCode,
          name: getCurrentApplicationStore().name,
          rules,
        })
        .finally(() => {
          saveLoading.value = false;
        });
      message.success("保存成功");
      conditionGroupBackup = rules;
      conditionGroup.value = rules;
      expendStatus.value = false;
    }

    function setScrollY(): void {
      const content = document.querySelector("#cube-layout-content");
      content &&
        tableApi.setState({
          scrollY: content.clientHeight - 40,
        });
    }
  },
});
