import moment from "moment";
export default [
  {
    key: "Dictionary",
    title: "数据字典",
    render(h, text, record, props) {
      return <app-dict-display value={text} code={props.code} {...props} />;
    },
  },
  {
    key: "Enum",
    title: "枚举",
    render(h, text, record, props) {
      return <app-enum-display value={text} code={props.code} {...props} />;
    },
  },
  {
    key: "Date",
    title: "日期",
    formats: [
      {
        key: "dash",
        default: true,
        desc: "如：2019-12-01",
        render(h, text) {
          const momentDate = moment(text);
          if (text && momentDate.isValid()) {
            return <span> {momentDate.format("YYYY-MM-DD")}</span>;
          }
          return text;
        },
      },
      {
        key: "cn",
        desc: "如：2019年12月01日",
        render(h, text) {
          const momentDate = moment(text);
          if (text && momentDate.isValid()) {
            return <span> {momentDate.format("YYYY年MM月DD日")}</span>;
          }
          return text;
        },
      },
    ],
  },
  {
    key: "User",
    title: "用户名称",
    render(h, userId) {
      return <app-user-display id={userId} />;
    },
  },
  {
    key: "Currency",
    title: "货币显示",
    render(h, value) {
      if (value) {
        return "¥" + Number(value).toFixed(2);
      }
      return value;
    },
  },
  {
    key: "Phone",
    title: "电话号码",
    render(h, value) {
      return <app-phone-display phone={value} />;
    },
  },
];
