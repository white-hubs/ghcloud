import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
export default (width) => [
  {
    mark: "all",
    dataIndex: "empty",
    key: "empty",
    title: "商家编号",
    slots: {
      customRender: "empty",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: "合计" , position: "topLeft" }, { default: () =>  "合计"})
        ]
    },
  },
  {
    mark: "empty",
    dataIndex: "empty",
    key: "empty",
    title: "商家编号",
    slots: {
      customRender: "empty",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return "";
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
        h(PopOver, { content: text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
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
        h(PopOver, { content: text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },

  {
    mark: "goodsCategoryName",
    dataIndex: "porkReportVO.code",
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
    mark: "highestPrice",
    dataIndex: "highestPrice",
    key: "highestPrice",
    title: "最高价",
    slots: {
      customRender: "highestPrice",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    mark: "lowerPrice",
    dataIndex: "lowerPrice",
    key: "lowerPrice",
    title: "最低价",
    slots: {
      customRender: "lowerPrice",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    mark: "averagePrice",
    dataIndex: "averagePrice",
    key: "averagePrice",
    title: "平均价",
    slots: {
      customRender: "averagePrice",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    mark: "porkArrangeSlices",
    dataIndex: "porkArrangeSlices",
    key: "porkArrangeSlices",
    title: "理货片数（片）",
    slots: {
      customRender: "porkArrangeSlices",
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
    // width: 130,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text, false)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text, false)}` : "--"})
        ]
    },
  },
  {
    mark: "dealSlices",
    dataIndex: "dealSlices",
    key: "dealSlices",
    title: "成交片数（片）",
    slots: {
      customRender: "dealSlices",
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
    // width: 130,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text, false)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text, false)}` : "--"})
        ]
    },
  },
  {
    mark: "porkArrangeWeight",
    dataIndex: "porkArrangeWeight",
    key: "porkArrangeWeight",
    title: "理货重量（kg）",
    slots: {
      customRender: "porkArrangeWeight",
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
    // width: 140,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--"})
        ]
    },
  },
  {
    mark: "dealWeight",
    dataIndex: "dealWeight",
    key: "dealWeight",
    title: "成交重量（kg）",
    slots: {
      customRender: "dealWeight",
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
    // width: 140,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--"})
        ]
    },
  },
  {
    mark: "amount",
    dataIndex: "amount",
    key: "amount",
    title: "成交金额",
    slots: {
      customRender: "amount",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    mark: "commission",
    dataIndex: "commission",
    key: "commission",
    title: "佣金金额",
    slots: {
      customRender: "commission",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
];
