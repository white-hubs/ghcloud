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
    // width: 90,
    ellipsis: true,
    // customRender: ({ text }) => {
    //   return (
    //     <PopOver  content={text}>
    //       {text ? text : '--'}
    //     </PopOver>
    //   );
    // },
  },
  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "档位编号",
    slots: {
      customRender: "code",
    },
    // width:90,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "enabled",
    dataIndex: "enabled",
    key: "enabled",
    title: "租用状态",
    slots: {
      customRender: "enabled",
    },
    // width: 90,
    ellipsis: true,
  },
  {
    mark: "typeName",
    dataIndex: "typeName",
    key: "typeName",
    title: "档位类型",
    slots: {
      customRender: "typeName",
    },
    // width: 90,
    ellipsis: true,
  },
  {
    mark: "location",
    dataIndex: "location",
    key: "location",
    title: "详细地址",
    slots: {
      customRender: "location",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  // {
  //   mark: "area",
  //   dataIndex: "area",
  //   key: "area",
  //   title: "所在区域",
  //   slots: {
  //     customRender: "area",
  //   },
  // width: 200,
  // ellipsis: true,
  // },
  {
    mark: "deptNames",
    dataIndex: "deptNames",
    key: "deptNames",
    title: "所属部门",
    slots: {
      customRender: "deptNames",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver  content={text ? text.join("/") : ""}>
          {text ? text.join("/") : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "status",
    dataIndex: "enabled",
    key: "enabled",
    title: "状态",
    slots: {
      customRender: "enabled",
    },
    // width: 60,
    ellipsis: true,
  },
  {
    mark: "leaseType",
    dataIndex: "leaseType",
    key: "leaseType",
    title: "出租属性",
    slots: {
      customRender: "leaseType",
    },
    // width: 90,
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
    width: width ? width : 150,
    fixed: "right",
  },
];
