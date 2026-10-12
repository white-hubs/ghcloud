import { getNowEnterprise, getUserInfo } from "../../utils/auth";

type RecoveryFile = { id: string | number; name: string };
type RecoveryEntry<T> = { version: 1; owner: string; id: string; payload: T; files: RecoveryFile[] };

const pendingSaves = new Map<string, Promise<unknown>>();
const memoryCheckpoints = new Map<string, string>();

/** 微应用卸载不会触发子路由守卫；按租户和用户隔离未同步的编辑进度。 */
export function createPlanDraftRecovery<T extends object>() {
  const owner = crypto.randomUUID();
  const currentScope = (): string | undefined => {
    try {
      const tenant = getNowEnterprise()?.code;
      const user = getUserInfo()?.id;
      if (tenant !== undefined && tenant !== null && user !== undefined && user !== null) {
        return `emergency-plan-draft:${encodeURIComponent(String(tenant))}:${encodeURIComponent(String(user))}:`;
      }
    } catch {
      // 身份资料不可用时只保留当前实例，不跨账号恢复。
    }
    return undefined;
  };
  const scope = currentScope();
  const isCurrentScope = () => scope === currentScope();
  const keyFor = (key: string) => `${scope || `emergency-plan-draft:instance:${owner}:`}${key}`;

  const readEntry = (key: string): RecoveryEntry<T> | null => {
    try {
      const raw = memoryCheckpoints.get(keyFor(key)) || (scope ? sessionStorage.getItem(keyFor(key)) : null);
      if (!raw) {
        return null;
      }
      const entry = JSON.parse(raw);
      return entry?.version === 1 &&
        typeof entry.owner === "string" &&
        typeof entry.id === "string" &&
        entry.payload &&
        typeof entry.payload === "object" &&
        !Array.isArray(entry.payload) &&
        Array.isArray(entry.files)
        ? (entry as RecoveryEntry<T>)
        : null;
    } catch {
      return null;
    }
  };

  const writeEntry = (key: string, entry: RecoveryEntry<T>): boolean => {
    const serialized = JSON.stringify(entry);
    try {
      if (scope) {
        sessionStorage.setItem(keyFor(key), serialized);
        memoryCheckpoints.delete(keyFor(key));
        return true;
      }
    } catch {
      // 会话存储不可写时，微应用重新挂载仍可从当前运行环境恢复。
    }
    memoryCheckpoints.set(keyFor(key), serialized);
    return false;
  };

  const save = (key: string, payload: T, id: string, files: RecoveryFile[] = []): boolean =>
    writeEntry(key, { version: 1, owner, id, payload, files: files.map(({ id: fileId, name }) => ({ id: fileId, name })) });

  const read = (key: string): RecoveryEntry<T> | null => {
    const direct = readEntry(key);
    if (direct || key === "new") {
      return direct;
    }
    const created = readEntry("new");
    return created?.id === key ? created : null;
  };

  const remove = (key: string) => {
    memoryCheckpoints.delete(keyFor(key));
    try {
      if (scope) {
        sessionStorage.removeItem(keyFor(key));
      }
    } catch {
      // 内存副本已移除，存储不可用时无需阻止服务端保存。
    }
  };

  const clear = (key: string) => {
    remove(key);
    if (key !== "new" && readEntry("new")?.id === key) {
      remove("new");
    }
  };

  const persist = (key: string, payload: T, request: Promise<unknown>): Promise<unknown> => {
    const checkpoint = readEntry(key);
    const id = (payload as { id?: string }).id || checkpoint?.id || "";
    save(key, payload, id, checkpoint?.files);
    const tracked = request
      .then((savedId) => {
        if (
          (typeof savedId === "string" && /^[1-9]\d*$/u.test(savedId)) ||
          (typeof savedId === "number" && Number.isSafeInteger(savedId) && savedId > 0)
        ) {
          const latest = readEntry(key);
          // 只补全编号；请求期间输入的较新内容必须保留。
          if (latest?.owner === owner) {
            writeEntry(key, { ...latest, id: String(savedId) });
          }
        }
        return savedId;
      })
      .finally(() => {
        if (pendingSaves.get(keyFor(key)) === tracked) {
          pendingSaves.delete(keyFor(key));
        }
      });
    pendingSaves.set(keyFor(key), tracked);
    return tracked;
  };

  const wait = async (key: string): Promise<void> => {
    try {
      await pendingSaves.get(keyFor(key));
    } catch {
      // 上次请求失败仍需恢复本地内容，并由页面发起重试。
    }
  };

  return { save, read, clear, persist, wait, isCurrentScope };
}
