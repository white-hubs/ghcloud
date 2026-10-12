import { timeFormat, millennial } from "@/utils/common";
export default (width) => [
  {
    mark: "sort",
    dataIndex: "sort",
    key: "sort",
    title: "排名",
    slots: {
      customRender: "sort",
    },
    align: "center",
    customRender: ({ text }) => {
      if (text || text === 0) {
        if (text === 1) {
          return (
            <PopOver position="topLeft" content={text}>
              <span class="supplierSort first">{text}</span>
            </PopOver>
          );
        }
        if (text === 2) {
          return (
            <PopOver position="topLeft" content={text}>
              <span class="supplierSort second">{text}</span>;
            </PopOver>
          );
        }
        if (text === 3) {
          return (
            <PopOver position="topLeft" content={text}>
              <span class="supplierSort third">{text}</span>;
            </PopOver>
          );
        }
        return text;
      } else {
        return "--";
      }
    },
    width: 80,
    ellipsis: true,
  },
  {
    mark: "label",
    dataIndex: "sort",
    key: "sort",
    title: "序号",
    slots: {
      customRender: "sort",
    },
    // align: "center",
    // customRender: ({ text }) => {
    //   if (text || text === 0) {
    //     if (text === 1) {
    //       return <span class="supplierSort first">{text}</span>;
    //     }
    //     if (text === 2) {
    //       return <span class="supplierSort second">{text}</span>;
    //     }
    //     if (text === 3) {
    //       return <span class="supplierSort third">{text}</span>;
    //     }
    //     return text;
    //   } else {
    //     return "--";
    //   }
    // },
    width: 80,
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
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "supplyName",
    dataIndex: "supplyName",
    key: "supplyName",
    title: "商家名称",
    slots: {
      customRender: "supplyName",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "supplierCode",
    dataIndex: "supplierCode",
    key: "supplierCode",
    title: "商家编号",
    slots: {
      customRender: "supplierCode",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "abattoirName",
    dataIndex: "abattoirName",
    key: "abattoirName",
    title: "屠宰场名称",
    slots: {
      customRender: "abattoirName",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text}>
          {text ? text : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "tradeSlices",
    dataIndex: "tradeSlices",
    key: "tradeSlices",
    title: "交易片数",
    slots: {
      customRender: "tradeSlices",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? millennial(text) : ""}>
          {text || text === 0 ? millennial(text) : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "tradeWeight",
    dataIndex: "tradeWeight",
    key: "tradeWeight",
    title: "交易重量",
    slots: {
      customRender: "tradeWeight",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? millennial(text) : ""}>
          {text || text === 0 ? millennial(text) : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "tradeCommission",
    dataIndex: "tradeCommission",
    key: "tradeCommission",
    title: "交易佣金",
    slots: {
      customRender: "tradeCommission",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? millennial(text) : ""}>
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "amount",
    dataIndex: "amount",
    key: "amount",
    title: "销售额",
    slots: {
      customRender: "amount",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? millennial(text) : ""}>
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
  {
    mark: "tradeAmount",
    dataIndex: "tradeAmount",
    key: "tradeAmount",
    title: "销售额",
    slots: {
      customRender: "tradeAmount",
    },
    customRender: ({ text }) => {
      return (
        <PopOver position="topLeft" content={text ? millennial(text) : ""}>
          {text || text === 0 ? `￥${millennial(text)}` : "--"}
        </PopOver>
      );
    },
    ellipsis: true,
  },
];
