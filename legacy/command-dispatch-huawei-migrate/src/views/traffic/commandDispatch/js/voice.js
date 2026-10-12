var videoCall = false;
var scallHandler;
import { BrowserIsIE, excuteFucOfPlugin } from "./init";
import ocxKq from "./init";
/**
 * 单呼
 * 参数：号码
 */
export function SingleCall(callNO) {
  try {
    if (BrowserIsIE()) {
      var sCallShow = ocxKq.SingleCallByNo(callNO, 0);
      gcallNo = callNO;
      if (sCallShow) {
        videoCall = false;
      } else console.log("发起呼叫失败！");
    } else {
      // var callNOparam=BuildParamJson('no',callNO);
      // var callTypeparam=BuildParamJson('type',0);
      // var jsonParameter=BuildJson("SingleCallByNo",callNOparam,callTypeparam);
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("SingleCallByNo", [callNO, 0]);
    }
  } catch (error) {
    alert(error);
  }
}

export function AcceptCall() {
  excuteFucOfPlugin("AcceptCall", [scallHandler]);
}

export function CloseSingleCall() {
  try {
    if (BrowserIsIE()) {
      var exRet = ocxKq.CloseSingleCall(scallHandler);
      if (exRet) console.log("挂断呼叫执行成功！");
      else console.log("挂断呼叫执行失败！");
      if (videoCall) ocxKq.CloseVideoCall();
    } else {
      // var param=BuildParamJson('hUserCall',scallHandler);
      // var jsonParameter=BuildJson("CloseSingleCall",param);
      // createCustomEvent(jsonParameter);

      excuteFucOfPlugin("CloseSingleCall", [scallHandler]);
      if (videoCall) {
        // var vcJsonParameter = BuildJson("CloseVideoCall");
        // createCustomEvent(vcJsonParameter);
        excuteFucOfPlugin("CloseVideoCall", []);
      }
    }
  } catch (error) {
    alert(error);
  }
}
/**
 * 视频呼叫
 * 参数：号码
 */
export function SingleVideoCall(callNO) {
  try {
    if (BrowserIsIE()) {
      ocxKq.SingleCallByNo(callNO, 1);
    } else {
      // var callNoParam = BuildParamJson("no", callNO);
      // var callTypeParam = BuildParamJson("type", 1);
      // var jsonParameter = BuildJson(
      //   "SingleCallByNo",
      //   callNoParam,
      //   callTypeParam
      // );
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("SingleCallByNo", [callNO, 1]);
    }
    videoCall = true;
  } catch (error) {
    alert(error);
  }
}

var gcallHandler = -1; //组呼句柄
var gcallNo; //组呼号码
/**
 * 组呼
 * 参数：组号码
 */
export function GroupCall() {
  try {
    var callNO = document.getElementById("groupNo").value;
    gcallNo = callNO;
    if (BrowserIsIE()) {
      var sCallShow = ocxKq.GroupCallByNo(callNO);
      if (sCallShow) {
        console.log("发起组呼成功");
      } else console.log("发起呼叫失败");
    } else {
      // var param = BuildParamJson("no", callNO);
      // var jsonParameter = BuildJson("GroupCallByNo", param);
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("GroupCallByNo", [callNO]);
    }
  } catch (error) {
    alert(error);
  }
}
/**
 * 组呼
 * 参数：号码数组
 */
export function TempGroupCall(callNO) {
  console.log(callNO);
  try {
    gcallNo = callNO;
    if (BrowserIsIE()) {
      var sCallShow = ocxKq.GroupCallByNo(callNO);
      if (sCallShow) {
        console.log("发起组呼成功");
      } else console.log("发起呼叫失败");
    } else {
      // var param = BuildParamJson("no", callNO);
      // var jsonParameter = BuildJson("GroupCallByNo", param);
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("TempGroupCall", callNO);
    }
  } catch (error) {
    alert(error);
  }
}
/**
 * 组呼
 * 参数：组号码
 */
export function GroupBroadcast() {
  try {
    var callNO = document.getElementById("groupNo").value;
    gcallNo = callNO;
    if (BrowserIsIE()) {
      var sCallShow = ocxKq.GroupBroadcast(callNO);
      if (sCallShow) {
        console.log("发起广播成功");
      } else console.log("发起广播失败");
    } else {
      // var param = BuildParamJson("no", callNO);
      // var jsonParameter = BuildJson("GroupBroadcast", param);
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("GroupBroadcast", [callNO]);
    }
  } catch (error) {
    alert(error);
  }
}

export function TempGroupBroadcast() {
  try {
    var callNO = document.getElementById("groupNo").value;
    gcallNo = callNO;
    if (BrowserIsIE()) {
      var sCallShow = ocxKq.GroupBroadcast(callNO);
      if (sCallShow) {
        console.log("发起广播成功");
      } else console.log("发起广播失败");
    } else {
      // var param = BuildParamJson("no", callNO);
      // var jsonParameter = BuildJson("GroupBroadcast", param);
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("TempBroadcast", ["600101", "800001"]);
    }
  } catch (error) {
    alert(error);
  }
}
/**
 * 话权申请释放
 *
 */
export function GCallSpeak() {
  try {
    var speakText = console.log();
    if (speakText == "申请话权") {
      if (BrowserIsIE()) {
        let ret = ocxKq.GetSpeakOfGroupCall(gcallHandler);
        if (!ret) console.error("申请话权失败！");
      } else {
        // var param = BuildParamJson("hUserCall", gcallHandler);
        // var jsonParameter = BuildJson("GetSpeakOfGroupCall", param);
        // createCustomEvent(jsonParameter);
        excuteFucOfPlugin("GetSpeakOfGroupCall", [gcallHandler]);
      }
    } else {
      console.log("申请话权");
      if (BrowserIsIE()) {
        let ret = ocxKq.FreedSpeakOfGroupCall(gcallHandler);
        if (!ret) console.error("释放话权失败！");
      } else {
        // var param = BuildParamJson("hUserCall", gcallHandler);
        // var jsonParameter = BuildJson("FreedSpeakOfGroupCall", param);
        // createCustomEvent(jsonParameter);
        excuteFucOfPlugin("FreedSpeakOfGroupCall", [gcallHandler]);
      }
    }
  } catch (error) {
    alert(error);
  }
}
export function CloseGCall() {
  try {
    if (BrowserIsIE()) {
      let ret = ocxKq.CloseGroupCall(gcallNo, gcallHandler);
      if (!ret) console.log("组呼主动释放失败：" + ret);
      else {
        console.log("组呼主动释放成功");
      }
    } else {
      // var gcallNoparam = BuildParamJson("no", gcallNo);
      // var gcallHandlerparam = BuildParamJson("hUserCall", gcallHandler);
      // var jsonParameter = BuildJson(
      //   "CloseGroupCall",
      //   gcallNoparam,
      //   gcallHandlerparam
      // );
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("CloseGroupCall", [gcallNo, gcallHandler]);
    }
  } catch (error) {
    alert(error);
  }
}

/**
 * 修改呼叫窗口位置
 * 参数：窗口左上角的X，Y
 */
export function MoveCallFrm() {
  try {
    var x = document.getElementById("CallFrmLocationX").value;
    var y = document.getElementById("CallFrmLocationY").value;
    x = parseInt(x);
    y = parseInt(y);
    if (BrowserIsIE()) {
      ocxKq.SetCallPanelLocation(x, y);
    } else {
      // var xparam = BuildParamJson("x", x);
      // var yparam = BuildParamJson("y", y);
      // var jsonParameter = BuildJson("SetCallPanelLocation", xparam, yparam);
      // createCustomEvent(jsonParameter);
      excuteFucOfPlugin("SetCallPanelLocation", [x, y]);
    }
  } catch (error) {
    alert(error);
  }
}
