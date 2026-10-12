import _ from "lodash";
import Formatters from "@/models/common/Formaters";
import Operators from "@/models/common/Operators";
import models from "../models";

// 解析列，处理formatter
function parseColumns(columns) {
  return columns.map((col) => {
    if (col.formatter) {
      const formatter = _.find(Formatters, (a) => a.key === col.formatter.type);
      if (formatter.render) {
        col.render = function (h, text, record) {
          return formatter.render(h, text, record, col.formatter.props);
        };
      } else if (formatter.formats) {
        col.formats = formatter.formats;
      }
    }
    return col;
  });
}

export function findColumns(modelName) {
  const columns = models[modelName]();
  return parseColumns(columns);
}

export function findFilters(modelName) {
  const columns = models[modelName]();
  const filters = [];
  const defaultControl = {
    type: "Input",
  };
  columns.forEach((col) => {
    if (col.supportFilter) {
      filters.push({
        field: col.filterField || col.dataIndex,
        title: col.title,
        operators: col.operators,
        control: col.filterControl || defaultControl,
      });
    }
  });
  return filters;
}

export function buildQuickQuery(modelName, keyword) {
  if (keyword) {
    const fields = findColumns(modelName).filter((a) => a.quickFilter);
    return {
      logic: "Or",
      children: _.compact(
        fields.map((item) => {
          const filter = {
            field: item.filterField || item.dataIndex,
            value: keyword,
            operator: Operators.Contains,
          };
          if (_.isFunction(item.quickFilter)) {
            return item.quickFilter(filter);
          }
          return filter;
        })
      ),
    };
  }
  return null;
}

// 获取表单验证规则配置
export function buildFormRules(modelName) {
  const fields = models[modelName]();
  const rules = {};
  fields.forEach((field) => {
    if (field.form) {
      rules[field.uid] = field.form.rules;
    }
  });
  return rules;
}

export function buildDefaults(modelName) {
  const fields = models[modelName]();
  const defaults = {};
  fields.forEach((field) => {
    if (field.form) {
      const defaultValue = _.isFunction(field.form.default)
        ? field.form.default()
        : field.form.default;
      defaults[field.uid] = defaultValue;
    }
  });
  return defaults;
}

/*
 * 解析排序字段 createTime,desc
 * 表格的dataIndex有时候并非真实的排序字段，需要根据配置找到真正的排序字段
 */
export function parseSort(modelName, sort) {
  function parseSortItem(sortItem) {
    const arr = sortItem.split(",");
    const dataIndex = arr[0];
    const order = arr[1];
    const fields = models[modelName]();
    const field = _.find(fields, (a) => a.dataIndex === dataIndex);
    if (field) {
      const sortFieldName = field.filterField || field.dataIndex;
      return sortFieldName + "," + order;
    }
    return null;
  }
  if (sort) {
    let normalizeSort = _.flatten([sort]);
    return _.compact(normalizeSort.map(parseSortItem));
  }
  return sort;
}

export function buildTableColumns(modelName, visibles) {
  let columns = findColumns(modelName);
  columns = _.sortBy(
    _.filter(columns, (a) => visibles.includes(a.uid)),
    (a) => visibles.indexOf(a.uid)
  );
  return {
    showIndex: "default", // 是否显示index
    fixedActionColumn: true, // 是否固定操作列
    actionColumnWidth: null, // 操作宽度
    minWidth: "default", // 表格最小宽度，可选值 px、max-content,default
    columns,
    wrap: true,
  };
}
