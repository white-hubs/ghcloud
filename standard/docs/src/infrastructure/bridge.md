# 开河标准桥接协议实现指南

本文档旨在为开发者提供基于开河标准的移动端桥接能力实现指南。通过本文，开发者可以了解如何在移动端与内嵌H5之间实现桥接通讯，以补充HTML5的不足，并调用原生APP的能力。

## 前置须知

1. **cubeAppBridge** 和 **cubeH5Bridge** 是开河标准桥接协议下需要关注的两个对象，它们分别挂载在H5应用的`window`对象上。
   - `cubeAppBridge`：用于H5应用向APP发送消息，需要APP端实现。
   - `cubeH5Bridge`：用于APP向H5发送消息，由H5实现，APP端需做好消息监听和处理。

2. 为了方便开发者测试协议，我们提供了一个桥接测试H5 Demo供开发者调试：[桥接测试H5 Demo](https://cube-dev.guhecloud.com:30000/apps/@ghcloud/cube-app-js-sdk-demo)。

## 桥接协议实现逻辑

### 1. APP端实现

1. **挂载`cubeAppBridge`对象**：在`webView`组件打开H5应用时，APP端需要向H5的`window`对象上挂载`cubeAppBridge`对象。其接口定义如下：

   ```typescript
   declare interface Window {
     /**
      * 定义cube app访问桥梁
      */
     cubeAppBridge: {
       /**
        * @param message 发送的消息，应为标准JSON字符串
        */
       postMessage: (message: string) => void;
     };
   }
   ```

   H5在需要调用APP原生能力时，会使用`window.cubeAppBridge.postMessage(msgString)`向APP端发送指令。APP端需要拦截`msgString`并按照标准JSON字符串解析，解析后的对象接口如下：

   ```typescript
   interface CubeBridgeMessage {
     /** 调用的API名称 */
     api: string;
     /** 携带的数据，JSON字符串或无格式纯文本 */
     data: string;
     /** APP端无需关心，但在回传信息时需要带上 */
     callbackId: number;
   }
   ```

   APP端根据解析后的`Message`信息执行相应操作，并将结果通过`window.cubeH5Bridge.receiveMessage`方法回传给H5。

2. **设置`userAgent`**：在`webview`的`userAgent`上加入`"Cuhe-App"`字符。

### 2. H5端实现

1. **实现`cubeH5Bridge`对象**：H5端需要实现`cubeH5Bridge`对象，用于接收APP端发送的消息。其接口定义如下：

   ```typescript
   declare interface Window {
     /**
      * 定义cube H5访问桥梁
      */
     cubeH5Bridge: {
       /**
        * @param message 接收的消息，应为标准JSON字符串
        */
       receiveMessage: (message: string) => void;
     };
   }
   ```

2. **处理APP端消息**：H5端通过`window.cubeH5Bridge.receiveMessage`接收APP端发送的消息，并根据消息内容执行相应操作。

## 协议开发示例（UniApp）

1. **设置`userAgent`**：使用`uni-app`的`plus api`设置`userAgent`。

2. **注入`cubeAppBridge`对象**：在`webview`页面渲染时，向H5的`window`对象注入`cubeAppBridge`对象，并实现H5通信方法。建议在渲染完成之前注入。

3. **监听并处理消息**：`webview`组件或对象监听并处理消息。在解析消息体时，对`data`字段进行容错处理，参考以下代码：

   ```javascript
   try {
     const eventData = JSON.parse(event.data);
   } catch (error) {
     (function(){})('解析消息失败', error);
   }
   ```

4. **响应H5消息**：将处理结果返回给H5，返回消息时执行H5挂载在`window`上的方法。

::: tip
具体桥接能力请参考 业务移动端-桥接能力 章节。
:::

