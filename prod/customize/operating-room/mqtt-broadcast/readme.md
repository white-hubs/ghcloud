把手术室的原始数据转义之后再通过mqtt广播出去

开发步骤
1. 先找一台电脑把瑞浩的驾驶舱web服务启动起来，确保驾驶舱的获取数据是正常的
2. 修改data-reader.js，把文件地址改为上面启动好的web服务地址
3. 去对应的emqx管理后台，创建一个WebSocket 客户端，订阅topic OPERATING_ROOM_BUSINESS_BROADCAST,然后观察输出