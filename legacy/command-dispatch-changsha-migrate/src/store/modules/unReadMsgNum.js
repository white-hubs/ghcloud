import _ from "lodash";

import { SessionEnum } from "../../models/session";
import { getSessionItemWithNumber, setSessionItemWithNumber } from "../../utils/session";

export default {
  namespaced: true,
  state: {
    unReadNum: getSessionItemWithNumber(SessionEnum.unReadNum) ?? null,
    unReadAlarmNum: getSessionItemWithNumber(SessionEnum.unReadAlarmNum) ?? null,
  },
  mutations: {
    SET_UNREAD_NUM: (state, value) => {
      state.unReadNum = _.cloneDeep(value);
      setSessionItemWithNumber(SessionEnum.unReadNum, value);
    },
    SET_UNREAD_ALARMNUM: (state, value) => {
      state.unReadAlarmNum = _.cloneDeep(value);
      setSessionItemWithNumber(SessionEnum.unReadAlarmNum, value);
    },
  },
};
