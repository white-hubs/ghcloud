import type { TemplateType } from "@ghcloud/cube-safety-management-service";

// export const appCodeMap = {
//   'SECURITY_MONITORING': '安防监控',
//   'ELECTRICMANAGE': '电气安全',
//   'FIRECONTROL': '消防安全',
//   'ROTATINGMANAGE': '动环安全',
//   'ELECTRlC_VEHICLE': '电动车安全',
//   'SMALLENFINEERING': '小散工程',
//   'INSPECTION': '日常巡检',
//   'ELECTRONIC_PATROL': '电子巡更',
//   'HIDDENDANGER': '隐患整改',
//   'FAULT': '故障报修',
// }
export const appCodeMap = [
  {
    code: "SECURITY_MONITORING",
    name: "安防监控",
  },
  {
    code: "ELECTRICMANAGE",
    name: "电气安全",
  },
  {
    code: "FIRECONTROL",
    name: "消防安全",
  },
  {
    code: "ROTATINGMANAGE",
    name: "动环安全",
  },
  {
    code: "ELECTRlC_VEHICLE",
    name: "电动车安全",
  },
  {
    code: "SMALLENFINEERING",
    name: "小散工程",
  },
  {
    code: "INSPECTION",
    name: "日常巡检",
  },
  {
    code: "ELECTRONIC_PATROL",
    name: "电子巡更",
  },
  {
    code: "HIDDENDANGER",
    name: "隐患整改",
  },
  {
    code: "FAULT",
    name: "故障报修",
  },
];
export const levelMap = {
  ONE_LEVEL: "一级报警",
  TWO_LEVEL: "二级报警",
  THREE_LEVEL: "散级报警",
  FOUR_LEVEL: "四级报警",
};
export const typeMap = {
  ONE_LEVEL: "明火烟雾报警",
  TWO_LEVEL: "违章占道报警",
  THREE_LEVEL: "交通拥堵报警",
};
/**
 * @description 将模板中包含[]字段的参数转换为variables中的值
 * @param template 模板字符串
 * @param variables 变量对象，键为数字，值为数字或数组
 * @returns {string}
 */
export const makeDom = (template: string, variables: Record<number, number | TemplateType[]>, topicConcat: string): string => {
  const marketApp = window.location.pathname.includes("safety-manage-head") || window.location.pathname.includes("sn-cockpit");
  const formatVariableValue = (value: number | TemplateType[] | Record<string, unknown>): string => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          let part = ``;
          if (marketApp) {
            if (item.name !== undefined) {
              part += `${item.name}`;
            }
            if (item.marketName !== undefined) {
              part += `${item.marketName}`;
            }
            part += "（";
          } else {
            part += `${item.name}（`;
          }

          if (item.num !== undefined) {
            part += `${item.num}个`;
            if (!topicConcat.includes("INSPECTION")) {
              part += `,`;
            }
          }
          if (item.rate !== undefined) {
            part += `${item.rate}%`;
          }
          if (item.avgTime !== undefined) {
            part += `${item.avgTime}分`;
          }
          part += "）";
          return part;
        })
        .join("、");
    }

    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "object" && value !== null) {
      const record = value as Record<string, unknown>;
      if (typeof record.rate === "number" || typeof record.rate === "string") {
        return `${record.rate}%`;
      }
      if (typeof record.num === "number" || typeof record.num === "string") {
        return String(record.num);
      }
      if (typeof record.value === "number" || typeof record.value === "string") {
        return String(record.value);
      }
    }

    return String(value);
  };

  const replacedTemplate = template.replace(/\[(\w+)\]/g, (match, key) => {
    const value = variables[key];

    if (value !== undefined) {
      return formatVariableValue(value as number | TemplateType[] | Record<string, unknown>);
    }
    return match;
  });
  return replacedTemplate;

  // // 处理换行
  // return replacedTemplate.replace(/；/g, '<br/>');
};
