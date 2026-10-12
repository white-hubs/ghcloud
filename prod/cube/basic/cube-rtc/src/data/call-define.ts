
// 呼叫的媒体类型
export enum CallMediaType {
  // 默认值，无媒体类型
  none = '',
  // 音频
  audio = 'AUDIO',
  // 视频
  video = 'VIDEO',
}

// 通话场景
export enum CallScene {
  // 默认值，无场景
  none = '',
  // 多人会议
  conference = 'CONFERENCE',
  // 单人电话
  single = 'SINGLE',
}

// 呼叫中的角色
export enum CallRole {
  // 默认值，无角色
  none = "none",
  // 呼叫者，发起呼叫的成员
  caller = "caller",
  // 2: 被邀请参加电话会议的成员
  called = 'called',
}


// / 通话状态
export enum CallStatus {
  // 空闲状态
  none = 'none',
  // 等待接受/拒绝状态
  waiting = 'waiting',
  // 接听状态
  accept = 'accept',
}