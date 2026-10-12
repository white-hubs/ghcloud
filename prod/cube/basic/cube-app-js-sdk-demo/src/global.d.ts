declare interface Window {
  config: {
    feature?: {
      videoAccessMode: string;
    };
  };
  JSPlugin: {
    JS_Play: (playURL: string, { playURL: string, mode: number }, unknownParam: number) => void;
  };
}

declare interface H5sPlayerInstance {
  disconnect: () => void;
  connect: () => void;
}

declare class JSPlugin {
  public constructor (options: {
    szId: string;
    szBasePath: string;
    iWidth?: number;
    iHeight?: number;
    iMaxSplit: number;
    iCurrentSplit: number;
  }): void

  public JS_Play: (playURL: string, { playURL: string, mode: number }, curIndex: number) => void
  public JS_Stop: (curIndex: number) => Promise<void>
  public JS_SetWindowControlCallback
}
