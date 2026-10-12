interface H5sPlayerConfig {
  protocol: 'http:' | 'https:' | string;
  // 服务主机 'localhost:8080' 或者 '192.168.1.1:8080'
  host: string;
  // API根路径，默认是 '/'，如果代理了服务，则填代理后的路径
  rootpath: string;
  token: string;
  // Login获取的session
  session: string;
  // main/sub或者预定义的转码profile token，实时视频生效
  streamprofile?: 'main' | 'sub' | string;
  // 过时参数，保持'v1'既可
  hlsver?: 'v1';
  consolelog?: 'true' | 'false' | string;
}

interface H5sRealTimePlayerConfig extends H5sPlayerConfig {}

interface H5sPlaybackPlayerConfig extends H5sPlayerConfig {
  // 回放配置项，实时的时候为空，具体格式参考回放视频接口参数
  pbconf?: string;
}

interface H5sRealTimePlayerWithId extends H5sRealTimePlayerConfig {
  videoid: string;
}

interface H5sRealTimePlayerWithDom extends H5sRealTimePlayerConfig {
  videodom: HTMLElement;
}

interface H5sPlaybackPlayerWithId extends H5sPlaybackPlayerConfig {
  videoid?: string;
}

interface H5sPlaybackPlayerWithDom extends H5sPlaybackPlayerConfig {
  videodom?: string;
}

export type H5sRealTimePlayer = H5sRealTimePlayerWithId | H5sRealTimePlayerWithDom

export type H5sPlaybackPlayer = H5sPlaybackPlayerWithId | H5sPlaybackPlayerWithDom
