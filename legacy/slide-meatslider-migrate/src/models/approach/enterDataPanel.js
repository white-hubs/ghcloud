import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "goods",
    dataIndex: "goods",
    key: "goods",
    title: "品类名称",
    slots: {
      customRender: "goods",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text  , position: "topLeft" }, { default: () =>text})
        ]
    },
  },
  {
    mark: "merchantName",
    dataIndex: "merchantName",
    key: "merchantName",
    title: "商家名称",
    slots: {
      customRender: "merchantName",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text  , position: "topLeft" }, { default: () =>text})
        ]
    },
  },
  {
    mark: "stallName",
    dataIndex: "stallName",
    key: "stallName",
    title: "交易区(档位)",
    slots: {
      customRender: "stallName",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text  , position: "topLeft" }, { default: () =>text})
        ]
    },
  },
  {
    mark: "carNo",
    dataIndex: "carNo",
    key: "carNo",
    title: "来货车辆",
    slots: {
      customRender: "carNo",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text  , position: "topLeft" }, { default: () =>text ? text : "--"})
        ]
    },
  },
  {
    mark: "netWeight",
    dataIndex: "netWeight",
    key: "netWeight",
    title: "来货重量(kg)",
    slots: {
      customRender: "netWeight",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text  , position: "topLeft" }, { default: () =>text ? text : "--"})
        ]
    },
  },
  {
    mark: "enterFee",
    dataIndex: "enterFee",
    key: "enterFee",
    title: "缴费金额",
    slots: {
      customRender: "enterFee",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : ""  , position: "topLeft" }, { default: () =>text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
  },
  {
    mark: "enterTime",
    dataIndex: "enterTime",
    key: "enterTime",
    title: "进场时间",
    slots: {
      customRender: "enterTime",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? timeFormat(text, true) : ""  , position: "topLeft" }, { default: () =>text ? `${timeFormat(text, true)}` : "--"})
        ]
    },
  },
];
