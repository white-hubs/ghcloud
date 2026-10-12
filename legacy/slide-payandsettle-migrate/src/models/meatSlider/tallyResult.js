import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "place",
    dataIndex: "place",
    key: "place",
    title: "理货机",
    slots: {
      customRender: "place",
    },
    customRender: ({ text }) => {
      // return text ? text : "--"
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    width: 80,
    ellipsis: true,
  },
  {
    mark: "porkReportCode",
    dataIndex: "porkReportCode",
    key: "porkReportCode",
    title: "批次号",
    slots: {
      customRender: "porkReportCode",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    width: 120,
    ellipsis: true,
  },
  {
    mark: "supplierName",
    dataIndex: "supplierName",
    key: "supplierName",
    title: "理货商户",
    slots: {
      customRender: "supplierName",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    width: 80,
    ellipsis: true,
  },
  {
    mark: "supplierCode",
    dataIndex: "supplierCode",
    key: "supplierCode",
    title: "商家编号",
    slots: {
      customRender: "supplierCode",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    width: 80,
    ellipsis: true,
  },
  {
    mark: "slices",
    dataIndex: "slices",
    key: "slices",
    title: "理货片数",
    slots: {
      customRender: "slices",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text + "片" : "--"}
        </PopOver>
      );
    },
    width: 80,
    ellipsis: true,
  },
  {
    mark: "cheatStatus",
    dataIndex: "cheatStatus",
    key: "cheatStatus",
    title: "结果",
    slots: {
      customRender: "cheatStatus",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? "作弊嫌疑" : "正常"}>
          {text ? <span class="deleteRow">作弊嫌疑</span> : "正常"}
        </PopOver>
      );
    },
    width: 80,
    ellipsis: true,
  },
];
