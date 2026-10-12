import { cubeOuaaService } from "@/api/server";

let currentUserId: string | undefined;

export async function getCurrentUserId(): Promise<string | undefined> {
  if (currentUserId !== undefined) {
    return currentUserId;
  }
  try {
    const user = await cubeOuaaService.getUserMine();
    currentUserId = String(user.id ?? "").trim() || undefined;
  } catch {
    currentUserId = undefined;
  }
  return currentUserId;
}
