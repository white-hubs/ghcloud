// 基础 URL 和服务 URL
export const serviceUrl = "https://cap2.cdhjx.cn";
const baseURL = serviceUrl + "/api/electron-guide/public";

// 封装请求方法
export const request = (url, method, data) => {
    // 显示加载提示
    wx.showLoading({ title: "加载中..." });
    return new Promise((resolve, reject) => {
        // 发起请求
        wx.request({
            url: baseURL + url, // 拼接完整 URL
            method: method, // 请求方法
            data: data, // 请求数据
            header: {
                'content-type': 'application/json' // 设置请求头
            },
            success: (res) => {
                // 隐藏加载提示
                wx.hideLoading();
                // 判断请求是否成功
                if (res.statusCode === 200) {
                    resolve(res.data); // 请求成功，返回数据
                } else {
                    // 请求失败，显示错误提示
                    wx.showToast({
                        title: res.data.message || '请求失败',
                        icon: 'none'
                    });
                    reject(res.data); // 返回错误数据
                }
            },
            fail: (err) => {
                // 隐藏加载提示
                wx.hideLoading();
                // 请求失败，显示错误提示
                wx.showToast({
                    title: '无法连接到服务器',
                    icon: 'none'
                });
                reject(err); // 返回错误
            }
        });
    });
};