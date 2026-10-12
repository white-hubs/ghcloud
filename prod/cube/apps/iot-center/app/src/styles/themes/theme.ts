import {
  CubeThemeManager,
  AuroraGreenTheme,
  DawnBlueTheme,
  DarkBlackTheme,
  DurkOrangeTheme,
  RightCyanTheme,
  Antd3AuroraGreenTheme,
  Antd3DawnBlueTheme,
  Antd3DarkBlackTheme,
  Antd3DurkOrangeTheme,
  Antd3RightCyanTheme,
} from '@ghcloud/cube-theme'

export const themeManager = new CubeThemeManager(
  {
    极光绿: AuroraGreenTheme,
    拂晓蓝: DawnBlueTheme,
    暗黑色: DarkBlackTheme,
    日暮色: DurkOrangeTheme,
    明青色: RightCyanTheme,
  },
  {
    defaultThemeName: '极光绿',
  }
)

export const antd3LegacyThemeManager = new CubeThemeManager(
  {
    极光绿: Antd3AuroraGreenTheme,
    拂晓蓝: Antd3DawnBlueTheme,
    暗黑色: Antd3DarkBlackTheme,
    日暮色: Antd3DurkOrangeTheme,
    明青色: Antd3RightCyanTheme,
  },
  {
    defaultThemeName: '极光绿',
    styleId: 'antd3-legacy-theme',
  }
)
