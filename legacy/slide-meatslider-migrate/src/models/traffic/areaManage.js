import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "区域名称",
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
    title: "区域编号",
    slots: {
      customRender: "code",
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
