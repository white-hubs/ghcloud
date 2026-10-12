import _ from "lodash";
import { SessionEnum } from "../../models/session";
import {
  getSessionItemWithObject,
  setSessionItemWithObject
} from "../../utils/session";

export default {
  namespaced: true,
  state: {
    nowEnterprise: getSessionItemWithObject(SessionEnum.nowEnterprise) ?? null,
  },
  mutations: {
    SET_NOW_ENTERPRISE: (state, value) => {
      return;
      // state.nowEnterprise = _.cloneDeep(value);
      // setSessionItemWithObject(SessionEnum.nowEnterprise, value);
    },
  },
};
