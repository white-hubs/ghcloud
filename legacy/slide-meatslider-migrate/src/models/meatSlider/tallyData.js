import { timeFormat, millennial,getFreshLabel } from "@/utils/common";
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
    ellipsis: true,
    customRender: ({ text, record }) => {
      if (record.riskLevel === "MEDIUM") {
        return [
          h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
        ]
      } else if (record.riskLevel === "HIGH") {
        return [
          h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
        ]
      } else {
        return [
          h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
        ]
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
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
      ]
    },
  },
  // 暂无
  {
    mark: "goodsCategoryName",
    dataIndex: "goodsCategoryName",
    key: "goodsCategoryName",
    title: "商品名称",
    slots: {
      customRender: "goodsCategoryName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text, record }) => {
      return (
        <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName : "--"}>
          {record.goodsCategoryName ? record.goodsCategoryName : "--"}
          <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
        </PopOver>
      );
    },
  },
  {
    mark: "porkReportCode",
    dataIndex: "porkReportCode",
    key: "porkReportCode",
    title: "批次号",
    slots: {
      customRender: "porkReportCode",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
      ]
    },
  },

  {
    mark: "porkReportSlices",
    dataIndex: "porkReportSlices",
    key: "porkReportSlices",
    title: "报备片数（片）",
    slots: {
      customRender: "porkReportSlices",
    },
    // width: 140,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text, false)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text, false)}` : "--" })
      ]
    },
  },
  {
    mark: "porkReportWeight",
    dataIndex: "porkReportWeight",
    key: "porkReportWeight",
    title: "报备重量（kg）",
    slots: {
      customRender: "porkReportWeight",
    },
    // width: 140,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--" })
      ]
    },
  },
  {
    mark: "porkArrangeSlices",
    dataIndex: "porkArrangeSlices",
    key: "porkArrangeSlices",
    title: "理货片数（片）",
    slots: {
      customRender: "porkArrangeSlices",
    },
    // width: 140,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text || text === 0 ? text : "--" })
      ]
    },
  },
  {
    mark: "slices",
    dataIndex: "slices",
    key: "slices",
    title: "理货片数（片）",
    slots: {
      customRender: "slices",
    },
    // width: 140,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--" })
      ]
    },
  },
  {
    mark: "porkArrangeWeight",
    dataIndex: "porkArrangeWeight",
    key: "porkArrangeWeight",
    title: "理货重量（kg）",
    slots: {
      customRender: "porkArrangeWeight",
    },
    // width: 140,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--" })
      ]
    },
  },
  {
    mark: "tallyWeight",
    dataIndex: "weight",
    key: "weight",
    title: "理货重量（kg）",
    slots: {
      customRender: "weight",
    },
    // width: 140,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `${millennial(text)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `${millennial(text)}` : "--" })
      ]
    },
  },
  {
    mark: "porkArrangePlace",
    dataIndex: "porkArrangePlace",
    key: "porkArrangePlace",
    title: "理货点",
    slots: {
      customRender: "porkArrangePlace",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text, position: "topLeft" }, { default: () => text ? text : "--" })
      ]

    },
  },
  {
    mark: "arrangeStatus",
    dataIndex: "arrangeStatus",
    key: "arrangeStatus",
    title: "理货状态",
    slots: {
      customRender: "arrangeStatus",
    },
    // width: 90,
    customRender: ({ text }) => {
      if (text === "WAITED") {
        return [
          h(PopOver, { content: "待理货", position: "topLeft" }, { default: () => "待理货" })
        ]
      } else if (text === "PROGRESSED") {
        return [
          h(PopOver, { content: "正在理货", position: "topLeft" }, { default: () => "正在理货" })
        ]
      } else if (text === "PAUSED") {
        return [
          h(PopOver, { content: "暂停理货", position: "topLeft" }, { default: () => "暂停理货" })
        ]
      } else {
        return [
          h(PopOver, { content: "理货完成", position: "topLeft" }, { default: () => "理货完成" })
        ]
      }
    },
  },
  {
    mark: "porkArrangeStatus",
    dataIndex: "porkArrangeStatus",
    key: "porkArrangeStatus",
    title: "理货状态",
    slots: {
      customRender: "porkArrangeStatus",
    },
    // width: 90,
    customRender: ({ text }) => {
      if (text === "WAITED") {
        return [
          h(PopOver, { content: "待理货", position: "topLeft" }, { default: () => "待理货" })
        ]
      } else if (text === "PROGRESSED") {
        return [
          h(PopOver, { content: "正在理货", position: "topLeft" }, { default: () => "正在理货" })
        ]
      } else if (text === "PAUSED") {
        return [
          h(PopOver, { content: "暂停理货", position: "topLeft" }, { default: () => "暂停理货" })
        ]
      } else {
        return [
          h(PopOver, { content: "理货完成", position: "topLeft" }, { default: () => "理货完成" })
        ]
      }
    },
  },
  // 暂无
  {
    mark: "pratiqueTickets",
    dataIndex: "pratiqueTickets",
    key: "pratiqueTickets",
    title: "检疫票数（张）",
    slots: {
      customRender: "pratiqueTickets",
    },
    // width: 140,
    customRender: ({ record, text }) => {
      if (!text && text !== 0) {
        return "--";
      } else {
        if (text < Math.ceil(record.porkArrangeSlices / 2)) {
          return [
            h(PopOver, { content: millennial(text, false), position: "topLeft" }, { default: () => millennial(text, false) })
          ]
        } else {
          return [
            h(PopOver, { content: millennial(text, false), position: "topLeft" }, { default: () => millennial(text, false) })
          ]
        }
      }
    },
  },
  // {
  //   mark: "pratiqueTickets",
  //   dataIndex: "pratiqueTickets",
  //   key: "pratiqueTickets",
  //   title: "登记检疫票数",
  //   slots: {
  //     customRender: "pratiqueTickets",
  //   },
  //   // width: 120,
  //   customRender: ({ text }) => {
  //     return (
  // <PopOver position="topLeft" content={text ? text : ""}>
  //   {text || text === 0 ? text : "--"}
  // </PopOver>
  //     );
  //   },
  // },
  {
    mark: "clenbuterol",
    dataIndex: "clenbuterol",
    key: "clenbuterol",
    title: "瘦肉精",
    slots: {
      customRender: "clenbuterol",
    },
    // width: 80,
    customRender: ({ text }) => {
      if (text === "UNSELECTED") {
        return [
          h(PopOver, { content: "检测中", position: "topLeft" }, { default: () => "检测中" })
        ]
      } else if (text === "POSITIVE") {
        return [
          h(PopOver, { content: "阳", position: "topLeft" }, { default: () => "阳" })
        ]
      } else {
        return [
          h(PopOver, { content: "阴", position: "topLeft" }, { default: () => "阴" })
        ]
      }

    },
  },
  {
    mark: "watered",
    dataIndex: "watered",
    key: "watered",
    title: "含水量",
    slots: {
      customRender: "watered",
    },
       // width: 80,
       customRender: ({ text }) => {
        if (text === "UNSELECTED") {
          return [
            h(PopOver, { content: "检测中", position: "topLeft" }, { default: () => "检测中" })
          ]
        } else if (text === "POSITIVE") {
          return [
            h(PopOver, { content: "阳", position: "topLeft" }, { default: () => "阳" })
          ]
        } else {
          return [
            h(PopOver, { content: "阴", position: "topLeft" }, { default: () => "阴" })
          ]
        }
  
      },
  },
  {
    mark: "result",
    dataIndex: "result",
    key: "result",
    title: "抽检结果",
    slots: {
      customRender: "result",
    },
    // width: 80,
    customRender: ({ text, record }) => {
      if (record.clenbuterol === "CHECKING" || record.watered === "CHECKING") {
        return [
          h(PopOver, { content: "检测中", position: "topLeft" }, { default: () => "检测中" })
        ]
      } else if (
        record.clenbuterol === "FAILED" ||
        record.watered === "FAILED"
      ) {
        return [
          h(PopOver, { content: "不合格", position: "topLeft" }, { default: () => "不合格" })
        ]
      } else {
        return [
          h(PopOver, { content: "合格", position: "topLeft" }, { default: () => "合格" })
        ]
      }
    },
  },
  {
    mark: "spotCheckStatus",
    dataIndex: "spotCheckStatus",
    key: "spotCheckStatus",
    title: "抽检结果",
    slots: {
      customRender: "spotCheckStatus",
    },
    // width: 80,
    customRender: ({ text, record }) => {
      if (
        record.clenbuterol === "UNSELECTED" ||
        record.watered === "UNSELECTED"
      ) {
        return [
          h(PopOver, { content: "检测中", position: "topLeft" }, { default: () => "检测中" })
        ]
      } else if (
        record.clenbuterol === "POSITIVE" ||
        record.watered === "POSITIVE"
      ) {
        return [
          h(PopOver, { content: "不合格", position: "topLeft" }, { default: () => "不合格" })
        ]
      } else {
        return [
          h(PopOver, { content: "合格", position: "topLeft" }, { default: () => "合格" })
        ]
      }
    },
  },
  {
    mark: "porkArrangeTime",
    dataIndex: "porkArrangeTime",
    key: "porkArrangeTime",
    title: "理货完成时间",
    slots: {
      customRender: "porkArrangeTime",
    },
    // width: 180,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "", position: "topLeft" }, { default: () =>text ? `${timeFormat(text, true)}` : "--"})
      ]
    },
  },
  {
    mark: "auditTime",
    dataIndex: "auditTime",
    key: "auditTime",
    title: "审核时间",
    slots: {
      customRender: "auditTime",
    },
    // width: 110,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "", position: "topLeft" }, { default: () =>text ? `${timeFormat(text, true)}` : "--"})
      ]
    },
    ellipsis: true,
  },

  {
    mark: "auditStatus",
    dataIndex: "auditStatus",
    key: "auditStatus",
    title: "审核状态",
    slots: {
      customRender: "auditStatus",
    },
    // width: 90,
    customRender: ({ text }) => {
      if (text === "AUDIT") {
        return [
          h(gTableDo, { content:'待审核', status:"audit" })
        ]
      } else if (text === "PASSED") {
        return [
          h(gTableDo, { content:'已通过', status:"audit" })
        ]
      } else {
        return [
          h(gTableDo, { content:'不通过', status:"audit" })
        ]
      }
    },
  },

  {
    mark: "tallyMachine",
    dataIndex: "place",
    key: "place",
    title: "理货机",
    slots: {
      customRender: "place",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text, position: "topLeft" }, { default: () =>text ? text : "--"})
      ]
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
        h(PopOver, { content:text, position: "topLeft" }, { default: () =>text ? text : "--"})
      ]
    },
  },
  {
    mark: "sort",
    dataIndex: "sort",
    key: "sort",
    title: "序号",
    slots: {
      customRender: "sort",
    },
    width: 65,
    customRender: ({ text, index }) => {
      return [
        h(PopOver, { content:index+1, position: "topLeft" }, { default: () =>index+1})
      ]
    },
  },
  {
    mark: "label",
    dataIndex: "label",
    key: "label",
    title: "电子标签",
    slots: {
      customRender: "label",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text, position: "topLeft" }, { default: () =>text ? text : "--"})
      ]
    },
  },
  {
    mark: "footMarkCode",
    dataIndex: "footMarkCode",
    key: "footMarkCode",
    title: "理货编码",
    slots: {
      customRender: "footMarkCode",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text, position: "topLeft" }, { default: () =>text ? text : "--"})
      ]
    },
  },
  {
    mark: "weight",
    dataIndex: "weight",
    key: "weight",
    title: "净重（kg）",
    slots: {
      customRender: "weight",
    },
    // width: 105,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `${millennial(text)}` : "", position: "topLeft" }, { default: () =>text || text === 0 ? `${millennial(text)}` : "--"})
      ]
    },
  },
  {
    mark: "tallyPorkArrangeTime",
    dataIndex: "porkArrangeTime",
    key: "porkArrangeTime",
    title: "理货时间",
    slots: {
      customRender: "porkArrangeTime",
    },
    // width: 180,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "", position: "topLeft" }, { default: () =>text ? `${timeFormat(text, true)}` : "--"})
      ]
    },
  },
  {
    mark: "cheat",
    dataIndex: "cheat",
    key: "cheat",
    title: "作弊状态",
    slots: {
      customRender: "cheat",
    },
    // width: 180,
    ellipsis: true,
    customRender: ({ text }) => {
      if (!text) {
        return [
          h(PopOver, { content:"正常", position: "topLeft" }, { default: () => "正常"})
        ]
      } else {
        return [
          h(PopOver, { content:"作弊嫌疑", position: "topLeft" }, { default: () => "作弊嫌疑"})
        ]
      }
    },
  },
  {
    mark: "action",
    dataIndex: "action",
    title: "操作",
    key: "action",
    slots: {
      customRender: "action",
    },
    width: width ? width : 150,
    fixed: "right",
  },
];
