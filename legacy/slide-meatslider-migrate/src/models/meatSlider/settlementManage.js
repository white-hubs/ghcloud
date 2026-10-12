import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  // 暂无
  {
    mark: "settlementCode",
    dataIndex: "settlementCode",
    key: "settlementCode",
    title: "结算单号",
    slots: {
      customRender: "settlementCode",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
    // width: 90,
    ellipsis: true,
  },
  {
    mark: "supplierName",
    dataIndex: "supplierName",
    key: "supplierName",
    title: "商家名称",
    slots: {
      customRender: "supplierName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
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
        h(PopOver, { content: text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  // {
  //   mark: "goodsCategoryName",
  //   dataIndex: "goodsCategoryName",
  //   key: "goodsCategoryName",
  //   title: "商品名称",
  //   slots: {
  //     customRender: "goodsCategoryName",
  //   },
  //   customRender: () => {
  //     // if (!text) {
  //     //   return "--";
  //     // }
  //     return "白条猪";
  //   },
  //   // width: 150,
  //   ellipsis: true,
  // },
  // {
  //   mark: "pattern",
  //   dataIndex: "pattern",
  //   key: "pattern",
  //   title: "结算模式",
  //   slots: {
  //     customRender: "pattern",
  //   },
  //   customRender: ({ text }) => {
  //     if (!text) {
  //       return "--";
  //     } else {
  //       return text;
  //     }
  //   },
  //   // width: 140,
  //   ellipsis: true,
  // },
  // {
  //   mark: "tradeWeight",
  //   dataIndex: "tradeWeight",
  //   key: "tradeWeight",
  //   title: "交易重量（kg）",
  //   slots: {
  //     customRender: "tradeWeight",
  //   },
  //   customRender: ({ text }) => {
  //     if (!text && text !== 0) {
  //       return "--";
  //     } else {
  //       return millennial(text);
  //     }
  //   },
  //   width: 140,
  //   ellipsis: true,
  // },
  {
    mark: "orderCode",
    dataIndex: "orderCode",
    key: "orderCode",
    title: "订单号",
    slots: {
      customRender: "orderCode",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "amount",
    dataIndex: "amount",
    key: "amount",
    title: "订单金额",
    slots: {
      customRender: "amount",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
    // width: 90,
    ellipsis: true,
  },
  {
    mark: "commission",
    dataIndex: "commission",
    key: "commission",
    title: "订单佣金",
    slots: {
      customRender: "commission",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? `￥${millennial(text)}` : "" , position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
    // width: 90,
    ellipsis: true,
  },
  // {
  //   mark: "settlementAmount",
  //   dataIndex: "settlementAmount",
  //   key: "settlementAmount",
  //   title: "结算金额",
  //   slots: {
  //     customRender: "settlementAmount",
  //   },
  //   customRender: ({ text }) => {
  //     if (text || text === 0) {
  //       return "￥" + millennial(text);
  //     } else {
  //       return "--";
  //     }
  //   },
  //   // width: 110,
  //   ellipsis: true,
  // },
  {
    mark: "initiateTime",
    dataIndex: "initiateTime",
    key: "initiateTime",
    title: "生成时间",
    slots: {
      customRender: "initiateTime",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "" , position: "topLeft" }, { default: () => text ? `${timeFormat(text, true)}` : "--"})
        ]
    },
    // width: 180,
    ellipsis: true,
  },
  {
    mark: "status",
    dataIndex: "status",
    key: "status",
    title: "结算状态",
    slots: {
      customRender: "status",
    },
    customRender: ({ text }) => {
      if (text ) {
        return [
          h(gTableDot, { content: "已结算" }, { default: () => "已结算" })
        ]
      }  else {
        return [
          h(gTableDot, { content: "待结算", status: "audit" }, { default: () => "待结算" })
        ]
      }
    },
  },
  {
    mark: "settlementTime",
    dataIndex: "settlementTime",
    key: "settlementTime",
    title: "结算时间",
    slots: {
      customRender: "settlementTime",
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "" , position: "topLeft" }, { default: () => text ? `${timeFormat(text, true)}` : "--"})
        ]
    },
    // width: 180,
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
    width: width ? width : 100,
    fixed: "right",
  },
];
