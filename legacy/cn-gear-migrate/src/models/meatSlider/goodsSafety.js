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
    // width: 150,
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
    mark: "requiredCheckRatio",
    dataIndex: "requiredCheckRatio",
    key: "requiredCheckRatio",
    title: "抽检比例（%）",
    slots: {
      customRender: "requiredCheckRatio",
    },
    // width: 140,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
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
    // width: 160,
    customRender: ({ text }) => {
      return (
        <PopOver
          position="topLeft"
          content={text ? `${millennial(Math.ceil(text / 2), false)}` : ""}
        >
          {text || text === 0
            ? `${millennial(Math.ceil(text / 2), false)}`
            : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "requiredCheckSlices",
    dataIndex: "requiredCheckSlices",
    key: "requiredCheckSlices",
    title: "规定抽检片数（片）",
    slots: {
      customRender: "requiredCheckSlices",
    },
    // width: 160,
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
    mark: "actualCheckSlices",
    dataIndex: "actualCheckSlices",
    key: "actualCheckSlices",
    title: "实际抽检片数（片）",
    slots: {
      customRender: "actualCheckSlices",
    },
    // width: 160,
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
    mark: "clenbuterol",
    dataIndex: "clenbuterol",
    key: "clenbuterol",
    title: "瘦肉精",
    slots: {
      customRender: "clenbuterol",
    },
    // width: 80,
    customRender: ({ text }) => {
      return text === "UNSELECTED" ? (
        <PopOver position="topLeft" content="检测中">
          检测中
        </PopOver>
      ) : text === "POSITIVE" ? (
        <PopOver position="topLeft" content="阳">
          <span style="color: red">阳</span>
        </PopOver>
      ) : (
        <PopOver position="topLeft" content="阴">
          阴
        </PopOver>
      );
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
      return text === "UNSELECTED" ? (
        <PopOver position="topLeft" content="检测中">
          检测中
        </PopOver>
      ) : text === "POSITIVE" ? (
        <PopOver position="topLeft" content="阳">
          <span style="color: red">阳</span>
        </PopOver>
      ) : (
        <PopOver position="topLeft" content="阴">
          阴
        </PopOver>
      );
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
        return (
          <PopOver position="topLeft" content="检测中">
            检测中
          </PopOver>
        );
      } else if (
        record.clenbuterol === "FAILED" ||
        record.watered === "FAILED"
      ) {
        return (
          <PopOver position="topLeft" content="不合格">
            <span class="deleteRow">不合格</span>
          </PopOver>
        );
      } else {
        return (
          <PopOver position="topLeft" content="合格">
            合格
          </PopOver>
        );
      }
    },
  },
  {
    mark: "inspectorName",
    dataIndex: "inspectorName",
    key: "inspectorName",
    title: "抽检员",
    slots: {
      customRender: "inspectorName",
    },
    ellipsis: true,
    // width: 80,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
  },
  {
    mark: "spotCheckTime",
    dataIndex: "spotCheckTime",
    key: "spotCheckTime",
    title: "抽检时间",
    slots: {
      customRender: "spotCheckTime",
    },
    // width: 180,
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
    ellipsis: true,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? text : "--"}>
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
