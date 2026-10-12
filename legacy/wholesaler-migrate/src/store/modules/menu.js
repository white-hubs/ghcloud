import _ from 'lodash';
import {
  hasPermission,
  loadCurrentProject,
  loadCurrentUser,
} from '@/services/AccountService';
import { GETTER_USER } from '@store/account';
import { flattenTree } from '@/utils/common';
import axios from '@/utils/axios';

const namespace = 'menu';
const r = (ac) => `${namespace}/${ac}`;
export const moduleName = namespace;
// actions
export const LODA_RESOURCES = r('LODA_RESOURCES');
// getters
export const GETTER_MENUS = r('GETTER_MENUS');
export const GETTER_RESOURCES = r('GETTER_RESOURCES');
export const GETTER_MENU_PATH = r('GETTER_MENU_PATH');
export const GETTER_TABS = r('GETTER_TABS');
export const GETTER_TAB = r('GETTER_TAB');
export const GETTER_SYSTEM = r('GETTER_SYSTEM');
export const GETTER_SYSTEM_MENUS = r('GETTER_SYSTEM_MENUS');
export const GETTER_FIRST_SYSTEM_MENU = r('GETTER_FIRST_SYSTEM_MENU');
// mutations
export const SET_STATE = r('SET_STATE');
export const ACTIVE = r('ACTIVE');

export const defaultTabs = [];
export const module = function () {
  return {
    state: {
      resources: [],
      current: null,
      tabs: [],
      tab: null,
      system: null,
    },
    getters: {
      // [GETTER_MENUS]: (state, getters) =>convertToMenus(getters[GETTER_USER], _.cloneDeep(state.resources)),
      [GETTER_MENUS]: (state) => _.cloneDeep(state.resources),
      [GETTER_RESOURCES]: (state) => _.cloneDeep(state.resources),
      [GETTER_MENU_PATH]: (state) =>
        state.current
          ? findMenuPath(_.cloneDeep(state.resources), state.current?.code)
          : [],
      [GETTER_TABS]: (state) => cloneDeepTabs(state.tabs),
      [GETTER_TAB]: (state) => state.tab,
      [GETTER_SYSTEM]: (state) => state.system,
      [GETTER_SYSTEM_MENUS]: (state) => {
        const menus = _.cloneDeep(state.resources) || [];
        const systemItem = menus.find((a) => a.code === state.system);
        if (systemItem) {
          return menus.filter((a) => isParent(systemItem, a, true));
        }
        return [];
      },
      [GETTER_FIRST_SYSTEM_MENU]: (state) => {
        const menus = _.cloneDeep(state.resources) || [];
        const systemItem = menus.find((a) => a.code === state.system);
        if (systemItem) {
          return menus.find((a) => isParent(systemItem, a, true) && a.url);
        }
        return null;
      },
    },
    mutations: {
      [SET_STATE](state, [key, value]) {
        state[key] = value;
      },
      [ACTIVE](state, url) {
        const current = _.find(state.resources, (a) => a.url === url);
        if (current) {
          state.current = current;
        }
      },
    },
    actions: {
      async [LODA_RESOURCES]({ commit }) {
        // const treeResources = await axios.restful(`/sys/resources/all-graph`);
        // debugger;
        // let project = await loadCurrentProject();
        let user = await loadCurrentUser();
        // const menus = project?.menus || [];
        const menus2 = user?.menus || [];
        commit(SET_STATE, ['resources', normalizeResources(menus2)]);
        // commit(SET_STATE, [
        //   'resources',
        //   normalizeResources(
        //     menus2.concat([
        //       {
        //         id: '1306410208145285121',
        //         pid: '',
        //         code: 'GRSZ',
        //         name: '个人设置',
        //         icon: 'bug',
        //         path: '',
        //         sort: 0,
        //         children: [
        //           {
        //             id: '1306410452513824769',
        //             pid: '1306410208145285121',
        //             code: 'Personal',
        //             name: '个人中心',
        //             icon: '',
        //             path: '/user-config/personal',
        //             sort: 0,
        //             children: [],
        //           },
        //         ],
        //       },
        //     ]),
        //   ),
        // ]);
      },
    },
  };
};
export default module();
function normalizeResources(treeResources) {
  const resources = flattenTree(treeResources);
  resources.forEach((item) => {
    const idPath = [];
    let temp = item;
    while (temp) {
      idPath.unshift(temp.id);
      temp = resources.find((a) => a.id === temp.pid);
    }
    item.idPath = idPath.join(',');
    item.pid = item.pid || null;
    item.url = item.path;
  });
  return resources;
}

export function isParent(parent, item, allLevel = false) {
  if (allLevel) {
    return (
      `,${item.idPath},`.startsWith(`,${parent.idPath},`) &&
      parent.id !== item.id
    );
  }
  return parent.id === item.pid;
}
function convertToMenus(user, resources) {
  resources = resources.filter((a) => a.enabled);
  const authorizedFunctionResources = resources.filter((item) => {
    return hasPermission(user, item.code);
  });
  const authorizedMenuResource = resources.filter((item) => {
    return (
      item.type === 'MENU' &&
      authorizedFunctionResources.some((a) => isParent(item, a, true))
    );
  });
  return authorizedMenuResource;
}

export function findMenuPath(resources, code) {
  const path = [];
  let menuItem = this.data.find((a) => a.code === code);
  while (menuItem) {
    path.unshift(menuItem);
    menuItem = this.data.find((a) => a.id === menuItem.pid);
  }
  return path;
}

function cloneDeepTabs(tabs) {
  return _.cloneDeepWith(tabs, (item) => {
    if (
      _.isObject(item) &&
      Reflect.has(item, 'tag') &&
      Reflect.has(item, 'componentInstance')
    ) {
      return item;
    }
  });
}
