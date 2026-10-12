import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "应用名称",
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
    mark: "id",
    dataIndex: "id",
    key: "id",
    title: "应用ID",
    slots: {
      customRender: "id",
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
    title: "租用权限",
    slots: {
      customRender: "enabled",
    },
    customRender: ({ text }) => {
      if (text) {
        return <PopOver  content="全部可用">
        全部可用
      </PopOver>;
      } else {
        return <PopOver  content="指定可用">
        指定可用
      </PopOver>;
      }
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
