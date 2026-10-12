import AccountManagement from "@/views/AccountManagement/index.vue";
import AccountManagementDetiles from "@/views/AccountManagement/detiles/index.vue";
import MoneyChange from "@/views/MoneyChange/index.vue";
import PartChange from "@/views/PartChange/index.vue";
import PersonRecord from "@/views/person-record/index.vue";
/** 固定的路由 */
export const constantRoutes: AuthRoute.Route[] = [
  {
    path: "/accountmanagement",
    name: "accountmanagement",
    component: AccountManagement,
  },
  {
    path: "/accountmanagement/detiles",
    name: "accountmanagementdetiles",
    component: AccountManagementDetiles,
  },
  {
    path: "/moneychange",
    name: "moneychange",
    component: MoneyChange,
  },
  {
    path: "/partchange",
    name: "partchange",
    component: PartChange,
  },
  {
    path: "/person-record",
    name: "personRecord",
    component: PersonRecord,
  },
];
