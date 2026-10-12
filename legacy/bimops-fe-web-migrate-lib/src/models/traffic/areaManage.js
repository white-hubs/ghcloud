export default (width) => [
  {
    mark: "sort",
    dataIndex: "sort",
    key: "sort",
    title: "序号",
    slots: {
      customRender: "sort",
    },
    width: 200,
    ellipsis: true,
  },
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
    mark: "aliasName",
    dataIndex: "aliasName",
    key: "aliasName",
    title: "模型区域名称",
    slots: {
      customRender: "aliasName",
    },
  },
  {
    mark: "areaManagerIds",
    dataIndex: "areaManagerIds",
    key: "areaManagerIds",
    title: "管理人员",
    slots: {
      customRender: "areaManagerIds",
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
