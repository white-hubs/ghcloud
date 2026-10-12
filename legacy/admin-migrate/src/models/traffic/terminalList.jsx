import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "访问端名称",
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
    title: "访问端编号",
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
    mark: "remark",
    dataIndex: "remark",
    key: "remark",
    title: "访问端备注",
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
    title: "访问端状态",
    slots: {
      customRender: "enabled",
    },
    // width: 200,
    ellipsis: true,
  },
  {
    mark: "createTime",
    dataIndex: "createTime",
    key: "createTime",
    title: "发布时间",
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
