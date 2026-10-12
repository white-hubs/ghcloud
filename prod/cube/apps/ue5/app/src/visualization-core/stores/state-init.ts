// import { initCommunication } from '../utils/communication'
import { useStateStore } from "./use-state-store";

/**
 * 状态初始化
 */
export async function statusInitialization(): Promise<void> {
  const { initState } = useStateStore();
  await initState();
}
