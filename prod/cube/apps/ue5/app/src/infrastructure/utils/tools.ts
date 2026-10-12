// @ts-ignore
window.getip = (data: { ip: string }): void => {
  ip = data.ip;
};
let ip = "";
/** 获取用户本地ip的方法 */
export const getUserIP = async (): Promise<string> => {
  // 插入jsonp http://api.ipify.cn?format=jsonp?callback=jsonpCallback
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${window.location.protocol}//api.ipify.cn?format=jsonp&callback=getip`;
    script.onload = (): void => {
      // 等待callback执行
      const timer = setInterval(() => {
        if (ip) {
          clearInterval(timer);
          resolve(ip);
        }
      }, 500);
    };
    script.onerror = (): void => {
      reject(new Error("Failed to get user IP"));
    };
    document.head.appendChild(script);
  });
};
