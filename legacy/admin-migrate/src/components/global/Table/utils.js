import _ from "lodash";
import { findColumns } from "@/services/ModelService";

export const parseTableColumns = (h, columns, deviceSize) => {
  const displayColumns = _.sortBy(
    _.filter(columns, (col) => {
      if (_.isArray(col.sizes)) {
        return col.sizes.includes(deviceSize);
      }
      return true;
    }),
    "orderNumber"
  );
  return displayColumns.map((item) => {
    if (item.formats) {
      item.render = _.find(item.formats, (a) => a.default).render;
    }
    if (item.render) {
      item.customRender = item.render.bind(null, h);
    }
    item.title = item.displayTitle || item.title;
    item.align = item.align || "left";
    return item;
  });
};

export const exportCsv = (data) => {
  function encode(text) {
    if (text) {
      return '"' + (text.replace('"', '""') + '"');
    }
    return "";
  }
  const text = data
    .map((item) => {
      return item.map(encode).join(",");
    })
    .join("\n");
  var uri = "data:text/csv;charset=utf-8,\uFEFF" + encodeURI(text);
  var downloadLink = document.createElement("a");
  downloadLink.href = uri;
  downloadLink.download = "export.csv";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export const flattenTreeData = (treeData, key = "children") => {
  const flattenData = [];
  function recurse(item) {
    flattenData.push(item);
    if (item[key]) {
      item[key].forEach((child) => {
        recurse(child);
      });
    }
  }
  treeData.forEach(recurse);
  return flattenData;
};

// 如果列数据来自于配置数据，则render、formats需要重新设置
export function attachColumns(tableConfig, modelName) {
  const rawColumns = findColumns(modelName);
  tableConfig.columns = tableConfig.columns.map((col) => {
    const rawCol = rawColumns.find((a) => a.uid == col.uid);
    col.render = rawCol.render;
    if (rawCol.formats) {
      col.formats = rawCol.formats.map((format) => {
        if (col.formats) {
          format.default = _.get(
            col.formats.find((a) => a.key === format.key),
            "default"
          );
        }
        return format;
      });
    }
    if (col.nowrap) {
      col.width = "auto";
    }
    return col;
  });
}
