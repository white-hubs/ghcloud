import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "设备编号",
    slots: {
      customRender: "code",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--" , position: "topLeft" }, { default: () =>text ? text : "--"})
        ]
    },
    // width: 80,
    ellipsis: true,
  },
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "设备名称",
    slots: {
      customRender: "name",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--" , position: "topLeft" }, { default: () =>text ? text : "--"})
        ]
    },
    // width: 80,
    ellipsis: true,
  },
  {
    mark: "typeName",
    dataIndex: "typeName",
    key: "typeName",
    title: "设备类型",
    slots: {
      customRender: "typeName",
    },
    customRender: ({ text }) => {
      if (text === "1") {
        text = "理货机";
      } else if (text === "2") {
        text = "摄像机";
      }
      return [
        h(PopOver, { content:text ? text : "--" , position: "topLeft" }, { default: () =>text ? text : "--"})
        ]
    },
    // width: 80,
    ellipsis: true,
  },
  {
    mark: "areaNames",
    dataIndex: "areaNames",
    key: "areaNames",
    title: "所属区域",
    slots: {
      customRender: "areaNames",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text.join("/") : "" , position: "topLeft" }, { default: () =>text ? text.join("/") : "--"})
        ]
    },
    // width: 80,
    ellipsis: true,
  },
  {
    mark: "deptNames",
    dataIndex: "deptNames",
    key: "deptNames",
    title: "所属部门",
    slots: {
      customRender: "deptNames",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text.join("/") : "" , position: "topLeft" }, { default: () =>text ? text.join("/") : "--"})
        ]
    },
    // width: 80,
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
    customRender: (status) => {
      if (status) {
        return [
          h(PopOver, { content: "在线" , position: "topLeft" }, { default: () => "在线"})
          ]
      } else {
        return [
          h(PopOver, { content: "离线" , position: "topLeft" }, { default: () => "离线"})
          ]
      }
    },
  },
  {
    mark: "action",
    dataIndex: "action",
    key: "action",
    title: "操作",
    slots: {
      customRender: "action",
    },
    width: width ? width : 80,
    ellipsis: true,
    fixed: "right",
  },
];
