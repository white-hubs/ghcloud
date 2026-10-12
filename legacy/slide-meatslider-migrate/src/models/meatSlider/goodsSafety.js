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
    width: 200,
    ellipsis: true,
    customRender: ({ text, record }) => {
      if (record.riskLevel === "MEDIUM") { 
        return [
          h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
          ]
        // return (
        //   <PopOver position="topLeft" content={text ? text : "--"}>
        //     <a-tag color="orange">中风险</a-tag>
        //     {text ? text : "--"}
        //   </PopOver>
        // );
      } else if (record.riskLevel === "HIGH") {
        return [
          h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
          ]
        // return (
        //   <PopOver position="topLeft" content={text ? text : "--"}>
        //     <a-tag color="red">高风险</a-tag>
        //     {text ? text : "--"}
        //   </PopOver>
        // );
      } else {
        return [
          h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
          ]
        // return (
        //   <PopOver position="topLeft" content={text ? text : "--"}>
        //     <a-tag color="green">低风险</a-tag>
        //     {text ? text : "--"}
        //   </PopOver>
        // );
      }
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
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
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
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
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
    // width: 150,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text, false)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text, false)}` : "--"})
        ]
    },
  },
  {
    mark: "requiredCheckRatio",
    dataIndex: "requiredCheckRatio",
    key: "requiredCheckRatio",
    title: "抽检比例（%）",
    slots: {
      customRender: "requiredCheckRatio",
    },
    // width: 140,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "porkReportTickets",
    dataIndex: "porkReportSlices",
    key: "porkReportSlices",
    title: "报备检疫票数（张）",
    slots: {
      customRender: "porkReportTickets",
    },
    // width: 160,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(Math.ceil(text / 2), false)}` : "" , position: "topLeft" }, { default: () => text || text === 0
          ? `${millennial(Math.ceil(text / 2), false)}`
          : "--"})
        ]
    },
  },
  {
    mark: "requiredCheckSlices",
    dataIndex: "requiredCheckSlices",
    key: "requiredCheckSlices",
    title: "规定抽检片数（片）",
    slots: {
      customRender: "requiredCheckSlices",
    },
    // width: 160,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text, false)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text, false)}` : "--"})
        ]
    },
  },
  {
    mark: "actualCheckSlices",
    dataIndex: "actualCheckSlices",
    key: "actualCheckSlices",
    title: "实际抽检片数（片）",
    slots: {
      customRender: "actualCheckSlices",
    },
    // width: 160,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text, false)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text, false)}` : "--"})
        ]
    },
  },
  {
    mark: "clenbuterol",
    dataIndex: "clenbuterol",
    key: "clenbuterol",
    title: "瘦肉精",
    slots: {
      customRender: "clenbuterol",
    },
    // width: 80,
    customRender: ({ text }) => {
      if (text === "UNSELECTED") {
        return [
          h(PopOver, { content: "检测中", position: "topLeft" }, { default: () => "检测中"})
          ]
      }else if (text === "POSITIVE") {
        return [
          h(PopOver, { content: "阳", position: "topLeft" }, { default: () => "阳"})
          ]
      }else {
        return [
          h(PopOver, { content: "阴", position: "topLeft" }, { default: () => "阴"})
          ]
      }
    },
  },
  {
    mark: "watered",
    dataIndex: "watered",
    key: "watered",
    title: "含水量",
    slots: {
      customRender: "watered",
    },
    // width: 80,
    customRender: ({ text }) => {
      if (text === "UNSELECTED") {
        return [
          h(PopOver, { content: "检测中", position: "topLeft" }, { default: () => "检测中"})
          ]
      }else if (text === "POSITIVE") {
        return [
          h(PopOver, { content: "阳", position: "topLeft" }, { default: () => "阳"})
          ]
      }else {
        return [
          h(PopOver, { content: "阴", position: "topLeft" }, { default: () => "阴"})
          ]
      }
    },
  },
  {
    mark: "result",
    dataIndex: "result",
    key: "result",
    title: "抽检结果",
    slots: {
      customRender: "result",
    },
    // width: 80,
    customRender: ({ text, record }) => {
      if (record.clenbuterol === "CHECKING" || record.watered === "CHECKING") {
        return [
          h(PopOver, { content: "检测中", position: "topLeft" }, { default: () => "检测中"})
          ]
      } else if (
        record.clenbuterol === "FAILED" ||
        record.watered === "FAILED"
      ) {
        return [
          h(PopOver, { content: "不合格", position: "topLeft" }, { default: () => "不合格"})
          ]
      } else {
        return [
          h(PopOver, { content: "合格", position: "topLeft" }, { default: () => "合格"})
          ]
      }
    },
  },
  {
    mark: "inspectorName",
    dataIndex: "inspectorName",
    key: "inspectorName",
    title: "抽检员",
    slots: {
      customRender: "inspectorName",
    },
    ellipsis: true,
    // width: 80,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text, position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "spotCheckTime",
    dataIndex: "spotCheckTime",
    key: "spotCheckTime",
    title: "抽检时间",
    slots: {
      customRender: "spotCheckTime",
    },
    // width: 180,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "", position: "topLeft" }, { default: () => text ? `${timeFormat(text, true)}` : "--"})
        ]
    },
  },
  {
    mark: "remark",
    dataIndex: "remark",
    key: "remark",
    title: "备注",
    slots: {
      customRender: "remark",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
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
    width: width ? width : 140,
    fixed: "right",
  },
];
