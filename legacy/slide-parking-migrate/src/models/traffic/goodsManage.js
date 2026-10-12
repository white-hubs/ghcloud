import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "品类名称",
    slots: {
      customRender: "name",
    },
    // width: 90,
  },

  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "商品编号",
    slots: {
      customRender: "code",
    },
    // width: 90,
  },
  {
    title: "操作",
    mark: "action",
    dataIndex: "action",
    key: "action",
    slots: {
      customRender: "action",
    },
    width: width ? width : 180,
    fixed: "right",
  },
];
