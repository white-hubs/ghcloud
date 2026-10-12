import _ from "lodash";


import appList from "./traffic/appList";
import menuList from "./traffic/menuList";
import productLineList from "./traffic/productLineList";
import productList from "./traffic/productList";
import rentDetails from "./traffic/rentDetails";
import tenants from "./traffic/tenants";
import terminalList from "./traffic/terminalList";
import userList from "./traffic/userList";

let models = {
  appList,
  menuList,
  userList,
  terminalList,
  tenants,
  rentDetails,
  productList,
  productLineList
};
export default models;
