import request from "@/utils/request";
let baseURL = "/api/fusion-communicate";
/**
 * 获取通讯用户列表
 * @param {*} param
 * @returns
 */
export const getCommunicateUserList = (params) =>
  request({
    url: baseURL + "/fusion-communicate/users",
    method: "get",
    params,
  });
/**
 * 通讯人员保活
 * @returns
 */
export const communicateUserKeepAlive = () =>
  request({
    url: baseURL + "/fusion-communicate/keep-alive",
    method: "post",
    data: [],
  });
/**
 * 获取在线人员列表
 */
export const getOnlineUserList = () =>
  request({
    url: baseURL + "/fusion-communicate/sys-users",
    method: "post",
    data: [],
  });
/**
 * 根据融合通讯账号获取系统账号
 */
export const getSysUserByFusionAccount = (fusionAccount) =>
  request({
    url: baseURL + `/fusion-communicate/sys-user/${fusionAccount}`,
    method: "get",
    params: {
      fusionAccount: fusionAccount,
    },
  });
/**
 * 获取历史轨迹
 */
export const getHistoryTrack = (params) =>
  request({
    url: baseURL + "/gps/page",
    method: "get",
    params: {
      ...params,
    },
  });
/**
 * 创建房间号
 */
export const createRoomNumber = (params) =>
  request({
    url: baseURL + "/conference-room/create",
    method: "post",
    params: {
      ...params,
    },
  });
/**
 * 获取userSig
 */
export const getUserSig = (params) =>
  request({
    url: baseURL + "/tencent/communication/sig",
    method: "get",
    params: {
      ...params,
    },
  });
/**
 * 发起通讯
 */
export const startCommunicate = (params) =>
  request({
    url: baseURL + "/conference-room/propose",
    method: "post",
    data: {
      ...params,
    },
  });
/**
 * 加入会议房间
 */
export const joinRoom = (params) =>
  request({
    url: baseURL + "/conference-room/join",
    method: "post",
    data: {
      ...params,
    },
  });
/**
 * 获取会议房间内的用户
 */
export const getRoomInfo = (roomNumber) =>
  request({
    url: baseURL + `/conference-room/${roomNumber}`,
    method: "get",
  });
/**
 * 新增会议成员邀请
 */
export const addRoomUser = (params) =>
  request({
    url: baseURL + "/conference-room/invite",
    method: "post",
    data: {
      ...params,
    },
  });
/**
 * 拒绝加入会议
 */
export const refuseJoinRoom = (params) =>
  request({
    url: baseURL + "/conference-room/refuse-join",
    method: "post",
    data: {
      ...params,
    },
  });
/**
 * 踢出会议成员
 */
export const removeRoomUser = (params) =>
  request({
    url: baseURL + "/conference-room/remove/user",
    method: "post",
    data: {
      ...params,
    },
  });
/**
 * 离开会议房间
 */
export const leaveRoom = (params) =>
  request({
    url: baseURL + "/conference-room/leave",
    method: "post",
    data: {
      ...params,
    },
  });
/**
 * 结束会议
 */
export const endRoom = (params) =>
  request({
    url: baseURL + "/conference-room/close",
    method: "post",
    data: {
      ...params,
    },
  });
/**
 * 保活账号
 */
export const keepAliveAccount = () =>
  request({
    url: baseURL + "/fusion-communicate/current-user/keep-alive",
    method: "put",
  });
/**
 * 注册账号
 */
export const registerAccount = (data) =>
  request({
    url: baseURL + "/fusion-communicate/assign/sys-user",
    method: "post",
    data,
  });
