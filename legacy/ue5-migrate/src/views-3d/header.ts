
import axios from "axios";

//获取用户本地ip的方法
export const getUserIP = (callback) => {
  var ip_dups = {};
  var RTCPeerConnection = window.RTCPeerConnection
    || (window as any).mozRTCPeerConnection
    || (window as any).webkitRTCPeerConnection;
  var useWebKit = !!(window as any).webkitRTCPeerConnection;
  var mediaConstraints = {
    optional: [{ RtpDataChannels: true }]
  };
  // 这里就是需要的ICEServer了
  var servers = {
    iceServers: [
      { urls: "stun:stun.services.mozilla.com" },
      { urls: "stun:stun.l.google.com:19302" },
    ]
  };
  var pc = new RTCPeerConnection(servers, mediaConstraints);
  function handleCandidate(candidate) {
    var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
    var hasIp = ip_regex.exec(candidate)
    if (hasIp) {
      var ip_addr = ip_regex.exec(candidate)[1];
      if (ip_dups[ip_addr] === undefined)
        callback(ip_addr);
      ip_dups[ip_addr] = true;
    }else{
      callback(null)
    }
  }
  // 网络协商的过程
  pc.onicecandidate = function (ice) {
    if (ice.candidate) {
      // handleCandidate(ice.candidate.candidate);
    }
  };
  pc.createDataChannel("");
  //创建一个SDP(session description protocol)会话描述协议 是一个纯文本信息 包含了媒体和网络协商的信息
  pc.createOffer(function (result) {
    pc.setLocalDescription(result, function () { }, function () { });
  }, function () { });
  setTimeout(function () {
    var lines = pc.localDescription.sdp.split('\n');
    lines.forEach(function (line) {
      if (line.indexOf('a=candidate:') === 0)
        handleCandidate(line);
    });
  }, 1000);
}
/**
 * 对接天气预报
 */
export async function getNowWeather() {
  getUserIP(async(ip) =>{
    if(ip){
      return new Promise((resolve,reject) =>{
        axios.get(`https://weather01.market.alicloudapi.com/ip-to-weather?ip=${ip}`, { headers: { Authorization: 'APPCODE 80751a3b98794bacb366cd0ccf80db86' } }).then(res => {
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
    else {
      return new Promise((resolve,reject) =>{
        axios.get(`https://weather01.market.alicloudapi.com/area-to-weather`, { headers: { Authorization: 'APPCODE 80751a3b98794bacb366cd0ccf80db86' } }).then(res => {
          resolve(res)
        })
        .catch(error => {
          reject(error)
        })
      })
    }
  })
}

/**
 * 天气code码
 */  
export const weatherCode = {
  '00':'Sunny', //晴
  '01':'Cloudy', //多云
  '02':'Overcast', //阴
  '03':'Rain', //阵雨
  '04':'Rain', //雷阵雨
  '05':'Rain', //雷阵雨伴有冰雹
  '06':'SnowLight', //雨夹雪
  '07':'RainLight', //小雨
  '08':'RainLight',//中雨
  '09':'Rain', //大雨
  '10':'RainThunderStorm', // 暴雨
  '11':'RainThunderStorm', //大暴雨
  '12':'RainThunderStorm', //特大暴雨
  '13':'RainLight', //阵雨
  '14':'SnowLight', //小雪
  '15':'SnowLight',//中雪
  '16':'Snow',//大雪
  '17':'Snow', //暴雪
  '18':'Foggy',//雾
  '19':'RainLight',//冻雨
  '20':'SandDustCalm',//沙城暴
  '24':'RainThunderStorm', //暴雨到大暴雨
  '25':'RainThunderStorm',// 大暴雨到特大暴雨
  '26':'SnowLight',//小到中雪
  '27':'SnowLight', //中到大雪
  '28':'SnowBlizzard', //大到暴雪
  '29':'SandDustCalm', //浮尘
  '30':'SandDustCalm', //扬尘
  '31':'SandDustStorm', //强沙城暴
  '53':'Foggy', //霾
  '301':'RainLight', //雨
  '302':'SnowLight', //雪
  'undefined':'无数据'
}


export const modelWeather = [
  {
    label:'晴',
    value:'Sunny',
    weatherCode:['00'],
    img:'tianqi/00.png'
  },
  {
    label:'多云',
    value:'Cloudy',
    weatherCode:['01'],
    img:'tianqi/01.png'
  },
  {
    label:'雾',
    value:'Foggy',
    weatherCode:['18','53'],
    img:'tianqi/18.png'
  },
  {
    label:'雨',
    value:'Rain',
    weatherCode:['03','04','05','09'],
    img:'tianqi/03.png'
  },
  {
    label:'雪',
    value:'Snow',
    weatherCode:['16','17'],
    img:'tianqi/16.png'
  },
]