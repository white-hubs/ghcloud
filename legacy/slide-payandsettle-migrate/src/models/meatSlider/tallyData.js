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
  // 暂无
  {
    mark: "productName",
    dataIndex: "productName",
    key: "productName",
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
    // width: 140,
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
    mark: "porkReportWeight",
    dataIndex: "porkReportWeight",
    key: "porkReportWeight",
    title: "报备重量（kg）",
    slots: {
      customRender: "porkReportWeight",
    },
    // width: 140,
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
          {text || text === 0 ? `${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? text : ""}>
          {text || text === 0 ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
          {text || text === 0 ? `${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
          {text || text === 0 ? `${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
          {text || text === 0 ? `${millennial(text)}` : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
        return (
          <PopOver position="topLeft" content="待理货">
            待理货
          </PopOver>
        );
      } else if (text === "PROGRESSED") {
        return (
          <PopOver position="topLeft" content="正在理货">
            正在理货
          </PopOver>
        );
      } else if (text === "PAUSED") {
        return (
          <PopOver position="topLeft" content="暂停理货">
            暂停理货
          </PopOver>
        );
      } else {
        return (
          <PopOver position="topLeft" content="理货完成">
            理货完成
          </PopOver>
        );
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
        return (
          <PopOver position="topLeft" content="待理货">
            待理货
          </PopOver>
        );
      } else if (text === "PROGRESSED") {
        return (
          <PopOver position="topLeft" content="理货中">
            理货中
          </PopOver>
        );
      } else if (text === "PAUSED") {
        return (
          <PopOver position="topLeft" content="暂停理货">
            暂停理货
          </PopOver>
        );
      } else {
        return (
          <PopOver position="topLeft" content="理货完成">
            理货完成
          </PopOver>
        );
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
        return (
          <PopOver position="topLeft" content="检测中">
            检测中
          </PopOver>
        );
      } else if (
        record.clenbuterol === "POSITIVE" ||
        record.watered === "POSITIVE"
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
    mark: "auditTime",
    dataIndex: "auditTime",
    key: "auditTime",
    title: "审核时间",
    slots: {
      customRender: "auditTime",
    },
    // width: 110,
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
        return <g-table-dot content="待审核" status="audit" />;
      } else if (text === "PASSED") {
        return <g-table-dot content="已通过" />;
      } else {
        return <g-table-dot content="不通过" status="delete" />;
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
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
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={index + 1}>
          {index + 1}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
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
      return (
        <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
          {text || text === 0 ? `${millennial(text)}` : "--"}
        </PopOver>
      );
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
        return (
          <PopOver position="topLeft" content="正常">
            正常
          </PopOver>
        );
      } else {
        return (
          <PopOver position="topLeft" content="作弊嫌疑">
            -------
            <span class="deleteRow">作弊嫌疑</span>
          </PopOver>
        );
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
