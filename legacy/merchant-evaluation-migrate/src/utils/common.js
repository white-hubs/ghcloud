import _ from 'lodash';
export const joinUrl = (...args) => {
  return args
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/(https?:)\/+/gi, '$1//');
};
export const mapRootUrl = (url) => {
  return joinUrl(window.config.serviceUrl, url);
};

export function treezen(
  data,
  parentProp = 'parentId',
  prop = 'id',
  rootId = null,
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
  parentProp = 'parentId',
  prop = 'id',
  rootId = null,
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
    (a) => a[parentProp] === rootId || !mapData[a[parentProp]],
  );
}

// 与treezen相反
export function flattenTree(data = [], childrenProp = 'children', pid = null) {
  const flatData = [];
  data.forEach((item) => {
    item.pid = item.pid || pid || null;
    flatData.push(item);
    if (item[childrenProp]) {
      flatData.push(...flattenTree(item[childrenProp], childrenProp, item.id));
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
