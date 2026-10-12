import _ from "lodash";
import { SessionEnum } from "../../models/session";
import {
  getSessionItemWithObject,
  setSessionItemWithObject
} from "../../utils/session";

export default {
  namespaced: true,
  state: {
    userInfo: getSessionItemWithObject(SessionEnum.userInfo) ?? null,
  },
  mutations: {
    SET_USER_INFO: (state, value) => {
      state.userInfo = _.cloneDeep(value);
      setSessionItemWithObject(SessionEnum.userInfo, value);
    },
  },
};
