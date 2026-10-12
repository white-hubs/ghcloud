import { timeFormat } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "姓名",
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
    mark: "gender",
    dataIndex: "gender",
    key: "gender",
    title: "性别",
    slots: {
      customRender: "gender",
    },
    customRender: ({ text }) => {
      if (text === "NONE") {
        text = "保密";
      } else if (text === "MALE") {
        text = "男";
      } else if (text === "FEMALE") {
        text = "女";
      }
      return  <PopOver  content={text ? text : ""}>
      {text ? text : "--"}
    </PopOver>
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
    mark: "mobile",
    dataIndex: "mobile",
    key: "mobile",
    title: "手机号",
    slots: {
      customRender: "mobile",
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
    mark: "lastLoginTime",
    dataIndex: "lastLoginTime",
    key: "lastLoginTime",
    title: "最后登录时间",
    slots: {
      customRender: "lastLoginTime",
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
