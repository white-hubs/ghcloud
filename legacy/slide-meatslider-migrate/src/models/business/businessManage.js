import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "supplierName",
    dataIndex: "supplierName",
    key: "supplierName",
    title: "认证商户",
    slots: {
      customRender: "supplierName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
      ]
    },
  },
  {
    mark: "name",
    dataIndex: "name",
    key: "name",
    title: "商家名称",
    slots: {
      customRender: "name",
    },
    // width: 90,
    ellipsis: true,
    customHeaderCell: () => {
      return {
        style: {
          "min-width": "90px",
          cursor: "pointer",
        },
      };
    },
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
      ]
    },
  },
  {
    mark: "liaison",
    dataIndex: "liaison",
    key: "liaison",
    title: "联系人姓名",
    slots: {
      customRender: "liaison",
    },
    // width: 105,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
      ]
    },
  },
  {
    mark: "phone",
    dataIndex: "phone",
    key: "phone",
    title: "联系人手机号",
    slots: {
      customRender: "phone",
    },
    // width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? text : "", position: "topLeft" }, { default: () => text ? text : "--" })
      ]
    },
  },
  {
    mark: "type",
    dataIndex: "type",
    key: "type",
    title: "经营性质",
    slots: {
      customRender: "type",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text, index }) => {
      if (text === "TYPE_PERSONAL") {
        return [
          h(PopOver, { content: "个人", position: "topLeft" }, { default: () => "个人" })
        ]
      } else {
        return [
          h(PopOver, { content: "企业", position: "topLeft" }, { default: () => "企业" })
        ]
      }
    },
  },
  {
    mark: "bizTypes",
    dataIndex: "bizTypes",
    key: "bizTypes",
    title: "业务角色",
    slots: {
      customRender: "bizTypes",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      if (text.length === 2) {
        text = "卖家、买家";
      } else {
        if (text[0] === "BIZ_TYPE_SELLER") {
          text = "卖家";
        } else if (text[0] === "BIZ_TYPE_BUYER") {
          text = "买家";
        } else {
          text = "--";
        }
      }
      return [
        h(PopOver, { content: text, position: "topLeft" }, { default: () => text ? text : "--" })
      ]
    },
  },
  {
    mark: "bizType",
    dataIndex: "bizType",
    key: "bizType",
    title: "业务角色",
    slots: {
      customRender: "bizType",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      if (text === "BIZ_TYPE_SELLER") {
        return [
          h(PopOver, { content: "卖家", position: "topLeft" }, { default: () => "卖家" })
        ]
      } else {
        return [
          h(PopOver, { content: "买家", position: "topLeft" }, { default: () => "买家" })
        ]
      }
    },
  },
  {
    mark: "status",
    dataIndex: "status",
    key: "status",
    title: "认证状态",
    slots: {
      customRender: "status",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text, index }) => {
      if (text === "AUDITED") {
        return [
          h(gTableDot, { content: "待审核", status: "audit" }, { default: () => "待审核" })
        ]
      } else if (text === "CERTIFIED") {
        return [
          h(gTableDot, { content: "已认证", status: "audit" }, { default: () => "已认证" })
        ]
      } else if (text === "FAILED") {
        return [
          h(gTableDot, { content: "不通过", status: "delete" }, { default: () => "不通过" })
        ]
      } else {
        return [
          h(gTableDot, { content: "未认证", status: "audit" }, { default: () => "未认证" })
        ]
      }
    },
  },
  {
    mark: "auditStatus",
    dataIndex: "auditStatus",
    key: "auditStatus",
    title: "实名认证状态",
    slots: {
      customRender: "auditStatus",
    },
    width: 120,
    ellipsis: true,
    customRender: ({ text, index }) => {
      if (text === "AUDITED") {
        return [
          h(gTableDot, { content: "待审核", status: "audit" }, { default: () => "待审核" })
        ]
      } else if (text === "CERTIFIED") {
        return [
          h(gTableDot, { content: "已认证" }, { default: () => "已认证" })
        ]
      } else if (text === "FAILED") {
        return [
          h(gTableDot, { content: "不通过", status: "delete" }, { default: () => "不通过" })
        ]
      } else {
        return [
          h(gTableDot, { content: "未认证", status: "audit" }, { default: () => "未认证" })
        ]
      }
    },
  },
  {
    mark: "sellerStatus",
    dataIndex: "sellerStatus",
    key: "sellerStatus",
    title: "卖家认证状态",
    slots: {
      customRender: "sellerStatus",
    },
    width: 120,
    ellipsis: true,
    customRender: ({ text, index }) => {
      if (text === "AUDITED") {
        return [
          h(gTableDot, { content: "待审核", status: "audit" }, { default: () => "待审核" })
        ]
      } else if (text === "CERTIFIED") {
        return [
          h(gTableDot, { content: "已认证" }, { default: () => "已认证" })
        ]
      } else if (text === "FAILED") {
        return [
          h(gTableDot, { content: "不通过", status: "delete" }, { default: () => "不通过" })
        ]
      } else {
        return [
          h(gTableDot, { content: "未认证", status: "audit" }, { default: () => "未认证" })
        ]
      }
    },
  },

  {
    mark: "submitTime",
    dataIndex: "submitTime",
    key: "submitTime",
    title: "提交时间",
    slots: {
      customRender: "submitTime",
    },
    width: 180,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? timeFormat(text, true) : "", position: "topLeft" }, { default: () => text ? timeFormat(text, true) : "--" })
      ]
    },
  },
  {
    mark: "reviewTime",
    dataIndex: "reviewTime",
    key: "reviewTime",
    title: "通过时间",
    slots: {
      customRender: "reviewTime",
    },
    width: 110,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(PopOver, { content: text ? timeFormat(text, true) : "", position: "topLeft" }, { default: () => text ? `${timeFormat(text, true)}` : "--" })
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
    fixed: "right",
  },
];
