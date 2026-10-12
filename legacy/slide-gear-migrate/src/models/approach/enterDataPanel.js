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
      return (
        <PopOver position="topLeft" content={text}>
          {text}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={millennial(text)}>
          {text ? millennial(text) : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? timeFormat(text, true) : ""}
        >
          {text ? `${timeFormat(text, true)}` : "--"}
        </PopOver>
      );
    },
  },
];
