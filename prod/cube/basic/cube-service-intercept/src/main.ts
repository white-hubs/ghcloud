
import { message } from 'ant-design-vue';
import { showNotify } from 'vant';

interface ResponseType{
  message:string;
  errorDescription?:string,
  errorDetail?:string,
  code:number,
}
interface OptionType{
  platform: string;
  customMessages:{[x:number|string]:string} |null; 
  customNotification: Function|null; 
  showNotification:boolean;
}
export class ServiceIntercept {
  private readonly options:OptionType
  public constructor (option: {}) {
    this.options={
      platform: 'web', //终端：web 或 mobile
      customMessages: null, // 自定义消息
      customNotification: null, // 自定义通知函数
      showNotification: true, // 是否显示提示
      ...option
    }
    this.checkDependencies();
  }
  async request(promise:any) {
    try {
      const response = await promise;
      const code=response.code?Number(response.code):200
      const message=response.message?response.message:'请求成功'
      this.handleResponse({  code, message});
      return response
    } catch (error: unknown) {
      const err= (error as { toJSON: () => Record<string, string>; }).toJSON()
      const errorCode = err.errorCode ? Number(err.errorCode) : 500;
      const errorMessage = err.errorMessage ? err.errorMessage : '服务器错误';
      this.handleResponse({ code:errorCode, message:errorMessage });
    }
  }
  //检查环境和包
  checkDependencies(){
      if (this.options.platform === 'web' && !message) {
      } else if (this.options.platform === 'mobile' && !showNotify) {
      }
  }
  //处理提示
  handleResponse(response:ResponseType) {
    const { code, message } = response;
    const defaultMessages:{[x:number|string]:string} = {
      200: '请求成功',
      400: '请求失败',
      401: '未授权',
      500: '服务器错误'
    };
    const messageToDisplay = this.options.customMessages
      ? (this.options.customMessages&&this.options.customMessages[code]||'未知错误'):(defaultMessages[code] ||message  || '未知错误')
    //判断使用自定义通知函数还是默认通知函数
    if(this.options.customNotification){
      this.options.customNotification(code, messageToDisplay);
    } else if (this.options.showNotification){
      this.defaultNotification(code, messageToDisplay);
    }
  }
  //获取提示类型（success：成功，error：失败）
  getNotificationType(code:string|number) {
    if (code === 200) {
      return 'success';
    } else {
      return 'error';
    }
  }
  //默认通知函数
  defaultNotification(code:string|number, message:string) {
    const notificationType = this.getNotificationType(code);
      if (this.options.platform === 'web') {
        this.webNotification(notificationType, message);
      } else if (this.options.platform === 'mobile') {
        this.mobileNotification(notificationType, message);
      } else {
      }
    
  }
  //默认通知函数（pc）
  webNotification(notificationType:string, Msg:string) {
    if (notificationType === 'success') {
      message.success(Msg);
    } else {
      message.error(Msg);
    }
  }
  //默认通知函数（h5）
  mobileNotification(notificationType:string,  Msg:string) {
    if (notificationType === 'success') {
      showNotify({ type: 'success', message: Msg });
    } else {
      showNotify({ type: 'danger', message: Msg });
    }
  }
}