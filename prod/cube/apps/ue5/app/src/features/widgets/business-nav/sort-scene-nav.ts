import type { SceneDataType } from "@/infrastructure/api/models/mdata";

/**
 * 按配置 `sort` 升序排列菜单；`sort` 相同时保持接口返回的相对顺序（稳定排序）。
 * 勿用 id 做并列打破：同 sort 的「电子巡更 / 态势总览」会被打乱配置顺序。
 */
export const sortSceneNavItems = <T extends Pick<SceneDataType, "sort">>(items: T[] | undefined | null): T[] => {
  if (!items?.length) {
    return [];
  }
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const sortDiff = (Number(left.item.sort) || 0) - (Number(right.item.sort) || 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }
      return left.index - right.index;
    })
    .map(({ item }) => item);
};

export const getFirstSortedChild = (parent: SceneDataType | undefined | null): SceneDataType | undefined =>
  sortSceneNavItems(parent?.children)[0];
