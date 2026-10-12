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
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? `￥${millennial(text)}` : ""}
        >
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver
          position="topLeft"
          content={text ? timeFormat(text, true) : ""}
        >
          {text ? `${timeFormat(text, true)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
        return <g-table-dot content="待支付" status="audit" />;
      } else if (text === "FINISHED") {
        return <g-table-dot content="已支付" />;
      } else {
        return <g-table-dot content="已取消" status="audit" />;
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
