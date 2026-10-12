import { getDictList } from '@/services/DictService';

const namespace = 'dict';
const r = (ac) => `${namespace}/${ac}`;
export const moduleName = namespace;
export const SET_STATE = r('SET_STATE');

export const GETTER_DICT = r('GETTER_DICT');
export const GETTER_DICT_MAP = r('GETTER_DICT_MAP');
export const GETTER_DICT_TREE_MAP = r('GETTER_DICT_TREE_MAP');

export const LOAD_DICT = r('LOAD_DICT');

function convertToMap(list) {
  // 全量map
  const map = {};
  list.forEach((item) => {
    map[item.code] = {
      ...item,
    };
  });
  return map;
}
// item.parentCode
// item.typeCode
// item.code
function convertToTreeMap(list = []) {
  // 按typeCode分的map-tree
  const listMap = {};
  const treeMap = {};
  list.forEach((item) => {
    if (!listMap[item.typeCode]) {
      listMap[item.typeCode] = [];
    }
    listMap[item.typeCode].push(item);
  });
  const keys = Object.keys(listMap);
  keys.forEach((typeCode) => {
    treeMap[typeCode] = convertToTree(listMap[typeCode]);
  });
  return treeMap;
}
function convertToTree(list) {
  const tree = [];
  const map = {};
  list.forEach((item) => {
    map[item.code] = {
      ...item,
    };
  });
  list.forEach((item) => {
    if (!item.parentCode) {
      tree.push(map[item.code]);
    } else {
      if (!map[item.parentCode].children) {
        map[item.parentCode].children = [];
      }
      map[item.parentCode].children.push(map[item.code]);
    }
  });
  return tree;
}

export const module = function () {
  return {
    state: {
      dict: [],
    },
    getters: {
      [GETTER_DICT]: (state) => state.dict,
      [GETTER_DICT_MAP]: (state) => convertToMap(state.dict),
      [GETTER_DICT_TREE_MAP]: (state) => convertToTreeMap(state.dict),
    },
    mutations: {
      [SET_STATE](state, [key, value]) {
        state[key] = value;
      },
    },
    actions: {
      async [LOAD_DICT]({ commit }) {
        const dictList = await getDictList();
        commit(SET_STATE, ['dict', dictList.sort((a, b) => a.sort - b.sort)]);
      },
    },
  };
};
export default module();
