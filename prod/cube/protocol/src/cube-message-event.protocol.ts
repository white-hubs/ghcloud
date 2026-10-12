export enum CubeMessageEvent {
  /** Client 跳转业务页面 */
  TO_BUSINESS_PAGE = 'toBusinessPageFromWebClient',
  /** 向桌面端 发消息 打开某个链接 */
  OPEN_URL_BY_BROWSER = 'openUrlByBrowser',
  /** 获取鉴权信息 */
  GET_AUTH_INFO = 'getAuthInfo',
  /** 设置鉴权信息 */
  SET_AUTH_INFO = 'setAuthInfo',
  /** 刷新token */
  REFRESH_TOKEN = 'refreshToken',
  /** 切换租户 */
  SWITCH_TENANT = 'switchTenant',

  /** 桌面端 窗口大小调整 */
  DESKTOP_WINDOW_RESIZE = 'desktop_window_resize',
  /** 桌面端 退出应用 */
  DESKTOP_EXIT_APP = 'desktop_exit_app',
  /** 桌面端 设置应用标题 */
  DESKTOP_SET_APP_TITLE = 'desktop_set_app_title',
  /** 桌面端 显示、隐藏 WebContents */
  DESKTOP_SET_WEB_CONTENTS_VISIBLE = 'desktop_set_web_contents_visible',
  /** 桌面端 创建tabManager */
  DESKTOP_CREATE_TAB_MANAGER = 'desktop_create_tab_manager',
  /** 桌面端 切换tab */
  DESKTOP_SWITCH_TAB = 'desktop_switch_tab',
  /** 桌面端 关闭tab */
  DESKTOP_CLOSE_TAB = 'desktop_close_tab',
  /** 桌面端 设置主view 到最高层级 */
  DESKTOP_SET_MAIN_VIEW_TO_TOP = 'desktop_set_main_view_to_top',
  /** 桌面端  设置主view 到最低层级 */
  DESKTOP_SET_MAIN_VIEW_TO_BOTTOM = 'desktop_set_main_view_to_bottom',
  /** 桌面端 退出登录 */
  DESKTOP_LOGOUT = 'desktop_logout',
  /** 桌面端 切换侧边栏 */
  DESKTOP_CHANGE_SIDEBAR = 'desktop_change_sidebar',


  /** 报警弹窗 触发可视化设备定位 */
  CUBE_ALARM_MODAL_DEVICE_LOCATE = 'cube-alarm-modal-device-locate'
}