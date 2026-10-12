import { createStore } from "vuex";
import getters from "./getters";
import commandDispatch from './modules/commandDispatch'
import dataSubscription from './modules/dataSubscription'
import enterprise from './modules/enterprise'
import menu from './modules/menu'
import unReadMsgNum from './modules/unReadMsgNum'
import userInfo from './modules/userInfo'

const modules = {
  commandDispatch,
  dataSubscription,
  enterprise,
  menu,
  unReadMsgNum,
  userInfo,
}
// 调用createStore
export default createStore({
  getters,
  modules,
});
