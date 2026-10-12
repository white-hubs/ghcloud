import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "supplierCode",
    dataIndex: "supplier.phone",
    key: "supplierCode",
    title: "商家编号",
    slots: {
      customRender: "supplierCode",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    // width: 150,
    ellipsis: true,
  },
  {
    mark: "userName",
    dataIndex: "userName",
    key: "userName",
    title: "客户名称",
    slots: {
      customRender: "userName",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "userPhone",
    dataIndex: "userPhone",
    key: "userPhone",
    title: "客户电话",
    slots: {
      customRender: "userPhone",
    },
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
    key: "name",
    title: "商家名称",
    slots: {
      customRender: "supplierName",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "id",
    dataIndex: "id",
    key: "id",
    title: "充值单号",
    slots: {
      customRender: "id",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "liaisonName",
    dataIndex: "supplier.liaison",
    key: "liaisonName",
    title: "联系人姓名",
    slots: {
      customRender: "liaisonName",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    // width: 150,
    ellipsis: true,
  },
  {
    mark: "liaisonPhone",
    dataIndex: "supplier.phone",
    key: "liaisonPhone",
    title: "联系人电话",
    slots: {
      customRender: "liaisonPhone",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    // width: 140,
    ellipsis: true,
  },
  {
    mark: "balance",
    dataIndex: "balance",
    key: "balance",
    title: "账户余额",
    slots: {
      customRender: "balance",
    },
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
    ellipsis: true,
  },
  {
    mark: "status",
    dataIndex: "status",
    key: "status",
    title: "激活状态",
    slots: {
      customRender: "status",
    },
    customRender: ({ text }) => {
      if (text === "ACTIVATED") {
        return <g-table-dot content="已激活" />;
      } else {
        return <g-table-dot content="待激活" status="audit" />;
      }
    },
    ellipsis: true,
  },

  {
    mark: "rechargeStatus",
    dataIndex: "status",
    key: "status",
    title: "充值状态",
    slots: {
      customRender: "status",
    },
    customRender: ({ text }) => {
      if (text === "COMPLETED") {
        return <g-table-dot content="已完成" />;
      } else {
        return <g-table-dot content="充值中" status="audit" />;
      }
    },
    ellipsis: true,
  },
  {
    mark: "activateTime",
    dataIndex: "activateTime",
    key: "activateTime",
    title: "激活时间",
    slots: {
      customRender: "activateTime",
    },
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
    ellipsis: true,
  },
  {
    mark: "amount",
    dataIndex: "amount",
    key: "amount",
    title: "充值金额",
    slots: {
      customRender: "amount",
    },

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
    ellipsis: true,
  },
  {
    mark: "mode",
    dataIndex: "mode",
    key: "mode",
    title: "充值方式",
    slots: {
      customRender: "mode",
    },
    customRender: ({ text }) => {
      if (text === "CASH") {
        return (
          <PopOver position="topLeft" content="现金">
            现金
          </PopOver>
        );
      } else if (text === "POS") {
        return (
          <PopOver position="topLeft" content="POS机刷卡">
            POS机刷卡
          </PopOver>
        );
      } else if (text === "WEIXIN_PAY") {
        return (
          <PopOver position="topLeft" content="微信支付">
            微信支付
          </PopOver>
        );
      } else {
        return "--";
      }
    },
    // width: 110,
    ellipsis: true,
  },
  {
    mark: "createTime",
    dataIndex: "createTime",
    key: "createTime",
    title: "充值时间",
    slots: {
      customRender: "createTime",
    },

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
    ellipsis: true,
  },
  {
    mark: "remark",
    dataIndex: "remark",
    key: "remark",
    title: "备注",
    slots: {
      customRender: "remark",
    },

    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
];
