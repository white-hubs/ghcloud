export interface ModelConfig {
  title: string;
  entry: 'views' | 'views-2d' | 'views-three' | 'views-old-area' | 'views-2d-old-area';
  ue5: {
    modelLocation: {
      lng: number;
      lat: number;
    };
    modelServer: { name: string; url: string; }[];
    modelPerspective: {
      label: string;
      value: string;
      area?: string;
      id?: string;
    }[];
    perspective: {
      id: string;
      area: string;
      camera: string;
      hideActors?: string[];
      buildTagLocation?: string;
      shellCode?: string;
      label?: string;
    }[];
    applicationPerspective: {
      id: string;
      application: string;
      camera: string;
      path: string;
    }[];
    roamingRoute: {
      name: string;
      id: string;
      route: { pointName: string; perspective: string;id: string;name: string;sort: number;speed: number; }[];
    }[];
    iconScale: number | string;
    isFilterArea: string;
    navType: string;
    cardType: string;
    deviceStyle: string;
    autoWeather: boolean;
    labelList: any[];
    guideData: {
      isOld: string;
      modelLine: string;
      guideList: {
        sort: number;
        name: string;
        describe: string;
        id: string;
        setScreen?: {
          initPerspective: string;
          durationStay: number;
          effectList: { name: string;value: string; }[];
        };
        pointList?: {
          id: string;
          title: string;
          point: string;
          angleView: string;
          type: string;
          describe: string;
          indicatorType: string;
          time: number;
        }[];
      }[];
    };
    correct?: boolean;
  };
  three: {
    modelServer: { name: string; url: string;area: string[];areaList: {
      id: string;
      name: string;
      aliasName: string;
    }[]; }[];
    modelPerspective: {
      label: string;
      value: string;
      area: string;
      areaId: string;
      id?: string;
    }[];
    perspective: {
      id?: string;
      value?: string;
      area: string;
      label?: string;
      camera: string;
      hideActors?: string[];
      buildTagLocation?: string;
    }[];
    roamingRoute: {
      name: string;
      id: string;
      route: { area: string; name: string; pointName: string; perspective: string;id: string;speed: number;sort: number; }[];
    }[];
    labelList: {
      labelType: string;
      locationType: string;
      location: string;
      area: string[];
      labelContent: {
        type: string;
        title: string;
        image: string;
        detail: string;
      };
      labelColor: string;
      interactive: string;
    }[];
    areaLabelList: {
      areaName: string;
      areaId: string;
      labelConfig: {
        detail: string;
        title: string;
        image: string;
        labelColor: string;
        interactive: string;
        location?: string;
      };
    }[];
    scene: {
      background: {
        images: {
          url: string;
          area: { id: string;name: string;aliasName: string; }[];
          id: string;
        }[];
        scale: number;
      };
    };
  };
  scada: {
    url: { menu: string; area: string; url: string; id: string; name: string; }[];
    background: { area: string[]; url: string;id: string; }[];
  };
}

/** 模型参数初始化 */
export const modelConfigInit = (): ModelConfig => {
  return {
    title: '三维可视化大屏',
    entry: 'views',
    ue5: {
      modelServer: [],
      modelPerspective: [],
      perspective: [],
      applicationPerspective: [],
      roamingRoute: [],
      labelList: [],
      iconScale: 1,
      isFilterArea: 'display',
      navType: 'classicsNav',
      cardType: 'classicsCard',
      deviceStyle: 'pop',
      autoWeather: false,
      guideData: {
        isOld: 'old',
        modelLine: '',
        guideList: []
      }
    },
    three: {
      modelServer: [],
      modelPerspective: [],
      perspective: [],
      roamingRoute: [],
      labelList: [],
      areaLabelList: [],
      scene: {
        background: {
          images: [],
          scale: 1
        }
      }
    },
    scada: {
      url: [],
      background: []
    }
  }
}
