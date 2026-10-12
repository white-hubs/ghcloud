import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "goodsName",
    dataIndex: "goodsName",
    key: "goodsName",
    title: "品类名称",
    slots: {
      customRender: "goodsName",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "品类名称",
    slots: {
      customRender: "name",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "enterChargeValue",
    dataIndex: "enterChargeValue",
    key: "enterChargeValue",
    title: "通用进场费用",
    slots: {
      customRender: "enterChargeValue",
    },
    ellipsis: true,
  },
  {
    mark: "specialChargeValue",
    dataIndex: "specialChargeValue",
    key: "specialChargeValue",
    title: "指定商家进场费用",
    slots: {
      customRender: "specialChargeValue",
    },
    ellipsis: true,
  },
  {
    mark: "weightUnit",
    dataIndex: "weightUnit",
    key: "weightUnit",
    title: "重量取值",
    slots: {
      customRender: "weightUnit",
    },
  },
  {
    mark: "carTypeName",
    dataIndex: "carTypeName",
    key: "carTypeName",
    title: "车型名称",
    slots: {
      customRender: "carTypeName",
    },
    ellipsis: true,
  },
  {
    mark: "status",
    dataIndex: "status",
    key: "status",
    title: "状态",
    slots: {
      customRender: "status",
    },
    ellipsis: true,
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
  },
  {
    mark: "action",
    dataIndex: "action",
    key: "action",
    title: "操作",
    slots: {
      customRender: "action",
    },
    ellipsis: true,
    width: width ? width : 120,
    fixed: "right",
  },
];
