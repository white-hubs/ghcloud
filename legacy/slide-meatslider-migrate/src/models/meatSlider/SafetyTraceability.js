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
  // 暂无
  {
    mark: "goodsCategoryName",
    dataIndex: "supplierVO.phone",
    key: "supplierVO.phone",
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
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]

    },
  },
  {
    mark: "label",
    dataIndex: "label",
    key: "label",
    title: "商品编码",
    slots: {
      customRender: "label",
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
    mark: "footMarkCode",
    dataIndex: "footMarkCode",
    key: "footMarkCode",
    title: "理货编码",
    slots: {
      customRender: "footMarkCode",
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
