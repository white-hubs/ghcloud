import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
export default (width) => [
  {
    mark: "supplierName",
    dataIndex: "supplierName",
    key: "supplierName",
    title: "商家名称",
    slots: {
      customRender: "supplierName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]

    },
  },
  {
    mark: "supplierCode",
    dataIndex: "supplierCode",
    key: "supplierCode",
    title: "商家编号",
    slots: {
      customRender: "supplierCode",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "goodsCategoryName",
    dataIndex: "goodsCategoryName",
    key: "goodsCategoryName",
    title: "商品名称",
    slots: {
      customRender: "goodsCategoryName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text, record }) => {
      return (
        <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName : "--"}>
          {record.goodsCategoryName ? record.goodsCategoryName : "--"}
          <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
        </PopOver>
      );
    },
  },

  {
    mark: "porkReportCode",
    dataIndex: "porkReportCode",
    key: "porkReportCode",
    title: "批次号",
    slots: {
      customRender: "porkReportCode",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "porkReportSlices",
    dataIndex: "porkReportSlices",
    key: "porkReportSlices",
    title: "报备片数（片）",
    slots: {
      customRender: "porkReportSlices",
    },
    width: 140,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text, false)}` : "" , position: "topLeft" }, { default: () => text ? `${millennial(text, false)}` : ""})
        ]
    },
  },
  {
    mark: "porkReportWeight",
    dataIndex: "porkReportWeight",
    key: "porkReportWeight",
    title: "报备重量（kg）",
    slots: {
      customRender: "porkReportWeight",
    },
    width: 140,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--"})
        ]
    },
  },
  {
    mark: "porkArrangeAuditStatus",
    dataIndex: "porkArrangeAuditStatus",
    key: "porkArrangeAuditStatus",
    title: "理货审核",
    slots: {
      customRender: "porkArrangeAuditStatus",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      if (text === "PASSED") {
        text = "已通过";
      } else if (text === "FAILED") {
        text = "未通过";
      } else if (text === "AUDIT") {
        text = "待审核";
      } else {
        text = "--";
      }
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
      // return (
      //   <PopOver position="topLeft" content={text}>
      //     <span>
      //       <span
      //         class={
      //           text === "已通过"
      //             ? "tableDotNormal"
      //             : text === "未通过"
      //             ? "tableDotDelete"
      //             : "tableDotAudit"
      //         }
      //       ></span>
      //       <span class="tableStatus pl1">{text ? text : "--"}</span>
      //     </span>
      //   </PopOver>
      // );
    },
  },
  {
    mark: "porkReportStatus",
    dataIndex: "porkReportStatus",
    key: "porkReportStatus",
    title: "报备审核",
    slots: {
      customRender: "porkReportStatus",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      if (text === "PASSED") {
        text = "已通过";
      } else if (text === "FAILED") {
        text = "未通过";
      } else if (text === "RESCINDED") {
        text = "已撤销";
      } else {
        text = "待审核";
      }
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
      // return (
      //   <PopOver position="topLeft" content={text}>
      //     <span>
      //       <span
      //         class={
      //           text === "已通过"
      //             ? "tableDotNormal"
      //             : text === "未通过"
      //             ? "tableDotDelete"
      //             : "tableDotAudit"
      //         }
      //       ></span>
      //       <span class="tableStatus pl1">{text ? text : "--"}</span>
      //     </span>
      //   </PopOver>
      // );
    },
  },
  {
    title: "操作",
    mark: "action",
    dataIndex: "action",
    key: "action",
    slots: {
      customRender: "action",
    },
    width: width ? width : 100,
    fixed: "right",
  },
];
