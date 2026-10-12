export type MenuNameNode = {
  id: string;
  name: string;
  children?: readonly MenuNameNode[];
};

export const normalizeMenuName = (name: string): string => name.replace(/\s+/g, "").trim();

const findMenuLevel = (tree: readonly MenuNameNode[], parentId: string | null): readonly MenuNameNode[] | null => {
  if (!parentId) {
    return tree;
  }
  for (const item of tree) {
    if (item.id === parentId) {
      return item.children ?? [];
    }
    if (item.children?.length) {
      const siblings = findMenuLevel(item.children, parentId);
      if (siblings) {
        return siblings;
      }
    }
  }
  return null;
};

export const hasDuplicateMenuNameAtLevel = (
  tree: readonly MenuNameNode[],
  parentId: string | null,
  name: string,
  excludeId = "",
): boolean => {
  const normalizedName = normalizeMenuName(name);
  if (!normalizedName) {
    return false;
  }
  return (findMenuLevel(tree, parentId) ?? []).some((item) => item.id !== excludeId && normalizeMenuName(item.name) === normalizedName);
};

export const getBusinessMenuSubmitErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }
  return fallback;
};
