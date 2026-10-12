import { CallRole, CallStatus } from './call-define'

// 通讯用户信息
export class CallUser {
  public id?: string;
  public name?: string;
  public avatar?: string;
  public callRole: CallRole = CallRole.none;
  public callStatus: CallStatus = CallStatus.none;
  public view?: string | HTMLElement;
  public userSig?: string;
  public audioAvailable?: boolean;
  public videoAvailable?: boolean;

  public constructor (params: {
    id?: string;
    name?: string;
    avatar?: string;
    callRole?: CallRole;
    callStatus?: CallStatus;
    view?: string;
    userSig?: string;
    audioAvailable?: boolean;
    videoAvailable?: boolean;
  } = {}) {
    const {
      id,
      name,
      avatar,
      callRole = CallRole.none,
      callStatus = CallStatus.none,
      view,
      userSig,
      audioAvailable = false,
      videoAvailable = false,
    } = params;
    this.id = id ?? '';
    this.name = name ?? '';
    this.avatar = avatar ?? '';
    this.callRole = callRole;
    this.callStatus = callStatus;
    this.view = view ?? '';
    this.userSig = userSig ?? '';
    this.audioAvailable = audioAvailable;
    this.videoAvailable = videoAvailable;
    // 默认video视图viewId
    if (id && !view) {
      this.view = `${id}_main`;
    }
  }
}