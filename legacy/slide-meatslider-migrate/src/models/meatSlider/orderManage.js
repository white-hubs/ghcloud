import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  // 暂无
  {
    mark: "code",
    dataIndex: "code",
    key: "code",
    title: "订单号",
    slots: {
      customRender: "code",
    },
    // width: 80,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
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
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
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
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },

  {
    mark: "customerName",
    dataIndex: "customerName",
    key: "customerName",
    title: "客户名称",
    slots: {
      customRender: "customerName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "customerPhone",
    dataIndex: "customerPhone",
    key: "customerPhone",
    title: "客户电话",
    slots: {
      customRender: "customerPhone",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
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
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? text : "--", position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "commission",
    dataIndex: "commission",
    key: "commission",
    title: "订单佣金",
    slots: {
      customRender: "commission",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? `￥${millennial(text)}` : "", position: "topLeft" }, { default: () => text || text === 0 ? `￥${millennial(text)}` : "--"})
        ]
    },
  },
  {
    mark: "orderTime",
    dataIndex: "orderTime",
    key: "orderTime",
    title: "订单时间",
    slots: {
      customRender: "orderTime",
    },
    // width: 110,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content:text ? timeFormat(text, true) : "", position: "topLeft" }, { default: () => text ? `${timeFormat(text, true)}` : "--"})
        ]
    },
  },
  {
    mark: "way",
    dataIndex: "way",
    key: "way",
    title: "支付方式",
    slots: {
      customRender: "way",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      if (text === "BALANCE") {
        text = "余额支付";
      }
      return [
        h(PopOver, { content:text , position: "topLeft" }, { default: () => text ? text : "--"})
        ]
    },
  },
  {
    mark: "status",
    dataIndex: "status",
    key: "status",
    title: "订单状态",
    slots: {
      customRender: "status",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      if (text === "WAITED") {
        return [
          h(gTableDot, { content: "待支付", status: "audit" }, { default: () => "待支付" })
        ]
      } else if (text === "FINISHED") {
        return [
          h(gTableDot, { content: "已支付" }, { default: () => "已支付" })
        ]
      }  else {
        return [
          h(gTableDot, { content: "已取消", status: "audit" }, { default: () => "已取消" })
        ]
      }
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
    width: width ? width : 150,
    fixed: "right",
  },
];
