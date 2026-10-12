import moment from "moment";

export const templateColumns = [
  {
    dataIndex: "",
    title: "序号",
    slots: {
      customRender: "",
    },
    customRender: ({ text, index }) => {
      return index + 1;
    },
  },
  {
    title: "模板名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    dataIndex: "content",
    key: "content",
    title: "广播内容",
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver
          position="topLeft"
          content={
            text
              ? text
                .replaceAll("${name}", "{ 姓名 }")
                .replaceAll("${address}", "{ 地址 }")
                .replaceAll("${plateNo}", "{车牌号 }")
                .replaceAll("${curTime}", "{当前时间}")
                .replaceAll("${curDate}", "{当前日期}")
                .replaceAll("${phone}", "{ 电话 }")
                .replaceAll("${genericText}", "{ 通用文本 }")
              : ""
          }
        >
          {text
            ? text
              .replaceAll("${name}", "{ 姓名 }")
              .replaceAll("${address}", "{ 地址 }")
              .replaceAll("${plateNo}", "{车牌号 }")
              .replaceAll("${curTime}", "{当前时间}")
              .replaceAll("${curDate}", "{当前日期}")
              .replaceAll("${phone}", "{ 电话 }")
              .replaceAll("${genericText}", "{ 通用文本 }")
            : "--"}
        </PopOver>
      );
    },
  },
  {
    dataIndex: "updateByName",
    title: "编辑人",
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    dataIndex: "updateTime",
    title: "最近编辑时间",
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
        </PopOver>
      );
    },
  },

]
export const checkedTemColumns = [
  {
    title: "模板名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    dataIndex: "content",
    key: "content",
    title: "广播内容",
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver
          position="topLeft"
          content={
            text
              ? text
                .replaceAll("${name}", "{ 姓名 }")
                .replaceAll("${address}", "{ 地址 }")
                .replaceAll("${plateNo}", "{车牌号 }")
                .replaceAll("${curTime}", "{当前时间}")
                .replaceAll("${curDate}", "{当前日期}")
                .replaceAll("${phone}", "{ 电话 }")
                .replaceAll("${genericText}", "{ 通用文本 }")
              : ""
          }
        >
          {text
            ? text
              .replaceAll("${name}", "{ 姓名 }")
              .replaceAll("${address}", "{ 地址 }")
              .replaceAll("${plateNo}", "{车牌号 }")
              .replaceAll("${curTime}", "{当前时间}")
              .replaceAll("${curDate}", "{当前日期}")
              .replaceAll("${phone}", "{ 电话 }")
              .replaceAll("${genericText}", "{ 通用文本 }")
            : "--"}
        </PopOver>
      );
    },
  },
  {
    dataIndex: "action",
    title: "操作",
    slots: {
      customRender: "action",
    },
  },
]

export const deviceColumns = [

  {
    dataIndex: "code",
    title: "设备编码",

  },
  {
    dataIndex: "deviceName",
    title: "设备名称",
  },
  {
    dataIndex: "deviceProdCategoryName",
    title: "产品品类",
  },
  {
    dataIndex: "deviceProdName",
    title: "产品名称",
  },
  {
    dataIndex: "brandName",
    title: "设备品牌",
  },
  {
    dataIndex: "areaName",
    title: "所属区域",
  },
]
export const checkedDeviceColumns = [
  {
    dataIndex: "",
    title: "序号",
    slots: {
      customRender: "",
    },
    customRender: ({ text, index }) => {
      return index + 1;
    },
  },
  {
    dataIndex: "deviceName",
    title: "设备名称",
  },
  {
    dataIndex: "deviceProdCategoryName",
    title: "产品品类",
  },
  {
    dataIndex: "deviceProdName",
    title: "产品名称",
  },
  {
    dataIndex: "areaName",
    title: "所属区域",
  },
  {
    dataIndex: "action",
    title: "操作",
    slots: {
      customRender: "action",
    },
  },
]