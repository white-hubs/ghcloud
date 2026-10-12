import _ from "lodash";

import models from "../models/index";
export const joinUrl = (...args) => {
  return args
    .join("/")
    .replace(/\/+/g, "/")
    .replace(/(https?:)\/+/gi, "$1//");
};
export const mapRootUrl = (url) => {
  return joinUrl("/api", url);
};

export function treezen(data, parentProp = "parentId", prop = "id", rootId = null) {
  data.forEach((item) => {
    item.children = data.filter((a) => a[parentProp] === item[prop]);
    if (_.isEmpty(item.children)) {
      item.children = null;
    }
  });
  return data.filter((a) => a[parentProp] === rootId);
}

export function treezenFiltered(filteredData, data, parentProp = "parentId", prop = "id", rootId = null) {
  let mapData = {};
  data.forEach((item) => {
    mapData[item[prop]] = item;
    item.children = data.filter((a) => a[parentProp] === item[prop]);
    if (_.isEmpty(item.children)) {
      item.children = null;
    }
  });
  return data.filter((a) => a[parentProp] === rootId || !mapData[a[parentProp]]);
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
      {},
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
export function getParentNode(tree, value, key = "id", params = "id", childrenProp = "children", path) {
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
      let findResult = getParentNode(tree[i][childrenProp], value, key, params, childrenProp, temPath);
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

// 递归删除对象中children为空数组的字段
export function deleteNullChi(data, name = "children") {
  for (let i = 0; i < data.length; i++) {
    if (!data[i][name]) {
      return;
    }
    if (data[i][name].length == 0) {
      let { children, ...items } = data[i];
      data[i] = items;
    } else {
      deleteNullChild(data[i][name]);
    }
  }
  return data;
}
/**
 *
 * @param {*} data 查询数据
 * @param {*} childKeyword 子选项关键字
 * @param {*} keyword 获取数据的关键字
 * @returns
 */
export function getParentKey(data, result = [], childKeyword = "children", keyword = "id") {
  for (let i of data) {
    if (i[childKeyword]?.length) {
      result.push(i[keyword]);
      getParentKey(i[childKeyword], result);
    }
  }
  return result;
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
  if (!time) {
    return null;
  }
  const date = new Date(time);
  let res = "";
  // 年
  const year = date.getFullYear();
  // 月
  const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
  // 日
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
  // 时
  const hour = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
  // 分
  const minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
  // 秒
  const second = date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;
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
  // const res = model.filter(item => {
  //   return data.includes(item.mark)
  // })
  return res;
}

export function dateAdd(interval, number, date) {
  switch (interval) {
    case "y": {
      date.setFullYear(date.getFullYear() + number);
      return date;
    }
    case "m": {
      date.setMonth(date.getMonth() + number);
      return date;
    }
    case "d": {
      date.setDate(date.getDate() + number * 30);
      return date;
    }
  }
}

export function dateReduce(interval, number, date) {
  switch (interval) {
    case "y": {
      date.setFullYear(date.getFullYear() - number);
      return date;
    }
    case "m": {
      date.setMonth(date.getMonth() - number);
      return date;
    }
    case "w": {
      date.setDate(date.getDate() - number);
      return date;
    }
    case "d": {
      date.setDate(date.getDate() - number * 30);
      return date;
    }
  }
}

export function validArray(value) {
  let res;
  value.forEach((item) => {
    if (item instanceof Array) {
      validArray(item);
    } else {
      res = item ? true : false;
    }
  });
  return res;
}

export function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
// 生成guid
export function guid() {
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

//获取URL参数
export function getParams(path) {
  let url = path;
  let arrObj = url.split("?");
  let params = Object.create(null);
  if (arrObj.length > 1) {
    arrObj = arrObj[1].split("&");
    arrObj.forEach((item) => {
      item = item.split("=");
      params[item[0]] = item[1];
    });
  }
  return params;
}

/** 导出
 * @param {string} path
 * @param {string} name
 *** */
export function exportFile(path, name) {
  fetch(`${path}`, {
    method: "get",
    headers: {
      Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("GH-Token")).access_token,
      tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
      terminal: window.config.terminal,
    },
  }).then((response) => {
    response.blob().then((blob) => {
      // 关闭loading 按钮恢复正常
      const blobUrl = window.URL.createObjectURL(blob);
      const filename = name;
      const aElement = document.createElement("a");
      document.body.appendChild(aElement);
      aElement.style.display = "none";
      aElement.href = blobUrl;
      aElement.download = filename;
      aElement.click();
      document.body.removeChild(aElement);
    });
  });
}
// 将树转为一维数组
export const treeLevelArray = function (tree, result = []) {
  for (let i = 0; i < tree.length; i++) {
    result.push(tree[i]);
    if (tree[i].children && tree[i].children.length) {
      treeLevelArray(tree[i].children, result);
      Reflect.deleteProperty(tree[i], "children");
    }
  }
  return result;
};
// 获取json树每项的最后一级
export const geTreeLastItem = function (tree, result = []) {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].children && tree[i].children.length) {
      geTreeLastItem(tree[i].children, result);
    } else {
      result.push(tree[i]);
    }
  }
  return result;
};

/**
 * 查询当前数据的兄弟数据
 * @param {array} data 基础数据
 * @param {string} value 查询数据
 * @param {string} key 查询标准
 * @param {string} child 多层关键字
 * @returns
 */
export function checkBroData(data, value, key = "parentId") {
  let res;
  if (data.length) {
    // 先将数据拍平
    const flattenData = flattenTree(data);
    // 查找相同父级
    res = flattenData.filter((item) => item[key] === value);
  }
  return res;
}

// 生成随机颜色
export function colorRgb() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}
