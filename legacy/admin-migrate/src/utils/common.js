import _ from "lodash";
import models from "@/models/index";
export const joinUrl = (...args) => {
  return args
    .join("/")
    .replace(/\/+/g, "/")
    .replace(/(https?:)\/+/gi, "$1//");
};
export const mapRootUrl = (url) => {
  return joinUrl("/api", url);
};

export function treezen(
  data,
  parentProp = "parentId",
  prop = "id",
  rootId = null
) {
  data.forEach((item) => {
    item.children = data.filter((a) => a[parentProp] === item[prop]);
    if (_.isEmpty(item.children)) {
      item.children = null;
    }
  });
  return data.filter((a) => a[parentProp] === rootId);
}

export function treezenFiltered(
  filteredData,
  data,
  parentProp = "parentId",
  prop = "id",
  rootId = null
) {
  let mapData = {};
  data.forEach((item) => {
    mapData[item[prop]] = item;
    item.children = data.filter((a) => a[parentProp] === item[prop]);
    if (_.isEmpty(item.children)) {
      item.children = null;
    }
  });
  return data.filter(
    (a) => a[parentProp] === rootId || !mapData[a[parentProp]]
  );
}

// 与treezen相反
export function flattenTree(data, childrenProp = "children") {
  const flatData = [];
  data.forEach((item) => {
    flatData.push(item);
    if (item[childrenProp]) {
      flatData.push(...flattenTree(item[childrenProp], childrenProp));
    }
  });
  return flatData;
}

export const recurse = (data, handler, key) => {
  let sourceData = _.cloneDeep(data);
  if (_.isArray(sourceData)) {
    sourceData = _.map(sourceData, (item, i) => {
      return recurse(item, handler, i);
    });
  } else if (_.isPlainObject(sourceData)) {
    sourceData = _.transform(
      sourceData,
      (result, value, i) => {
        result[i] = recurse(value, handler, i);
      },
      {}
    );
  } else {
    sourceData = handler ? handler(sourceData, key) : sourceData;
  }
  return sourceData;
};
// tree中匹配的项
export function treematch(tree, value, key = "id", childrenProp = "children") {
  let matchValue;
  for (let i = 0; i < tree.length; i++) {
    if (tree[i][key] == value) {
      matchValue = tree[i];
      break;
    } else {
      if (tree[i][childrenProp] && tree[i][childrenProp].length) {
        matchValue = treematch(tree[i][childrenProp], value, key, childrenProp);
        if (matchValue) break;
      }
    }
  }
  return matchValue;
}
// json数据中根据指定项找到所有父级 tree=>json数据 value=>要匹配的值 key=>json数据中匹配属性名 params=>返回的属性名
export function getParentNode(
  tree,
  value,
  key = "id",
  params = "id",
  childrenProp = "children",
  path
) {
  if (path === undefined) {
    path = [];
  }
  for (let i = 0; i < tree.length; i++) {
    let temPath = path.concat();
    temPath.push(tree[i][params]);
    if (value == tree[i][key]) {
      return temPath;
    }
    if (tree[i][childrenProp]) {
      let findResult = getParentNode(
        tree[i][childrenProp],
        value,
        key,
        params,
        childrenProp,
        temPath
      );
      if (findResult) {
        return findResult;
      }
    }
  }
}
// 递归删除对象中children为空数组的字段
export function deleteNullChild(data) {
  for (let i = 0; i < data.length; i++) {
    if (!data[i].children) {
      return;
    }
    if (data[i].children.length == 0) {
      let { children, ...items } = data[i];
      data[i] = items;
    } else {
      deleteNullChild(data[i].children);
    }
  }
  return data;
}
/**
 *
 * @param {*} data number
 * @returns
 */
export function millennial(data, status = true) {
  let res;
  const decimal = Number(data).toFixed(2);
  const pointFront = decimal.split(".")[0];
  const pointBehind = decimal.split(".")[1];
  const pointFrontRes = Number(pointFront).toLocaleString();

  if (status) {
    res = pointFrontRes + "." + pointBehind;
  } else {
    res = pointFrontRes;
  }
  return res;
}

export function timeFormat(time, status) {
  const date = new Date(time);
  let res = "";
  // 年
  const year = date.getFullYear();
  // 月
  const month =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
  // 日
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
  // 时
  const hour = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
  // 分
  const minutes =
    date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
  // 秒
  const second =
    date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;
  if (status) {
    res = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
  } else {
    res = `${year}-${month}-${day}`;
  }
  return res;
}

export function tableColumns(modelName, data, width) {
  const model = models[modelName](width);
  const res = [];
  for (let i of data) {
    for (let j of model) {
      if (j.mark === i) {
        res.push(j);
      }
    }
  }
  return res;
}
