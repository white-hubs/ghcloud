import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "business",
    dataIndex: "business",
    key: "business",
    title: "流水号",
    slots: {
      customRender: "business",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text.id : ""}>
          {text ? text.id : "--"}
        </PopOver>
      );
    },
    // width: 150,
    ellipsis: true,
  },
  {
    mark: "type",
    dataIndex: "type",
    key: "type",
    title: "业务类型",
    slots: {
      customRender: "type",
    },
    customRender: ({ text, record }) => {
      return (
        <PopOver
          position="topLeft"
          content={record.business ? record.business.name : ""}
        >
          {record.business ? record.business.name : "--"}
        </PopOver>
      );
    },
    // width: 150,
    ellipsis: true,
  },
  {
    mark: "supplierCode",
    dataIndex: "supplier",
    key: "supplierCode",
    title: "商家编号",
    slots: {
      customRender: "supplierCode",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text.code : ""}>
          {text ? text.code : "--"}
        </PopOver>
      );
    },
    // width: 150,
    ellipsis: true,
  },
  {
    mark: "adminUserName",
    dataIndex: "adminUserName",
    key: "adminUserName",
    title: "客户名称",
    slots: {
      customRender: "adminUserName",
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
    mark: "supplierName",
    dataIndex: "supplier",
    key: "supplierName",
    title: "商家名称",
    slots: {
      customRender: "supplierName",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text.name : ""}>
          {text ? text.name : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "id",
    dataIndex: "id",
    key: "id",
    title: "余额账户编号",
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
    mark: "businessId",
    dataIndex: "business.id",
    key: "businessId",
    title: "流水号",
    slots: {
      customRender: "businessId",
    },
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
    mark: "flow",
    dataIndex: "flow",
    key: "flow",
    title: "资金流向",
    slots: {
      customRender: "flow",
    },
    customRender: ({ text }) => {
      if (text === "INCOME") {
        return (
          <PopOver position="topLeft" content="入账">
            入账
          </PopOver>
        );
      } else {
        return (
          <PopOver position="topLeft" content="出账">
            出账
          </PopOver>
        );
      }
    },
    ellipsis: true,
  },
  {
    mark: "payer",
    dataIndex: "sourceMerchant.name",
    key: "sourceMerchant.name",
    title: "出账方",
    slots: {
      customRender: "payer",
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
    mark: "payee",
    dataIndex: "targetMerchant.name",
    key: "targetMerchant.name",
    title: "入账方",
    slots: {
      customRender: "payee",
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
    mark: "amount",
    dataIndex: "amount",
    key: "amount",
    title: "金额",
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
    mark: "createTime",
    dataIndex: "createTime",
    key: "createTime",
    title: "交易时间",
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
  {
    mark: "action",
    dataIndex: "action",
    key: "action",
    title: "操作",
    slots: {
      customRender: "action",
    },
    width: width ? width : 200,
    ellipsis: true,
  },
];
