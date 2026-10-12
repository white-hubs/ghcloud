// 业务侧全局类型声明占位。按需补充。
// 例如：
//   interface Window {
//     __CUSTOM_SDK__?: unknown;
//   }

declare namespace ElectricalSafety {
  // 预留命名空间，避免文件为空被视为脚本而非模块。
  // 业务添加新类型时可直接在此或另起文件。
  type _Placeholder = never;
}

declare namespace JSX {
  type Element = import("vue").VNode;
}
