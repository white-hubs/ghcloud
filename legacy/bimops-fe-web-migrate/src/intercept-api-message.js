// 拦截 XMLHttpRequest
const originalXHR = window.XMLHttpRequest;

window.XMLHttpRequest = function () {
  const xhr = new originalXHR();

  // 重写 open 方法
  const originalOpen = xhr.open;
  xhr.open = function (method, url) {
    if (url.includes('/api/message/')) {
      // 直接返回，不发送请求
      return;
    }
    // 调用原始的 open 方法
    originalOpen.apply(xhr, arguments);
  };

  // 重写 send 方法
  const originalSend = xhr.send;
  xhr.send = function (body) {
    if (this._url && this._url.includes('/api/message/')) {
      // 直接返回，不发送请求
      return;
    }
    // 调用原始的 send 方法
    originalSend.apply(xhr, arguments);
  };

  return xhr;
};


// 导出模块
export default function interceptApiMessage() {
}
