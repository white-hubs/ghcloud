import { getDefaultImg } from "@/utils/tool";
import { Image, PopOver } from "@ghcloud/cube-ui";

interface ImgState {
  id: string;
  name: string;
  path: string;
}
export interface ProductState {
  [key: string]: unknown;
  prodCategoryName: string;
  prodCategoryNameWithCascade: string;
  protocolName: string;
  prodBrandName: string;
  prodModel: string;
  prodIconFile: ImgState;
  prodPicFile: ImgState;
}

export const baseInfoState = [
  {
    label: "设备密钥",
    name: "salt",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "设备描述",
    name: "remark",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "初始激活时间",
    name: "activationTimeStr",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "创建时间",
    name: "createTimeStr",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "所属产品",
    name: "productName",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "节点类型",
    name: "nodeTypeName",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "父级网关名称",
    name: "deviceParentName",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "品牌名称",
    name: "product",
    render: (val: ProductState): string | unknown => (val?.prodBrandName ? val.prodBrandName : "--"),
  },
  {
    label: "产品型号",
    name: "product",
    render: (val: ProductState): string | unknown => (val?.prodModel ? val.prodModel : "--"),
  },
  {
    label: "三方设备ID",
    name: "rawDeviceId",
    render: (val: unknown): string | unknown => val || "--",
  },
  {
    label: "物联配置",
    name: "config",
    render: (val: string): string | unknown => (
      <PopOver content={val || "--"} style="width: 200px; word-wrap: break-word;">
        <span style="display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 3;overflow: hidden;text-overflow: ellipsis;">
          {val || "--"}
        </span>
      </PopOver>
    ),
  },
  {
    label: "产品图标",
    name: "product",
    render: (val: ProductState): JSX.Element => {
      if (!val?.prodIconFile) {
        return <span>暂无图片</span>;
      }
      return (
        <>
          <Image
            src={val?.prodIconFile?.path || getDefaultImg()}
            width={100}
            height={100}
            key={val?.prodIconFile?.path}
            fallback={getDefaultImg()}
          />
        </>
      );
    },
  },
  {
    label: "产品图片",
    name: "product",
    render: (val: ProductState): JSX.Element => {
      if (!val?.prodPicFile) {
        return <span>暂无图片</span>;
      }
      return (
        <>
          <Image
            src={val?.prodPicFile?.path || getDefaultImg()}
            width={100}
            height={100}
            key={val?.prodIconFile?.path}
            fallback={getDefaultImg()}
          />
        </>
      );
    },
  },
];
