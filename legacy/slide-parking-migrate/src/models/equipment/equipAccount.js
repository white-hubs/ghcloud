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
      return (
        <PopOver position="topLeft" content={text ? text : "--"}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? text : "--"}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? text : "--"}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? text.join("/") : ""}>
          {text ? text.join("/") : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? text.join("/") : ""}>
          {text ? text.join("/") : ""}
        </PopOver>
      );
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
        return (
          <PopOver position="topLeft" content="在线">
            <span class="normalRow">在线</span>
          </PopOver>
        );
      } else {
        return (
          <PopOver position="topLeft" content="离线">
            <span class="deleteRow">离线</span>
          </PopOver>
        );
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
