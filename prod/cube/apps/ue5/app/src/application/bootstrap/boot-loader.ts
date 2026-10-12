import { applySystemTitle, readCachedSystemTitle } from "@/application/bootstrap/system-title";

const BOOT_LOADER_ID = "ue5-boot-loader";
const LEAVE_MS = 280;

type BootMode = "login" | "viz";

type BootBridge = {
  setProgress: (percent: number) => void;
};

type BootWindow = Window & { __UE5_BOOT__?: BootBridge };

const HINT: Record<BootMode, string> = {
  login: "正在加载",
  viz: "正在加载可视化数据",
};

const LOADER_INNER_HTML = `
    <div class="ue5-boot-loader__stage">
      <span class="ue5-boot-loader__spinner" aria-hidden="true"></span>
      <strong></strong>
      <span data-boot-hint>正在加载</span>
      <div class="ue5-boot-loader__meter">
        <span class="ue5-boot-loader__track"><i data-boot-fill></i></span>
        <span data-boot-percent>0%</span>
      </div>
    </div>
`;

let leaveTimer = 0;
let painted = 0;

const getBootLoader = (): HTMLElement | null => document.getElementById(BOOT_LOADER_ID);

const paintProgress = (el: HTMLElement, value: number, allowReset = false): void => {
  const next = Math.max(0, Math.min(100, Math.round(value)));
  if (!allowReset && next < painted) {
    return;
  }
  painted = next;
  const width = `${painted}%`;
  const label = `${painted}%`;
  el.querySelectorAll<HTMLElement>("[data-boot-fill]").forEach((node) => {
    node.style.width = width;
  });
  el.querySelectorAll("[data-boot-percent]").forEach((node) => {
    node.textContent = label;
  });
};

const bindProgress = (el: HTMLElement): void => {
  (window as BootWindow).__UE5_BOOT__ = {
    setProgress: (percent) => {
      paintProgress(el, percent);
    },
  };
};

const applyBootMode = (mode: BootMode): void => {
  const root = document.documentElement;
  root.dataset.ue5BootMode = mode;
  const el = getBootLoader();
  if (!el) {
    return;
  }
  const hint = HINT[mode];
  el.setAttribute("aria-label", hint);
  el.querySelectorAll("[data-boot-hint]").forEach((node) => {
    node.textContent = hint;
  });
};

export const showUe5BootLoader = (mode: BootMode = "viz"): void => {
  if (leaveTimer) {
    window.clearTimeout(leaveTimer);
    leaveTimer = 0;
  }
  let el = getBootLoader();
  if (!el) {
    el = document.createElement("div");
    el.id = BOOT_LOADER_ID;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = LOADER_INNER_HTML;
    document.body.prepend(el);
  }
  applyBootMode(mode);
  applySystemTitle(readCachedSystemTitle());
  el.classList.remove("is-leaving", "is-error");
  delete el.dataset.leaving;
  delete el.dataset.ready;
  bindProgress(el);
  paintProgress(el, 8, true);
};

export const reportUe5BootProgress = (percent: number): void => {
  const el = getBootLoader();
  if (!el) {
    return;
  }
  paintProgress(el, percent);
};

export const dismissUe5BootLoader = (): void => {
  const el = getBootLoader();
  if (!el || el.dataset.leaving === "1") {
    return;
  }
  el.dataset.leaving = "1";
  el.dataset.ready = "1";
  paintProgress(el, 100);
  el.classList.add("is-leaving");
  leaveTimer = window.setTimeout(() => {
    leaveTimer = 0;
    el.remove();
  }, LEAVE_MS);
};

export const failUe5BootLoader = (message: string): void => {
  const el = getBootLoader();
  if (!el) {
    return;
  }
  el.dataset.ready = "1";
  el.classList.add("is-error");
  el.querySelectorAll("[data-boot-hint]").forEach((hint) => {
    hint.textContent = message;
  });
};
