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
    // width: 90,
    ellipsis: true,
    customRender: ({ text, record }) => {
      if (record.riskLevel === "MEDIUM") {
        return (
          <PopOver position="topLeft" content={text ? text : "--"}>
            <a-tag color="orange">中风险</a-tag>
            {text ? text : "--"}
          </PopOver>
        );
      } else if (record.riskLevel === "HIGH") {
        return (
          <PopOver position="topLeft" content={text ? text : "--"}>
            <a-tag color="red">高风险</a-tag>
            {text ? text : "--"}
          </PopOver>
        );
      } else {
        return (
          <PopOver position="topLeft" content={text ? text : "--"}>
            <a-tag color="green">低风险</a-tag>
            {text ? text : "--"}
          </PopOver>
        );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "productName",
    dataIndex: "merchantVO.phone",
    key: "merchantVO.phone",
    title: "商品名称",
    slots: {
      customRender: "productName",
    },
    // width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : "白条猪"}>
          {text ? text : "白条猪"}
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
    width: 150,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver
          position="topLeft"
          content={text ? `${millennial(text, false)}` : ""}
        >
          {text || text === 0 ? `${millennial(text, false)}` : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "porkReportTickets",
    dataIndex: "porkReportSlices",
    key: "porkReportSlices",
    title: "报备检疫票数（张）",
    slots: {
      customRender: "porkReportTickets",
    },
    width: 160,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver
          position="topLeft"
          content={millennial(Math.ceil(text / 2), false)}
        >
          {" "}
          {millennial(Math.ceil(text / 2), false)}
        </PopOver>
      );
    },
  },
  {
    mark: "pratiqueSlices",
    dataIndex: "pratiqueSlices",
    key: "pratiqueSlices",
    title: "检疫片数（片）",
    slots: {
      customRender: "pratiqueSlices",
    },
    width: 140,
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver
          position="topLeft"
          content={text ? `${millennial(text, false)}` : ""}
        >
          {text || text === 0 ? `${millennial(text, false)}` : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "pratiqueTickets",
    dataIndex: "pratiqueTickets",
    key: "pratiqueTickets",
    title: "登记检疫票数（张）",
    slots: {
      customRender: "pratiqueTickets",
    },
    width: 160,
    ellipsis: true,
    customRender: ({ record, text }) => {
      if (!text && text === 0) {
        return "--";
      } else {
        if (text < record.porkReportSlices / 2) {
          return (
            <PopOver position="topLeft" content={millennial(text, false)}>
              <span class="deleteRow">{millennial(text, false)}</span>
            </PopOver>
          );
        } else {
          return (
            <PopOver position="topLeft" content={millennial(text, false)}>
              {millennial(text, false)}
            </PopOver>
          );
        }
      }
    },
  },
  {
    mark: "registrantName",
    dataIndex: "registrantName",
    key: "registrantName",
    title: "登记员",
    slots: {
      customRender: "registrantName",
    },
    // width: 80,
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
    mark: "registerTime",
    dataIndex: "registerTime",
    key: "registerTime",
    title: "登记时间",
    slots: {
      customRender: "registerTime",
    },
    width: 180,
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
    mark: "remark",
    dataIndex: "remark",
    key: "remark",
    title: "备注",
    slots: {
      customRender: "remark",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
    width: width ? width : 140,
    fixed: "right",
  },
];
