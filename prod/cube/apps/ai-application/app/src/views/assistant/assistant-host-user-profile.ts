/** 主应用写入 sessionStorage 的用户信息 key（与 mf-root / NavTopLink 一致） */
const HOST_USER_INFO_STORAGE_KEY = "GH-UserInfo";

export interface HostUserProfile {
  /** 展示名：与顶栏一致，`name || username` */
  name: string;
  /**
   * 头像 URL：仅当存在 `fileVO` 时取值（与顶栏 `v-if="userInfo?.fileVO"` 一致）。
   * 无 fileVO 时为空串，UI 不传 `src`。
   */
  avatarSrc: string;
  /** 是否存在 fileVO（决定是否走带 src 的 Avatar 分支） */
  hasFileVO: boolean;
}

interface HostUserInfoStorage {
  name?: string;
  username?: string;
  fileVO?: {
    path?: string;
  } | null;
}

function normalizeProfile(info: HostUserInfoStorage | null | undefined): HostUserProfile {
  if (info == null || typeof info !== "object") {
    return { name: "", avatarSrc: "", hasFileVO: false };
  }
  // 顶栏：state.userInfo?.name || state.userInfo?.username
  const name = String(info.name || info.username || "");
  // 顶栏：v-if="state.userInfo?.fileVO" 后 :src="`${fileVO.path}`"
  const hasFileVO = info.fileVO != null && typeof info.fileVO === "object";
  const avatarSrc = hasFileVO ? `${info.fileVO?.path ?? ""}` : "";
  return { name, avatarSrc, hasFileVO };
}

/**
 * 读取主应用当前用户资料（头像 / 姓名）。
 * 内容与顶栏 `user-dropdown` 一致：`fileVO.path` + `name || username`。
 */
export function readHostUserProfile(): HostUserProfile {
  try {
    if (typeof sessionStorage === "undefined") {
      return normalizeProfile(null);
    }
    const raw = sessionStorage.getItem(HOST_USER_INFO_STORAGE_KEY);
    if (!raw) {
      return normalizeProfile(null);
    }
    return normalizeProfile(JSON.parse(raw) as HostUserInfoStorage);
  } catch {
    return normalizeProfile(null);
  }
}
