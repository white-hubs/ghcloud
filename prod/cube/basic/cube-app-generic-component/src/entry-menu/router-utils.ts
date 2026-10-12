interface NavigateOptions {
  /** 是否替换当前历史记录（默认 false，表示 push 新记录） */
  replace?: boolean;
  /** 通过 history.state 传递的数据 */
  state?: unknown;
  /** 额外查询参数（合并到 URL query 中） */
  query?: Record<string, string | number | boolean>;
  /** Hash 模式下强制指定锚点（如 `#section`） */
  hash?: string;
}

export function navigateTo (path: string, options: NavigateOptions = {}): void {
  const { replace = false, state = null, query = {}, hash = '' } = options;
  const isHashMode = window.location.hash.includes('#/');

  // 处理查询参数和完整路径
  const queryString = new URLSearchParams(
    Object.entries(query).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  const fullPath = queryString ? `${path}?${queryString}${hash}` : `${path}${hash}`;

  if (isHashMode) {
    // Hash 模式：直接通过 location.hash 修改（触发 hashchange）
    const newHash = `#${fullPath}`;
    if (replace) {
      // 替换当前历史记录
      window.history.replaceState(state, '', newHash);
      window.location.replace(newHash); // 强制刷新
    } else {
      window.location.hash = newHash; // 直接赋值触发 hashchange
    }
  } else {
    // History 模式：使用 pushState/replaceState
    const newUrl = new URL(fullPath, window.location.origin);
    if (replace) {
      window.history.replaceState(state, '', newUrl);
    } else {
      window.history.pushState(state, '', newUrl);
    }
    window.dispatchEvent(new PopStateEvent('popstate', { state }));
  }
}


/**
* 获取当前路由的查询参数（自动解析为对象）
*/
export function getCurrentQueryParams (): Record<string, string> {
  const search = window.location.search;
  return Object.fromEntries(new URLSearchParams(search).entries());
}
