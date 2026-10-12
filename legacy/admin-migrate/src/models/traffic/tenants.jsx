import { timeFormat, millennial } from "@/utils/common";

export default (width) => [
  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: `租户编号`,
    slots: {
      customRender: "code",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text}>
          {text || text === 0 ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: `租户名称`,
    slots: {
      customRender: "name",
    },
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
    mark: "areaNames",
    dataIndex: "areaNames",
    key: "areaNames",
    title: "所在地",
    slots: {
      customRender: "areaNames",
    },
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
    title: "启用状态",
    slots: {
      customRender: "enabled",
    },
    // width: 60,
    ellipsis: true,
  },
  {
    mark: "createTime",
    dataIndex: "createTime",
    key: "createTime",
    title: "注册时间",
    slots: {
      customRender: "createTime",
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
