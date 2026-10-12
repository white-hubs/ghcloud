import { getAssetsImage } from "@/infrastructure/utils/getImage";

const bgImgData: Record<
  string,
  {
    parkDay: string;
    parkNight: string;
    buildingDay: string;
    buildingNight: string;
  }
> = {
  儿童医院: {
    parkDay: getAssetsImage("overView59.png"),
    parkNight: getAssetsImage("overView62.png"),
    buildingDay: getAssetsImage("overView58.png"),
    buildingNight: getAssetsImage("overView61.png"),
  },
  中亿丰: {
    parkDay: getAssetsImage("overView67.png"),
    parkNight: getAssetsImage("overView67.png"),
    buildingDay: getAssetsImage("overView67.png"),
    buildingNight: getAssetsImage("overView67.png"),
  },
  高县: {
    parkDay: getAssetsImage("overView68.png"),
    parkNight: getAssetsImage("overView68.png"),
    buildingDay: getAssetsImage("overView68.png"),
    buildingNight: getAssetsImage("overView68.png"),
  },
  南沙: {
    parkDay: getAssetsImage("overView69.png"),
    parkNight: getAssetsImage("overView69.png"),
    buildingDay: getAssetsImage("overView69.png"),
    buildingNight: getAssetsImage("overView69.png"),
  },
  鹏程小学: {
    parkDay: getAssetsImage("overView70.png"),
    parkNight: getAssetsImage("overView70.png"),
    buildingDay: getAssetsImage("overView70.png"),
    buildingNight: getAssetsImage("overView70.png"),
  },
  福州广汇: {
    parkDay: getAssetsImage("overView71.png"),
    parkNight: getAssetsImage("overView71.png"),
    buildingDay: getAssetsImage("overView71.png"),
    buildingNight: getAssetsImage("overView71.png"),
  },
  太子湾: {
    parkDay: getAssetsImage("overView72.png"),
    parkNight: getAssetsImage("overView72.png"),
    buildingDay: getAssetsImage("overView72.png"),
    buildingNight: getAssetsImage("overView72.png"),
  },
  白鹅潭: {
    parkDay: getAssetsImage("overView74.png"),
    parkNight: getAssetsImage("overView74.png"),
    buildingDay: getAssetsImage("overView73.png"),
    buildingNight: getAssetsImage("overView73.png"),
  },
};

export function getBgImg(params: string) {
  if (params) {
    return bgImgData[params];
  }
}
