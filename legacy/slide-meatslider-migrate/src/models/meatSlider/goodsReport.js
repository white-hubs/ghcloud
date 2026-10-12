import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "supplierName",
    dataIndex: "supplierName",
    key: "supplierName",
    title: "商家名称",
    slots: {
      customRender: "supplierName",
    },
    width: 200,
    fixed: "left",
    ellipsis: true,
    customRender: ({ text, record }) => {
      if (record.riskLevel === "MEDIUM") {
        return [
          h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
          ]
        // return (
        //   <PopOver position="topLeft" content={text ? text : "--"}>
        //     <a-tag color="orange">中风险</a-tag>
        //     {text ? text : "--"}
        //   </PopOver>
        // );
      } else if (record.riskLevel === "HIGH") {
        return [
          h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
          ]
        // return (
        //   <PopOver position="topLeft" content={text ? text : "--"}>
        //     <a-tag color="red">高风险</a-tag>
        //     {text ? text : "--"}
        //   </PopOver>
        // );
      } else {
        return [
          h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
          ]
        // return (
        //   <PopOver position="topLeft" content={text ? text : "--"}>
        //     <a-tag color="green">低风险</a-tag>
        //     {text ? text : "--"}
        //   </PopOver>
        // );
      }
    },
  },
  {
    mark: "supplierCode",
    dataIndex: "supplierCode",
    key: "supplierCode",
    title: "商家编号",
    slots: {
      customRender: "supplierCode",
    },
    fixed: "left",

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },

  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "报备单号",
    slots: {
      customRender: "code",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "vehiclePlate",
    dataIndex: "vehiclePlate",
    key: "vehiclePlate",
    title: "来货车辆",
    slots: {
      customRender: "vehiclePlate",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "reportSlices",
    dataIndex: "reportSlices",
    key: "reportSlices",
    title: "报备片数（片）",
    slots: {
      customRender: "reportSlices",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text, false)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text, false)}` : "--"})
        ]
    },
  },
  {
    mark: "reportWeight",
    dataIndex: "reportWeight",
    key: "reportWeight",
    title: "报备重量（kg）",
    slots: {
      customRender: "reportWeight",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--"})
        ]
    },
  },
  {
    mark: "abattoirName",
    dataIndex: "abattoirName",
    key: "abattoirName",
    title: "屠宰场",
    slots: {
      customRender: "abattoirName",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },

  {
    mark: "arrivedTime",
    dataIndex: "arrivedTime",
    key: "arrivedTime",
    title: "到达时间",
    slots: {
      customRender: "arrivedTime",
    },

    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "" , position: "topLeft" }, { default: () => text ? `${timeFormat(text, true)}` : "--"})
        ]
    },
    ellipsis: true,
  },
  {
    mark: "auditTime",
    dataIndex: "auditTime",
    key: "auditTime",
    title: "审核时间",
    slots: {
      customRender: "auditTime",
    },

    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "" , position: "topLeft" }, { default: () => text ? `${timeFormat(text, true)}` : "--"})
        ]
    },
    ellipsis: true,
  },
  {
    mark: "stallName",
    dataIndex: "stallName",
    key: "stallName",
    title: "档位号",
    slots: {
      customRender: "stallName",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--" , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "pratiqueCode",
    dataIndex: "pratiqueCode",
    key: "pratiqueCode",
    title: "检疫证号",
    slots: {
      customRender: "pratiqueCode",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text.split(",") : "--" , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "auditorName",
    dataIndex: "auditorName",
    key: "auditorName",
    title: "操作员",
    slots: {
      customRender: "auditorName",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text.split(",") : "--" , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "reportStatus",
    dataIndex: "status",
    key: "status",
    title: "审核状态",
    slots: {
      customRender: "status",
    },

    ellipsis: true,
    customRender: ({ text }) => {
      if (text === "PASSED") {
        text = "已通过";
      } else if (text === "FAILED") {
        text = "不通过";
      } else {
        text = "待审核";
      }
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
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
    width: 100,
    fixed: "right",
  },
];
