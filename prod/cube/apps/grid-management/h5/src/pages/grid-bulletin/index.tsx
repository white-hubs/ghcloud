import { cubeGridManagementService } from "@/api/server";
const gridBulletinLogo = "/resource/v1/grid-management/images/h5/grid-bulletin-logo.png";
import dayjs from "dayjs";
import { Icon, Popup } from "vant";
import { type Ref, defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import { AreaPopupCascader } from "@ghcloud/cube-app-generic-component";

import styles from "./index.module.less";

// ==================== 展示组件配置 ====================

type WidgetKey = "managers" | "announcements" | "footer";

interface WidgetConfig {
  key: WidgetKey;
  label: string;
}

// ==================== 数据类型定义 ====================

/** 区域联系人卡片展示数据 */
interface GridManagerCard {
  id: string;
  name: string;
  mobile: string;
  avatar: string | null;
  roleType: string;
}

/** 通知公告 */
interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  levelName: string;
  level: string;
  createTime: string;
  createBy: string;
  typeName: string;
  publishAgency?: string;
}

// ==================== 常量 & 纯函数工具 ====================
const MANAGER_SCROLL_TRIGGER_COUNT = 6;

const ALL_WIDGETS: WidgetConfig[] = [
  { key: "managers", label: "人员信息" },
  { key: "announcements", label: "通知公告" },
  { key: "footer", label: "公司投诉电话" },
];

const SETTINGS_CLOSE_DELAY_MS = 220;
const AREA_ID_QUERY_KEY = "id";

// ==================== API 接口定义（待接口确认后替换） ====================

/** 将单个 GridManager 映射为卡片，roleType 为角色描述 */
const toCard = (
  m: { gridManagerId: string; gridManagerName: string; avatar: { path: string } | null; mobile: string },
  roleType: string,
): GridManagerCard => ({
  id: m.gridManagerId,
  name: m.gridManagerName,
  mobile: m.mobile,
  avatar: m.avatar?.path ?? null,
  roleType,
});

/** 获取公示栏区域联系人列表 */
const fetchGridManagers = async (areaId: string, tenantId: string): Promise<GridManagerCard[]> => {
  const res = await cubeGridManagementService.getBulletinGridManagers(areaId, tenantId);
  const cards: GridManagerCard[] = [
    ...res.gridManagers.map((m) => toCard(m, "招商运营经理")),
    ...res.gridMemberInfo.map((m) => toCard(m, "招商运营主管")),
    ...(res.engineeringManager ? [toCard(res.engineeringManager, "工程物业负责人")] : []),
    ...(res.safetyManager ? [toCard(res.safetyManager, "秩序安全负责人")] : []),
    ...(res.cleaningManager ? [toCard(res.cleaningManager, "保洁负责人")] : []),
    ...(res.meteringManager ? [toCard(res.meteringManager, "计量管理负责人")] : []),
    ...(res.meteringStaff ? [toCard(res.meteringStaff, "计量管理人员")] : []),
  ];
  return cards;
};

/** 获取公示栏通知公告列表 */
const fetchAnnouncements = async (tenantId: string): Promise<AnnouncementItem[]> => {
  const res = await cubeGridManagementService.getBulletinAnnouncements({ pageNumber: 1, pageSize: 1 }, tenantId);
  return res.records as unknown as AnnouncementItem[];
};

/** 格式化时间 */
const formatTime = (timeStr: string): string => {
  if (!timeStr) {
    return "";
  }
  return dayjs(timeStr).format("YYYY.MM.DD HH:mm:ss");
};

/** 将类型名按每两字分行 */
const splitTypeLabel = (str: string = "新闻资讯"): string[] => {
  const result: string[] = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(str.slice(i, i + 2));
  }
  return result;
};

/** 从地址栏读取区域 id（query） */
const getAreaIdFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get(AREA_ID_QUERY_KEY) ?? "";
};

/** 将区域 id 同步到地址栏（query） */
const syncAreaIdToUrl = (areaId: string) => {
  const url = new URL(window.location.href);
  if (areaId) {
    url.searchParams.set(AREA_ID_QUERY_KEY, areaId);
  } else {
    url.searchParams.delete(AREA_ID_QUERY_KEY);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
};

/**
 * 创建一个独立自动滚动控制器
 * @param elRef   滚动容器的 ref
 * @param speed   每帧滚动像素数（默认 0.6）
 */
const createAutoScroller = (elRef: Ref<HTMLElement | null>, speed = 0.6) => {
  let rafId = 0;
  let paused = false;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const clearRetry = () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = undefined;
    }
  };

  const clearObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = undefined;
    }
  };

  const startLoop = () => {
    if (rafId) {
      return;
    } // 已在运行，避免重复启动
    // 累积器：解决 speed < 0.5 时浏览器将 scrollTop 取整为 0 导致不滚动的问题
    let accum = 0;
    const step = () => {
      if (!paused && elRef.value) {
        accum += speed;
        if (accum >= 1) {
          const px = Math.floor(accum);
          elRef.value.scrollTop += px;
          accum -= px;
        }
        if (elRef.value.scrollTop + elRef.value.clientHeight >= elRef.value.scrollHeight - 1) {
          elRef.value.scrollTop = 0;
          accum = 0;
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  };

  const start = () => {
    clearRetry();
    clearObserver();
    const el = elRef.value;
    if (!el) {
      return;
    }
    if (el.scrollHeight > el.clientHeight) {
      startLoop();
      return;
    }
    // 用 ResizeObserver 监听内容高度变化（富文本图片加载后触发）
    resizeObserver = new ResizeObserver(() => {
      const el2 = elRef.value;
      if (el2 && el2.scrollHeight > el2.clientHeight) {
        clearObserver();
        clearRetry();
        startLoop();
      }
    });
    resizeObserver.observe(el);
    // 兜底：多次延迟重试（防止不支持 ResizeObserver 的环境）
    const delays = [300, 800, 1500, 3000];
    let attempt = 0;
    const retry = () => {
      if (attempt >= delays.length) {
        return;
      }
      retryTimer = setTimeout(() => {
        const el2 = elRef.value;
        if (el2 && el2.scrollHeight > el2.clientHeight) {
          clearObserver();
          startLoop();
          return;
        }
        attempt++;
        retry();
      }, delays[attempt]);
    };
    retry();
  };

  const pause = () => {
    paused = true;
  };
  const resume = () => {
    paused = false;
  };
  const stop = () => {
    clearRetry();
    clearObserver();
    cancelAnimationFrame(rafId);
    rafId = 0;
  };
  const restart = () => {
    stop();
    start();
  };

  return { start, pause, resume, stop, restart };
};

// ==================== 页面组件 ====================

export const GridBulletin = defineComponent({
  setup: () => {
    const tenantId = import.meta.env.VITE_TENANT_ID as string;

    // 区域选择
    const selectedAreaId = ref("");
    const selectedAreaName = ref("");

    // 区域联系人
    const gridManagers = ref<GridManagerCard[]>([]);
    const gridManagersLoading = ref(false);

    // 通知公告
    const announcements = ref<AnnouncementItem[]>([]);
    const announcementsLoading = ref(false);

    // 投诉电话
    const complaintPhone = ref("");

    // 设置面板
    const showSettings = ref(false);
    const visibleWidgets = ref<Set<WidgetKey>>(new Set<WidgetKey>(["managers", "announcements", "footer"]));

    // 区域选择器 ref
    const areaRef = ref<{ openPopup: () => void }>();

    /** 获取区域联系人 */
    const getGridManagers = async (areaId: string) => {
      gridManagersLoading.value = true;
      gridManagers.value = await fetchGridManagers(areaId, tenantId);
      gridManagersLoading.value = false;
    };

    /** 获取通知公告 */
    const getAnnouncements = async () => {
      announcementsLoading.value = true;
      announcements.value = await fetchAnnouncements(tenantId);
      announcementsLoading.value = false;
    };

    /** 获取投诉电话 */
    const getComplaintPhone = async () => {
      complaintPhone.value = await cubeGridManagementService.getBulletinComplaintPhone(tenantId);
    };

    /** 处理区域选择确认 */
    const handleAreaOk = async (values: { id?: string; name?: string }) => {
      if (values?.id) {
        const areaId = String(values.id);
        selectedAreaId.value = areaId;
        selectedAreaName.value = values.name ?? "";
        syncAreaIdToUrl(areaId);
        await getGridManagers(areaId);
      }
    };

    /** 拨打电话 */
    const handleCall = (mobile: string) => {
      window.location.href = `tel:${mobile}`;
    };

    // ==================== 设置面板逻辑 ====================

    const toggleWidget = (key: WidgetKey) => {
      const next = new Set(visibleWidgets.value);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      visibleWidgets.value = next;
    };

    const handleOpenAreaSelector = () => {
      showSettings.value = false;
      window.setTimeout(() => {
        areaRef.value?.openPopup();
      }, SETTINGS_CLOSE_DELAY_MS);
    };

    /** 渲染设置面板 */
    const renderSettingsPanel = () => {
      const added = ALL_WIDGETS.filter((w) => visibleWidgets.value.has(w.key));
      const pending = ALL_WIDGETS.filter((w) => !visibleWidgets.value.has(w.key));
      return (
        <Popup v-model:show={showSettings.value} position="bottom" round style={{ maxHeight: "70vh" }}>
          <div class={styles["settings-panel"]}>
            <div class={styles["settings-title"]}>设置</div>
            <div class={styles["settings-item"]}>
              <div class={styles["settings-item-content"]}>
                <span class={styles["settings-item-label"]}>区域选择</span>
                <span class={styles["settings-item-value"]}>{selectedAreaName.value || "请选择区域"}</span>
              </div>
              <div class={[styles["settings-btn"], styles["settings-btn--primary"]]} onClick={handleOpenAreaSelector}>
                选择
              </div>
            </div>

            {/* 已添加 */}
            {added.length > 0 && (
              <>
                <div class={styles["settings-group-label"]}>已添加</div>
                {added.map((w) => (
                  <div class={styles["settings-item"]} key={w.key}>
                    <span class={styles["settings-item-label"]}>{w.label}</span>
                    <div class={[styles["settings-btn"], styles["settings-btn--remove"]]} onClick={() => toggleWidget(w.key)}>
                      移除
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 待添加 */}
            {pending.length > 0 && (
              <>
                <div class={styles["settings-group-label"]}>待添加</div>
                {pending.map((w) => (
                  <div class={styles["settings-item"]} key={w.key}>
                    <span class={styles["settings-item-label"]}>{w.label}</span>
                    <div class={[styles["settings-btn"], styles["settings-btn--add"]]} onClick={() => toggleWidget(w.key)}>
                      添加
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Popup>
      );
    };

    // 区域联系人自动滚动
    const managersScrollRef = ref<HTMLElement | null>(null);
    const managersScroller = createAutoScroller(managersScrollRef, 0.5);

    // 通知公告内容自动滚动（绑定到 announcement-content）
    const contentScrollRef = ref<HTMLElement | null>(null);
    const contentScroller = createAutoScroller(contentScrollRef, 0.5);

    // 监听区域联系人数据，仅超过阈值时启动滚动
    watch(
      () => gridManagers.value.length,
      async (len) => {
        if (len > MANAGER_SCROLL_TRIGGER_COUNT) {
          await nextTick();
          managersScroller.restart();
          return;
        }
        managersScroller.stop();
        if (managersScrollRef.value) {
          managersScrollRef.value.scrollTop = 0;
        }
      },
    );

    // 监听通知公告数据，数据就绪后启动内容滚动
    watch(
      () => announcements.value.length,
      async (len) => {
        if (len > 0) {
          await nextTick();
          contentScroller.restart();
        }
      },
    );

    onMounted(() => {
      Promise.all([getAnnouncements(), getComplaintPhone()]);
    });

    onMounted(() => {
      const areaIdFromUrl = getAreaIdFromUrl();
      if (!areaIdFromUrl) {
        return;
      }
      selectedAreaId.value = areaIdFromUrl;
      getGridManagers(areaIdFromUrl);
    });

    // 定时刷新：每分钟重新拉取区域联系人和通知公告
    let refreshTimer: ReturnType<typeof setInterval> | undefined;
    onMounted(() => {
      refreshTimer = setInterval(() => {
        if (selectedAreaId.value) {
          getGridManagers(selectedAreaId.value);
        }
        getAnnouncements();
      }, 60_000);
    });

    onUnmounted(() => {
      managersScroller.stop();
      contentScroller.stop();
      clearInterval(refreshTimer);
    });

    // ==================== 渲染 ====================

    /** 渲染区域联系人卡片 */
    const renderManagerCard = (manager: GridManagerCard) => (
      <div class={styles["manager-card"]} key={manager.id}>
        <div class={styles["manager-avatar"]}>
          {manager.avatar ? <img src={manager.avatar} alt={manager.name} /> : <div class={styles["avatar-placeholder"]} />}
        </div>
        <div class={styles["manager-info"]}>
          <div class={styles["manager-role"]}>{manager.roleType}</div>
          <div class={styles["manager-name"]}>{manager.name}</div>
          <div class={styles["manager-mobile"]} onClick={() => handleCall(manager.mobile)}>
            <Icon name="phone-o" size={13} color="#1565C0" />
            <span>{manager.mobile}</span>
          </div>
        </div>
      </div>
    );

    /** 渲染通知公告卡片 */
    const renderAnnouncementCard = (item: AnnouncementItem) => (
      <div class={styles["announcement-card"]} key={item.id}>
        <div class={styles["announcement-header"]}>
          {/* 左侧类型标签：垂直居中，每行两字 */}
          <div class={styles["announcement-type-tag"]}>
            {splitTypeLabel(item.typeName).map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
          {/* 右侧：标题 + 级别标签同行 */}
          <div class={styles["announcement-header-right"]}>
            <div class={styles["announcement-title-row"]}>
              <div class={styles["announcement-title"]}>{item.title}</div>
              <div class={[styles["level-tag"], styles[`level-tag--${item.level?.toLowerCase()}`]]}>{item.levelName}</div>
            </div>
          </div>
        </div>
        <div
          ref={contentScrollRef}
          class={styles["announcement-content"]}
          innerHTML={item.content || ""}
          onTouchstart={contentScroller.pause}
          onTouchend={contentScroller.resume}
          onMouseenter={contentScroller.pause}
          onMouseleave={contentScroller.resume}
        />
        <div class={styles["announcement-footer"]}>
          <div class={styles["announcement-publisher"]}>
            <Icon name="send-gift-o" size={13} color="#8e97a4" />
            <span>{item.publishAgency}</span>
          </div>
          <div class={styles["announcement-time"]}>{formatTime(item.createTime)}</div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class={styles["page"]}>
        {/* 顶部导航 */}
        <div class={styles["header"]}>
          <div class={styles["header-logo"]}>
            <img src={gridBulletinLogo} alt="网格化管理" class={styles["logo-img"]} />
          </div>
          <div class={styles["header-title"]}>区域管理公示栏</div>
          <div
            class={styles["header-setting-btn"]}
            onClick={() => {
              showSettings.value = true;
            }}
          >
            <Icon name="setting-o" size={20} color="#fff" />
          </div>
        </div>

        {/* 主体内容 */}
        <div class={styles["content"]}>
          {/* 区域联系人 */}
          {visibleWidgets.value.has("managers") && (
            <div class={[styles["section"], styles["section--managers"]]}>
              <div class={styles["section-header"]}>
                <div class={styles["section-title"]}>
                  <div class={styles["title-bar"]} />
                  <span>区域联系人</span>
                </div>
              </div>
              <div
                ref={managersScrollRef}
                class={styles["manager-grid"]}
                onTouchstart={managersScroller.pause}
                onTouchend={managersScroller.resume}
                onMouseenter={managersScroller.pause}
                onMouseleave={managersScroller.resume}
              >
                {gridManagersLoading.value ? (
                  <div class={styles["loading-text"]}>加载中...</div>
                ) : (
                  gridManagers.value.map(renderManagerCard)
                )}
              </div>
            </div>
          )}

          {/* 通知公告 */}
          {visibleWidgets.value.has("announcements") && (
            <div class={[styles["section"], styles["section--announcements"]]}>
              <div class={styles["section-header"]}>
                <div class={styles["section-title"]}>
                  <div class={styles["title-bar"]} />
                  <span>通知公告</span>
                </div>
              </div>
              <div class={styles["announcement-list"]}>
                {announcementsLoading.value ? (
                  <div class={styles["loading-text"]}>加载中...</div>
                ) : (
                  announcements.value.map(renderAnnouncementCard)
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部投诉电话 */}
        {visibleWidgets.value.has("footer") && (
          <div class={styles["footer"]}>
            <Icon name="phone-o" size={16} color="#fff" />
            <span>公司投诉电话：{complaintPhone.value || "加载中..."}</span>
          </div>
        )}

        {/* 区域选择 */}
        <AreaPopupCascader ref={areaRef} value={selectedAreaId.value} tenant={tenantId} onOk={handleAreaOk} />

        {/* 设置面板 */}
        {renderSettingsPanel()}
      </div>
    );
  },
});
