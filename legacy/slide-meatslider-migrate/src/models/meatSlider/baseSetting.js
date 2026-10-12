import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "抽检员",
    slots: {
      customRender: "name",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
    // width: 80,
    ellipsis: true,
  },
  {
    mark: "slaughterhouseName",
    dataIndex: "name",
    key: "name",
    title: "屠宰场全称",
    slots: {
      customRender: "name",
    },
    // width: 105,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "abbr",
    dataIndex: "abbr",
    key: "abbr",
    title: "屠宰场简称",
    slots: {
      customRender: "abbr",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
    // width: 105,
    ellipsis: true,
  },
  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "屠宰场代码",
    slots: {
      customRender: "code",
    },
    // width: 105,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "address",
    dataIndex: "address",
    key: "address",
    title: "屠宰场地址",
    slots: {
      customRender: "address",
    },
    ellipsis: true,
    // width: 105,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
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
  },
  {
    mark: "addTime",
    dataIndex: "addTime",
    key: "addTime",
    title: "添加时间",
    slots: {
      customRender: "addTime",
    },
    // width: 180,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },

  {
    dataIndex: "startTime",
    mark: "startTime",
    key: "startTime",
    title: "起点时间（h）",
    slots: {
      customRender: "startTime",
    },
  },
  {
    dataIndex: "endTime",
    mark: "endTime",
    key: "endTime",
    title: "终点时间（h）",
    slots: {
      customRender: "endTime",
    },
  },
  {
    dataIndex: "loss",
    mark: "loss",
    key: "loss",
    title: "损耗重量(kg)",
    slots: {
      customRender: "loss",
    },
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
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
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
    fixed: "right",
  },
];
