## h5端显示提示,使用默认提示信息==================================================================================================================
```ts
const serviceIntercept = new ServiceIntercept({
  platform: 'mobile',
  showNotification: true, // 显示提示
})
const data=serviceIntercept.request(cubeMdataService.getAreaTree('58197260'))
```
## web端显示提示,自定义通知函数========================================================================================
```ts
const serviceIntercept = new ServiceIntercept({
  platform: 'web',
  customNotification: customNotification,
})
const customNotification = (code: number, message: string): void => {
  if (code === 200) {
    showNotify({ type: 'success', message })
  } else {
    showNotify({ type: 'danger', message })
  }
}
```
## 不显示提示==========================================================================================================
```ts
const serviceIntercept = new ServiceIntercept({
  platform: 'mobile',
  showNotification: false,
})
```
## 显示自定义提示消息=====================================================================================================
```ts
const serviceIntercept = new ServiceIntercept({
  platform: 'mobile',
  customMessages: {
    200: '请求成功1111',
    400: '请求失败',
    401: '未授权222',
    500: '服务器错误'
  }
})
```