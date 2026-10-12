import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "菜单名称",
    slots: {
      customRender: "name",
    },
    // width: 650,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "菜单编号",
    slots: {
      customRender: "code",
    },
    // width: 200,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "path",
    dataIndex: "path",
    key: "path",
    title: "菜单路径",
    slots: {
      customRender: "path",
    },
    // width: 200,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "remark",
    dataIndex: "remark",
    key: "remark",
    title: "菜单备注",
    slots: {
      customRender: "remark",
    },
    // width: 200,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "enabled",
    dataIndex: "enabled",
    key: "enabled",
    title: "菜单状态",
    slots: {
      customRender: "enabled",
    },
  },
  {
    mark: "updateTime",
    dataIndex: "updateTime",
    key: "updateTime",
    title: "更新时间",
    slots: {
      customRender: "updateTime",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver
          
          content={text ? timeFormat(text, true) : ""}
        >
          {text ? timeFormat(text, true) : "--"}
        </PopOver>
      );
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
    width: width ? width : 200,
    fixed: "right",
  },
];
