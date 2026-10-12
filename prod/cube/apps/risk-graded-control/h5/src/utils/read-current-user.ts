interface CurrentUserStorage {
  id?: string | number;
  userId?: string | number;
  name?: string;
  username?: string;
  nickname?: string;
  displayName?: string;
}

export function readCurrentUserId(): string | undefined {
  try {
    const raw = sessionStorage.getItem("GH-UserInfo");
    if (!raw) return undefined;
    const user = JSON.parse(raw) as CurrentUserStorage;
    const id = user.id ?? user.userId;
    return id == null ? undefined : String(id);
  } catch {
    return undefined;
  }
}

export function readCurrentUserDisplayName(): string {
  try {
    const raw = sessionStorage.getItem("GH-UserInfo");
    if (!raw) return "";
    const user = JSON.parse(raw) as CurrentUserStorage;
    return String(user.name ?? user.displayName ?? user.nickname ?? user.username ?? "").trim();
  } catch {
    return "";
  }
}
