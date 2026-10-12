export default function (data) {
  // 针对五医院的数据转换
  const defaultConf = {
    protocol: window.location.protocol, // {string} - 'http:' or 'https:'
    host: '171.221.238.16:2600', // window.location.host, //{string} - 'localhost:8080'
    rootpath: '/', // {string} - path of the app running
    token: '1080', // {string} - token of stream
    streamprofile: 'main', // {string} - stream profile, main/sub or other predefine transcoding profile
    hlsver: 'v1', // {string} - v1 is for ts, v2 is for fmp4
    session: '2d78509a-68be-4a43-8f54-f27380c56ce8', // 'c1782caf-b670-42d8-ba90-2244d0b0ee83', //{string} - session got from login
    consolelog: 'false', // 'true' or 'false' enable/disable (function(){})
  };
  let config = {
    // 录像 关闭
    // pbconf: null,
  };
  if (data) {
    config = {
      // 直播 实时
      host: data.ServerIP + ':' + data.ServerPort,
      token: data.CameraToken,
      // 录像 关闭
      // pbconf: null,
    };
  }

  return Object.assign(defaultConf, config);
}
