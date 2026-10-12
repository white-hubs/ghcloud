declare class H5sPlayerRTC {
  public constructor(conf: H5sRealTimePlayer);

  public connect(): void;

  public disconnect(): void;
}

declare class H5sPlayerWS {
  public constructor(conf: H5sRealTimePlayer);

  public connect(): void;

  public disconnect(): void;
}

declare const platform: {
  manufacturer: "Apple" | string;
  version: string;
  product: "iPhone" | string;
  layout: "WebKit" | string;
  os: {
    family: "iOS" | "Linux" | string;
  };
  description: string;
  name: string;
};

declare interface Document {
  webkitFullscreenElement?: HTMLVideoElement;
  mozFullScreenElement?: HTMLVideoElement;
  msFullscreenElement?: HTMLVideoElement;
}

declare interface Window {
  config?: {
    feature: {
      videoAccessMode: string;
    };
  };
  JSPlugin: any;
}
