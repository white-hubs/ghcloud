export const deviceOnlineText = (online?: boolean, stateCode?: number): string => {
  if (online === false || stateCode === 0) {
    return "离线";
  }
  return "在线";
};

export const deviceOnlineColor = (online?: boolean, stateCode?: number): string =>
  deviceOnlineText(online, stateCode) === "在线" ? "green" : "red";
