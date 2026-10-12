import { message } from "ant-design-vue";
import { defineStore } from "pinia";
import { nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { CubeOuaaService, type ApplicationPageVO, type Menu } from "@ghcloud/cube-ouaa-service";
//@ts-ignore
import _ from "lodash";
//@ts-ignore
import * as api from "../api";
//@ts-ignore
import router from "../routes/index.js";
//@ts-ignore
import { permissionConfig } from "../config.js";
//@ts-ignore
import { addGlobalUncaughtErrorHandler, registerMicroApps, type LoadableApp, type ObjectType } from "qiankun";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { CubeMessageEvent, type CubeAuth } from "@ghcloud/cube-protocol";
import type { CubeEventSubscribe } from "@ghcloud/event-bus";

import { subscriber, MFRootEventNameEnum } from "../event";
import { flattenTree } from "../utils/common.js";
import {
  extractMicroAppErrorMessage,
  isMicroAppLoadError,
  logMicroAppLoad,
  MICRO_APP_ERROR_GRACE_MS,
  MICRO_APP_LOAD_TIMEOUT_MS,
} from "../utils/micro-app-load.js";
import {
  createBrowserMicroAppNavigationRuntime,
  createMicroAppNavigationCoordinator,
  createMicroAppNavigationPlan,
  resolveMicroAppTargetPath,
} from "../utils/micro-app-navigation.js";
import { prefetchApplication, prefetchAuthorizedMicroApps, prefetchMicroAppByPath } from "../utils/micro-app-prefetch.js";
import { inDesktopClient } from "./use-environment";
import { personManageMenus } from "@/routes/person-manage-menus.js";

type AppLoadStatus = "IDLE" | "SUCCESS" | "ERROR" | "LOADING";

let microAppErrorHandlerRegistered = false;

interface ApplicationGroupItem {
  id: string;
  name: string;
  remark: string;
  applicationPageVOS: ApplicationPageVO[];
}

/** 前端自定义接口 */
interface CustomApplicationMenuGroup {
  groupId: string;
  applications: {
    id: string;
    name: string;
    icon: string;
    menus: Menu[];
    applicationGroupId: string;
  }[];
}

interface ChildApplicationNavigationOptions {
  recordMenuVisit?: boolean;
}

/** 当前子应用信息 */
export const useChildApplication = defineStore("childApplication", () => {
  const applicationGroup = ref<ApplicationGroupItem[]>([]);
  const applicationMenuGroup = ref<CustomApplicationMenuGroup[]>([]);
  const currentApplicationMenuGroup = ref<CustomApplicationMenuGroup>();
  const currentApplication = ref<ApplicationPageVO | undefined>(
    sessionStorage.getItem("GH-currentApplication") ? JSON.parse(sessionStorage.getItem("GH-currentApplication")!) : undefined,
  );
  const currentMenus = ref<Menu[]>(sessionStorage.getItem("GH-currentMenus") ? JSON.parse(sessionStorage.getItem("GH-currentMenus")!) : []);
  const tabsPane = ref([]);

  const appLoadStatus = ref<AppLoadStatus>("IDLE");
  const loadGeneration = ref(0);
  let errorGraceTimer: ReturnType<typeof setTimeout> | null = null;
  let loadTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  const route = useRoute();
  const navigationCoordinator = createMicroAppNavigationCoordinator(
    createBrowserMicroAppNavigationRuntime({
      async navigateToTransitionPage(path) {
        await router.push(path);
        await nextTick();
      },
    }),
  );

  watch(
    () => currentApplication.value,
    () => {
      sessionStorage.setItem("GH-currentApplication", JSON.stringify(currentApplication.value ?? ""));
    },
  );
  watch(
    () => currentMenus.value,
    () => {
      sessionStorage.setItem("GH-currentMenus", JSON.stringify(currentMenus.value));
    },
  );

  function getFirstItemInMenu(data: Menu[]): Menu | null {
    if (data.length) {
      if (data[0].children && data[0].children.length > 0) {
        return getFirstItemInMenu(data[0].children);
      } else {
        return data[0];
      }
    }
    return null;
  }

  function normalizeMenuVisitPath(path: string): string {
    const normalizedPath = path.trim().split("#")[0].split("?")[0].replace(/\/+$/, "");
    return normalizedPath || "/";
  }

  function findLeafMenuByPath(menus: Menu[], path: string): Menu | undefined {
    const normalizedPath = normalizeMenuVisitPath(path);
    for (const menu of menus) {
      if (menu.children?.length) {
        const childMenu = findLeafMenuByPath(menu.children, normalizedPath);
        if (childMenu) {
          return childMenu;
        }
        continue;
      }
      if (menu.path && normalizeMenuVisitPath(menu.path) === normalizedPath) {
        return menu;
      }
    }
    return undefined;
  }

  function recordMenuVisit(menu?: Pick<Menu, "id" | "children">): void {
    if (!menu?.id || menu.children?.length) {
      return;
    }
    const logVisitError = (error: unknown) => {
      logMicroAppLoad("menuVisitHistoryError", {
        menuId: menu.id,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    };
    try {
      const cubeOuaaService = new CubeOuaaService(CubeMfRootGlobalState.getInstance().mfRootState.authInfo as CubeAuth);
      void cubeOuaaService.saveMenuVisitHistory(menu.id).catch(logVisitError);
    } catch (error) {
      logVisitError(error);
    }
  }

  function recordMenuVisitByPath(menus: Menu[], path: string, shouldRecord: boolean): void {
    if (shouldRecord) {
      recordMenuVisit(findLeafMenuByPath(menus, path));
    }
  }

  function setDefaultPage() {
    if (route.path === "/about") {
      if (navigationCoordinator.shouldSuppressDefaultNavigation()) {
        return;
      }
      const firstMenu = getFirstItemInMenu(currentMenus.value);
      if (firstMenu?.path) {
        history.pushState(history.state, "", firstMenu.path);
      }
    }
  }

  function getPersonManagePath(path = "/about") {
    return path === "/about" ? (personManageMenus.menu[0]?.path ?? path) : path;
  }

  function changeAppLoadStatus(status: AppLoadStatus) {
    appLoadStatus.value = status;
  }

  function clearMicroAppLoadTimers() {
    if (errorGraceTimer) {
      clearTimeout(errorGraceTimer);
      errorGraceTimer = null;
    }
    if (loadTimeoutTimer) {
      clearTimeout(loadTimeoutTimer);
      loadTimeoutTimer = null;
    }
  }

  function beginMicroAppLoad(appName: string) {
    loadGeneration.value += 1;
    const generation = loadGeneration.value;
    clearMicroAppLoadTimers();
    changeAppLoadStatus("LOADING");
    logMicroAppLoad("beforeLoad", { appName, generation });
    loadTimeoutTimer = setTimeout(() => {
      if (loadGeneration.value !== generation || appLoadStatus.value !== "LOADING") {
        return;
      }
      logMicroAppLoad("loadTimeout", { appName, generation });
      scheduleMicroAppLoadError(generation, "Micro app load timeout");
    }, MICRO_APP_LOAD_TIMEOUT_MS);
    return generation;
  }

  function completeMicroAppLoad(appName: string) {
    clearMicroAppLoadTimers();
    changeAppLoadStatus("SUCCESS");
    logMicroAppLoad("afterMount", { appName, generation: loadGeneration.value });
  }

  function scheduleMicroAppLoadError(generation: number, errorMessage: string) {
    if (errorGraceTimer) {
      clearTimeout(errorGraceTimer);
    }
    errorGraceTimer = setTimeout(() => {
      if (loadGeneration.value !== generation || appLoadStatus.value !== "LOADING") {
        return;
      }
      logMicroAppLoad("loadError", { generation, errorMessage });
      changeAppLoadStatus("ERROR");
    }, MICRO_APP_ERROR_GRACE_MS);
  }

  function registerChildApp() {
    // 之前的权限处理
    function handlePermissionConfig(app: LoadableApp<ObjectType>) {
      const applicationCode = sessionStorage.getItem("GH-currentApplication")
        ? JSON.parse(sessionStorage.getItem("GH-currentApplication")!).code
        : null;
      if (applicationCode) {
        const menus: Menu[] = sessionStorage.getItem("GH-currentMenus") ? JSON.parse(sessionStorage.getItem("GH-currentMenus")!) : [];
        const handleMenus = flattenTree(menus);
        const menuFunctions = handleMenus.map((item: { functions: any }) => {
          return item.functions ?? [];
        });
        // 过滤出父级菜单无页面操作  处理路径
        permissionConfig.menuConfig = handleMenus.filter((item: { children: string | any[] }) => {
          return !item.children.length;
        });
        permissionConfig.functionCodes = _.flattenDeep(menuFunctions).map((item) => (item as { functionCode: string }).functionCode);
        app.props!.routes = expandMenu(menus);
      }
      app.props!.permissionConfig = permissionConfig;
      app.props!.auth = { ...CubeMfRootGlobalState.getInstance().mfRootState.authInfo };
    }
    // 展开菜单方便子应用识别
    function expandMenu(menuList: Menu[]) {
      const res: Menu[] = [];
      for (let index = 0; index < menuList.length; index++) {
        const element = menuList[index];
        if (element.children && element.children.length) {
          res.push(...expandMenu(element.children));
        }
        try {
          //@ts-ignore
          delete element.children;
        } catch (error) {}
        res.push(element);
      }
      return res;
    }
    const microApps = window.config.microApps.map((item: { name: string; entry: string }) => {
      const base = `/portal/${item.name}/`;
      return {
        name: item.name,
        entry: item.entry,
        container: "#appContainer",
        activeRule: base,
        props: {
          router,
          base,
          permissionConfig,
        },
      };
    });

    // 注册子应用
    registerMicroApps(microApps, {
      beforeLoad: async (app) => {
        beginMicroAppLoad(app.name);
        handlePermissionConfig(app);
        const applicationCode = sessionStorage.getItem("GH-currentApplication")
          ? JSON.parse(sessionStorage.getItem("GH-currentApplication")!).code
          : "";
        if (applicationCode) {
          const cubeOuaaService = new CubeOuaaService(CubeMfRootGlobalState.getInstance().mfRootState.authInfo as CubeAuth);
          void cubeOuaaService.createApplicationAccess(applicationCode).catch((error: unknown) => {
            logMicroAppLoad("loadError", {
              appName: app.name,
              phase: "createApplicationAccess",
              errorMessage: error instanceof Error ? error.message : String(error),
            });
          });
        }
      },
      beforeMount: [
        async (app) => {
          changeAppLoadStatus("LOADING");
          handlePermissionConfig(app);
          logMicroAppLoad("beforeMount", { appName: app.name, generation: loadGeneration.value });
        },
      ],
      afterMount: async (app) => {
        completeMicroAppLoad(app.name);
      },
    });

    if (!microAppErrorHandlerRegistered) {
      microAppErrorHandlerRegistered = true;
      addGlobalUncaughtErrorHandler((event) => {
        if (!isMicroAppLoadError(event)) {
          return;
        }
        if (appLoadStatus.value !== "LOADING") {
          return;
        }
        scheduleMicroAppLoadError(loadGeneration.value, extractMicroAppErrorMessage(event));
      });
    }
  }

  // 获取当前用户持有的应用
  async function getUserApplications() {
    applicationGroup.value = await api.getUserApplicationsGroups();
    prefetchAuthorizedMicroApps(applicationGroup.value);
  }

  /** 获取第一个已分配菜单、可实际进入的应用。 */
  async function findFirstAvailableApplication(): Promise<ApplicationPageVO | undefined> {
    if (!applicationGroup.value.length) {
      await getUserApplications();
    }
    for (const group of applicationGroup.value) {
      for (const application of group.applicationPageVOS) {
        if (application.code === "PERSON-MANAGE") {
          if (application.menuVOS?.length) {
            return application;
          }
          continue;
        }
        await getApplicationMenuByGroup(application, false);
        const menuGroup = applicationMenuGroup.value.find((item) => item.groupId === application.applicationGroupId);
        const menus = menuGroup?.applications.find((item) => item.id === application.id)?.menus ?? [];
        if (menus.length) {
          return application;
        }
      }
    }
    return undefined;
  }

  // 获取某个应用分组下的所有菜单
  async function getApplicationMenuByGroup(ele: ApplicationPageVO | null, setCurrentApplicationMenuGroup: boolean = true) {
    if (!ele) {
      return;
    }
    if (ele.code === "PERSON-MANAGE") {
      currentApplicationMenuGroup.value = {
        groupId: "personal-group",
        applications: [
          {
            id: ele.id,
            name: ele.name,
            icon: ele.icon,
            menus: ele.menuVOS,
            applicationGroupId: "personal-group",
          },
        ],
      };
      return;
    }
    const findData = applicationMenuGroup.value.find((e) => e.groupId === ele.applicationGroupId);
    if (!findData) {
      try {
        const groupMenus = await new CubeOuaaService(
          CubeMfRootGlobalState.getInstance().mfRootState.authInfo as CubeAuth,
        ).getApplicationMenusByGroupId(ele.applicationGroupId);
        applicationMenuGroup.value.push({
          groupId: ele.applicationGroupId,
          applications: groupMenus.map((e) => {
            return {
              id: e.id,
              name: e.name,
              icon: e.icon,
              applicationGroupId: e.applicationGroupId,
              menus: e.menuVOS,
            };
          }),
        });
      } catch (e) {
        message.destroy();
        message.error("获取菜单失败");
      }
    }
    if (setCurrentApplicationMenuGroup) {
      currentApplicationMenuGroup.value = applicationMenuGroup.value.find((e) => e.groupId === ele.applicationGroupId);
    }
    message.destroy();
  }

  /** 到某一个子应用 */
  async function toChildApplication(ele: ApplicationPageVO, path = "/about", options: ChildApplicationNavigationOptions = {}) {
    const { recordMenuVisit: shouldRecordMenuVisit = true } = options;
    const navigationGeneration = navigationCoordinator.startNavigation();
    const targetPath =
      ele.code === "PERSON-MANAGE"
        ? getPersonManagePath(path)
        : resolveMicroAppTargetPath(path, ele.code === currentApplication.value?.code ? currentMenus.value : []);
    if (ele.code === currentApplication.value?.code && targetPath) {
      const navigationPlan = createMicroAppNavigationPlan(window.location.pathname, targetPath, currentMenus.value);
      if (navigationPlan.deferredPath) {
        changeAppLoadStatus("LOADING");
      }
      await navigationCoordinator.navigate(navigationPlan, navigationGeneration);
      if (navigationCoordinator.isCurrent(navigationGeneration)) {
        recordMenuVisitByPath(currentMenus.value, navigationPlan.deferredPath ?? navigationPlan.path, shouldRecordMenuVisit);
      }
      return;
    }
    changeAppLoadStatus("LOADING");
    prefetchApplication(ele);
    prefetchMicroAppByPath(targetPath);
    // 个人中心特性逻辑
    if (ele.code === "PERSON-MANAGE") {
      await getApplicationMenuByGroup(ele);
      if (!navigationCoordinator.isCurrent(navigationGeneration)) {
        return;
      }
      currentMenus.value = ele.menuVOS;
      currentApplication.value = ele;
      await navigationCoordinator.navigate({ path: targetPath }, navigationGeneration);
      if (navigationCoordinator.isCurrent(navigationGeneration)) {
        recordMenuVisitByPath(ele.menuVOS, targetPath, shouldRecordMenuVisit);
      }
      return;
    }

    const nowApplication = currentApplication.value;
    // 获取菜单
    if (ele.applicationGroupId !== nowApplication?.applicationGroupId) {
      await getApplicationMenuByGroup(ele, false);
      if (!navigationCoordinator.isCurrent(navigationGeneration)) {
        return;
      }
    }
    const findData = applicationMenuGroup.value.find((e) => e.groupId === ele.applicationGroupId);
    let menuData = [];
    if (findData) {
      menuData = findData.applications.find((e) => e.id === ele.id)?.menus ?? [];
    } else {
      //TODO(张正) 这边的逻辑应该是用不到了
      menuData = await api.getApplicationInMenus({ applicationCode: ele.code }, "get");
      if (!navigationCoordinator.isCurrent(navigationGeneration)) {
        return;
      }
    }
    message.destroy();
    if (!menuData.length) {
      message.error("该应用下未分配菜单");
      return;
    }
    const navigationPlan = createMicroAppNavigationPlan(window.location.pathname, path, menuData, {
      targetContainerExists: Boolean(document.querySelector("#appContainer")),
    });
    try {
      await navigationCoordinator.navigate(navigationPlan, navigationGeneration);
      if (!navigationCoordinator.isCurrent(navigationGeneration)) {
        return;
      }
      currentApplicationMenuGroup.value = findData;
      currentMenus.value = menuData;
      currentApplication.value = ele;
      recordMenuVisitByPath(menuData, navigationPlan.deferredPath ?? navigationPlan.path, shouldRecordMenuVisit);
    } catch (error) {
      if (!navigationCoordinator.isCurrent(navigationGeneration)) {
        return;
      }
      currentApplicationMenuGroup.value = findData;
      currentMenus.value = menuData;
      currentApplication.value = ele;
      const fallbackPath = navigationPlan.deferredPath ?? navigationPlan.path;
      if (typeof fallbackPath === "string" && fallbackPath.startsWith("/")) {
        recordMenuVisitByPath(menuData, fallbackPath, shouldRecordMenuVisit);
        window.location.assign(fallbackPath);
      }
    }
  }

  /** 根据applicationGroup 查询出所有的应用菜单 */
  async function queryAllApplicationMenuGroup() {
    const queryTasks: Promise<void>[] = [];
    applicationGroup.value.forEach((ele) => {
      if (ele.applicationPageVOS.length) {
        queryTasks.push(getApplicationMenuByGroup(ele.applicationPageVOS[0], false));
      }
    });
    await Promise.all(queryTasks);
  }

  function normalizeMenuPath(pathname: string): string {
    const path = pathname.split("?")[0].replace(/\/+$/, "");
    return path || "/";
  }

  function getMenuPathMatchScore(menuPath: string, pathname: string): number {
    const normalizedMenuPath = normalizeMenuPath(menuPath);
    const normalizedPath = normalizeMenuPath(pathname);
    if (!normalizedMenuPath || normalizedMenuPath === "/") {
      return normalizedMenuPath === normalizedPath ? 1 : 0;
    }
    if (normalizedMenuPath === normalizedPath) {
      return normalizedMenuPath.length + 10000;
    }
    // 允许详情页/子路由归属到父菜单，但必须命中路径段边界，避免 /a 误匹配 /ab。
    return normalizedPath.startsWith(`${normalizedMenuPath}/`) ? normalizedMenuPath.length : 0;
  }

  function getBestMenuPathMatchScore(menus: Menu[], pathname: string): number {
    return menus.reduce((bestScore, menu) => {
      const menuScore = menu.path ? getMenuPathMatchScore(menu.path, pathname) : 0;
      const childScore = menu.children?.length ? getBestMenuPathMatchScore(menu.children, pathname) : 0;
      return Math.max(bestScore, menuScore, childScore);
    }, 0);
  }

  // 应用可能复用相同路由，先递归确认当前应用菜单是否已包含地址，避免仅按 URL 把应用误切到首个匹配项。
  function hasMenuPath(menus: Menu[], pathname: string): boolean {
    return getBestMenuPathMatchScore(menus, pathname) > 0;
  }

  /** 通过当前path 匹配 applicationMenuGroup 中的应用和菜单 */
  function matchApplicationMenuGroupByPath(currentPath: string = window.location.pathname) {
    // 个人中心特性逻辑
    if (personManageMenus.menu.find((e) => e.path === currentPath)) {
      toChildApplication(
        {
          id: personManageMenus.id,
          code: personManageMenus.code,
          name: personManageMenus.name,
          //@ts-ignore
          menuVOS: personManageMenus.menu,
          icon: personManageMenus.icon,
        },
        currentPath,
        { recordMenuVisit: false },
      );
      throw new Error("个人中心特性逻辑，跳转后不再执行后续代码");
    }

    let bestMatch:
      | {
          score: number;
          application: ApplicationPageVO | undefined;
          menus: Menu[];
        }
      | undefined;

    for (let index = 0; index < applicationMenuGroup.value.length; index++) {
      const element = applicationMenuGroup.value[index];
      for (let appIndex = 0; appIndex < element.applications.length; appIndex++) {
        const findApp = element.applications[appIndex];
        const score = getBestMenuPathMatchScore(findApp.menus, currentPath);
        if (!score || score <= (bestMatch?.score ?? 0)) {
          continue;
        }
        const application = applicationGroup.value
          .find((e) => e.id === findApp.applicationGroupId)
          ?.applicationPageVOS.find((e) => e.id === findApp.id);
        bestMatch = {
          score,
          application,
          menus: findApp.menus,
        };
      }
    }

    if (bestMatch) {
      currentApplication.value = bestMatch.application;
      currentMenus.value = bestMatch.menus;
      return {
        menus: bestMatch.menus,
        application: bestMatch.application,
      };
    }

    return {
      menus: [],
      application: null,
    };
  }

  /**
   * 根据当前地址校正应用上下文，处理浏览器返回/手输地址导致的 currentApplication 与路由不一致。
   */
  async function syncCurrentByPath(pathname: string = window.location.pathname) {
    const normalizedPath = pathname.split("?")[0];
    const applicationIdBeforeSync = currentApplication.value?.id;
    if (hasMenuPath(currentMenus.value, pathname)) {
      return;
    }

    if (!applicationGroup.value.length) {
      await getUserApplications();
    }
    if (!applicationMenuGroup.value.length) {
      await queryAllApplicationMenuGroup();
    }

    // 拉取菜单期间用户可能已主动切换应用或路由，旧纠偏请求必须作废，不能覆盖最新选择。
    if (currentApplication.value?.id !== applicationIdBeforeSync || window.location.pathname !== normalizedPath) {
      return;
    }

    const matchResult = matchApplicationMenuGroupByPath(normalizedPath);
    if (matchResult?.application) {
      const matchedApplication = matchResult.application as ApplicationPageVO;
      currentApplication.value = matchedApplication;
      currentMenus.value = matchResult.menus || [];
      currentApplicationMenuGroup.value = applicationMenuGroup.value.find(
        (group) => group.groupId === matchedApplication.applicationGroupId,
      );
    }
  }

  function clearMenuCache() {
    currentApplication.value = undefined;
    currentMenus.value = [];
    tabsPane.value = [];
    currentApplicationMenuGroup.value = undefined;
  }
  subscriber.subscribe(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, async (event: CubeEventSubscribe<{ code: string; path?: string }>) => {
    for (let index = 0; index < applicationGroup.value.length; index++) {
      const element = applicationGroup.value[index];
      const findApp = element.applicationPageVOS.find((e) => e.code === event.data.code);
      if (findApp) {
        if (inDesktopClient) {
          const menus = await api.getApplicationInMenus({ applicationCode: findApp.code }, "get");
          const targetPath = resolveMicroAppTargetPath(event.data.path ?? "/about", menus);
          if (typeof targetPath === "string" && targetPath.startsWith("/")) {
            //@ts-ignore
            window.cubeElectronIpcRenderer.send(CubeMessageEvent.TO_BUSINESS_PAGE, {
              title: findApp.name,
              url: `${location.origin}${targetPath}`,
            });
            recordMenuVisitByPath(menus, targetPath, true);
          }
          return;
        }
        toChildApplication(findApp, event.data.path ?? "/about");
        break;
      }
    }
  });

  return {
    getFirstItemInMenu,
    setDefaultPage,
    changeAppLoadStatus,
    beginMicroAppLoad,
    completeMicroAppLoad,
    toChildApplication,
    getUserApplications,
    findFirstAvailableApplication,
    getApplicationMenuByGroup,
    clearMenuCache,
    registerChildApp,
    queryAllApplicationMenuGroup,
    matchApplicationMenuGroupByPath,
    syncCurrentByPath,
    applicationGroup,
    appLoadStatus,
    applicationMenuGroup,
    currentApplicationMenuGroup,
    currentApplication,
    currentMenus,
    tabsPane,
  };
});
