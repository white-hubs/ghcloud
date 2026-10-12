import { message } from "ant-design-vue";
import store from "../../../../store";
var ocxKq;
var port = 14320;
var verifyResult = false; //连接验证码
var waitVerifyCallback = false;
var videoCall = false;
export default ocxKq;
export function Load() {
  if (BrowserIsIE()) {
    try {
      ocxKq = document.getElementById("csocx");
      if (ocxKq.object == null) alert("还没有注册控件");
      else alert("已经注册控件");
    } catch (e) {
      alert("e:" + e.description);
    }
  } else {
    console.log(document.cookie);
    initPlugin();
    // initMap();
  }
}

export function GetSurfaceModel() {
  excuteFucOfPlugin("GetSurfaceModel", []);
}

export function SetSurfaceModel1() {
  excuteFucOfPlugin("SetSurfaceModel", ["1", "0"]);
}

export function SetSurfaceModel2() {
  excuteFucOfPlugin("SetSurfaceModel", ["0", "0"]);
}

export function VideoVisible() {
  excuteFucOfPlugin("VideoVisible", []);
}

export function SetCallPanelLocation() {
  var callx = document.getElementById("callx").value;
  var cally = document.getElementById("cally").value;
  excuteFucOfPlugin("SetCallPanelLocation", [callx, cally]);
}

export function openDispatch() {
  window.open(
    "http://192.168.0.205:8098/webdispatch/index.html#/?info=7oANCVzhcfpxHa5ypI$DE4nzCmwKdyZaqnzPn_fqZlIrb67HtP2sCOFtBZSfobL0",
    "_blank"
  );
}

export function ShowVideoCallWindow() {
  var callNO = document.getElementById("teminalNo").value;
  excuteFucOfPlugin("ShowVideoCallWindow", [callNO]);
}

/**
 * 关闭 拒接视频
 */
export function CloseVideo() {
  alert(scallHandler);
  excuteFucOfPlugin("CloseVideo", [scallHandler]);
}
/**
 * 与扩展通信
 **/
export function createCustomEvent(msg) {
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("excuteActiveX", true, false, msg);
  document.dispatchEvent(evt);
}
/**
 * 判断浏览器类别
 **/
export function BrowserIsIE() {
  var explorer = navigator.userAgent;
  //console.info("explorer："+explorer);
  if (explorer.indexOf("Trident") >= 0) {
    //console.info("IS IE");
    return true;
  } else {
    console.info("IS Not IE");
    return false;
  }
}

/**
 * 组装发送命令json
 * @param {方法名称} methodName
 */
export function BuildJson(methodName) {
  var paras = "[";
  var length = arguments.length;
  for (var i = 1; i < length; i++) {
    paras += arguments[i];
    if (i < length - 1) paras += ",";
  }
  paras += "]";
  var buildResult =
    '{"MethodName":"' + methodName + '","Parameters":' + paras + "}";
  //alert("BuildJson 结果："+ JSON.stringify(buildResult));
  //alert("BuildJson 结果："+buildResult);
  //return  JSON.stringify(buildResult);
  return buildResult;
}

/**
 * 组装变量
 * @param {变量名称} key
 * @param {变量值} value
 */
export function BuildParamJson(key, value) {
  var paraJson =
    '{"ParameterName":"' + key + '","ParameterKey":"' + value + '"}';
  //console.info("paraJson:"+JSON.stringify(paraJson));
  return paraJson;
}

//调度操作操作
/**
 * 初始化uct控件
 * 并登录
 */
export function AcitvexInit(name, pwd, ip) {
  try {
    if (BrowserIsIE()) {
      ocxKq.RegistCallBack(window, "callbackInfo", "msg");
      console.log("RegistCallBack finish!");
      var loginRet = parent.ocxKq.Login(name, pwd, ip);
      if (!loginRet) alert("Login fail!");
    } else {
      // var nameParam = BuildParamJson("name", name);
      // var pwdParam = BuildParamJson("pwd", pwd);
      // var ipParam = BuildParamJson("ip", ip);
      // var jsonParameter = BuildJson("Login", nameParam, pwdParam, ipParam);
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("Login", [name, pwd, ip]);
    }
  } catch (ex) {
    alert("AcitvexInit:" + ex);
  }
}

export function InitMQ() {
  try {
    var ip = document.getElementById("txt_MQIP").value;
    var port = document.getElementById("txt_MQPort").value;
    var name = document.getElementById("txt_MQName").value;
    var key = document.getElementById("txt_MQFilterkey").value;
    var value = document.getElementById("txt_MQFilterValue").value;

    if (BrowserIsIE()) {
      let ret = ocxKq.InitMQ(ip, port, name, key, value);
      alert("InitMQ：" + ret);
    } else {
      var ipParam = BuildParamJson("ip", ip);
      var portParam = BuildParamJson("port", port);
      var nameParam = BuildParamJson("name", name);
      var keyParam = BuildParamJson("key", key);
      var valueParam = BuildParamJson("value", value);

      var jsonParameter = BuildJson(
        "InitMQ",
        ipParam,
        portParam,
        nameParam,
        keyParam,
        valueParam
      );
      createCustomEvent(jsonParameter);
    }
  } catch (error) {
    alert(error);
  }
  //window.onload=InitFc();
}
/**
 * 退出登录并释放插件
 * 参数：无
 */
export function DestrUct() {
  try {
    console.log(document.cookie);
    if (BrowserIsIE()) {
      //if($.isEmptyObject(ocxKq)) return;
      if (ocxKq == "" || ocxKq == null || ocxKq == undefined) {
        //console.info("ocxKq is null");
        return;
      }

      ocxKq.LoginOut();
      ocxKq.DestroyCtrl();
      //   delete ocxKq;
    } else {
      // var jsonParameter = BuildJson("LoginOut");
      // createCustomEvent(jsonParameter);
      // var desJsonParameter = BuildJson("DestroyCtrl");
      // createCustomEvent(desJsonParameter);
      excuteFucOfPlugin("LoginOut", []);
      excuteFucOfPlugin("DestroyCtrl", []);
      //desdroyPlugin();
    }
  } catch (error) {
    alert(error);
  }
}
export function Logout() {
  try {
    if (BrowserIsIE()) {
      if (ocxKq == "" || ocxKq == null || ocxKq == undefined) {
        console.info("ocxKq is null");
        return;
      }
      ocxKq.LoginOut();
    } else {
      // var jsonParameter = BuildJson("LoginOut");
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("LoginOut", []);
    }
  } catch (error) {
    alert(error);
  }
}

export function initPlugin() {
  try {
    var wsImpl = window.WebSocket || window.MozWebSocket;
    // create a new websocket and connect
    if (port > 65535) port = 1024;
    window.ws = new wsImpl("ws://localhost:" + port);
    // when data is comming from the server, this metod is called
    // when the connection is established, this method is called
    ws.onopen = function () {
      // when the connection is closed, this method is called

      ws.onmessage = function (evt) {
      
        callbackInfo(evt.data);
      };
      SendMethod("VerifyWebSoket", []); //send verify method
      waitVerifyCallback = true;
      setTimeout(() => {
        if (!verifyResult) {
          ws.onmessage = null;
          ws.close();
          waitVerifyCallback = false;
          StartNewPoint();
        }
      }, 1000);
    };
    ws.onclose = function () {
   
    };
    ws.onerror = function (event) {
   
      if (!waitVerifyCallback) setTimeout(StartNewPoint, 500);
    };
  } catch (error) {
    console.error(error);
    StartNewPoint();
    return;
  }
}
// 连接新端口
export function StartNewPoint() {
  port += 1;
  initPlugin();
}
export function excuteFucOfPlugin(method, paras) {
  if (verifyResult && ws.readyState === WebSocket.OPEN) {
    SendMethod(method, paras);
  } else {
    console.error(ws.readyState);
  }
}
export function SendMethod(method, paras) {
  let jobj = {
    method: method,
    paramArray: paras,
  };
  let jStr = JSON.stringify(jobj);

  ws.send(jStr);
}

export function callbackInfo(msg) {
  // alert("js页面的回调信息："+msg);
  // msg=msg.replace(/\n/g,"");
  // alert("js页面处理后的回调信息："+msg);
  msg = msg.replace(/\n/g, "");
  console.info("Callback msg:" + msg);
  console.info("Callback msg length:" + msg.length);
  try {
    // var order = msg.substr(0, 1);
    // var msgInfo = msg.substr(1);
    // if (order !== "0") {
    //   return;
    // }
    //var obj = strToJson(msg);
    //var obj =$.parseJSON(msg);
    var obj = JSON.parse(msg);
    console.info("transfer json object!");
    console.info(obj);
    var cmd = obj.cmd + "\n";
    let type = obj.type + "\n";
    var msgid = obj.msgid + "\n";
    var code = obj.code + "\n";
    var date = obj.date + "\n";
    var msgstr = obj.msg;
    //alert(cmd.concat(type,msgid,code,msgstr,date));
    //console.info(cmd.concat(type,msgid,code,msgstr,date));
    let gcallobj = obj.msg;
    let videoObje = obj.msg;

    switch (obj.cmd) {
      case "Init":
        break;
      case "Login":
        if (obj.type == "LoginSuc") {
       
          store.commit("commandDispatch/SET_commandDispatch", {
            ...store.getters.commandDispatch,
            loginResult: true,
          });
          // message.success("登录成功");
        } else if (obj.type == "Loginfail") {
          var logFailStr = "登录错误：";
          // message.error(logFailStr.concat("\n", msgstr, "\n", date));
          store.commit("commandDispatch/SET_commandDispatch", {
            ...store.getters.commandDispatch,
            loginResult: false,
          });
        }
        break;
      case "SingleCall":
        if (obj.type == "SCallMCfm") {
          //var callArray=msgstr.split('|');
          //let jsonObj=JSON.parse(msgstr);
          let jsonObj = obj.msg;
          let callType = "普通呼叫";
          if (jsonObj.flag == 1) {
            //视频呼叫
            videoCall = true;
            ocxKq.ShowVideoCallWindow(jsonObj.pcCfmDn);
            callType = "视频呼叫";
          }
          scallHandler = jsonObj.hUserCall;
        } else if (obj.type == "SCalled") {
          videoCall = false;
          //var calledArray=msgstr.split('|');
          //let jsonObj=JSON.parse(msgstr);
          let jsonObj = obj.msg;
          let callType = "普通呼叫";
          if (jsonObj.flag == 1) {
            //视频呼叫
            callType = "视频呼叫";
            videoCall = true;
          } else if (jsonObj.flag == 2) callType = "紧急呼叫";
          let msg = jsonObj.pcCalling + "(" + jsonObj.pcDn + ")发来" + callType;
          scallHandler = jsonObj.hUserCall;

          var confirmRet = confirm(msg);
          if (confirmRet) {
            if (jsonObj.flag == 1) {
              var openCallWindow = ocxKq.ShowVideoCallWindow(jsonObj.pcDn); //视频呼叫打开视频面板
            }
            // var AceeptRet = ocxKq.AcceptCall(scallHandler);
            AcceptCall();
            //if (!AceeptRet) alert("接听失败！");
          } else {
            CloseSingleCall();
          }
        } else if (obj.type == "SCallFreed") {
          //var callFreeArray=msgstr.split('|');
          //let jsonObj=JSON.parse(msgstr);
          let jsonObj = obj.msg;
          if (jsonObj.usCause == 0) {
            if (videoCall) ocxKq.CloseVideoCall();
          } else {
         
          }
        }
        break;
      case "GroupCall":
        // var gcallArray=msgstr.split('|');
        //let gcallobj=JSON.parse(msgstr);
        if (obj.type == "GCallMoCfm") {
          if (gcallobj.ret == 0) {
            gcallHandler = gcallobj.hUserCall;
          } else if (gcallobj.ret == -1)
            console.log("gcallobj.ret----", gcallobj.ret);
          else if (gcallobj.ret == -2)
            console.log("gcallobj.ret----", gcallobj.ret);
          else if (gcallobj.ret == -3)
            console.log("gcallobj.ret----", gcallobj.ret);
        } else if (obj.type == "GCallMtInd") {
          let type = gcallobj.type;
          let ret = gcallobj.ret;
          var cGid = gcallobj.cGid;
          var cTalkingGID = gcallobj.cTalkingGID;
          let pcName = gcallobj.pcName;
          var CallRefID = gcallobj.CallRefID;
          let hUserCall = gcallobj.hUserCall;
          let typeStr =
            type == 21 ? "临时组会话" : type == 22 ? "组呼" : "广播";
          let retstr = ret == 0 ? "正常介入" : "低优先级介入";

          gcallNo = cGid;
          gcallHandler = hUserCall;
        } else if (obj.type == "GCallReqCfm") {
          switch (gcallobj.ret) {
            case 0:
              console.log('"话权申请成功，我讲话中..."');
              break;
            case 1:
              console.log("排队中...");
              break;
            case 2:
              console.log("排队失败...");
              break;
            case 3:
              console.log("排队终止...");
              break;
            case 4:
              console.log("话权终止...");
              break;
            case 5:
              console.log("系统错误...");
              break;
            default:
              console.log("其他失败原因：" + gcallobj.ret);
              break;
          }
        } else if (obj.type == "GCallRelCfm") {
          console.log("话权释放成功");
        } else if (obj.type == "GCallChagInd") {
          console.log(
            gcallobj.cTalkingGID + "(" + gcallobj.cTalkingName + ")讲话中..."
          );
        } else if (obj.type == "GCallRelInd") {
          console.log(
            gcallobj.gid +
              "(" +
              gcallobj.hUserCall +
              ")组呼释放，原因值：" +
              gcallobj.ret
          );
        }
        break;
      case "Video":
        //var VideoArray=msgstr.split('|');
        //let videoObje=JSON.parse(msgstr);
        if (obj.type == "SVideoMtInd") {
          var pcCalling = videoObje.pcCalling;
          var pcDn = videoObje.pcDn;
          let pcName = videoObje.pcName;
          var iDirection = videoObje.iDirection;
          let hUserCall = videoObje.hUserCall;
          var videoDir = "下载";
          if (iDirection == "1") videoDir = "下载";
          else if (iDirection == "2") videoDir = "上传";
          else if (iDirection == "3") videoDir = "收发";
          let ret = confirm(
            pcCalling +
              "(" +
              pcDn +
              ")发来视频" +
              videoDir +
              "请求，您确定同意请求吗？"
          );

          if (ret) {
            //接受视频
            ocxKq.AcceptVideo(pcDn, parseInt(iDirection), hUserCall);
          } else {
            //挂断视频
            alert("挂断视频:" + hUserCall);
            ocxKq.CloseVideo(hUserCall);
          }
        }
        break;
      case "Msg":
        if (obj.type == "MsgSendResult") {
          let ret = obj.msg.result;
          if (ret == 0) {
            var chsmsid = obj.msg.smsid;
          }
        } else if (obj.type == "MsgReceive") {
          if (obj.msg.content.infoType == 0x31) {
            console.log("发来的设置信息");
          } else {
            console.log("发来的：");
          }

          //ConfirmMSG(0,pcDst,chSmsId,InfoSeq);
        } else if (obj.type == "FileUpload") {
          console.log(msgstr);
        } else if (obj.type == "FileDownload") {
          console.log(msgstr);
        }
        break;
      case "Error":
        break;
      case "Wsoket":
        if (obj.type == "WsoketResult") {
          switch (obj.msg.method) {
            case "VerifyWebSoket":
              //验证唯一ID，不变
              if (obj.msg.result === "34c61afbc8b6470f9b349a1e1c2986be") {
                verifyResult = true;
                store.commit("commandDispatch/SET_commandDispatch", {
                  ...store.getters.commandDispatch,
                  verifyResult,
                });
              }
              break;
            case "SingleCallByNo":
              if (obj.msg.result) {
                message.success("发起呼叫成功！");
                videoCall = false;
              } else {
                message.error("发起呼叫失败！");
              }
              break;
            case "CloseSingleCall":
              if (obj.msg.result) console.log("挂断呼叫执行成功！");
              else console.log("挂断呼叫执行失败！");
              break;
            case "GroupCallByNo":
              if (obj.msg.result) console.log("发起组呼成功".concat(callNO));
              else console.log("发起呼叫失败".concat(callNO));
              break;
            case "GroupBroadcast":
              if (obj.msg.result) console.log("发起广播成功".concat(callNO));
              else console.log("发起广播失败".concat(callNO));
              break;
            case "GetSpeakOfGroupCall":
              if (!obj.msg.result) console.error("申请话权失败！");
              break;
            case "FreedSpeakOfGroupCall":
              if (!obj.msg.result) console.error("释放话权失败！");
              break;
            case "CloseGroupCall":
              if (!obj.msg.result) console.log("组呼主动释放失败：" + ret);
              else {
                console.log("组呼主动释放成功");
              }
              break;
            case "SendMSGForJSonString":
              if (obj.msg.result != 0) {
                console.log("' style='width=95%'>发送结果为：" + excutRet);
              } else {
                alert("信息发送失败！");
              }
              break;
            case "SendMSGForV5":
              if (obj.msg.result != 0) {
                console.log("' style='width=95%'>发送结果为：" + excutRet);
              } else alert("信息发送失败！");
              break;
            case "SendMSG":
              if (obj.msg.result != 0) {
                console.log("' style='width=95%'>发送结果为：" + excutRet);
              } else alert("信息发送失败！");
              break;
            case "ReceivedMSG":
              if (obj.msg.result != 0) alert("确认消息失败！");
              break;
            case "UploadFile":
              if (obj.msg.result != 0) alert("上传操作失败：" + UploadFileRet);
              else
                alert(
                  "文件上传成功:pcDst-" +
                    pcDst +
                    " fileName-" +
                    fileName +
                    " chSmsId-" +
                    fileChSmsId
                );
              break;
            case "DownLoadFiel":
              if (obj.msg.result != 0) alert("下载操作失败：" + obj.msg.result);
              break;
          }
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }
}
