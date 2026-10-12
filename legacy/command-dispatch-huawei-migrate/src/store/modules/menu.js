import _ from "lodash";

import { SessionEnum } from "../../models/session";
import { getSessionItemWithObject, setSessionItemWithObject } from "../../utils/session";

export default {
  namespaced: true,
  state: {
    currentApplication: getSessionItemWithObject(SessionEnum.currentApplication) ?? null,
    currentMenus: getSessionItemWithObject(SessionEnum.currentMenus) ?? [],
    tabsPane: [],
    applications: [],
  },
  mutations: {
    SET_APPLICATION: (state, value) => {
      state.currentApplication = _.cloneDeep(value);
      setSessionItemWithObject(SessionEnum.currentApplication, value);
    },
    SET_MENU: (state, value) => {
      state.currentMenus = _.cloneDeep(value);
      setSessionItemWithObject(SessionEnum.currentMenus, value);
    },
    SET_TABS_PANE: (state, value) => {
      state.tabsPane = _.cloneDeep(value);
    },
    SET_APPLICATIONS: (state, value) => {
      state.applications = _.cloneDeep(value);
    },
  },
};
