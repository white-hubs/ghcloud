# @ghcloud/cube-personnel-positioning-app

开河平台 PC 端人员定位子应用。定位对象、定位设备、实时位置和历史轨迹通过人员服务及物联属性接口获取；实时告警处置页面本期保留为 Mock 占位。

## 本地运行

```bash
cd prod/cube/apps/personnel-positioning/app
bun run dev
```

默认访问地址：`http://localhost:8888/apps/@ghcloud/cube-personnel-positioning-app`

## 页面

| 路径                    | 页面         | 主要功能                                                 |
| ----------------------- | ------------ | -------------------------------------------------------- |
| `/objects`              | 定位对象     | 查询、来源人员同步、绑定/更换/解绑终端、查看人员定位详情 |
| `/realtime`             | 实时定位     | 实时位置查询、室外位置展示、室内楼栋/楼层/坐标展示       |
| `/devices`              | 定位设备管理 | 分别选择终端/定位基站后同步、查询、启停与详情             |
| `/objects/:personId`    | 人员定位详情 | 人员摘要、当前/最后位置、绑定记录                         |
| `/trajectory/:personId` | 历史轨迹     | 轨迹点、轨迹分段、回放与导出                             |

## 目录约定

- 页面和弹窗组件均使用独立目录，目录内包含同名 `.tsx` 与 `.less`。
- 业务枚举集中在 `src/constants/positioning.ts`。
- 领域类型集中在 `src/models/positioning.ts`。
- API 请求集中在 `src/api/positioning.ts`，Pinia Store 负责接口数据标准化和页面共享状态。
- 定位人员来源当前仅开放员工管理；定位设备当前仅支持定位终端和定位基站。
- 室内位置本期只展示楼栋、楼层和坐标，不绘制室内地图。

## 校验命令

```bash
bun test tests
bun run typecheck
bun run build
```
