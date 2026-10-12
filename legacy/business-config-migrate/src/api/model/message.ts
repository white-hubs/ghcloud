export interface MsgApplicationsType {
  applicationCode:string;
  applicationName:string
}
export interface MsgReceivesType{
    applicationCode: string;
    applicationName: string;
    channelCodes: boolean[];
    selectArr:boolean[];
    id:           string;
    msgSceneCode: string;
    msgSceneName: string;
    receiveMode: string;
}
export interface MsgChannels{
    channelCode: string;
    channelName: string;
    config: string;
    manufacturerCode: string;
    manufacturerName: string;
}
export interface ReferManufacturersType {
  code:string;
  name:string;
  accountRule:string;
}
export interface MsgTmpPageType {
  applicationCode: string;
  applicationName: string;
  channelCode: string;
  content: string;
  enabled: boolean;
  id:      string;
  msgSceneCode: string;
  msgSceneName: string;
  name: string;
  config: string;
}