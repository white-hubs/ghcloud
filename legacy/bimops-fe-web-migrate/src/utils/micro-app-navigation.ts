interface NavigationMenu {
  path?: string;
  children?: NavigationMenu[];
}

export interface MicroAppNavigationPlan {
  path: string;
  deferredPath?: string;
}

export interface MicroAppNavigationContext {
  targetContainerExists?: boolean;
}

export interface MicroAppNavigationRuntime {
  pushState: (path: string) => void;
  assign: (path: string) => void;
  addRoutingListener: (listener: (url: string) => void) => () => void;
  navigateToTransitionPage: (path: string) => Promise<void>;
  setTimer: (callback: () => void, timeout: number) => number;
  clearTimer: (timer: number) => void;
}

export interface BrowserMicroAppNavigationRuntimeOptions {
  navigateToTransitionPage?: (path: string) => Promise<void>;
}

export interface MicroAppNavigationCoordinator {
  startNavigation: () => number;
  isCurrent: (generation: number) => boolean;
  shouldSuppressDefaultNavigation: () => boolean;
  navigate: (plan: MicroAppNavigationPlan, generation: number) => Promise<void>;
}

const ROUTING_TIMEOUT = 5000;

function findFirstMenuPath(menus: NavigationMenu[]): string | null {
  if (!menus.length) {
    return null;
  }

  const firstMenu = menus[0];
  if (firstMenu.children?.length) {
    return findFirstMenuPath(firstMenu.children);
  }

  return firstMenu.path ?? null;
}

export function resolveMicroAppTargetPath(requestedPath: string, menus: NavigationMenu[]): string {
  if (requestedPath !== "/about") {
    return requestedPath;
  }

  return findFirstMenuPath(menus) ?? requestedPath;
}

export function createMicroAppNavigationPlan(
  currentPath: string,
  requestedPath: string,
  menus: NavigationMenu[],
  context: MicroAppNavigationContext = {},
): MicroAppNavigationPlan {
  const targetPath = resolveMicroAppTargetPath(requestedPath, menus);
  const shouldWaitForPortalContainer = targetPath.startsWith("/portal/") && context.targetContainerExists === false;
  const shouldNavigateViaAbout =
    targetPath !== "/about" &&
    (shouldWaitForPortalContainer ||
      (currentPath !== "/index" && (currentPath.includes("path") || targetPath.includes(currentPath))) ||
      currentPath.includes("genericEquipmentMonitor") ||
      targetPath.includes("genericEquipmentMonitor"));

  if (shouldNavigateViaAbout) {
    return {
      path: "/about",
      deferredPath: targetPath,
    };
  }

  return {
    path: targetPath,
  };
}

function normalizeUrl(url: string): string {
  const parsedUrl = new URL(url, "http://micro-app.local");
  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function createBrowserMicroAppNavigationRuntime(options: BrowserMicroAppNavigationRuntimeOptions = {}): MicroAppNavigationRuntime {
  const pushState = (path: string) => {
    if (!isNavigablePath(path)) {
      return;
    }
    history.pushState({ current: location.pathname + location.search }, "", path);
  };

  return {
    pushState,
    assign(path) {
      window.location.assign(path);
    },
    addRoutingListener(listener) {
      const handleRoutingEvent = (event: Event) => {
        const newUrl = (event as CustomEvent<{ newUrl?: string }>).detail?.newUrl;
        if (newUrl) {
          listener(newUrl);
        }
      };
      window.addEventListener("single-spa:routing-event", handleRoutingEvent);
      return () => {
        window.removeEventListener("single-spa:routing-event", handleRoutingEvent);
      };
    },
    navigateToTransitionPage(path) {
      if (options.navigateToTransitionPage) {
        return options.navigateToTransitionPage(path);
      }
      pushState(path);
      return Promise.resolve();
    },
    setTimer(callback, timeout) {
      return window.setTimeout(callback, timeout);
    },
    clearTimer(timer) {
      window.clearTimeout(timer);
    },
  };
}

export function createMicroAppNavigationCoordinator(runtime: MicroAppNavigationRuntime): MicroAppNavigationCoordinator {
  let currentGeneration = 0;
  let pendingGeneration: number | undefined;
  let cancelPendingNavigation: (() => void) | undefined;

  const startNavigation = () => {
    currentGeneration += 1;
    cancelPendingNavigation?.();
    cancelPendingNavigation = undefined;
    pendingGeneration = undefined;
    return currentGeneration;
  };

  return {
    startNavigation,
    isCurrent(generation) {
      return generation === currentGeneration;
    },
    shouldSuppressDefaultNavigation() {
      return pendingGeneration !== undefined;
    },
    navigate(plan, generation) {
      if (generation !== currentGeneration) {
        return Promise.resolve();
      }

      if (!plan.deferredPath) {
        runtime.pushState(plan.path);
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let phase: "transition" | "target" = "transition";
        let settled = false;
        let removeRoutingListener = () => {};
        let timeout = 0;

        const finish = () => {
          if (settled) {
            return;
          }
          settled = true;
          removeRoutingListener();
          runtime.clearTimer(timeout);
          if (pendingGeneration === generation) {
            pendingGeneration = undefined;
          }
          if (cancelPendingNavigation === finish) {
            cancelPendingNavigation = undefined;
          }
          resolve();
        };

        removeRoutingListener = runtime.addRoutingListener((url) => {
          if (generation !== currentGeneration) {
            finish();
            return;
          }

          if (phase === "target" && normalizeUrl(url) === normalizeUrl(plan.deferredPath!)) {
            finish();
          }
        });
        timeout = runtime.setTimer(() => {
          if (generation === currentGeneration) {
            runtime.assign(plan.deferredPath!);
          }
          finish();
        }, ROUTING_TIMEOUT);

        pendingGeneration = generation;
        cancelPendingNavigation = finish;
        void runtime
          .navigateToTransitionPage(plan.path)
          .then(() => {
            if (generation !== currentGeneration || phase !== "transition") {
              return;
            }
            phase = "target";
            runtime.pushState(plan.deferredPath!);
          })
          .catch(finish);
      });
    },
  };
}
