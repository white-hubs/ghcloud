import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import React from "react";
import { useRoutes, BrowserRouter } from "react-router-dom";
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";

import { MFRootEventNameEnum, subscriber } from "@ghcloud/cube-mf-root";

import Router from "./router/router";

const RouterView = (): JSX.Element => {
  return <>{useRoutes(Router)}</>;
};

const basename = qiankunWindow.__POWERED_BY_QIANKUN__ ? "/" : "/apps/todo-center/app";

export const App = (): React.JSX.Element => {
  const skinColor = localStorage.getItem("skinColor")
    ? (JSON.parse(localStorage.getItem("skinColor") as unknown as string) as { primaryColor: string }).primaryColor
    : "rgb(24, 144, 255)";
  const [colorPrimary, setColorPrimary] = React.useState(skinColor);
  subscriber.subscribe(MFRootEventNameEnum.MF_ROOT_CHANGE_SKIN, (info) => {
    setColorPrimary(info.data as string);
  });
  return (
    <BrowserRouter basename={basename}>
      <ConfigProvider theme={{ token: { colorPrimary } }} prefixCls="todo-center-app" locale={zhCN}>
        <RouterView />
      </ConfigProvider>
    </BrowserRouter>
  );
};
