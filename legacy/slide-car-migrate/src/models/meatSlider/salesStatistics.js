import { timeFormat, millennial } from "@/utils/common";
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
      return (
        <PopOver position="topLeft" content="合计">
          合计
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },

  {
    mark: "productName",
    dataIndex: "porkReportVO.code",
    key: "productName",
    title: "商品名称",
    slots: {
      customRender: "productName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content="白条猪">
          白条猪
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `${millennial(text, false)}` : ""}
        >
          {text || text === 0 ? `${millennial(text, false)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `${millennial(text, false)}` : ""}
        >
          {text || text === 0 ? `${millennial(text, false)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
          {text || text === 0 ? `${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
          {text || text === 0 ? `${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
    },
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
];
