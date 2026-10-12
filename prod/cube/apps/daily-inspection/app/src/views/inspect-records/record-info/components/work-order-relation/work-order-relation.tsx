import dayjs from "dayjs";
import { defineComponent, watch } from "vue";

import { useCubeTable } from "@ghcloud/cube-app-design";
import { type InspectRecordToBusinessVO } from "@ghcloud/cube-daily-inspection-service";
import { Button, PopOver } from "@ghcloud/cube-ui";

import styles from "./work-order-relation.module.less";

interface Props {
  dataSource: InspectRecordToBusinessVO[];
  onSelect?: (selectedOrders: InspectRecordToBusinessVO[]) => void;
}

export const WorkOrderRelation = defineComponent({
  props: ["dataSource", "onSelect"],
  setup: (props: Props, { expose }) => {
    // 定义表格列
    const columns = [
      {
        title: "任务类型",
        dataIndex: "businessCategory",
        key: "businessCategory",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }) => {
          const categoryMap = new Map([
            ["FAULT", "故障报修"],
            ["HIDDENDANGER", "隐患排查"],
            ["HAZARD_GOVERNANCE", "隐患治理"],
          ]);
          const textVal = categoryMap.get(text);
          return <PopOver content={textVal || ""}>{textVal || "--"}</PopOver>;
        },
      },
      {
        title: "名称",
        dataIndex: "businessName",
        key: "businessName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "状态",
        dataIndex: "businessStatus",
        key: "businessStatus",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              <span>{text || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        fixed: "right",
        align: "center",
        customRender: ({ record }: { record: InspectRecordToBusinessVO }): JSX.Element => {
          return (
            <>
              <Button type="link" onClick={() => handleDetail(record)}>
                详情
              </Button>
            </>
          );
        },
      },
    ];
    const handleDetail = (record: InspectRecordToBusinessVO): void => {
      if (record.businessCategory === "HAZARD_GOVERNANCE") {
        const target = `/portal/hazard-governance/hazard-ledger-detail?id=${record.businessId}`;
        history.pushState(history.state, "", target);
      } else if (record.businessCategory === "HIDDENDANGER") {
        const target = `/portal/stream-engine-render/index?businessType=HIDDENDANGER&processInstanceId=${record.businessId}&type=detail&title=隐患排查`;
        history.pushState(history.state, "", target);
      } else {
        const target = `/portal/stream-engine-render/index?businessType=FAULT&processInstanceId=${record.businessId}&type=detail&title=故障报修`;
        history.pushState(history.state, "", target);
      }
    };
    watch(
      () => props.dataSource,
      (newVal) => {
        if (newVal && newVal.length) {
          tableApi.setDataSource(newVal);
        }
      },
    );
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      dataSource: props.dataSource,
      rowKey: "id",
      pagination: false,
    });
    return () => (
      <div class={styles.container}>
        <CubeTable class={styles.table} />
      </div>
    );
  },
});
