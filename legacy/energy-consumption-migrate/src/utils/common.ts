import _ from "lodash";
// 保留两位小数，不四舍五入
export const fixedNum = (value: number, decimal: number = 2): number | string => {
  // if (!Number.isInteger(value)) {
  if (value === null || typeof value === 'undefined') return ''
  let num = value.toString()
  const index = num.indexOf('.')
  if (index !== -1) {
    num = num.substring(0, decimal + index + 1)
  } else {
    num = num.substring(0)
  }
  return parseFloat(num).toFixed(decimal) === 'NaN' ? '0' : parseFloat(num).toFixed(decimal)
  // }
  // return value
}
// 输入数字或两位小数
export const inputNumber = (value: number): number => {
  let val = value.toString()
  val = val.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')
  return Number(val)
}

export function exportFile(path,name){
  fetch(`${path}`,{
    method:'get',
    // headers:{
    //   Authorization:"Bearer " + JSON.parse(sessionStorage.getItem("GH-Token")).access_token,
    //   tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
    //   terminal: window.config.terminal,
    // },
    headers: {
      'tenantFlag': 'interior',
    },
  }).then(response=>{
    response.blob().then(blob => {
        // 关闭loading 按钮恢复正常
        const blobUrl = window.URL.createObjectURL(blob);
        const filename = name;
        const aElement = document.createElement('a');
        document.body.appendChild(aElement);
        aElement.style.display = 'none';
        aElement.href = blobUrl;
        aElement.download = filename;
        aElement.click();
        document.body.removeChild(aElement);
      });
})
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
export function timeFormat(time, status) {
  if (!time) {
    return null;
  }
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
export const treeAddLevel = (array, levelName = 'level', childrenName = 'children') => {
  if (!Array.isArray(array)) return []
  const recursive = (array, level = 0) => {
      level++
      return array.map(v => {
          v[levelName] = level
          const child = v[childrenName]
          if (child && child.length) recursive(child, level)
          return v
      })
  }
  return recursive(array)
}