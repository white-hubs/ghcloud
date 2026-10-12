import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "设备名称",
    slots: {
      customRender: "name",
    },
    // width: 650,
    ellipsis: true,
  },
  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "类型编号",
    slots: {
      customRender: "code",
    },

    ellipsis: true,
  },
  {
    mark: "quantity",
    dataIndex: "quantity",
    key: "quantity",
    title: "设备数量",
    slots: {
      customRender: "quantity",
    },

    ellipsis: true,
  },
  {
    title: "操作",
    mark: "action",
    dataIndex: "action",
    key: "action",
    slots: {
      customRender: "action",
    },
    width: width ? width : 200,
    fixed: "right",
  },
];
